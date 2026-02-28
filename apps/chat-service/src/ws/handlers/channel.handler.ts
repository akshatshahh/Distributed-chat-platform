import type { Socket, Server } from 'socket.io';
import type { SocketData } from '@chat/shared-types';
import type { Logger } from '@chat/shared-utils';

import type { ChannelService } from '../../services/channel.service.js';

interface Deps {
  io: Server;
  channelService: ChannelService;
  logger: Logger;
}

export function registerChannelHandlers(socket: Socket, deps: Deps) {
  const data = socket.data as SocketData;

  socket.on('channel:join', async (channelId: string) => {
    try {
      const isMember = await deps.channelService.isMember(channelId, data.userId);
      if (!isMember) {
        deps.logger.warn({ userId: data.userId, channelId }, 'Non-member tried to join channel room');
        return;
      }
      socket.join(channelId);
      socket.to(channelId).emit('channel:joined', {
        channelId,
        user: { id: data.userId, username: data.username, displayName: data.username, avatarUrl: null },
      });
      deps.logger.debug({ userId: data.userId, channelId }, 'User joined channel room');
    } catch (err) {
      deps.logger.error({ err, channelId }, 'Error joining channel');
    }
  });

  socket.on('channel:leave', async (channelId: string) => {
    socket.leave(channelId);
    socket.to(channelId).emit('channel:left', { channelId, userId: data.userId });
    deps.logger.debug({ userId: data.userId, channelId }, 'User left channel room');
  });
}
