import type { FastifyInstance } from 'fastify';
import { registerSchema, loginSchema, AppError } from '@chat/shared-utils';

import type { AuthService } from '../services/auth.service.js';
import { config } from '../config.js';

export function registerAuthRoutes(app: FastifyInstance, authService: AuthService) {
  app.post('/auth/register', async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        success: false,
        error: 'VALIDATION_ERROR',
        message: parsed.error.issues.map((i) => i.message).join(', '),
      });
    }

    const { auth, refreshToken } = await authService.register({
      username: parsed.data.username,
      email: parsed.data.email,
      displayName: parsed.data.displayName,
      password: parsed.data.password,
      userAgent: request.headers['user-agent'],
      ipAddress: request.ip,
    });

    reply.setCookie(config.cookie.refreshTokenName, refreshToken, {
      httpOnly: config.cookie.httpOnly,
      secure: config.cookie.secure,
      sameSite: config.cookie.sameSite,
      path: config.cookie.path,
      maxAge: config.cookie.maxAge / 1000, // Fastify uses seconds
    });

    return reply.status(201).send({ success: true, data: auth });
  });

  app.post('/auth/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        success: false,
        error: 'VALIDATION_ERROR',
        message: parsed.error.issues.map((i) => i.message).join(', '),
      });
    }

    const { auth, refreshToken } = await authService.login({
      email: parsed.data.email,
      password: parsed.data.password,
      userAgent: request.headers['user-agent'],
      ipAddress: request.ip,
    });

    reply.setCookie(config.cookie.refreshTokenName, refreshToken, {
      httpOnly: config.cookie.httpOnly,
      secure: config.cookie.secure,
      sameSite: config.cookie.sameSite,
      path: config.cookie.path,
      maxAge: config.cookie.maxAge / 1000,
    });

    return reply.status(200).send({ success: true, data: auth });
  });

  app.post('/auth/refresh', async (request, reply) => {
    const refreshTokenValue = request.cookies[config.cookie.refreshTokenName];
    if (!refreshTokenValue) {
      return reply.status(401).send({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'No refresh token provided',
      });
    }

    const { auth, refreshToken } = await authService.refresh(
      refreshTokenValue,
      request.headers['user-agent'],
      request.ip,
    );

    reply.setCookie(config.cookie.refreshTokenName, refreshToken, {
      httpOnly: config.cookie.httpOnly,
      secure: config.cookie.secure,
      sameSite: config.cookie.sameSite,
      path: config.cookie.path,
      maxAge: config.cookie.maxAge / 1000,
    });

    return reply.status(200).send({ success: true, data: auth });
  });

  app.post('/auth/logout', async (request, reply) => {
    const refreshTokenValue = request.cookies[config.cookie.refreshTokenName];
    if (refreshTokenValue) {
      await authService.logout(refreshTokenValue);
    }

    reply.clearCookie(config.cookie.refreshTokenName, {
      path: config.cookie.path,
    });

    return reply.status(200).send({ success: true, message: 'Logged out' });
  });
}
