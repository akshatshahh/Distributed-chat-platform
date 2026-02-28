import type Redis from 'ioredis';

import { ChannelRepository } from '../repositories/channel.repository.js';
import { NotFoundError, ForbiddenError } from '@chat/shared-utils';

export class ChannelService {
  constructor(
    private channelRepo: ChannelRepository,
    private redis: Redis,
  ) {}

  async create(data: { name: string; description?: string; type: string; userId: string }) {
    const channel = await this.channelRepo.create({
      name: data.name,
      description: data.description,
      type: data.type,
      created_by: data.userId,
    });

    await this.channelRepo.addMember(channel.id, data.userId, 'owner');
    return channel;
  }

  async getById(channelId: string) {
    const channel = await this.channelRepo.findById(channelId);
    if (!channel) throw new NotFoundError('Channel', channelId);
    return channel;
  }

  async getUserChannels(userId: string) {
    return this.channelRepo.findByUser(userId);
  }

  async join(channelId: string, userId: string) {
    const channel = await this.getById(channelId);
    const memberCount = await this.channelRepo.getMemberCount(channelId);
    if (memberCount >= channel.max_members) {
      throw new ForbiddenError('Channel is full');
    }
    await this.channelRepo.addMember(channelId, userId);
  }

  async leave(channelId: string, userId: string) {
    await this.channelRepo.removeMember(channelId, userId);
  }

  async isMember(channelId: string, userId: string): Promise<boolean> {
    const cacheKey = `member:${channelId}:${userId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached !== null) return cached === '1';

    const result = await this.channelRepo.isMember(channelId, userId);
    await this.redis.setex(cacheKey, 300, result ? '1' : '0');
    return result;
  }

  async invalidateMemberCache(channelId: string, userId: string) {
    await this.redis.del(`member:${channelId}:${userId}`);
  }
}
