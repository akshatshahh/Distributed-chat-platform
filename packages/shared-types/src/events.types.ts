import type { Message, SendMessagePayload, EditMessagePayload, MessageAck } from './message.types.js';
import type { UserSummary } from './user.types.js';
import type { PresenceStatus } from './presence.types.js';
import type { Notification } from './notification.types.js';

export interface ServerToClientEvents {
  'message:new': (message: Message) => void;
  'message:updated': (message: Message) => void;
  'message:deleted': (data: { channelId: string; messageId: string }) => void;
  'message:persist_failed': (data: { messageId: string }) => void;
  'channel:joined': (data: { channelId: string; user: UserSummary }) => void;
  'channel:left': (data: { channelId: string; userId: string }) => void;
  'typing:start': (data: { channelId: string; userId: string; username: string }) => void;
  'typing:stop': (data: { channelId: string; userId: string }) => void;
  'presence:update': (data: { userId: string; status: PresenceStatus }) => void;
  'notification:new': (notification: Notification) => void;
  'auth:token_expired': () => void;
  'sync:messages': (data: { channelId: string; messages: Message[] }) => void;
  'sync:complete': () => void;
}

export interface ClientToServerEvents {
  'message:send': (data: SendMessagePayload, ack: (response: MessageAck) => void) => void;
  'message:edit': (data: EditMessagePayload) => void;
  'message:delete': (data: { channelId: string; messageId: string }) => void;
  'channel:join': (channelId: string) => void;
  'channel:leave': (channelId: string) => void;
  'typing:start': (channelId: string) => void;
  'typing:stop': (channelId: string) => void;
  'presence:heartbeat': () => void;
  'auth:refresh': (newToken: string) => void;
  'sync:request': (data: { since: string; channels: string[] }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  username: string;
  email: string;
}
