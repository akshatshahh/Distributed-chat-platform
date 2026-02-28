import type { FastifyInstance } from 'fastify';
import { paginationSchema } from '@chat/shared-utils';

import type { MessageService } from '../services/message.service.js';

export function registerMessageRoutes(app: FastifyInstance, messageService: MessageService) {
  app.get('/channels/:channelId/messages', async (request, reply) => {
    const { channelId } = request.params as { channelId: string };
    const query = paginationSchema.safeParse(request.query);
    if (!query.success) {
      return reply.status(400).send({ success: false, error: 'VALIDATION_ERROR' });
    }

    const result = await messageService.getHistory(channelId, query.data.cursor, query.data.limit);
    return reply.status(200).send({ success: true, data: result });
  });
}
