import crypto from 'crypto';
import type { Socket, Server } from 'socket.io';
import type { Message, SendMessagePayload, EditMessagePayload, MessageAck, SocketData } from '@chat/shared-types';
import { sendMessageSchema, editMessageSchema } from '@chat/shared-utils';
import type { Logger, Metrics } from '@chat/shared-utils';

import type { ChannelService } from '../../services/channel.service.js';
import type { MessageService } from '../../services/message.service.js';

interface Deps {
  io: Server;
  channelService: ChannelService;
  messageService: MessageService;
  logger: Logger;
  metrics: Metrics;
}

export function registerMessageHandlers(socket: Socket, deps: Deps) {
  const data = socket.data as SocketData;

  socket.on('message:send', async (payload: SendMessagePayload, ack: (res: MessageAck) => void) => {
    const startTime = Date.now();

    const parsed = sendMessageSchema.safeParse(payload);
    if (!parsed.success) {
      return ack({ success: false, error: 'VALIDATION_ERROR' });
    }

    const isMember = await deps.channelService.isMember(parsed.data.channelId, data.userId);
    if (!isMember) {
      return ack({ success: false, error: 'NOT_A_MEMBER' });
    }

    const message: Message = {
      id: crypto.randomUUID(),
      channelId: parsed.data.channelId,
      senderId: data.userId,
      content: parsed.data.content,
      messageType: parsed.data.type || 'text',
      replyToId: parsed.data.replyToId || null,
      isEdited: false,
      isDeleted: false,
      metadata: parsed.data.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    ack({ success: true, messageId: message.id, timestamp: message.createdAt });

    socket.to(message.channelId).emit('message:new', message);
    socket.emit('message:new', message);

    deps.metrics.wsMessagesTotal.inc({ event: 'message:send', direction: 'in' });

    Promise.all([
      deps.messageService.persist(message).catch((err) => {
        deps.logger.error({ err, messageId: message.id }, 'Failed to persist message');
        socket.emit('message:persist_failed', { messageId: message.id });
      }),
      deps.messageService.cacheMessage(message.channelId, message),
    ]).catch((err) => deps.logger.error({ err }, 'Post-delivery processing error'));

    const latencyMs = Date.now() - startTime;
    deps.metrics.messageDeliveryLatency.observe(latencyMs / 1000);
  });

  socket.on('message:edit', async (payload: EditMessagePayload) => {
    const parsed = editMessageSchema.safeParse(payload);
    if (!parsed.success) return;

    const updated = await deps.messageService.editMessage(
      parsed.data.channelId,
      parsed.data.messageId,
      parsed.data.content,
    );
    if (updated) {
      deps.io.to(parsed.data.channelId).emit('message:updated', updated);
    }
  });

  socket.on('message:delete', async (payload: { channelId: string; messageId: string }) => {
    const deleted = await deps.messageService.deleteMessage(payload.channelId, payload.messageId);
    if (deleted) {
      deps.io.to(payload.channelId).emit('message:deleted', {
        channelId: payload.channelId,
        messageId: payload.messageId,
      });
    }
  });
}
