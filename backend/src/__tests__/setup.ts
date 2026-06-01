// ---------------------------------------------------------------------------
// Global test setup — mock external dependencies
// ---------------------------------------------------------------------------

import { vi } from 'vitest';

// Mock PostgreSQL pool
vi.mock('../config/postgresql.js', () => ({
  getPool: vi.fn(() => ({
    query: vi.fn(),
  })),
}));

// Mock Redis client
vi.mock('../config/database.js', () => ({
  getRedisClient: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    keys: vi.fn(() => []),
  })),
}));

// Mock env config
vi.mock('../config/env.js', () => ({
  env: {
    PORT: 3001,
    NODE_ENV: 'test',
    APP_ENV: 'DEVELOPMENT',
    DATABASE_URL: 'postgresql://localhost:5432/test',
    JWT_SECRET: 'test-secret',
    JWT_ISSUER: 'test',
    SMTP_HOST: 'localhost',
    SMTP_PORT: 587,
    SMTP_USER: 'test@test.com',
    SMTP_PASS: 'test-pass',
    FRONTEND_URL: 'http://localhost:3000',
    EXCHANGE_RATE_API_KEY: 'test-key',
  },
  Environment: { DEVELOPMENT: 'DEVELOPMENT', PRODUCTION: 'PRODUCTION', THESIS: 'THESIS' },
}));

// Mock logger (silenced in tests)
vi.mock('../utils/logger.js', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
  logError: vi.fn(),
}));
