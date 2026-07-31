// ---------------------------------------------------------------------------
// CSRF protection — double-submit-cookie pattern (csrf-csrf)
//
// The API authenticates state-changing requests primarily with a stateless
// `Authorization: Bearer <jwt>` header, which is inherently immune to CSRF
// (a cross-site attacker cannot read the victim's token to attach it, and the
// browser never auto-sends it). The genuine CSRF surface is the handful of
// endpoints that authenticate via an *ambient cookie* — the `refreshToken`
// cookie (token rotation) and the passport/express-session cookie (OAuth).
//
// This middleware adds a double-submit CSRF token (HMAC-signed cookie + a
// matching `x-csrf-token` request header) as defence-in-depth on top of the
// existing `SameSite=strict` cookies. To avoid breaking the Bearer-token SPA
// and the public unauthenticated auth endpoints, `skipCsrfProtection` bypasses
// enforcement for those requests — leaving forged, cookie-only, non-Bearer
// state-changing requests (the actual attack) to be rejected with 403.
// ---------------------------------------------------------------------------

import { doubleCsrf } from 'csrf-csrf';
import type { Request } from 'express';
import { env } from '../config/env.js';

const isProduction = env.NODE_ENV === 'production';

/** Error code attached to CSRF validation failures for the error handler. */
export const CSRF_ERROR_CODE = 'EBADCSRFTOKEN';

// Path suffixes for public / unauthenticated endpoints that establish auth
// rather than consume an ambient cookie session. These must not require a CSRF
// token or login, registration and OAuth would break. They do not read the
// auth cookie, so they carry no CSRF risk.
const CSRF_EXEMPT_PATTERNS: RegExp[] = [
  /\/auth\/login$/,
  /\/auth\/register$/,
  /\/auth\/verify-email$/,
  /\/auth\/resend-verification$/,
  /\/auth\/forgot-password$/,
  /\/auth\/reset-password$/,
  /\/auth\/google(\/callback)?$/,
  /\/auth\/facebook(\/callback)?$/,
  /\/contact$/,
];

/**
 * Decide whether CSRF enforcement should be skipped for a request.
 *
 * Skipped when:
 *   • the request carries a Bearer token (stateless auth, not CSRF-able), or
 *   • the path is a public auth/OAuth/contact endpoint (no cookie auth).
 *
 * Safe methods (GET/HEAD/OPTIONS) are already ignored by `ignoredMethods`.
 */
function skipCsrfProtection(req: Request): boolean {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return true;
  }
  return CSRF_EXEMPT_PATTERNS.some((re) => re.test(req.path));
}

const {
  doubleCsrfProtection,
  generateCsrfToken,
} = doubleCsrf({
  getSecret: () => env.CSRF_SECRET,
  // Bind the token to the per-browser session id set by express-session.
  getSessionIdentifier: (req: Request) => req.sessionID ?? '',
  cookieName: isProduction ? '__Host-anl.x-csrf-token' : 'anl.x-csrf-token',
  cookieOptions: {
    sameSite: 'strict',
    path: '/',
    secure: isProduction,
    httpOnly: true,
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getCsrfTokenFromRequest: (req: Request) =>
    req.headers['x-csrf-token'] as string | undefined,
  errorConfig: {
    statusCode: 403,
    message: 'Invalid or missing CSRF token',
    code: CSRF_ERROR_CODE,
  },
  skipCsrfProtection,
});

export { doubleCsrfProtection, generateCsrfToken };
