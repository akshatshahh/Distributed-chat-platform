import type { Knex } from 'knex';

export interface MessageRow {
  id: string;
  channel_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  reply_to_id: string | null;
  is_edited: boolean;
  is_deleted: boolean;
  metadata: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export class MessageRepository {
  constructor(private db: Knex) {}

  async insert(message: {
    id: string;
    channel_id: string;
    sender_id: string;
    content: string;
    message_type: string;
    reply_to_id?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<MessageRow> {
    const [row] = await this.db('messages').insert(message).returning('*');
    return row;
  }

  async findByChannel(
    channelId: string,
    options: { cursor?: string; limit: number },
  ): Promise<MessageRow[]> {
    const query = this.db('messages')
      .where({ channel_id: channelId, is_deleted: false })
      .orderBy('created_at', 'desc')
      .limit(options.limit);

    if (options.cursor) {
      const cursorMsg = await this.db('messages')
        .where({ channel_id: channelId, id: options.cursor })
        .select('created_at')
        .first();
      if (cursorMsg) {
        query.where('created_at', '<', cursorMsg.created_at);
      }
    }

    return query;
  }

  async getMessagesSince(
    channelId: string,
    since: Date,
    limit: number,
  ): Promise<MessageRow[]> {
    return this.db('messages')
      .where({ channel_id: channelId, is_deleted: false })
      .where('created_at', '>', since)
      .orderBy('created_at', 'asc')
      .limit(limit);
  }

  async update(
    channelId: string,
    messageId: string,
    data: { content?: string; is_edited?: boolean; is_deleted?: boolean },
  ): Promise<MessageRow | undefined> {
    const [row] = await this.db('messages')
      .where({ channel_id: channelId, id: messageId })
      .update({ ...data, updated_at: new Date() })
      .returning('*');
    return row;
  }
}
