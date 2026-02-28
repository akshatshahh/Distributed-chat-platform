import type { FastifyInstance } from 'fastify';
import { createChannelSchema } from '@chat/shared-utils';

import type { ChannelService } from '../services/channel.service.js';

export function registerChannelRoutes(app: FastifyInstance, channelService: ChannelService) {
  app.post('/channels', async (request, reply) => {
    const userId = (request as any).user?.id;
    if (!userId) return reply.status(401).send({ success: false, error: 'UNAUTHORIZED' });

    const parsed = createChannelSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, error: 'VALIDATION_ERROR', message: parsed.error.issues.map((i) => i.message).join(', ') });
    }

    const channel = await channelService.create({
      name: parsed.data.name,
      description: parsed.data.description,
      type: parsed.data.type,
      userId,
    });

    return reply.status(201).send({ success: true, data: channel });
  });

  app.get('/channels', async (request, reply) => {
    const userId = (request as any).user?.id;
    if (!userId) return reply.status(401).send({ success: false, error: 'UNAUTHORIZED' });

    const channels = await channelService.getUserChannels(userId);
    return reply.status(200).send({ success: true, data: channels });
  });

  app.get('/channels/:channelId', async (request, reply) => {
    const { channelId } = request.params as { channelId: string };
    const channel = await channelService.getById(channelId);
    return reply.status(200).send({ success: true, data: channel });
  });

  app.post('/channels/:channelId/join', async (request, reply) => {
    const userId = (request as any).user?.id;
    if (!userId) return reply.status(401).send({ success: false, error: 'UNAUTHORIZED' });

    const { channelId } = request.params as { channelId: string };
    await channelService.join(channelId, userId);
    return reply.status(200).send({ success: true, message: 'Joined channel' });
  });

  app.post('/channels/:channelId/leave', async (request, reply) => {
    const userId = (request as any).user?.id;
    if (!userId) return reply.status(401).send({ success: false, error: 'UNAUTHORIZED' });

    const { channelId } = request.params as { channelId: string };
    await channelService.leave(channelId, userId);
    return reply.status(200).send({ success: true, message: 'Left channel' });
  });
}
