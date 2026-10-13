/**
 * Migration: 006 — Email threading
 *
 * Adds conversation threading to the internal messaging system. Both the
 * inbox (`messages`) and the sender's copy (`sent_messages`) gain:
 *   - `thread_id`  — groups every message belonging to one conversation.
 *   - `parent_id`  — the specific message a reply was written against.
 *
 * Backfill: every existing row becomes the root of its own thread
 * (`thread_id = id`), so historic mail keeps working without a parent.
 *
 * Idempotent: columns are only added when missing and the backfill only
 * touches rows whose `thread_id` is still NULL.
 */

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
export const up = (pgm) => {
  pgm.sql(`
    ALTER TABLE messages
      ADD COLUMN IF NOT EXISTS thread_id uuid,
      ADD COLUMN IF NOT EXISTS parent_id uuid;
  `);

  pgm.sql(`
    ALTER TABLE sent_messages
      ADD COLUMN IF NOT EXISTS thread_id uuid,
      ADD COLUMN IF NOT EXISTS parent_id uuid;
  `);

  // Backfill: each legacy message is its own thread root.
  pgm.sql(`UPDATE messages SET thread_id = id WHERE thread_id IS NULL;`);
  pgm.sql(`UPDATE sent_messages SET thread_id = id WHERE thread_id IS NULL;`);

  // Indexes to fetch a whole conversation quickly.
  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages (thread_id);`);
  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_sent_messages_thread_id ON sent_messages (thread_id);`);
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
export const down = (pgm) => {
  pgm.sql(`DROP INDEX IF EXISTS idx_messages_thread_id;`);
  pgm.sql(`DROP INDEX IF EXISTS idx_sent_messages_thread_id;`);
  pgm.sql(`ALTER TABLE messages DROP COLUMN IF EXISTS thread_id, DROP COLUMN IF EXISTS parent_id;`);
  pgm.sql(`ALTER TABLE sent_messages DROP COLUMN IF EXISTS thread_id, DROP COLUMN IF EXISTS parent_id;`);
};
