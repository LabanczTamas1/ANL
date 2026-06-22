/**
 * Migration: 004 — Repair progress_milestones literal-quote defaults
 *
 * The original migration (003) declared string defaults as `"''"` and
 * `"'pending'"`. node-pg-migrate dollar-quotes string defaults verbatim, so the
 * stored DEFAULT became the *literal* two-character string `''` (and
 * `'pending'` including the quotes) instead of an empty string / `pending`.
 *
 * As a result, seeded milestones received `note = ''` (literal) and
 * `status = 'pending'` (literal), which surfaced as stray quote characters in
 * the UI. This migration repairs both the column defaults and any existing
 * affected rows. It is idempotent and safe to run on a clean database.
 */

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
export const up = (pgm) => {
  // 1. Repair column defaults to clean values.
  pgm.sql(`
    ALTER TABLE progress_milestones ALTER COLUMN description SET DEFAULT '';
    ALTER TABLE progress_milestones ALTER COLUMN note SET DEFAULT '';
    ALTER TABLE progress_milestones ALTER COLUMN status SET DEFAULT 'pending';
  `);

  // 2. Clean existing rows that captured the literal-quote defaults.
  pgm.sql(`
    UPDATE progress_milestones SET description = '' WHERE description = '''''';
    UPDATE progress_milestones SET note = '' WHERE note = '''''';
    UPDATE progress_milestones
       SET status = trim(both '''' from status)
     WHERE status LIKE '''%''';
  `);
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
export const down = () => {
  // No-op: we never want to restore the broken literal-quote defaults.
};
