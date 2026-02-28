import Redis from 'ioredis';

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
}

export function createRedisClient(config: RedisConfig): Redis {
  return new Redis({
    host: config.host,
    port: config.port,
    password: config.password || undefined,
    maxRetriesPerRequest: 3,
    enableAutoPipelining: true,
    retryStrategy: (times) => Math.min(times * 50, 2000),
  });
}

export function createRedisPair(config: RedisConfig) {
  return {
    pub: createRedisClient(config),
    sub: createRedisClient(config),
    cache: createRedisClient(config),
  };
}

export function getRedisConfig(): RedisConfig {
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  };
}
