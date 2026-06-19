/**
 * Migration: 003 — Progress milestones
 *
 * Replaces the single `users.progress` integer / `progression_*` columns model
 * with a richer per-user journey: each user has an ordered list of milestones,
 * each with its own status, optional admin note, and completion timestamp.
 *
 * The legacy `progression_*` columns on `users` are kept intact for backward
 * compatibility; this table is additive.
 */

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
export const up = (pgm) => {
  pgm.sql('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  pgm.createTable(
    'progress_milestones',
    {
      id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
      user_id: {
        type: 'uuid',
        notNull: true,
        references: '"users"',
        onDelete: 'CASCADE',
      },
      title: { type: 'varchar(255)', notNull: true },
      description: { type: 'text', notNull: true, default: "''" },
      // pending | in_progress | completed
      status: { type: 'varchar(20)', notNull: true, default: "'pending'" },
      position: { type: 'integer', notNull: true, default: 0 },
      // Optional note maintained by admins/owners (visible to the user)
      note: { type: 'text', notNull: true, default: "''" },
      completed_at: { type: 'timestamptz' },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    },
    { ifNotExists: true },
  );

  pgm.createIndex('progress_milestones', 'user_id', {
    name: 'idx_progress_milestones_user_id',
    ifNotExists: true,
  });
  pgm.createIndex('progress_milestones', ['user_id', 'position'], {
    name: 'idx_progress_milestones_user_position',
    ifNotExists: true,
  });
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
export const down = (pgm) => {
  pgm.dropTable('progress_milestones', { ifExists: true });
};
