export const config = {
  port: parseInt(process.env.GATEWAY_PORT || '3000', 10),
  host: process.env.GATEWAY_HOST || '0.0.0.0',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4000',
  authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  chatServiceUrl: process.env.CHAT_SERVICE_URL || 'http://localhost:3002',
  presenceServiceUrl: process.env.PRESENCE_SERVICE_URL || 'http://localhost:3003',
  notificationServiceUrl: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004',
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10),
  },
};
