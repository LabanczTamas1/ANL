/**
 * Migration: 007 — Articles / News platform
 *
 * Adds the `articles` table that powers the in-app authoring platform where
 * owners and admins compose news-style articles, keep them in `draft`, and
 * `publish` them to the public landing page.
 *
 * Content model:
 *   - `content` is a JSONB array of blocks. Each block is one of:
 *       { type: 'paragraph', text }
 *       { type: 'heading',   text, level }
 *       { type: 'image',     url, caption, alt, align }
 *       { type: 'quote',     text, cite }
 *       { type: 'list',      ordered, items: [] }
 *     This lets authors place images exactly where they want inside the body.
 *   - `cover_image_url` is the hero/card image.
 *   - `featured_size` drives the news-portal grid on the home page
 *     ('hero' | 'large' | 'medium' | 'small').
 *   - `status` is 'draft' | 'published'; only 'published' rows are public.
 *
 * Idempotent: table and indexes are only created when missing.
 */

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
export const up = (pgm) => {
  pgm.sql('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  pgm.createTable(
    'articles',
    {
      id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
      title: { type: 'varchar(500)', notNull: true, default: "''" },
      slug: { type: 'varchar(255)', notNull: true, unique: true },
      excerpt: { type: 'text', notNull: true, default: "''" },
      cover_image_url: { type: 'text', notNull: true, default: "''" },
      content: { type: 'jsonb', notNull: true, default: pgm.func("'[]'::jsonb") },
      author_id: { type: 'uuid' },
      author_name: { type: 'varchar(255)', notNull: true, default: "''" },
      status: { type: 'varchar(20)', notNull: true, default: "'draft'" },
      featured_size: { type: 'varchar(20)', notNull: true, default: "'medium'" },
      category: { type: 'varchar(100)', notNull: true, default: "''" },
      tags: { type: 'jsonb', notNull: true, default: pgm.func("'[]'::jsonb") },
      view_count: { type: 'integer', notNull: true, default: 0 },
      published_at: { type: 'timestamptz' },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    },
    { ifNotExists: true },
  );

  pgm.createIndex('articles', 'slug', { unique: true, ifNotExists: true });
  pgm.createIndex('articles', 'status', { ifNotExists: true });
  pgm.createIndex('articles', 'published_at', { ifNotExists: true });
  pgm.createIndex('articles', 'author_id', { ifNotExists: true });
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
export const down = (pgm) => {
  pgm.dropTable('articles', { ifExists: true, cascade: true });
};
