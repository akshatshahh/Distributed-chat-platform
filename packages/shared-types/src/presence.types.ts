export type PresenceStatus = 'online' | 'away' | 'dnd' | 'offline';

export interface PresenceUpdate {
  userId: string;
  status: PresenceStatus;
  lastSeenAt: Date;
}

export interface TypingEvent {
  channelId: string;
  userId: string;
  username: string;
}
