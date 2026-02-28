import type { Knex } from 'knex';
import type Redis from 'ioredis';
import type { HealthCheckResult } from '@chat/shared-types';

export async function performHealthCheck(checks: {
  postgres?: Knex;
  redis?: Redis;
}): Promise<HealthCheckResult> {
  const results: HealthCheckResult = {
    status: 'healthy',
    checks: {},
    uptime: process.uptime(),
    version: process.env.APP_VERSION || 'unknown',
  };

  if (checks.postgres) {
    const start = Date.now();
    try {
      await checks.postgres.raw('SELECT 1');
      results.checks.postgres = { status: 'up', latencyMs: Date.now() - start };
    } catch (err) {
      results.checks.postgres = { status: 'down', latencyMs: Date.now() - start, error: String(err) };
      results.status = 'unhealthy';
    }
  }

  if (checks.redis) {
    const start = Date.now();
    try {
      await checks.redis.ping();
      results.checks.redis = { status: 'up', latencyMs: Date.now() - start };
    } catch (err) {
      results.checks.redis = { status: 'down', latencyMs: Date.now() - start, error: String(err) };
      results.status = 'degraded';
    }
  }

  return results;
}
