import { createServer } from 'http';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import {
  createLogger,
  createMetrics,
  createRedisPair,
  getRedisConfig,
  performHealthCheck,
  AppError,
} from '@chat/shared-utils';
import { createDatabaseClient } from '@chat/database';

import { config } from './config.js';
import { MessageRepository } from './repositories/message.repository.js';
import { ChannelRepository } from './repositories/channel.repository.js';
import { MessageService } from './services/message.service.js';
import { ChannelService } from './services/channel.service.js';
import { setupChatGateway } from './ws/chat.gateway.js';
import { registerChannelRoutes } from './routes/channel.routes.js';
import { registerMessageRoutes } from './routes/message.routes.js';

const logger = createLogger('chat-service');
const metrics = createMetrics('chat-service');

async function main() {
  const db = createDatabaseClient();
  const redisConfig = getRedisConfig();
  const { pub, sub, cache } = createRedisPair(redisConfig);

  const messageRepo = new MessageRepository(db);
  const channelRepo = new ChannelRepository(db);
  const messageService = new MessageService(messageRepo, cache);
  const channelService = new ChannelService(channelRepo, cache);

  const app = Fastify({ logger: false });
  await app.register(cors, { origin: config.corsOrigin, credentials: true });

  // Error handler
  app.setErrorHandler(async (error, request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        success: false,
        error: error.code,
        message: error.message,
      });
    }
    logger.error({ err: error }, 'Unhandled error');
    return reply.status(500).send({ success: false, error: 'INTERNAL_ERROR' });
  });

  // REST routes
  registerChannelRoutes(app, channelService);
  registerMessageRoutes(app, messageService);

  app.get('/health', async () => performHealthCheck({ postgres: db, redis: cache }));
  app.get('/metrics', async (request, reply) => {
    reply.header('Content-Type', metrics.registry.contentType);
    return metrics.registry.metrics();
  });

  // Create HTTP server and attach Socket.IO
  const httpServer = createServer(app.server);

  const io = new Server(httpServer, {
    cors: { origin: config.corsOrigin, credentials: true },
    path: '/ws',
    transports: ['websocket', 'polling'],
  });

  io.adapter(createAdapter(pub, sub));

  setupChatGateway({ io, channelService, messageService, logger, metrics });

  // Start listening
  await app.ready();
  httpServer.listen(config.port, config.host, () => {
    logger.info(`Chat service listening on ${config.host}:${config.port}`);
  });
}

main().catch((err) => {
  logger.error({ err }, 'Failed to start chat service');
  process.exit(1);
});
