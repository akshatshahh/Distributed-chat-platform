export const config = {
  port: parseInt(process.env.PRESENCE_SERVICE_PORT || '3003', 10),
  host: process.env.PRESENCE_SERVICE_HOST || '0.0.0.0',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4000',
  heartbeatInterval: 30000,
  offlineThreshold: 60000,
};
