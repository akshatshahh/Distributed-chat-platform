import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

export function createMetrics(serviceName: string) {
  const registry = new Registry();
  registry.setDefaultLabels({ service: serviceName });
  collectDefaultMetrics({ register: registry });

  return {
    registry,
    httpRequestDuration: new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests',
      labelNames: ['method', 'route', 'status_code'] as const,
      buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5],
      registers: [registry],
    }),
    httpRequestTotal: new Counter({
      name: 'http_requests_total',
      help: 'Total HTTP requests',
      labelNames: ['method', 'route', 'status_code'] as const,
      registers: [registry],
    }),
    wsActiveConnections: new Gauge({
      name: 'ws_active_connections',
      help: 'Number of active WebSocket connections',
      registers: [registry],
    }),
    wsMessagesTotal: new Counter({
      name: 'ws_messages_total',
      help: 'Total WebSocket messages processed',
      labelNames: ['event', 'direction'] as const,
      registers: [registry],
    }),
    messageDeliveryLatency: new Histogram({
      name: 'message_delivery_latency_seconds',
      help: 'End-to-end message delivery latency',
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5],
      registers: [registry],
    }),
    dbQueryDuration: new Histogram({
      name: 'db_query_duration_seconds',
      help: 'Database query duration',
      labelNames: ['query_type', 'table'] as const,
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5],
      registers: [registry],
    }),
  };
}

export type Metrics = ReturnType<typeof createMetrics>;
