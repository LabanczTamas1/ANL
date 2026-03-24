// ---------------------------------------------------------------------------
// Booking Repository — PostgreSQL CRUD
// ---------------------------------------------------------------------------

import { getPool } from '../../../config/postgresql.js';
import { createLogger } from '../../../utils/logger.js';

const logger = createLogger('booking', 'repository');

export interface BookingRow {
  id: string;
  full_name: string;
  email: string;
  company: string;
  referral_source: string;
  referral_source_other?: string;
  date: string;
  time: number;
  timezone: string;
  meet_link?: string;
  status: string;
  notes?: string;
  access_token: string;
  created_at: string;
}

export interface BookingInput {
  id: string;
  fullName: string;
  email: string;
  company: string;
  referralSource: string;
  referralSourceOther?: string | null;
  date: string;
  time: number;
  timezone: string;
  meetLink?: string | null;
  status: string;
  notes?: string | null;
  accessToken: string;
}

class BookingRepository {
  async createTable(): Promise<void> {
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

    // Migration: add access_token column if it doesn't exist (for existing tables)
    await pool.query(`
      DO $$ BEGIN
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS access_token VARCHAR(64) UNIQUE;
      EXCEPTION WHEN duplicate_column THEN NULL;
      END $$;
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_bookings_access_token ON bookings(access_token);
    `);
  }

  async insert(booking: BookingInput): Promise<BookingRow> {
    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO bookings
       (id, full_name, email, company, referral_source, referral_source_other,
        date, time, timezone, meet_link, status, notes, access_token)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        booking.id,
        booking.fullName,
        booking.email,
        booking.company,
        booking.referralSource,
        booking.referralSourceOther || null,
        booking.date,
        booking.time,
        booking.timezone,
        booking.meetLink || null,
        booking.status,
        booking.notes || null,
        booking.accessToken,
      ],
    );
    return result.rows[0];
  }

  async findById(id: string): Promise<BookingRow | undefined> {
    const pool = getPool();
    const result = await pool.query('SELECT * FROM bookings WHERE id = $1', [
      id,
    ]);
    return result.rows[0];
  }

  async findByEmail(email: string): Promise<BookingRow[]> {
    const pool = getPool();
    const result = await pool.query(
      'SELECT * FROM bookings WHERE email = $1 ORDER BY created_at DESC',
      [email],
    );
    return result.rows;
  }

  async findLatestByEmail(
    email: string,
    limit = 5,
  ): Promise<BookingRow[]> {
    const pool = getPool();
    const result = await pool.query(
      'SELECT * FROM bookings WHERE email = $1 ORDER BY created_at DESC LIMIT $2',
      [email, limit],
    );
    return result.rows;
  }

  async findAll(limit = 50, offset = 0): Promise<BookingRow[]> {
    const pool = getPool();
    const result = await pool.query(
      'SELECT * FROM bookings ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset],
    );
    return result.rows;
  }

  async delete(id: string): Promise<BookingRow | undefined> {
    const pool = getPool();
    const result = await pool.query(
      'DELETE FROM bookings WHERE id = $1 RETURNING *',
      [id],
    );
    return result.rows[0];
  }

  async updateStatus(
    id: string,
    status: string,
  ): Promise<BookingRow | undefined> {
    const pool = getPool();
    const result = await pool.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
      [status, id],
    );
    return result.rows[0];
  }

  async findByAccessToken(accessToken: string): Promise<BookingRow | undefined> {
    const pool = getPool();
    const result = await pool.query(
      'SELECT * FROM bookings WHERE access_token = $1',
      [accessToken],
    );
    return result.rows[0];
  }
}

export const bookingRepository = new BookingRepository();
