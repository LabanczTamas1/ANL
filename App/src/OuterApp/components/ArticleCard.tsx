import React from "react";
import { Link } from "react-router-dom";
import type { Article, ArticleSize } from "../../services/api/articleApi";

const safeSrc = (url: string): string => {
  const trimmed = (url || "").trim();
  if (trimmed.startsWith("/")) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return "";
};

const formatDate = (iso: string | null, locale: string): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });
};

interface ArticleCardProps {
  article: Article;
  size?: ArticleSize;
  locale?: string;
}

/**
 * News-portal article card. The visual weight adapts to `size` so the home
 * grid can mix a dominant hero, secondary features, and compact fillers like
 * an editorial front page.
 */
const ArticleCard: React.FC<ArticleCardProps> = ({ article, size = "medium", locale = "en-US" }) => {
  const cover = safeSrc(article.coverImageUrl);
  const date = formatDate(article.publishedAt ?? article.createdAt, locale);

  const Meta = (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {article.category && (
        <span className="uppercase tracking-wider font-bold text-brand-focus">
          {article.category}
        </span>
      )}
      {date && <span className="text-content-muted">{date}</span>}
    </div>
  );

  const Fallback = (
    <div className="absolute inset-0 bg-gradient-to-br from-brand/40 via-surface-elevated to-surface-black" />
  );

  // ─── HERO — full-bleed image with overlaid text ──────────────────────────────
  if (size === "hero") {
    return (
      <Link
        to={`/articles/${article.slug}`}
        className="group relative block h-full min-h-[22rem] overflow-hidden rounded-3xl border border-line-glass shadow-glass"
      >
        {cover ? (
          <img
            src={cover}
            alt={article.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          Fallback
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          {Meta}
          <h3 className="mt-3 text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight line-clamp-3">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="mt-3 text-content-subtle-inverse text-base md:text-lg line-clamp-2 max-w-2xl">
              {article.excerpt}
            </p>
          )}
        </div>
      </Link>
    );
  }

  // ─── SMALL — compact horizontal row ──────────────────────────────────────────
  if (size === "small") {
    return (
      <Link
        to={`/articles/${article.slug}`}
        className="group flex h-full gap-4 overflow-hidden rounded-2xl border border-line-glass bg-surface-elevated/60 p-3 transition-colors hover:border-brand/40"
      >
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
          {cover ? (
            <img
              src={cover}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            Fallback
          )}
        </div>
        <div className="flex min-w-0 flex-col justify-center">
          {Meta}
          <h3 className="mt-1 text-sm font-bold text-white leading-snug line-clamp-3">
            {article.title}
          </h3>
        </div>
      </Link>
    );
  }

  // ─── LARGE / MEDIUM — image on top, text below ───────────────────────────────
  const isLarge = size === "large";
  return (
    <Link
      to={`/articles/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line-glass bg-surface-elevated/60 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-card-hover"
    >
      <div className={`relative w-full overflow-hidden ${isLarge ? "aspect-[16/9]" : "aspect-[3/2]"}`}>
        {cover ? (
          <img
            src={cover}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          Fallback
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        {Meta}
        <h3
          className={`mt-3 font-bold text-white leading-tight tracking-tight ${
            isLarge ? "text-2xl md:text-3xl line-clamp-3" : "text-xl line-clamp-2"
          }`}
        >
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="mt-3 text-content-muted leading-relaxed line-clamp-3">
            {article.excerpt}
          </p>
        )}
        <span className="mt-auto pt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-hover opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          Read article
          <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </span>
      </div>
    </Link>
  );
};

export default ArticleCard;
