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
import apiV1Router from './api/v1/index.js';
import { logError } from './utils/logger.js';

const app = express();

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
// Legacy route aliases (backward compatibility)
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
app.use('/api/admin', adminRoutes);
app.use('/api/email', emailRoutes);
app.use('/inbox', emailRoutes);
app.use('/sentmails', emailRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/kanban', kanbanRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api', fileManagementRoutes);
app.use('/api', progressRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/user', userRoutes);

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
  logError(err, { context: 'globalErrorHandler' });
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
