import type { FastifyInstance } from 'fastify';

import { config } from '../config.js';

export function registerHealthRoutes(app: FastifyInstance) {
  app.get('/health', async () => {
    const services = [
      { name: 'auth-service', url: config.authServiceUrl },
      { name: 'chat-service', url: config.chatServiceUrl },
    ];

    const checks: Record<string, { status: string; latencyMs: number }> = {};

    for (const service of services) {
      const start = Date.now();
      try {
        const response = await fetch(`${service.url}/health`);
        checks[service.name] = {
          status: response.ok ? 'up' : 'degraded',
          latencyMs: Date.now() - start,
        };
      } catch {
        checks[service.name] = {
          status: 'down',
          latencyMs: Date.now() - start,
        };
      }
    }

    const allUp = Object.values(checks).every((c) => c.status === 'up');
    const anyDown = Object.values(checks).some((c) => c.status === 'down');

    return {
      status: allUp ? 'healthy' : anyDown ? 'unhealthy' : 'degraded',
      checks,
      uptime: process.uptime(),
      version: process.env.APP_VERSION || 'unknown',
    };
  });
}
