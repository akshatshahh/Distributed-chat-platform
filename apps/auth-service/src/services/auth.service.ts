import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from '@chat/shared-utils';
import type { AuthResponse, UserSummary } from '@chat/shared-types';

import { UserRepository } from '../repositories/user.repository.js';
import { config } from '../config.js';

export class AuthService {
  constructor(private userRepo: UserRepository) {}

  async register(data: {
    username: string;
    email: string;
    displayName: string;
    password: string;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<{ auth: AuthResponse; refreshToken: string }> {
    const existingEmail = await this.userRepo.findByEmail(data.email);
    if (existingEmail) {
      throw new ConflictError('Email already in use');
    }

    const existingUsername = await this.userRepo.findByUsername(data.username);
    if (existingUsername) {
      throw new ConflictError('Username already taken');
    }

    const passwordHash = await bcrypt.hash(data.password, config.bcryptRounds);

    const user = await this.userRepo.create({
      username: data.username,
      email: data.email,
      display_name: data.displayName,
      password_hash: passwordHash,
    });

    return this.generateTokens(user.id, user.username, user.email, {
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      userAgent: data.userAgent,
      ipAddress: data.ipAddress,
    });
  }

  async login(data: {
    email: string;
    password: string;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<{ auth: AuthResponse; refreshToken: string }> {
    const user = await this.userRepo.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValid = await bcrypt.compare(data.password, user.password_hash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    await this.userRepo.updateLastSeen(user.id);

    return this.generateTokens(user.id, user.username, user.email, {
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      userAgent: data.userAgent,
      ipAddress: data.ipAddress,
    });
  }

  async refresh(
    refreshTokenValue: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<{ auth: AuthResponse; refreshToken: string }> {
    const payload = verifyRefreshToken(refreshTokenValue);
    const tokenHash = this.hashToken(refreshTokenValue);

    const storedToken = await this.userRepo.findRefreshTokenByHash(tokenHash);
    if (!storedToken) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // Revoke old token (rotation)
    await this.userRepo.revokeRefreshToken(tokenHash);

    const user = await this.userRepo.findById(payload.sub);
    if (!user) {
      throw new NotFoundError('User');
    }

    return this.generateTokens(user.id, user.username, user.email, {
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      userAgent,
      ipAddress,
    });
  }

  async logout(refreshTokenValue: string): Promise<void> {
    const tokenHash = this.hashToken(refreshTokenValue);
    await this.userRepo.revokeRefreshToken(tokenHash);
  }

  async getProfile(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User', userId);
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      statusMessage: user.status_message,
      isActive: user.is_active,
      lastSeenAt: user.last_seen_at,
      createdAt: user.created_at,
    };
  }

  private async generateTokens(
    userId: string,
    username: string,
    email: string,
    extra: {
      displayName: string;
      avatarUrl: string | null;
      userAgent?: string;
      ipAddress?: string;
    },
  ): Promise<{ auth: AuthResponse; refreshToken: string }> {
    const jti = crypto.randomUUID();

    const accessToken = signAccessToken({ sub: userId, username, email });
    const refreshToken = signRefreshToken({ sub: userId, jti });

    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.userRepo.storeRefreshToken({
      user_id: userId,
      token_hash: tokenHash,
      user_agent: extra.userAgent,
      ip_address: extra.ipAddress,
      expires_at: expiresAt,
    });

    const user: UserSummary = {
      id: userId,
      username,
      displayName: extra.displayName,
      avatarUrl: extra.avatarUrl,
    };

    return {
      auth: { accessToken, user },
      refreshToken,
    };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
