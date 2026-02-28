import type { FastifyInstance } from 'fastify';

import type { ServiceHealthCollector } from '../collectors/service-health.collector.js';

export function registerHealthRoutes(app: FastifyInstance, collector: ServiceHealthCollector) {
  app.get('/health', async () => {
    const results = await collector.collectAll();
    const statuses = Object.values(results).map((r) => r.status);
    const allHealthy = statuses.every((s) => s === 'healthy');
    const anyUnhealthy = statuses.some((s) => s === 'unhealthy');

    return {
      status: allHealthy ? 'healthy' : anyUnhealthy ? 'unhealthy' : 'degraded',
      services: results,
      uptime: process.uptime(),
    };
  });

  app.get('/health/cached', async () => {
    return { success: true, data: collector.getCached() };
  });
}
