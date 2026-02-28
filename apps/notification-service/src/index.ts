import Fastify from 'fastify';
import cors from '@fastify/cors';
import { createLogger, createMetrics, performHealthCheck } from '@chat/shared-utils';
import { createDatabaseClient } from '@chat/database';

import { config } from './config.js';
import { NotificationService } from './services/notification.service.js';
import { createMentionWorker } from './workers/mention.worker.js';
import { registerNotificationRoutes } from './routes/notification.routes.js';

const logger = createLogger('notification-service');
const metrics = createMetrics('notification-service');

async function main() {
  const db = createDatabaseClient();
  const notificationService = new NotificationService(db);

  const mentionWorker = createMentionWorker(notificationService, logger);
  logger.info('Mention worker started');

  const app = Fastify({ logger: false });
  await app.register(cors, { origin: config.corsOrigin });

  registerNotificationRoutes(app, notificationService);

  app.get('/health', async () => performHealthCheck({ postgres: db }));
  app.get('/metrics', async (request, reply) => {
    reply.header('Content-Type', metrics.registry.contentType);
    return metrics.registry.metrics();
  });

  await app.listen({ port: config.port, host: config.host });
  logger.info(`Notification service listening on ${config.host}:${config.port}`);

  const shutdown = async () => {
    await mentionWorker.close();
    await app.close();
    await db.destroy();
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((err) => {
  logger.error({ err }, 'Failed to start notification service');
  process.exit(1);
});
