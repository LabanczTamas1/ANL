// ---------------------------------------------------------------------------
// Request Tracker — analytics middleware
// ---------------------------------------------------------------------------

import { createClient, RedisClientType } from 'redis';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { env } from '../../config/env.js';
import { createLogger } from '../logger.js';

const logger = createLogger('requestTracker', 'middleware');

let redisClient: RedisClientType | null = null;

async function ensureConnection(): Promise<RedisClientType> {
  if (!redisClient) {
    redisClient = createClient({
      url: env.REDIS_URL,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
      },
    }) as RedisClientType;

    redisClient.on('error', (err) =>
      logger.error({ err }, 'RequestTracker Redis error'),
    );
  }

  if (!redisClient.isReady) {
    await Promise.race([
      redisClient.connect(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Redis timeout')), 5000),
      ),
    ]);
  }

  return redisClient;
}

function getStatusCategory(statusCode: number): string {
  if (statusCode >= 200 && statusCode < 300) return '2xx';
  if (statusCode >= 300 && statusCode < 400) return '3xx';
  if (statusCode >= 400 && statusCode < 500) return '4xx';
  if (statusCode >= 500) return '5xx';
  return 'unknown';
}

/** Express middleware to track request analytics. */
export async function trackRequest(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const client = await ensureConnection();

    const timestamp = new Date().toISOString();
    const method = req.method;
    const path = req.originalUrl;

    let role = 'anonymous';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as Record<
          string,
          unknown
        >;
        role = (decoded.role as string) || 'user';
      } catch {
        /* invalid token */
      }
    } else if (req.user?.role) {
      role = req.user.role;
    }

    await client.incr('stats:total_requests');
    await client.incr(`stats:method:${method}`);
    await client.incr(`stats:role:${role}`);
    await client.incr(`stats:role:${role}:method:${method}`);

    const requestData: Record<string, unknown> = {
      timestamp,
      method,
      path,
      role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    };

    const originalEnd = res.end;
    res.end = function (this: Response, chunk?: any, encoding?: any) {
      originalEnd.call(this, chunk, encoding);

      const statusCode = res.statusCode;
      const statusCategory = getStatusCategory(statusCode);
      requestData.statusCode = statusCode;

      (async () => {
        try {
          await client.incr(`stats:status:${statusCode}`);
          await client.incr(`stats:status_category:${statusCategory}`);

          const hourTimestamp = new Date(timestamp);
          hourTimestamp.setMinutes(0, 0, 0);
          const hourKey = hourTimestamp.toISOString();
          await client.hIncrBy(
            'stats:hourly_status',
            `${hourKey}:${statusCategory}`,
            1,
          );

          const dayTimestamp = new Date(timestamp);
          dayTimestamp.setHours(0, 0, 0, 0);
          const dayKey = dayTimestamp.toISOString();
          await client.hIncrBy(
            'stats:daily_status',
            `${dayKey}:${statusCategory}`,
            1,
          );

          await client.lPush(
            'stats:recent_requests',
            JSON.stringify(requestData),
          );
          await client.lTrim('stats:recent_requests', 0, 999);
        } catch (err) {
          logger.error({ err }, 'Error storing status code data');
        }
      })();

      return this;
    } as typeof res.end;
  } catch (error) {
    logger.error({ err: error }, 'Error tracking request');
  }

  next();
}

/** Retrieve aggregated request statistics. */
export async function getRequestStats(): Promise<Record<string, unknown>> {
  const fallback = {
    totalRequests: '0',
    methodCounts: { GET: '0', POST: '0', PUT: '0', PATCH: '0', DELETE: '0' },
    roleCounts: {},
    roleMethodCounts: {},
    statusCounts: { '2xx': '0', '3xx': '0', '4xx': '0', '5xx': '0' },
    timeSeriesData: { hourly: [], daily: [] },
    recentRequests: [],
  };

  let client: RedisClientType;
  try {
    client = await ensureConnection();
  } catch {
    return { ...fallback, _status: 'degraded' };
  }

  const response: any = { ...fallback };

  await Promise.all([
    // Basic counters
    (async () => {
      try {
        const pipe = client.multi();
        pipe.get('stats:total_requests');
        const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
        methods.forEach((m) => pipe.get(`stats:method:${m}`));

        const results = await Promise.race<any>([
          pipe.exec(),
          new Promise((_, rej) => setTimeout(() => rej('timeout'), 3000)),
        ]);

        if (results?.length) {
          response.totalRequests = results[0] || '0';
          methods.forEach((m, i) => {
            response.methodCounts[m] = results[i + 1] || '0';
          });
        }
      } catch {}
    })(),

    // Role counts
    (async () => {
      try {
        const roles = ['admin', 'user', 'editor', 'manager', 'anonymous'];
        const pipe = client.multi();
        roles.forEach((r) => pipe.get(`stats:role:${r}`));

        const results = await Promise.race<any>([
          pipe.exec(),
          new Promise((_, rej) => setTimeout(() => rej('timeout'), 3000)),
        ]);

        if (results?.length) {
          roles.forEach((r, i) => {
            const c = results[i] || '0';
            if (c !== '0') response.roleCounts[r] = c;
          });
        }
      } catch {}
    })(),

    // Status counts
    (async () => {
      try {
        const cats = ['2xx', '3xx', '4xx', '5xx'];
        const pipe = client.multi();
        cats.forEach((c) => pipe.get(`stats:status_category:${c}`));
        const results = await Promise.race<any>([
          pipe.exec(),
          new Promise((_, rej) => setTimeout(() => rej('timeout'), 3000)),
        ]);
        if (results?.length) {
          cats.forEach((c, i) => {
            response.statusCounts[c] = results[i] || '0';
          });
        }
      } catch {}
    })(),

    // Recent requests
    (async () => {
      try {
        const data = await Promise.race<any>([
          client.lRange('stats:recent_requests', 0, -1),
          new Promise((_, rej) => setTimeout(() => rej('timeout'), 3000)),
        ]);
        if (data?.length) {
          response.recentRequests = data.map((item: string) => {
            try {
              return JSON.parse(item);
            } catch {
              return { raw: item };
            }
          });
        }
      } catch {}
    })(),
  ]);

  return response;
}

/** Reset all request statistics. */
export async function resetRequestStats(): Promise<{
  message: string;
}> {
  const client = await ensureConnection();

  let allKeys: string[] = [];
  let cursor = 0;

  do {
    const result = await client.scan(cursor, { MATCH: 'stats:*', COUNT: 100 });
    cursor = result.cursor;
    allKeys = allKeys.concat(result.keys);
  } while (cursor !== 0);

  if (allKeys.length > 0) await client.del(allKeys);

  return { message: 'All request statistics reset successfully' };
}
