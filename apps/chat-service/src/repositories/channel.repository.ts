import type { Knex } from 'knex';

export interface ChannelRow {
  id: string;
  name: string;
  description: string | null;
  type: string;
  created_by: string;
  max_members: number;
  is_archived: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ChannelMemberRow {
  channel_id: string;
  user_id: string;
  role: string;
  joined_at: Date;
  last_read_at: Date;
  notifications: string;
}

export class ChannelRepository {
  constructor(private db: Knex) {}

  async create(data: {
    name: string;
    description?: string;
    type: string;
    created_by: string;
  }): Promise<ChannelRow> {
    const [channel] = await this.db('channels').insert(data).returning('*');
    return channel;
  }

  async findById(id: string): Promise<ChannelRow | undefined> {
    return this.db('channels').where({ id }).first();
  }

  async findByUser(userId: string): Promise<ChannelRow[]> {
    return this.db('channels')
      .join('channel_members', 'channels.id', 'channel_members.channel_id')
      .where('channel_members.user_id', userId)
      .where('channels.is_archived', false)
      .select('channels.*');
  }

  async addMember(channelId: string, userId: string, role = 'member'): Promise<void> {
    await this.db('channel_members')
      .insert({ channel_id: channelId, user_id: userId, role })
      .onConflict(['channel_id', 'user_id'])
      .ignore();
  }

  async removeMember(channelId: string, userId: string): Promise<void> {
    await this.db('channel_members')
      .where({ channel_id: channelId, user_id: userId })
      .delete();
  }

  async isMember(channelId: string, userId: string): Promise<boolean> {
    const row = await this.db('channel_members')
      .where({ channel_id: channelId, user_id: userId })
      .first();
    return !!row;
  }

  async getMembers(channelId: string): Promise<ChannelMemberRow[]> {
    return this.db('channel_members').where({ channel_id: channelId });
  }

  async getMemberCount(channelId: string): Promise<number> {
    const result = await this.db('channel_members')
      .where({ channel_id: channelId })
      .count('* as count')
      .first();
    return Number(result?.count || 0);
  }
}
