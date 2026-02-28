import type { FastifyRequest, FastifyReply } from 'fastify';
import { verifyAccessToken, UnauthorizedError } from '@chat/shared-utils';

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header');
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyAccessToken(token);
    request.user = {
      id: payload.sub,
      username: payload.username,
      email: payload.email,
    };
  } catch {
    throw new UnauthorizedError('Invalid or expired access token');
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      username: string;
      email: string;
    };
  }
}
