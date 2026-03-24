// ---------------------------------------------------------------------------
// JWT Service — RS256 (preferred) with HS256 fallback
// ---------------------------------------------------------------------------

import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env.js';
import { createLogger } from './logger.js';

const logger = createLogger('jwt', 'infra');

/** Whether RSA keys are available (RS256 mode). */
const useRS256 = !!(env.JWT_PRIVATE_KEY && env.JWT_PUBLIC_KEY);

const accessAlgorithm = useRS256 ? 'RS256' : 'HS256';
const accessSignKey = useRS256 ? env.JWT_PRIVATE_KEY! : env.JWT_SECRET;
const accessVerifyKey = useRS256 ? env.JWT_PUBLIC_KEY! : env.JWT_SECRET;

if (useRS256) {
  logger.info('JWT configured with RS256 (asymmetric)');
} else {
  logger.info('JWT configured with HS256 (symmetric fallback)');
}

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface AccessTokenPayload extends JwtPayload {
  sub: string;
  email: string;
  username?: string;
  role: string;
}

export interface RefreshTokenPayload extends JwtPayload {
  sub: string;
  jti: string;
  fid: string;
}

// ---------------------------------------------------------------------------
// JwtService
// ---------------------------------------------------------------------------

export class JwtService {
  /** Sign an access token. */
  static signAccessToken(payload: {
    id: string;
    email: string;
    username?: string;
    role: string;
    [key: string]: unknown;
  }): string {
    const { id, email, username, role, ...rest } = payload;
    const tokenPayload: Record<string, unknown> = {
      sub: id,
      email,
      username,
      role,
      ...rest,
    };

    const options: SignOptions = {
      algorithm: accessAlgorithm as jwt.Algorithm,
      expiresIn: env.JWT_ACCESS_TOKEN_EXPIRY as unknown as SignOptions['expiresIn'],
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    };

    return jwt.sign(tokenPayload, accessSignKey, options);
  }

  /** Verify an access token and return its payload. */
  static verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, accessVerifyKey, {
      algorithms: [accessAlgorithm as jwt.Algorithm],
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    }) as AccessTokenPayload;
  }

  /** Sign a refresh token (always HS256). */
  static signRefreshToken(userId: string, familyId?: string): {
    token: string;
    jti: string;
    fid: string;
  } {
    const jti = uuidv4();
    const fid = familyId ?? uuidv4();

    const token = jwt.sign({ sub: userId, jti, fid }, env.REFRESH_TOKEN_SECRET, {
      algorithm: 'HS256',
      expiresIn: env.REFRESH_TOKEN_EXPIRY as unknown as SignOptions['expiresIn'],
    });

    return { token, jti, fid };
  }

  /** Verify a refresh token. */
  static verifyRefreshToken(token: string): RefreshTokenPayload {
    return jwt.verify(token, env.REFRESH_TOKEN_SECRET, {
      algorithms: ['HS256'],
    }) as RefreshTokenPayload;
  }

  /**
   * Legacy sign (HS256 only) — used for backward-compatible OAuth flows.
   * Preserves the existing `jwt.sign({ id, email, role }, secret, { expiresIn })` pattern.
   */
  static signLegacy(
    payload: Record<string, unknown>,
    expiresIn: string = '24h',
  ): string {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: expiresIn as unknown as SignOptions['expiresIn'] });
  }

  /** Legacy verify (HS256 only). */
  static verifyLegacy(token: string): JwtPayload & Record<string, unknown> {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload &
      Record<string, unknown>;
  }

  /** Decode without verification (for debugging). */
  static decode(token: string) {
    return jwt.decode(token, { complete: true });
  }
}
