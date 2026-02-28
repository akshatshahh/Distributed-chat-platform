import { createServer } from 'http';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createLogger, createMetrics, createRedisPair, getRedisConfig, performHealthCheck } from '@chat/shared-utils';

import { config } from './config.js';
import { PresenceService } from './services/presence.service.js';
import { setupPresenceGateway } from './ws/presence.gateway.js';
import { registerPresenceRoutes } from './routes/presence.routes.js';

const logger = createLogger('presence-service');
const metrics = createMetrics('presence-service');

async function main() {
  const redisConfig = getRedisConfig();
  const { pub, sub, cache } = createRedisPair(redisConfig);
  const presenceService = new PresenceService(cache);

  const app = Fastify({ logger: false });
  await app.register(cors, { origin: config.corsOrigin });

  registerPresenceRoutes(app, presenceService);
  app.get('/health', async () => performHealthCheck({ redis: cache }));
  app.get('/metrics', async (request, reply) => {
    reply.header('Content-Type', metrics.registry.contentType);
    return metrics.registry.metrics();
  });

  const httpServer = createServer(app.server);
  const io = new Server(httpServer, {
    cors: { origin: config.corsOrigin },
    path: '/ws-presence',
  });
  io.adapter(createAdapter(pub, sub));

  setupPresenceGateway({ io, presenceService, logger, metrics });

  // Cleanup stale users periodically
  setInterval(() => presenceService.cleanupStale(), 60000);

  await app.ready();
  httpServer.listen(config.port, config.host, () => {
    logger.info(`Presence service listening on ${config.host}:${config.port}`);
  });
}

main().catch((err) => {
  logger.error({ err }, 'Failed to start presence service');
  process.exit(1);
});
