export const config = {
  port: parseInt(process.env.MONITORING_SERVICE_PORT || '3005', 10),
  host: process.env.MONITORING_SERVICE_HOST || '0.0.0.0',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4000',
  services: [
    { name: 'api-gateway', url: process.env.GATEWAY_URL || 'http://localhost:3000' },
    { name: 'auth-service', url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001' },
    { name: 'chat-service', url: process.env.CHAT_SERVICE_URL || 'http://localhost:3002' },
    { name: 'presence-service', url: process.env.PRESENCE_SERVICE_URL || 'http://localhost:3003' },
    { name: 'notification-service', url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004' },
  ],
};
