// ---------------------------------------------------------------------------
// db — Thin PostgreSQL query helper + Redis cache utilities
// ---------------------------------------------------------------------------

import { getPool } from '../config/postgresql.js';
import { getRedisClient } from '../config/database.js';
import { createLogger } from './logger.js';
import type { QueryResultRow } from 'pg';

const logger = createLogger('db', 'infra');

// ─── Query helpers ────────────────────────────────────────────────────────

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  const pool = getPool();
  const result = await pool.query<T>(text, params);
  return result.rows;
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

export async function execute(
  text: string,
  params?: unknown[],
): Promise<number> {
  const pool = getPool();
  const result = await pool.query(text, params);
  return result.rowCount ?? 0;
}

// ─── Redis cache helpers ──────────────────────────────────────────────────

const CACHE_PREFIX = 'cache:';

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const r = getRedisClient();
    const raw = await r.get(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setCache(
  key: string,
  data: unknown,
  ttlSeconds = 300,
): Promise<void> {
  try {
    const r = getRedisClient();
    await r.set(`${CACHE_PREFIX}${key}`, JSON.stringify(data), {
      EX: ttlSeconds,
    });
  } catch (err) {
    logger.warn({ err, key }, 'Failed to set cache');
  }
}

export async function invalidateCache(...keys: string[]): Promise<void> {
  try {
    const r = getRedisClient();
    const fullKeys = keys.map((k) => `${CACHE_PREFIX}${k}`);
    if (fullKeys.length > 0) await r.del(fullKeys);
  } catch (err) {
    logger.warn({ err }, 'Failed to invalidate cache');
  }
}

export async function invalidateCachePattern(pattern: string): Promise<void> {
  try {
    const r = getRedisClient();
    let cursor = 0;
    do {
      const result = await r.scan(cursor, {
        MATCH: `${CACHE_PREFIX}${pattern}`,
        COUNT: 200,
      });
      cursor = result.cursor;
      if (result.keys.length > 0) await r.del(result.keys);
    } while (cursor !== 0);
  } catch (err) {
    logger.warn({ err, pattern }, 'Failed to invalidate cache pattern');
  }
}
