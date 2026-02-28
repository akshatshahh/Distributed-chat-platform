import { Worker, type Job } from 'bullmq';
import type { Message } from '@chat/shared-types';
import type { Logger } from '@chat/shared-utils';

import type { NotificationService } from '../services/notification.service.js';
import { config } from '../config.js';

interface MentionJobData {
  message: Message;
  senderUsername: string;
}

export function createMentionWorker(
  notificationService: NotificationService,
  logger: Logger,
) {
  const worker = new Worker<MentionJobData>(
    'process-message',
    async (job: Job<MentionJobData>) => {
      const { message, senderUsername } = job.data;
      const mentionRegex = /@(\w+)/g;
      const mentions = [...message.content.matchAll(mentionRegex)].map((m) => m[1]);

      for (const username of mentions) {
        await notificationService.create({
          user_id: username, // In production, resolve username -> userId
          type: 'mention',
          title: `${senderUsername} mentioned you`,
          body: message.content.slice(0, 100),
          metadata: { channelId: message.channelId, messageId: message.id },
        });
      }

      if (mentions.length > 0) {
        logger.info({ messageId: message.id, mentions }, 'Processed mentions');
      }
    },
    {
      connection: { host: config.redis.host, port: config.redis.port },
      concurrency: 5,
    },
  );

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'Mention worker job failed');
  });

  return worker;
}
