import Fastify from 'fastify';
import cors from '@fastify/cors';
import { createLogger, createMetrics } from '@chat/shared-utils';

import { config } from './config.js';
import { ServiceHealthCollector } from './collectors/service-health.collector.js';
import { registerHealthRoutes } from './routes/health.routes.js';
import { registerMetricsRoutes } from './routes/metrics.routes.js';

const logger = createLogger('monitoring-service');
const metrics = createMetrics('monitoring-service');

async function main() {
  const collector = new ServiceHealthCollector(config.services, logger);

  const app = Fastify({ logger: false });
  await app.register(cors, { origin: config.corsOrigin });

  registerHealthRoutes(app, collector);
  registerMetricsRoutes(app, metrics);

  // Periodic health collection
  setInterval(() => {
    collector.collectAll().catch((err) => logger.error({ err }, 'Health collection failed'));
  }, 30000);

  await app.listen({ port: config.port, host: config.host });
  logger.info(`Monitoring service listening on ${config.host}:${config.port}`);
}

main().catch((err) => {
  logger.error({ err }, 'Failed to start monitoring service');
  process.exit(1);
});
