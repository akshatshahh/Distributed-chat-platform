import type { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';

import { config } from '../config.js';

export async function registerRateLimit(app: FastifyInstance) {
  await app.register(rateLimit, {
    max: config.rateLimit.max,
    timeWindow: config.rateLimit.timeWindow,
    keyGenerator: (request) => {
      return request.user?.id || request.ip;
    },
    errorResponseBuilder: () => ({
      success: false,
      error: 'RATE_LIMIT',
      message: 'Too many requests, please try again later',
    }),
  });
}
