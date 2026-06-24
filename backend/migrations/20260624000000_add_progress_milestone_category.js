/**
 * Migration: 005 — Add `category` to progress_milestones
 *
 * Milestones are now grouped into collapsible phases (categories). This adds a
 * `category` column (clean empty-string default) and backfills the categories
 * for the default seeded journey so existing users immediately get grouped
 * phases without re-seeding.
 *
 * Idempotent: the column is added only if it does not already exist and the
 * backfill only touches rows whose category is still blank.
 */

/** Default journey title → category mapping (mirrors progressModel.ts). */
const DEFAULT_CATEGORY_BY_TITLE = {
  'First Contact': 'Getting Started',
  'Register to ANL': 'Getting Started',
  Meeting: 'Discovery',
  'Onboarding + Contract': 'Discovery',
  'Strategy Session': 'Strategy',
  '90 Day Program': 'Execution',
  'Enjoy Your Growth!': 'Growth',
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
export const up = (pgm) => {
  pgm.sql(`
    ALTER TABLE progress_milestones
      ADD COLUMN IF NOT EXISTS category VARCHAR(120) NOT NULL DEFAULT '';
  `);

  // Backfill categories for the default seeded milestones. Values are trusted
  // constants (no user input), so inlining with escaped quotes is safe here.
  for (const [title, category] of Object.entries(DEFAULT_CATEGORY_BY_TITLE)) {
    const t = title.replace(/'/g, "''");
    const c = category.replace(/'/g, "''");
    pgm.sql(
      `UPDATE progress_milestones
          SET category = '${c}'
        WHERE title = '${t}' AND (category IS NULL OR category = '');`,
    );
  }
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
export const down = (pgm) => {
  pgm.sql(`ALTER TABLE progress_milestones DROP COLUMN IF EXISTS category;`);
};
