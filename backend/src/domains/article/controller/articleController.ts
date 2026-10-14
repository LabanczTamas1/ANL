// ---------------------------------------------------------------------------
// Article Controller — in-app news/article platform
// ---------------------------------------------------------------------------

import { Request, Response } from 'express';
import { logError } from '../../../utils/logger.js';
import * as articleService from '../service/articleService.js';
import type {
  ArticleBlock,
  ArticleInput,
  ArticleSize,
  ArticleStatus,
} from '../service/articleService.js';

const ALLOWED_BLOCK_TYPES = new Set(['paragraph', 'heading', 'image', 'quote', 'list']);

/** Only allow http(s) and site-relative URLs — blocks `javascript:` etc. */
function safeUrl(value: unknown): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (trimmed === '') return '';
  if (trimmed.startsWith('/')) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return '';
}

/** Defensively normalize an incoming block array from the client. */
function sanitizeContent(raw: unknown): ArticleBlock[] {
  if (!Array.isArray(raw)) return [];
  const blocks: ArticleBlock[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const b = item as Record<string, unknown>;
    const type = String(b.type);
    if (!ALLOWED_BLOCK_TYPES.has(type)) continue;

    switch (type) {
      case 'paragraph':
      case 'quote':
        blocks.push({
          type: type as ArticleBlock['type'],
          text: String(b.text ?? ''),
          ...(type === 'quote' ? { cite: String(b.cite ?? '') } : {}),
        });
        break;
      case 'heading':
        blocks.push({
          type: 'heading',
          text: String(b.text ?? ''),
          level: [2, 3, 4].includes(Number(b.level)) ? Number(b.level) : 2,
        });
        break;
      case 'image':
        blocks.push({
          type: 'image',
          url: safeUrl(b.url),
          caption: String(b.caption ?? ''),
          alt: String(b.alt ?? ''),
          align: ['left', 'center', 'right'].includes(String(b.align))
            ? (String(b.align) as 'left' | 'center' | 'right')
            : 'center',
        });
        break;
      case 'list':
        blocks.push({
          type: 'list',
          ordered: Boolean(b.ordered),
          items: Array.isArray(b.items) ? b.items.map((i) => String(i)) : [],
        });
        break;
    }
  }
  return blocks;
}

function sanitizeInput(body: Record<string, unknown>): ArticleInput {
  const status =
    body.status === 'published' || body.status === 'draft'
      ? (body.status as ArticleStatus)
      : undefined;
  return {
    title: String(body.title ?? '').trim(),
    slug: body.slug ? String(body.slug).trim() : undefined,
    excerpt: body.excerpt != null ? String(body.excerpt) : undefined,
    coverImageUrl: body.coverImageUrl != null ? safeUrl(body.coverImageUrl) : undefined,
    content: body.content != null ? sanitizeContent(body.content) : undefined,
    status,
    featuredSize: body.featuredSize ? (String(body.featuredSize) as ArticleSize) : undefined,
    category: body.category != null ? String(body.category) : undefined,
    tags: Array.isArray(body.tags) ? body.tags.map((t) => String(t)).slice(0, 20) : undefined,
  };
}

// ─── Public ───────────────────────────────────────────────────────────────────

export async function listPublished(req: Request, res: Response): Promise<void> {
  try {
    const limitRaw = Number(req.query.limit);
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 100) : undefined;
    const articles = await articleService.listPublished(limit);
    res.json({ articles });
  } catch (error) {
    logError(error, { context: 'listPublishedArticles' });
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
}

export async function getPublishedBySlug(req: Request, res: Response): Promise<void> {
  try {
    const article = await articleService.getPublishedBySlug(req.params.slug);
    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }
    res.json({ article });
  } catch (error) {
    logError(error, { context: 'getPublishedArticle' });
    res.status(500).json({ error: 'Failed to fetch article' });
  }
}

// ─── Admin / Owner ──────────────────────────────────────────────────────────────

export async function listAll(_req: Request, res: Response): Promise<void> {
  try {
    const articles = await articleService.listAll();
    res.json({ articles });
  } catch (error) {
    logError(error, { context: 'listAllArticles' });
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const article = await articleService.getById(req.params.id);
    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }
    res.json({ article });
  } catch (error) {
    logError(error, { context: 'getArticleById' });
    res.status(500).json({ error: 'Failed to fetch article' });
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const input = sanitizeInput(req.body ?? {});
    if (!input.title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }
    const authorName =
      [req.user?.firstName, req.user?.lastName].filter(Boolean).join(' ').trim() ||
      req.user?.username ||
      'ANL';
    const article = await articleService.create(input, {
      id: req.user?.id,
      name: authorName,
    });
    res.status(201).json({ message: 'Article created', article });
  } catch (error) {
    logError(error, { context: 'createArticle' });
    res.status(500).json({ error: 'Failed to create article' });
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const input = sanitizeInput(req.body ?? {});
    if (!input.title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }
    const article = await articleService.update(req.params.id, input);
    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }
    res.json({ message: 'Article updated', article });
  } catch (error) {
    logError(error, { context: 'updateArticle' });
    res.status(500).json({ error: 'Failed to update article' });
  }
}

export async function setStatus(req: Request, res: Response): Promise<void> {
  try {
    const status = req.body?.status;
    if (status !== 'draft' && status !== 'published') {
      res.status(400).json({ error: 'Status must be draft or published' });
      return;
    }
    const article = await articleService.setStatus(req.params.id, status);
    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }
    res.json({ message: 'Article status updated', article });
  } catch (error) {
    logError(error, { context: 'setArticleStatus' });
    res.status(500).json({ error: 'Failed to update article status' });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const ok = await articleService.remove(req.params.id);
    if (!ok) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }
    res.json({ message: 'Article deleted' });
  } catch (error) {
    logError(error, { context: 'deleteArticle' });
    res.status(500).json({ error: 'Failed to delete article' });
  }
}
