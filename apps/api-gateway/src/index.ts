import Fastify from 'fastify';
import cors from '@fastify/cors';
import httpProxy from '@fastify/http-proxy';
import { createLogger, createMetrics, AppError } from '@chat/shared-utils';

import { config } from './config.js';
import { authMiddleware } from './middleware/auth.middleware.js';
import { registerRateLimit } from './middleware/rate-limit.middleware.js';
import { registerHealthRoutes } from './routes/health.js';

const logger = createLogger('api-gateway');
const metrics = createMetrics('api-gateway');

async function main() {
  const app = Fastify({ logger: false });

  await app.register(cors, { origin: config.corsOrigin, credentials: true });
  await registerRateLimit(app);

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
    return reply.status(500).send({ success: false, error: 'INTERNAL_ERROR' });
  });

  // Auth service proxy (no auth required for auth endpoints)
  await app.register(httpProxy, {
    upstream: config.authServiceUrl,
    prefix: '/auth',
    rewritePrefix: '/auth',
  });

  // Chat service proxy (auth required)
  await app.register(async function chatProxy(instance) {
    instance.addHook('preHandler', authMiddleware);
    await instance.register(httpProxy, {
      upstream: config.chatServiceUrl,
      prefix: '/channels',
      rewritePrefix: '/channels',
    });
  });

  // Health and metrics
  registerHealthRoutes(app);

  app.get('/metrics', async (request, reply) => {
    reply.header('Content-Type', metrics.registry.contentType);
    return metrics.registry.metrics();
  });

  await app.listen({ port: config.port, host: config.host });
  logger.info(`API Gateway listening on ${config.host}:${config.port}`);
}

main().catch((err) => {
  logger.error({ err }, 'Failed to start API Gateway');
  process.exit(1);
});

declare module 'fastify' {
  interface FastifyRequest {
    startTime?: number;
  }
}
