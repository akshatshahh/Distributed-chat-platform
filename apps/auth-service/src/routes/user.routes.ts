import type { FastifyInstance } from 'fastify';

import type { AuthService } from '../services/auth.service.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

export function registerUserRoutes(app: FastifyInstance, authService: AuthService) {
  app.get('/auth/me', { preHandler: [authMiddleware] }, async (request, reply) => {
    const profile = await authService.getProfile(request.user!.id);
    return reply.status(200).send({ success: true, data: profile });
  });
}
