import dotenv from 'dotenv';
dotenv.config();

export const Environment = Object.freeze({
  DEVELOPMENT: 'DEVELOPMENT',
  PRODUCTION: 'PRODUCTION',
  THESIS: 'THESIS',
} as const);

export type EnvironmentType = (typeof Environment)[keyof typeof Environment];

export const env = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  APP_ENV: (process.env.APP_ENV || 'DEVELOPMENT') as EnvironmentType,

  // PostgreSQL
  DATABASE_URL:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/anl',

  // Redis
  REDIS_URL: process.env.REDIS_URL,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,

  // JWT — supports RS256 (preferred) or HS256 fallback
  JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY,
  JWT_PUBLIC_KEY: process.env.JWT_PUBLIC_KEY,
  JWT_SECRET: process.env.JWT_SECRET || 'your-fallback-secret-key',
  JWT_ISSUER: process.env.JWT_ISSUER || 'api.anl.com',
  JWT_AUDIENCE: process.env.JWT_AUDIENCE || 'anl-app',
  JWT_ACCESS_TOKEN_EXPIRY: process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m',
  REFRESH_TOKEN_SECRET:
    process.env.REFRESH_TOKEN_SECRET ||
    process.env.JWT_SECRET ||
    'your-refresh-secret',
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  REFRESH_TOKEN_EXPIRY_SECONDS: parseInt(
    process.env.REFRESH_TOKEN_EXPIRY_SECONDS || '604800',
    10,
  ),

  // URLs
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3001',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

  // OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  ADMIN_GOOGLE_EMAIL:
    process.env.ADMIN_GOOGLE_EMAIL || 'deid.unideb@gmail.com',
  FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID || '',
  FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET || '',

  // Google Calendar — OAuth (admin connects via UI)
  ANL_TEAM_EMAILS: process.env.ANL_TEAM_EMAILS || '',

  // SMTP
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || 'ANL - Ads and Leads',
  SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || '',

  // CORS
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'http://localhost:5173',

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  SEQ_URL: process.env.SEQ_URL,
  SEQ_API_KEY: process.env.SEQ_API_KEY,
} as const;
