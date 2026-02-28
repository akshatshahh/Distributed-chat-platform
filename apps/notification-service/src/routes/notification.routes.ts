import type { FastifyInstance } from 'fastify';

import type { NotificationService } from '../services/notification.service.js';

export function registerNotificationRoutes(
  app: FastifyInstance,
  notificationService: NotificationService,
) {
  app.get('/notifications', async (request, reply) => {
    const userId = (request as any).user?.id;
    if (!userId) return reply.status(401).send({ success: false, error: 'UNAUTHORIZED' });

    const notifications = await notificationService.getByUser(userId);
    const unreadCount = await notificationService.getUnreadCount(userId);
    return { success: true, data: { notifications, unreadCount } };
  });

  app.post('/notifications/:id/read', async (request, reply) => {
    const userId = (request as any).user?.id;
    if (!userId) return reply.status(401).send({ success: false, error: 'UNAUTHORIZED' });

    const { id } = request.params as { id: string };
    await notificationService.markAsRead(id, userId);
    return { success: true };
  });

  app.post('/notifications/read-all', async (request, reply) => {
    const userId = (request as any).user?.id;
    if (!userId) return reply.status(401).send({ success: false, error: 'UNAUTHORIZED' });

    await notificationService.markAllRead(userId);
    return { success: true };
  });
}
