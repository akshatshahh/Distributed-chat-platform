import type { HealthCheckResult } from '@chat/shared-types';
import type { Logger } from '@chat/shared-utils';

interface ServiceConfig {
  name: string;
  url: string;
}

export class ServiceHealthCollector {
  private cache: Record<string, HealthCheckResult> = {};

  constructor(
    private services: ServiceConfig[],
    private logger: Logger,
  ) {}

  async collectAll(): Promise<Record<string, HealthCheckResult>> {
    const results: Record<string, HealthCheckResult> = {};

    for (const service of this.services) {
      const start = Date.now();
      try {
        const response = await fetch(`${service.url}/health`, {
          signal: AbortSignal.timeout(5000),
        });
        const data = await response.json() as HealthCheckResult;
        results[service.name] = data;
      } catch (err) {
        results[service.name] = {
          status: 'unhealthy',
          checks: { connection: { status: 'down', latencyMs: Date.now() - start, error: String(err) } },
          uptime: 0,
          version: 'unknown',
        };
      }
    }

    this.cache = results;
    return results;
  }

  getCached(): Record<string, HealthCheckResult> {
    return this.cache;
  }
}
