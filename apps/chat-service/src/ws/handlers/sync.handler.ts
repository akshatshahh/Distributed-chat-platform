import type { Socket } from 'socket.io';
import type { SocketData } from '@chat/shared-types';
import type { Logger } from '@chat/shared-utils';

import type { ChannelService } from '../../services/channel.service.js';
import type { MessageService } from '../../services/message.service.js';

interface Deps {
  channelService: ChannelService;
  messageService: MessageService;
  logger: Logger;
}

export function registerSyncHandlers(socket: Socket, deps: Deps) {
  const data = socket.data as SocketData;

  socket.on('sync:request', async (payload: { since: string; channels: string[] }) => {
    const sinceDate = new Date(payload.since);
    const now = new Date();
    const gapMs = now.getTime() - sinceDate.getTime();

    for (const channelId of payload.channels) {
      const isMember = await deps.channelService.isMember(channelId, data.userId);
      if (!isMember) continue;

      try {
        let missedMessages;
        if (gapMs < 60_000) {
          missedMessages = await deps.messageService.getCachedMessages(channelId, sinceDate);
        } else {
          missedMessages = await deps.messageService.getMessagesSince(channelId, sinceDate, 100);
        }

        if (missedMessages.length > 0) {
          socket.emit('sync:messages', { channelId, messages: missedMessages });
        }
      } catch (err) {
        deps.logger.error({ err, channelId }, 'Error syncing messages');
      }
    }

    socket.emit('sync:complete');
  });
}
