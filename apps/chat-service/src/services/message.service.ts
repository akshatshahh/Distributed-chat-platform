import type Redis from 'ioredis';
import type { Message } from '@chat/shared-types';

import { MessageRepository } from '../repositories/message.repository.js';

export class MessageService {
  constructor(
    private messageRepo: MessageRepository,
    private redis: Redis,
  ) {}

  async getHistory(channelId: string, cursor?: string, limit = 50) {
    const messages = await this.messageRepo.findByChannel(channelId, { cursor, limit: limit + 1 });
    const hasMore = messages.length > limit;
    if (hasMore) messages.pop();

    return {
      messages: messages.map(this.toMessage),
      cursor: messages.length > 0 ? messages[messages.length - 1].id : null,
      hasMore,
    };
  }

  async getMessagesSince(channelId: string, since: Date, limit = 100): Promise<Message[]> {
    const rows = await this.messageRepo.getMessagesSince(channelId, since, limit);
    return rows.map(this.toMessage);
  }

  async persist(message: Message): Promise<void> {
    await this.messageRepo.insert({
      id: message.id,
      channel_id: message.channelId,
      sender_id: message.senderId,
      content: message.content,
      message_type: message.messageType,
      reply_to_id: message.replyToId,
      metadata: message.metadata,
    });
  }

  async cacheMessage(channelId: string, message: Message): Promise<void> {
    const key = `msgcache:${channelId}`;
    await this.redis.lpush(key, JSON.stringify(message));
    await this.redis.ltrim(key, 0, 49);
  }

  async getCachedMessages(channelId: string, since: Date): Promise<Message[]> {
    const cached = await this.redis.lrange(`msgcache:${channelId}`, 0, 49);
    return cached
      .map((m) => JSON.parse(m) as Message)
      .filter((m) => new Date(m.createdAt) > since)
      .reverse();
  }

  async editMessage(channelId: string, messageId: string, content: string): Promise<Message | null> {
    const row = await this.messageRepo.update(channelId, messageId, {
      content,
      is_edited: true,
    });
    return row ? this.toMessage(row) : null;
  }

  async deleteMessage(channelId: string, messageId: string): Promise<boolean> {
    const row = await this.messageRepo.update(channelId, messageId, { is_deleted: true });
    return !!row;
  }

  private toMessage(row: { id: string; channel_id: string; sender_id: string; content: string; message_type: string; reply_to_id: string | null; is_edited: boolean; is_deleted: boolean; metadata: Record<string, unknown>; created_at: Date; updated_at: Date }): Message {
    return {
      id: row.id,
      channelId: row.channel_id,
      senderId: row.sender_id,
      content: row.content,
      messageType: row.message_type as Message['messageType'],
      replyToId: row.reply_to_id,
      isEdited: row.is_edited,
      isDeleted: row.is_deleted,
      metadata: row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
