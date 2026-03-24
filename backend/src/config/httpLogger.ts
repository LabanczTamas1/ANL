import pinoHttp from 'pino-http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { logger as rootLogger } from '../utils/logger.js';

const createHttpLogger = pinoHttp as unknown as (opts: Record<string, unknown>) => any;

export const httpLogger = createHttpLogger({
  logger: rootLogger,
  autoLogging: {
    ignore: (req: IncomingMessage) => (req as any).url === '/health',
  },
  customLogLevel(_req: IncomingMessage, res: ServerResponse, err: Error | undefined) {
    if (res.statusCode >= 400 && res.statusCode < 500) return 'warn';
    if (res.statusCode >= 500 || err) return 'error';
    return 'info';
  },
  serializers: {
    req: (req: any) => ({
      method: req.method,
      url: req.url,
      headers: {
        host: req.headers.host,
        userAgent: req.headers['user-agent'],
      },
      remoteAddress: req.remoteAddress,
      remotePort: req.remotePort,
    }),
    res: (res: any) => ({
      statusCode: res.statusCode,
    }),
  },
});
