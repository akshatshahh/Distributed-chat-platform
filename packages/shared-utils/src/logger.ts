import pino from 'pino';

export function createLogger(serviceName: string, level?: string) {
  return pino({
    name: serviceName,
    level: level || process.env.LOG_LEVEL || 'info',
    transport:
      process.env.NODE_ENV === 'development'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
    serializers: {
      err: pino.stdSerializers.err,
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
    },
  });
}

export type Logger = pino.Logger;
