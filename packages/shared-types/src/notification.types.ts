export type NotificationType = 'mention' | 'reply' | 'invite' | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string | null;
  metadata: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
}
