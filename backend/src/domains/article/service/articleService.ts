// ---------------------------------------------------------------------------
// Article Service — data access for the in-app news/article platform
// ---------------------------------------------------------------------------

import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, execute } from '../../../utils/db.js';

// ─── Types ──────────────────────────────────────────────────────────────────

export type ArticleStatus = 'draft' | 'published';
export type ArticleSize = 'hero' | 'large' | 'medium' | 'small';

export interface ArticleBlock {
  type: 'paragraph' | 'heading' | 'image' | 'quote' | 'list';
  text?: string;
  level?: number;
  url?: string;
  caption?: string;
  alt?: string;
  align?: 'left' | 'center' | 'right';
  cite?: string;
  ordered?: boolean;
  items?: string[];
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string;
  content: ArticleBlock[];
  authorId: string | null;
  authorName: string;
  status: ArticleStatus;
  featuredSize: ArticleSize;
  category: string;
  tags: string[];
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ArticleRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image_url: string;
  content: ArticleBlock[] | string;
  author_id: string | null;
  author_name: string;
  status: ArticleStatus;
  featured_size: ArticleSize;
  category: string;
  tags: string[] | string;
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleInput {
  title: string;
  slug?: string;
  excerpt?: string;
  coverImageUrl?: string;
  content?: ArticleBlock[];
  status?: ArticleStatus;
  featuredSize?: ArticleSize;
  category?: string;
  tags?: string[];
}

// ─── Mapping / helpers ────────────────────────────────────────────────────────

function parseJson<T>(value: T[] | string | null | undefined, fallback: T[]): T[] {
  if (value == null) return fallback;
  if (Array.isArray(value)) return value as T[];
  try {
    const parsed = JSON.parse(value as string);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function mapRow(row: ArticleRow): Article {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    coverImageUrl: row.cover_image_url,
    content: parseJson<ArticleBlock>(row.content, []),
    authorId: row.author_id,
    authorName: row.author_name,
    status: row.status,
    featuredSize: row.featured_size,
    category: row.category,
    tags: parseJson<string>(row.tags, []),
    viewCount: row.view_count,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const ALLOWED_SIZES: ArticleSize[] = ['hero', 'large', 'medium', 'small'];

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120);
}

async function ensureUniqueSlug(base: string, excludeId?: string): Promise<string> {
  const root = slugify(base) || `article-${Date.now()}`;
  let candidate = root;
  let n = 1;
  // Loop until the slug is free (ignoring the row we are editing).
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await queryOne<{ id: string }>(
      'SELECT id FROM articles WHERE slug = $1 LIMIT 1',
      [candidate],
    );
    if (!existing || existing.id === excludeId) return candidate;
    n += 1;
    candidate = `${root}-${n}`;
  }
}

function normalizeSize(size?: string): ArticleSize {
  return ALLOWED_SIZES.includes(size as ArticleSize) ? (size as ArticleSize) : 'medium';
}

// ─── Public reads ─────────────────────────────────────────────────────────────

export async function listPublished(limit?: number): Promise<Article[]> {
  const rows = await query<ArticleRow>(
    `SELECT * FROM articles
     WHERE status = 'published'
     ORDER BY published_at DESC NULLS LAST, created_at DESC
     ${limit ? 'LIMIT $1' : ''}`,
    limit ? [limit] : [],
  );
  return rows.map(mapRow);
}

export async function getPublishedBySlug(slug: string): Promise<Article | null> {
  const row = await queryOne<ArticleRow>(
    `SELECT * FROM articles WHERE slug = $1 AND status = 'published' LIMIT 1`,
    [slug],
  );
  if (!row) return null;
  // Fire-and-forget view counter; never block the response on it.
  void execute('UPDATE articles SET view_count = view_count + 1 WHERE id = $1', [row.id]);
  return mapRow(row);
}

// ─── Admin reads ──────────────────────────────────────────────────────────────

export async function listAll(): Promise<Article[]> {
  const rows = await query<ArticleRow>(
    `SELECT * FROM articles ORDER BY updated_at DESC`,
  );
  return rows.map(mapRow);
}

export async function getById(id: string): Promise<Article | null> {
  const row = await queryOne<ArticleRow>('SELECT * FROM articles WHERE id = $1 LIMIT 1', [id]);
  return row ? mapRow(row) : null;
}

// ─── Writes ───────────────────────────────────────────────────────────────────

export async function create(
  data: ArticleInput,
  author: { id?: string; name?: string },
): Promise<Article> {
  const id = uuidv4();
  const slug = await ensureUniqueSlug(data.slug || data.title);
  const status: ArticleStatus = data.status === 'published' ? 'published' : 'draft';
  const publishedAt = status === 'published' ? new Date().toISOString() : null;

  const rows = await query<ArticleRow>(
    `INSERT INTO articles
       (id, title, slug, excerpt, cover_image_url, content, author_id, author_name,
        status, featured_size, category, tags, published_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING *`,
    [
      id,
      data.title ?? '',
      slug,
      data.excerpt ?? '',
      data.coverImageUrl ?? '',
      JSON.stringify(data.content ?? []),
      author.id ?? null,
      author.name ?? '',
      status,
      normalizeSize(data.featuredSize),
      data.category ?? '',
      JSON.stringify(data.tags ?? []),
      publishedAt,
    ],
  );
  return mapRow(rows[0]);
}

export async function update(id: string, data: ArticleInput): Promise<Article | null> {
  const current = await getById(id);
  if (!current) return null;

  const slug =
    data.slug && data.slug !== current.slug
      ? await ensureUniqueSlug(data.slug, id)
      : current.slug;

  const nextStatus: ArticleStatus =
    data.status === 'published' || data.status === 'draft' ? data.status : current.status;

  // Stamp published_at the first time an article becomes published.
  const publishedAt =
    nextStatus === 'published'
      ? current.publishedAt ?? new Date().toISOString()
      : null;

  const rows = await query<ArticleRow>(
    `UPDATE articles SET
       title = $2,
       slug = $3,
       excerpt = $4,
       cover_image_url = $5,
       content = $6,
       status = $7,
       featured_size = $8,
       category = $9,
       tags = $10,
       published_at = $11,
       updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [
      id,
      data.title ?? current.title,
      slug,
      data.excerpt ?? current.excerpt,
      data.coverImageUrl ?? current.coverImageUrl,
      JSON.stringify(data.content ?? current.content),
      nextStatus,
      normalizeSize(data.featuredSize ?? current.featuredSize),
      data.category ?? current.category,
      JSON.stringify(data.tags ?? current.tags),
      publishedAt,
    ],
  );
  return mapRow(rows[0]);
}

export async function setStatus(id: string, status: ArticleStatus): Promise<Article | null> {
  const current = await getById(id);
  if (!current) return null;
  const publishedAt =
    status === 'published' ? current.publishedAt ?? new Date().toISOString() : null;
  const rows = await query<ArticleRow>(
    `UPDATE articles SET status = $2, published_at = $3, updated_at = now()
     WHERE id = $1 RETURNING *`,
    [id, status, publishedAt],
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function remove(id: string): Promise<boolean> {
  const count = await execute('DELETE FROM articles WHERE id = $1', [id]);
  return count > 0;
}
