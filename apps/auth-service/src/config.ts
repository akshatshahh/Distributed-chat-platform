export const config = {
  port: parseInt(process.env.AUTH_SERVICE_PORT || '3001', 10),
  host: process.env.AUTH_SERVICE_HOST || '0.0.0.0',
  bcryptRounds: 12,
  cookie: {
    refreshTokenName: 'refresh_token',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/auth/refresh',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
};
