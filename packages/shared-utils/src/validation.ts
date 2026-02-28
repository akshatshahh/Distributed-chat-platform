import { z } from 'zod';

export const emailSchema = z.string().email().max(255);
export const usernameSchema = z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/);
export const passwordSchema = z.string().min(8).max(128);
export const displayNameSchema = z.string().min(1).max(100);
export const channelNameSchema = z.string().min(1).max(100);
export const messageContentSchema = z.string().min(1).max(5000);
export const uuidSchema = z.string().uuid();

export const registerSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  displayName: displayNameSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export const sendMessageSchema = z.object({
  channelId: uuidSchema,
  content: messageContentSchema,
  type: z.enum(['text', 'image', 'file', 'system']).optional(),
  replyToId: uuidSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const editMessageSchema = z.object({
  channelId: uuidSchema,
  messageId: uuidSchema,
  content: messageContentSchema,
});

export const createChannelSchema = z.object({
  name: channelNameSchema,
  description: z.string().max(500).optional(),
  type: z.enum(['group', 'direct', 'public']),
});

export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export { z };
