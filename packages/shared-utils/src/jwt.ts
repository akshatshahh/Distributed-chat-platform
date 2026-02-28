import jwt from 'jsonwebtoken';
import type { TokenPayload, RefreshTokenPayload } from '@chat/shared-types';

export function signAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  const expiresInSec = parseExpiry(process.env.JWT_ACCESS_EXPIRY || '15m');
  return jwt.sign(payload, getAccessSecret(), { expiresIn: expiresInSec });
}

export function signRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string {
  const expiresInSec = parseExpiry(process.env.JWT_REFRESH_EXPIRY || '7d');
  return jwt.sign(payload, getRefreshSecret(), { expiresIn: expiresInSec });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, getAccessSecret()) as TokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, getRefreshSecret()) as RefreshTokenPayload;
}

function getAccessSecret(): string {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error('JWT_ACCESS_SECRET is not set');
  return secret;
}

function getRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error('JWT_REFRESH_SECRET is not set');
  return secret;
}

function parseExpiry(value: string): number {
  const match = value.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return 900; // default 15 minutes
  const num = parseInt(match[1], 10);
  switch (match[2]) {
    case 's': return num;
    case 'm': return num * 60;
    case 'h': return num * 3600;
    case 'd': return num * 86400;
    default: return 900;
  }
}
