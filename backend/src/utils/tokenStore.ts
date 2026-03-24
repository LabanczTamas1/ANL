// ---------------------------------------------------------------------------
// Token Store — Redis-based refresh-token family tracking
// ---------------------------------------------------------------------------
//
// Redis keys:
//   rt:blacklist:{jti}   → familyId | "family_revoked"       TTL: 7 days
//   rt:family:{familyId} → Set<jti>                           TTL: 7 days
//   rt:user:{userId}     → Set<familyId>                      TTL: 7 days
// ---------------------------------------------------------------------------

import { getRedisClient } from '../config/database.js';
import { env } from '../config/env.js';
import { createLogger } from './logger.js';

const logger = createLogger('tokenStore', 'infra');

const TTL = env.REFRESH_TOKEN_EXPIRY_SECONDS; // 7 days default

function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    const client = getRedisClient();
    if (!client) return Promise.resolve(fallback);
    return fn().catch((err) => {
      logger.warn({ err }, 'Token store operation failed (non-critical)');
      return fallback;
    });
  } catch {
    return Promise.resolve(fallback);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Register a new token (jti) in a family. Links family to user. */
export async function registerToken(
  userId: string,
  familyId: string,
  jti: string,
): Promise<void> {
  await safe(async () => {
    const r = getRedisClient();
    const familyKey = `rt:family:${familyId}`;
    const userKey = `rt:user:${userId}`;

    await r.sAdd(familyKey, jti);
    await r.expire(familyKey, TTL);

    await r.sAdd(userKey, familyId);
    await r.expire(userKey, TTL);
  }, undefined);
}

/** Blacklist a single jti (after rotation). */
export async function blacklistToken(
  jti: string,
  familyId: string,
): Promise<void> {
  await safe(async () => {
    const r = getRedisClient();
    await r.set(`rt:blacklist:${jti}`, familyId, { EX: TTL });
  }, undefined);
}

/** Check if a jti is blacklisted. */
export async function isTokenBlacklisted(jti: string): Promise<boolean> {
  return safe(async () => {
    const r = getRedisClient();
    const val = await r.get(`rt:blacklist:${jti}`);
    return val !== null;
  }, false);
}

/** Revoke an entire token family (theft detected or logout). */
export async function revokeFamily(familyId: string): Promise<void> {
  await safe(async () => {
    const r = getRedisClient();
    const familyKey = `rt:family:${familyId}`;
    const jtis = await r.sMembers(familyKey);

    for (const jti of jtis) {
      await r.set(`rt:blacklist:${jti}`, 'family_revoked', { EX: TTL });
    }
    await r.del(familyKey);
  }, undefined);
}

/** Revoke all token families for a user (role change, deletion). */
export async function revokeAllUserTokens(userId: string): Promise<void> {
  await safe(async () => {
    const r = getRedisClient();
    const userKey = `rt:user:${userId}`;
    const families = await r.sMembers(userKey);

    for (const fid of families) {
      await revokeFamily(fid);
    }
    await r.del(userKey);
  }, undefined);
}
