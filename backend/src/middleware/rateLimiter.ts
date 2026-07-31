// ---------------------------------------------------------------------------
// Rate limiting middleware — tiered, Redis-backed, distributed limiters
//
// A single in-memory limiter is useless once the API runs on more than one
// instance (each process keeps its own counters). We therefore back every
// limiter with Redis so the limits are enforced cluster-wide. If Redis is not
// available (e.g. during unit tests) the limiters transparently fall back to
// the library's default in-memory store.
//
// Tiers (most→least permissive):
//   • globalLimiter        — coarse safety net applied to ALL traffic
//   • apiLimiter           — authenticated JSON API traffic
//   • authLimiter          — login / register / token endpoints (brute-force)
//   • passwordResetLimiter — forgot / reset password (very strict)
//   • emailLimiter         — sending / saving mail (spam + cost protection)
//   • contactLimiter       — public contact form (spam protection)
//   • uploadLimiter        — file uploads / data export (resource protection)
//   • reviewLimiter        — review submission (spam protection)
// ---------------------------------------------------------------------------

import { rateLimit, ipKeyGenerator, type RateLimitRequestHandler } from 'express-rate-limit';
import { RedisStore, type RedisReply } from 'rate-limit-redis';
import type { Request, Response } from 'express';
import { getRedisClient } from '../config/database.js';
import { createLogger } from '../utils/logger.js';

const log = createLogger('rate-limit', 'middleware');

// ---------------------------------------------------------------------------
// Store factory — one logical Redis namespace per limiter tier
// ---------------------------------------------------------------------------

/**
 * Build a Redis-backed store for a limiter. Each tier gets its own key prefix
 * so counters never collide. Falls back to the default in-memory store when
 * Redis has not been initialised (returns `undefined`).
 */
function buildStore(prefix: string): RedisStore | undefined {
  try {
    const client = getRedisClient();
    return new RedisStore({
      prefix: `rl:${prefix}:`,
      // node-redis v4 uses `sendCommand`
      sendCommand: (...args: string[]) =>
        client.sendCommand(args) as Promise<RedisReply>,
    });
  } catch {
    // Redis not initialised (tests / early boot) — use in-memory fallback.
    log.warn(
      { prefix },
      'Redis unavailable for rate limiter; using in-memory store',
    );
    return undefined;
  }
}

// ---------------------------------------------------------------------------
// Key generators
// ---------------------------------------------------------------------------

/** IPv6-safe client IP key (normalises /64 subnet, per library guidance). */
function ipKey(req: Request): string {
  return ipKeyGenerator(req.ip ?? 'unknown');
}

/**
 * Prefer the authenticated user id when present so a single logged-in user
 * cannot exhaust the shared IP budget of everyone behind the same NAT/proxy,
 * and vice-versa. Falls back to the client IP for anonymous requests.
 */
function userOrIpKey(req: Request): string {
  const userId = (req as Request & { user?: { id?: string; userId?: string } })
    .user;
  const id = userId?.id ?? userId?.userId;
  return id ? `u:${id}` : ipKey(req);
}

/**
 * For credential endpoints: combine client IP with the submitted identifier
 * (email / username) so an attacker cannot rotate emails against one IP nor
 * spray one email from a single IP without hitting a limit.
 */
function credentialKey(req: Request): string {
  const body = (req.body ?? {}) as { email?: string; username?: string };
  const identifier = (body.email ?? body.username ?? '')
    .toString()
    .trim()
    .toLowerCase();
  return identifier ? `${ipKey(req)}:${identifier}` : ipKey(req);
}

// ---------------------------------------------------------------------------
// Shared handler — structured log + consistent JSON body
// ---------------------------------------------------------------------------

function limitHandler(tier: string) {
  return (req: Request, res: Response): void => {
    log.warn(
      { tier, ip: req.ip, method: req.method, path: req.originalUrl },
      'Rate limit exceeded',
    );
    res.status(429).json({
      error: 'Too many requests',
      message:
        'You have sent too many requests in a short period. Please slow down and try again later.',
      retryAfter: res.getHeader('Retry-After') ?? undefined,
    });
  };
}

// ---------------------------------------------------------------------------
// Limiter factory
// ---------------------------------------------------------------------------

interface TierOptions {
  windowMs: number;
  limit: number;
  prefix: string;
  keyGenerator?: (req: Request) => string;
  /** Only count failed responses (>=400). Useful for login brute-force. */
  skipSuccessfulRequests?: boolean;
}

function createLimiter(opts: TierOptions): RateLimitRequestHandler {
  return rateLimit({
    windowMs: opts.windowMs,
    limit: opts.limit,
    standardHeaders: 'draft-7', // RateLimit-* headers
    legacyHeaders: false,
    store: buildStore(opts.prefix),
    keyGenerator: opts.keyGenerator ?? ipKey,
    skipSuccessfulRequests: opts.skipSuccessfulRequests ?? false,
    handler: limitHandler(opts.prefix),
  });
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

// ---------------------------------------------------------------------------
// Exported limiters
// ---------------------------------------------------------------------------

/** Coarse cluster-wide safety net — applied to every request in app.ts. */
export const globalLimiter = createLimiter({
  prefix: 'global',
  windowMs: MINUTE,
  limit: 300,
});

/** General authenticated/JSON API traffic. */
export const apiLimiter = createLimiter({
  prefix: 'api',
  windowMs: MINUTE,
  limit: 120,
  keyGenerator: userOrIpKey,
});

/** Login / register / token endpoints — brute-force protection. */
export const authLimiter = createLimiter({
  prefix: 'auth',
  windowMs: 15 * MINUTE,
  limit: 10,
  keyGenerator: credentialKey,
  // Don't punish users who log in successfully; only failed attempts count.
  skipSuccessfulRequests: true,
});

/** Forgot / reset password — very strict, keyed on IP+email. */
export const passwordResetLimiter = createLimiter({
  prefix: 'pwd-reset',
  windowMs: HOUR,
  limit: 5,
  keyGenerator: credentialKey,
});

/** Email verification resend — strict, keyed on IP+email. */
export const verificationLimiter = createLimiter({
  prefix: 'verify',
  windowMs: HOUR,
  limit: 6,
  keyGenerator: credentialKey,
});

/** Sending / saving mail — spam + SMTP-cost protection. */
export const emailLimiter = createLimiter({
  prefix: 'email',
  windowMs: HOUR,
  limit: 30,
  keyGenerator: userOrIpKey,
});

/** Public contact form — spam protection (unauthenticated). */
export const contactLimiter = createLimiter({
  prefix: 'contact',
  windowMs: HOUR,
  limit: 5,
});

/** File uploads / data export — resource protection. */
export const uploadLimiter = createLimiter({
  prefix: 'upload',
  windowMs: HOUR,
  limit: 40,
  keyGenerator: userOrIpKey,
});

/** Review submission — spam protection. */
export const reviewLimiter = createLimiter({
  prefix: 'review',
  windowMs: HOUR,
  limit: 15,
  keyGenerator: userOrIpKey,
});
