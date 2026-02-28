import type { FastifyInstance } from 'fastify';

import type { PresenceService } from '../services/presence.service.js';

export function registerPresenceRoutes(app: FastifyInstance, presenceService: PresenceService) {
  app.get('/presence/online', async () => {
    const users = await presenceService.getOnlineUsers();
    return { success: true, data: users };
  });

  app.post('/presence/status', async (request) => {
    const { userIds } = request.body as { userIds: string[] };
    const statuses = await presenceService.getBulkStatus(userIds || []);
    return { success: true, data: statuses };
  });
}
