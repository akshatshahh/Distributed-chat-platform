import { io, type Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@chat/shared-types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3002';

type ChatSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: ChatSocket | null = null;

export function getSocket(token: string): ChatSocket {
  if (socket?.connected) return socket;

  socket = io(WS_URL, {
    path: '/ws',
    transports: ['websocket', 'polling'],
    auth: { token },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 30000,
    randomizationFactor: 0.5,
    timeout: 20000,
  }) as ChatSocket;

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
