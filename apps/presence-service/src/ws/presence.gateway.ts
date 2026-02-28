import type { Server } from 'socket.io';
import { verifyAccessToken } from '@chat/shared-utils';
import type { Logger, Metrics } from '@chat/shared-utils';
import type { SocketData } from '@chat/shared-types';

import type { PresenceService } from '../services/presence.service.js';

interface Deps {
  io: Server;
  presenceService: PresenceService;
  logger: Logger;
  metrics: Metrics;
}

export function setupPresenceGateway(deps: Deps) {
  const { io, presenceService, logger, metrics } = deps;

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const payload = verifyAccessToken(token);
      (socket.data as SocketData).userId = payload.sub;
      (socket.data as SocketData).username = payload.username;
      (socket.data as SocketData).email = payload.email;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const data = socket.data as SocketData;
    metrics.wsActiveConnections.inc();
    logger.info({ userId: data.userId }, 'Presence connection');

    await presenceService.setOnline(data.userId);
    io.emit('presence:update', { userId: data.userId, status: 'online' });

    socket.on('presence:heartbeat', async () => {
      await presenceService.setOnline(data.userId);
    });

    socket.on('disconnect', async () => {
      metrics.wsActiveConnections.dec();
      await presenceService.setOffline(data.userId);
      io.emit('presence:update', { userId: data.userId, status: 'offline' });
      logger.info({ userId: data.userId }, 'Presence disconnection');
    });
  });
}
