/**
 * Migration: 001 — Initial schema
 *
 * Creates the bookings table with all columns including access_token.
 * This replaces the old createTable() + inline ALTER TABLE hack in bookingRepository.ts.
 *
 * Tracked by node-pg-migrate in the `pgmigrations` table.
 */

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
export const up = (pgm) => {
  pgm.createTable('bookings', {
    id: { type: 'uuid', primaryKey: true },
    full_name: { type: 'varchar(255)', notNull: true },
    email: { type: 'varchar(255)', notNull: true },
    company: { type: 'varchar(255)', notNull: true },
    referral_source: { type: 'varchar(100)', notNull: true },
    referral_source_other: { type: 'varchar(255)' },
    date: { type: 'date', notNull: true },
    time: { type: 'integer', notNull: true },
    timezone: { type: 'varchar(100)', default: "'America/New_York'" },
    meet_link: { type: 'text' },
    status: { type: 'varchar(50)', default: "'confirmed'" },
    notes: { type: 'text' },
    access_token: { type: 'varchar(64)', unique: true },
    created_at: {
      type: 'timestamp with time zone',
      default: pgm.func('current_timestamp'),
    },
  }, { ifNotExists: true });

  pgm.createIndex('bookings', 'email', { name: 'idx_bookings_email', ifNotExists: true });
  pgm.createIndex('bookings', 'date', { name: 'idx_bookings_date', ifNotExists: true });
  pgm.createIndex('bookings', 'status', { name: 'idx_bookings_status', ifNotExists: true });
  pgm.createIndex('bookings', 'access_token', { name: 'idx_bookings_access_token', ifNotExists: true });
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
export const down = (pgm) => {
  pgm.dropTable('bookings');
};
