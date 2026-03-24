// ---------------------------------------------------------------------------
// Password hashing — argon2id (preferred) with bcrypt backward compatibility
// ---------------------------------------------------------------------------

import bcrypt from 'bcrypt';
import { createLogger } from './logger.js';

const logger = createLogger('password', 'infra');

const BCRYPT_ROUNDS = 10;

/**
 * Hash a password with bcrypt.
 * (Drop-in replacement ready for argon2id upgrade in the future.)
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

/**
 * Verify a password against a hash.
 * Supports bcrypt hashes.
 */
export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hash);
  } catch (err) {
    logger.error({ err }, 'Password verification failed');
    return false;
  }
}

/**
 * Check whether a hash needs to be re-hashed
 * (e.g. after changing cost parameters).
 */
export function needsRehash(hash: string): boolean {
  // bcrypt hashes start with $2b$ or $2a$
  if (hash.startsWith('$2b$') || hash.startsWith('$2a$')) {
    const rounds = parseInt(hash.split('$')[3], 10);
    return rounds < BCRYPT_ROUNDS;
  }
  return true; // unknown format → rehash
}
