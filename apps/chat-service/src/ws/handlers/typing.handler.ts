import type { Socket } from 'socket.io';
import type { SocketData } from '@chat/shared-types';

export function registerTypingHandlers(socket: Socket) {
  const data = socket.data as SocketData;

  socket.on('typing:start', (channelId: string) => {
    socket.to(channelId).emit('typing:start', {
      channelId,
      userId: data.userId,
      username: data.username,
    });
  });

  socket.on('typing:stop', (channelId: string) => {
    socket.to(channelId).emit('typing:stop', {
      channelId,
      userId: data.userId,
    });
  });
}
