import type Redis from 'ioredis';
import type { PresenceStatus } from '@chat/shared-types';

export class PresenceService {
  private readonly onlineKey = 'presence:online';

  constructor(private redis: Redis) {}

  async setOnline(userId: string): Promise<void> {
    await this.redis.zadd(this.onlineKey, Date.now(), userId);
  }

  async setOffline(userId: string): Promise<void> {
    await this.redis.zrem(this.onlineKey, userId);
  }

  async getStatus(userId: string): Promise<PresenceStatus> {
    const score = await this.redis.zscore(this.onlineKey, userId);
    if (!score) return 'offline';
    const lastSeen = parseInt(score, 10);
    const elapsed = Date.now() - lastSeen;
    if (elapsed < 60000) return 'online';
    if (elapsed < 300000) return 'away';
    return 'offline';
  }

  async getOnlineUsers(): Promise<string[]> {
    const threshold = Date.now() - 60000;
    return this.redis.zrangebyscore(this.onlineKey, threshold, '+inf');
  }

  async getBulkStatus(userIds: string[]): Promise<Record<string, PresenceStatus>> {
    const result: Record<string, PresenceStatus> = {};
    for (const id of userIds) {
      result[id] = await this.getStatus(id);
    }
    return result;
  }

  async cleanupStale(): Promise<number> {
    const threshold = Date.now() - 300000;
    return this.redis.zremrangebyscore(this.onlineKey, '-inf', threshold);
  }
}
