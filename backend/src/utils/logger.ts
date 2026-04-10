import pino from 'pino';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, 'app.log');
const errorLogFile = path.join(logsDir, 'error.log');

const isDevelopment = process.env.NODE_ENV !== 'production';
const seqUrl = process.env.SEQ_URL;
const seqApiKey = process.env.SEQ_API_KEY;

type LogLayer =
  | 'controller'
  | 'service'
  | 'repository'
  | 'middleware'
  | 'config'
  | 'infra';

/**
 * Build the production transport targets array.
 * Always includes file + stdout; adds Seq when SEQ_URL is set.
 */
function buildProductionTargets() {
  const targets: pino.TransportTargetOptions[] = [
    { target: 'pino/file', options: { destination: logFile, append: true } },
    { target: 'pino/file', level: 'error', options: { destination: errorLogFile, append: true } },
    { target: 'pino/file', options: { destination: 1 } }, // stdout fd
  ];

  if (seqUrl) {
    targets.push({
      target: 'pino-seq',
      options: {
        serverUrl: seqUrl,
        ...(seqApiKey ? { apiKey: seqApiKey } : {}),
      },
    });
  }

  return targets;
}

/**
 * Root logger — Pino with multiple transports.
 *
 * Dev  → pino-pretty to stdout
 * Prod → app.log + error.log + stdout + Seq (when SEQ_URL is set)
 */
export const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    formatters: {
      level: (label) => ({ level: label }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    base: {
      pid: process.pid,
      hostname: process.env.HOSTNAME || os.hostname(),
      env: process.env.NODE_ENV || 'development',
    },
  },
  isDevelopment
    ? pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          singleLine: false,
        },
      })
    : pino.transport({ targets: buildProductionTargets() }),
);

/**
 * Create a domain + layer child logger.
 *
 * ```ts
 * const log = createLogger('booking', 'service');
 * log.info({ bookingId }, 'Booking created');
 * ```
 */
export function createLogger(domain: string, layer: LogLayer) {
  return logger.child({ domain, layer });
}

/** Create a child logger for a generic context string. */
export function createChildLogger(context: string) {
  return logger.child({ context });
}

/** Log an error with stack trace and optional context. */
export function logError(
  error: Error | unknown,
  context: Record<string, unknown> = {},
) {
  const err = error instanceof Error ? error : new Error(String(error));
  logger.error(
    {
      ...context,
      err: {
        message: err.message,
        stack: err.stack,
        name: err.name,
      },
    },
    err.message || 'An error occurred',
  );
}

/** Log an HTTP request with optional duration. */
export function logRequest(req: any, duration: number | null = null) {
  const data: Record<string, unknown> = {
    method: req.method,
    url: req.url,
    userAgent: req.get?.('user-agent'),
    ip: req.ip || req.connection?.remoteAddress,
    userId: req.user?.id || 'anonymous',
  };

  if (duration !== null) data.duration = `${duration}ms`;

  logger.info(data, `${req.method} ${req.url}`);
}

/** Log a business event. */
export function logBusinessEvent(
  eventName: string,
  data: Record<string, unknown> = {},
) {
  logger.info(
    { eventType: 'business', eventName, ...data },
    `Business Event: ${eventName}`,
  );
}
