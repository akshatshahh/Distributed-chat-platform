import type { Socket } from 'socket.io';
import { verifyAccessToken } from '@chat/shared-utils';
import type { SocketData } from '@chat/shared-types';

export function wsAuthMiddleware(socket: Socket, next: (err?: Error) => void) {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    const payload = verifyAccessToken(token);
    (socket.data as SocketData).userId = payload.sub;
    (socket.data as SocketData).username = payload.username;
    (socket.data as SocketData).email = payload.email;
    next();
  } catch {
    next(new Error('Invalid or expired token'));
  }
}
