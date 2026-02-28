export const config = {
  port: parseInt(process.env.CHAT_SERVICE_PORT || '3002', 10),
  host: process.env.CHAT_SERVICE_HOST || '0.0.0.0',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4000',
  messageCacheSize: 50,
};
