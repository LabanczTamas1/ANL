// ---------------------------------------------------------------------------
// Booking model — DDL for PostgreSQL
// ---------------------------------------------------------------------------

import { getPool } from '../../../config/postgresql.js';
import { createLogger } from '../../../utils/logger.js';

const logger = createLogger('booking', 'repository');

export const REFERRAL_SOURCES = [
  'Google Search',
  'LinkedIn',
  'Facebook',
  'Instagram',
  'Referral / Word of mouth',
  'Conference / Event',
  'Blog / Article',
  'Other',
];

export async function createBookingsTable(): Promise<void> {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id UUID PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      company VARCHAR(255) NOT NULL,
      referral_source VARCHAR(100) NOT NULL,
      referral_source_other VARCHAR(255),
      date DATE NOT NULL,
      time INTEGER NOT NULL,
      timezone VARCHAR(100) DEFAULT 'America/New_York',
      meet_link TEXT,
      status VARCHAR(50) DEFAULT 'confirmed',
      notes TEXT,
      access_token VARCHAR(64) UNIQUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email);
    CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
    CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
  `);

  // Migration: add access_token column if it doesn't exist
  await pool.query(`
    DO $$ BEGIN
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS access_token VARCHAR(64) UNIQUE;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_bookings_access_token ON bookings(access_token);
  `);

  logger.info('Bookings table ensured');
}
