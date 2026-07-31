// ---------------------------------------------------------------------------
// Express app setup — middleware stack and error handler
// ---------------------------------------------------------------------------

import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import passport from './utils/passport.js';
import { corsMiddleware } from './config/cors.js';
import { httpLogger } from './config/httpLogger.js';
import { correlationId } from './middleware/correlationId.js';
import { trackRequest } from './utils/admin/trackRequest.js';
import { blockBannedIPs } from './utils/admin/blockBannedIPs.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import {
  doubleCsrfProtection,
  generateCsrfToken,
  CSRF_ERROR_CODE,
} from './middleware/csrf.js';
import apiV1Router from './api/v1/index.js';
import { logError } from './utils/logger.js';

const app = express();

// Behind a single reverse proxy (Caddy) — trust exactly one hop so
// `req.ip` / X-Forwarded-For resolve to the real client without allowing
// upstream clients to spoof their address for the rate limiter.
app.set('trust proxy', 1);

// ---------------------------------------------------------------------------
// Middleware stack (request order)
// CORS → Correlation-ID → HTTP logger → JSON/URL body → Cookie parser → Routes
// ---------------------------------------------------------------------------

app.use(corsMiddleware);
app.use(correlationId);
app.use(httpLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Coarse cluster-wide safety net against volumetric abuse. Fine-grained
// per-endpoint limiters live in the individual route modules.
app.use(globalLimiter);

// Passport + sessions (for OAuth)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'yourSecretKey',
    resave: false,
    saveUninitialized: true,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

// ---------------------------------------------------------------------------
// CSRF protection (double-submit cookie). Must run after cookie-parser and
// session so it can read cookies and bind tokens to the session id. Bearer
// (stateless) and public auth requests are skipped inside the middleware.
// ---------------------------------------------------------------------------

app.use(doubleCsrfProtection);

// Endpoint the SPA can call to obtain a CSRF token (sets the paired cookie).
app.get('/csrf-token', (req: Request, res: Response) => {
  res.json({ csrfToken: generateCsrfToken(req, res) });
});
app.get('/api/v1/csrf-token', (req: Request, res: Response) => {
  res.json({ csrfToken: generateCsrfToken(req, res) });
});

// ---------------------------------------------------------------------------
// Health check — must be before any auth middleware
// ---------------------------------------------------------------------------

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ---------------------------------------------------------------------------
// API v1 routes
// ---------------------------------------------------------------------------

app.use('/api/v1', apiV1Router);

// ---------------------------------------------------------------------------
// Legacy route aliases (backward compatibility with frontend)
// These will be removed once the frontend migrates to /api/v1 exclusively
// ---------------------------------------------------------------------------

import authRoutes from './domains/user/routes/authRoutes.js';
import userRoutes from './domains/user/routes/userRoutes.js';
import adminRoutes from './domains/admin/routes/adminRoutes.js';
import emailRoutes from './domains/email/routes/emailRoutes.js';
import contactRoutes from './domains/contact/routes/contactRoutes.js';
import kanbanRoutes from './domains/kanban/routes/kanbanRoutes.js';
import availabilityRoutes from './domains/availability/routes/availabilityRoutes.js';
import bookingRoutes from './domains/booking/routes/bookingRoutes.js';
import fileManagementRoutes from './domains/fileManagement/routes/fileManagementRoutes.js';
import progressRoutes from './domains/progress/routes/progressRoutes.js';
import reviewRoutes from './domains/review/routes/reviewRoutes.js';

app.use('/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);          // FE calls /admin/emails
app.use('/api', adminRoutes);            // FE calls /api/stats, /api/stats/reset
app.use('/api/email', emailRoutes);
app.use('/inbox', emailRoutes);
app.use('/sentmails', emailRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/kanban', kanbanRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api', fileManagementRoutes);   // FE calls /api/upload, /api/export
app.use('/api', progressRoutes);         // FE calls /api/terminatedStatistics
app.use('/api/reviews', reviewRoutes);

// ---------------------------------------------------------------------------
// Analytics & IP blocking (applied AFTER routes, like the original)
// ---------------------------------------------------------------------------

app.use(trackRequest);
app.use(blockBannedIPs());

// ---------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------

app.get('/', (_req: Request, res: Response) => {
  res.send(
    '<h1>ANL Backend</h1><p>API available at <code>/api/v1</code></p>',
  );
});

// ---------------------------------------------------------------------------
// Global error handler
// ---------------------------------------------------------------------------

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  // Reject failed CSRF validation with a clear 403 instead of a 500.
  if ((err as { code?: string }).code === CSRF_ERROR_CODE) {
    res.status(403).json({ error: 'Invalid or missing CSRF token' });
    return;
  }
  logError(err, { context: 'globalErrorHandler' });
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
