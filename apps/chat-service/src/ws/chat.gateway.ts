import type { Server } from 'socket.io';
import type { Logger, Metrics } from '@chat/shared-utils';

import type { ChannelService } from '../services/channel.service.js';
import type { MessageService } from '../services/message.service.js';
import { wsAuthMiddleware } from './middleware/ws-auth.middleware.js';
import { registerMessageHandlers } from './handlers/message.handler.js';
import { registerChannelHandlers } from './handlers/channel.handler.js';
import { registerTypingHandlers } from './handlers/typing.handler.js';
import { registerSyncHandlers } from './handlers/sync.handler.js';

interface GatewayDeps {
  io: Server;
  channelService: ChannelService;
  messageService: MessageService;
  logger: Logger;
  metrics: Metrics;
}

export function setupChatGateway(deps: GatewayDeps) {
  const { io, logger, metrics } = deps;

  io.use(wsAuthMiddleware);

  io.on('connection', (socket) => {
    metrics.wsActiveConnections.inc();
    logger.info({ socketId: socket.id, userId: socket.data.userId }, 'Client connected');

    registerMessageHandlers(socket, deps);
    registerChannelHandlers(socket, deps);
    registerTypingHandlers(socket);
    registerSyncHandlers(socket, deps);

    socket.on('auth:refresh', (newToken: string) => {
      try {
        const { verifyAccessToken } = require('@chat/shared-utils');
        const payload = verifyAccessToken(newToken);
        socket.data.userId = payload.sub;
        socket.data.username = payload.username;
        socket.data.email = payload.email;
        logger.debug({ userId: payload.sub }, 'Token refreshed on socket');
      } catch {
        socket.emit('auth:token_expired');
      }
    });

    socket.on('disconnect', (reason) => {
      metrics.wsActiveConnections.dec();
      logger.info({ socketId: socket.id, userId: socket.data.userId, reason }, 'Client disconnected');
    });
  });
}
