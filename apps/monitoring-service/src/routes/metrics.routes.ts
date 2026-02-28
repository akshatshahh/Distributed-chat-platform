import type { FastifyInstance } from 'fastify';
import type { Metrics } from '@chat/shared-utils';

export function registerMetricsRoutes(app: FastifyInstance, metrics: Metrics) {
  app.get('/metrics', async (request, reply) => {
    reply.header('Content-Type', metrics.registry.contentType);
    return metrics.registry.metrics();
  });
}
