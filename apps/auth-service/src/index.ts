import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import { createLogger, AppError, createMetrics, performHealthCheck } from '@chat/shared-utils';
import { createDatabaseClient } from '@chat/database';

import { config } from './config.js';
import { UserRepository } from './repositories/user.repository.js';
import { AuthService } from './services/auth.service.js';
import { registerAuthRoutes } from './routes/auth.routes.js';
import { registerUserRoutes } from './routes/user.routes.js';

const logger = createLogger('auth-service');
const metrics = createMetrics('auth-service');

async function main() {
  const db = createDatabaseClient();
  const userRepo = new UserRepository(db);
  const authService = new AuthService(userRepo);

  const app = Fastify({ logger: false });

  await app.register(cookie);
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:4000',
    credentials: true,
  });

  // Request logging and metrics
  app.addHook('onRequest', async (request) => {
    request.startTime = Date.now();
  });

  app.addHook('onResponse', async (request, reply) => {
    const duration = (Date.now() - (request.startTime || Date.now())) / 1000;
    const route = request.routeOptions?.url || request.url;
    metrics.httpRequestDuration.observe(
      { method: request.method, route, status_code: reply.statusCode.toString() },
      duration,
    );
    metrics.httpRequestTotal.inc({
      method: request.method,
      route,
      status_code: reply.statusCode.toString(),
    });
    logger.info({
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      duration: `${duration.toFixed(3)}s`,
    });
  });

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
    return reply.status(500).send({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    });
  });

  // Routes
  registerAuthRoutes(app, authService);
  registerUserRoutes(app, authService);

  // Health check
  app.get('/health', async () => {
    return performHealthCheck({ postgres: db });
  });

  // Metrics endpoint
  app.get('/metrics', async (request, reply) => {
    reply.header('Content-Type', metrics.registry.contentType);
    return metrics.registry.metrics();
  });

  // Start server
  await app.listen({ port: config.port, host: config.host });
  logger.info(`Auth service listening on ${config.host}:${config.port}`);
}

main().catch((err) => {
  logger.error({ err }, 'Failed to start auth service');
  process.exit(1);
});

declare module 'fastify' {
  interface FastifyRequest {
    startTime?: number;
  }
}
