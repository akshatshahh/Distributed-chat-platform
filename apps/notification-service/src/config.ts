export const config = {
  port: parseInt(process.env.NOTIFICATION_SERVICE_PORT || '3004', 10),
  host: process.env.NOTIFICATION_SERVICE_HOST || '0.0.0.0',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4000',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
};
