// ---------------------------------------------------------------------------
// Article API — /api/v1/articles/*
// ---------------------------------------------------------------------------

import apiClient from './client';

export type ArticleStatus = 'draft' | 'published';
export type ArticleSize = 'hero' | 'large' | 'medium' | 'small';

export type ArticleBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string; level: number }
  | { type: 'image'; url: string; caption: string; alt: string; align: 'left' | 'center' | 'right' }
  | { type: 'quote'; text: string; cite: string }
  | { type: 'list'; ordered: boolean; items: string[] };

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

// ─── Public ─────────────────────────────────────────────────────────────────

/** GET /articles/published — published articles for the public home grid. */
export const getPublishedArticles = (limit?: number) =>
  apiClient.get<{ articles: Article[] }>('/articles/published', {
    params: limit ? { limit } : undefined,
  });

/** GET /articles/published/:slug — public article detail. */
export const getPublishedArticle = (slug: string) =>
  apiClient.get<{ article: Article }>(`/articles/published/${slug}`);

// ─── Admin / Owner ────────────────────────────────────────────────────────────

/** GET /articles — every article (draft + published) for management. */
export const getAllArticles = () =>
  apiClient.get<{ articles: Article[] }>('/articles');

/** GET /articles/:id — single article for editing / preview. */
export const getArticle = (id: string) =>
  apiClient.get<{ article: Article }>(`/articles/${id}`);

/** POST /articles — create a new article. */
export const createArticle = (payload: ArticleInput) =>
  apiClient.post<{ article: Article }>('/articles', payload);

/** PUT /articles/:id — update an article. */
export const updateArticle = (id: string, payload: ArticleInput) =>
  apiClient.put<{ article: Article }>(`/articles/${id}`, payload);

/** PATCH /articles/:id/status — publish or unpublish. */
export const setArticleStatus = (id: string, status: ArticleStatus) =>
  apiClient.patch<{ article: Article }>(`/articles/${id}/status`, { status });

/** DELETE /articles/:id — permanently delete an article. */
export const deleteArticle = (id: string) =>
  apiClient.delete<{ message: string }>(`/articles/${id}`);
