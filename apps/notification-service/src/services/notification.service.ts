import type { Knex } from 'knex';
import type { Notification } from '@chat/shared-types';

export class NotificationService {
  constructor(private db: Knex) {}

  async create(data: {
    user_id: string;
    type: string;
    title: string;
    body?: string;
    metadata?: Record<string, unknown>;
  }): Promise<Notification> {
    const [row] = await this.db('notifications').insert(data).returning('*');
    return this.toNotification(row);
  }

  async getByUser(userId: string, limit = 50): Promise<Notification[]> {
    const rows = await this.db('notifications')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc')
      .limit(limit);
    return rows.map(this.toNotification);
  }

  async getUnreadCount(userId: string): Promise<number> {
    const result = await this.db('notifications')
      .where({ user_id: userId, is_read: false })
      .count('* as count')
      .first();
    return Number(result?.count || 0);
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.db('notifications')
      .where({ id: notificationId, user_id: userId })
      .update({ is_read: true });
  }

  async markAllRead(userId: string): Promise<void> {
    await this.db('notifications')
      .where({ user_id: userId, is_read: false })
      .update({ is_read: true });
  }

  private toNotification(row: any): Notification {
    return {
      id: row.id,
      userId: row.user_id,
      type: row.type,
      title: row.title,
      body: row.body,
      metadata: row.metadata || {},
      isRead: row.is_read,
      createdAt: row.created_at,
    };
  }
}
