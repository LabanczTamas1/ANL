import React from "react";
import type { Article, ArticleBlock } from "../../services/api/articleApi";

/** Allow only http(s) and site-relative image URLs (blocks javascript: etc). */
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
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const alignClass: Record<string, string> = {
  left: "mr-auto text-left",
  center: "mx-auto text-center",
  right: "ml-auto text-right",
};

const Block: React.FC<{ block: ArticleBlock }> = ({ block }) => {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="text-content-subtle-inverse text-lg leading-relaxed mb-6 whitespace-pre-line">
          {block.text}
        </p>
      );
    case "heading": {
      const sizes: Record<number, string> = {
        2: "text-3xl md:text-4xl",
        3: "text-2xl md:text-3xl",
        4: "text-xl md:text-2xl",
      };
      return (
        <h2
          className={`${sizes[block.level] || sizes[2]} font-bold text-white mt-10 mb-4 tracking-tight`}
        >
          {block.text}
        </h2>
      );
    }
    case "image": {
      const src = safeSrc(block.url);
      if (!src) return null;
      return (
        <figure className={`my-8 ${alignClass[block.align] || alignClass.center}`}>
          <img
            src={src}
            alt={block.alt || block.caption || ""}
            loading="lazy"
            className="rounded-2xl border border-line-glass shadow-glass w-full object-cover"
          />
          {block.caption && (
            <figcaption className="text-content-muted text-sm mt-3 italic">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    }
    case "quote":
      return (
        <blockquote className="my-8 border-l-4 border-brand pl-6 py-2">
          <p className="text-xl md:text-2xl text-white font-medium italic leading-snug">
            “{block.text}”
          </p>
          {block.cite && (
            <cite className="block mt-3 text-content-muted text-sm not-italic">
              — {block.cite}
            </cite>
          )}
        </blockquote>
      );
    case "list":
      return block.ordered ? (
        <ol className="list-decimal list-inside text-content-subtle-inverse text-lg leading-relaxed mb-6 space-y-2">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      ) : (
        <ul className="list-disc list-inside text-content-subtle-inverse text-lg leading-relaxed mb-6 space-y-2">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    default:
      return null;
  }
};

interface ArticleRendererProps {
  article: Article;
  locale?: string;
}

/**
 * Shared article body renderer used by both the public article page and the
 * in-app author preview, so what a creator previews is exactly what readers see.
 * All text goes through React (auto-escaped) and image URLs are sanitized.
 */
const ArticleRenderer: React.FC<ArticleRendererProps> = ({ article, locale = "en-US" }) => {
  const cover = safeSrc(article.coverImageUrl);
  const date = formatDate(article.publishedAt ?? article.createdAt, locale);

  return (
    <article className="relative mx-auto max-w-3xl px-6">
      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {article.category && (
          <span className="uppercase tracking-wider text-xs font-bold text-brand-focus">
            {article.category}
          </span>
        )}
        {date && <span className="text-content-muted text-sm">{date}</span>}
      </div>

      {/* Title */}
      <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-[1.05] tracking-tight mb-6">
        {article.title}
      </h1>

      {/* Excerpt */}
      {article.excerpt && (
        <p className="text-xl text-content-muted leading-relaxed mb-8">
          {article.excerpt}
        </p>
      )}

      {/* Author */}
      {article.authorName && (
        <div className="flex items-center gap-3 mb-10 pb-8 border-b border-line-glass">
          <div className="w-10 h-10 rounded-full bg-brand/30 border border-line-glass flex items-center justify-center text-sm font-bold text-white">
            {article.authorName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-white text-sm font-semibold">{article.authorName}</div>
            <div className="text-content-muted text-xs uppercase tracking-wider">ANL</div>
          </div>
        </div>
      )}

      {/* Cover */}
      {cover && (
        <img
          src={cover}
          alt={article.title}
          className="w-full rounded-3xl border border-line-glass shadow-glass object-cover mb-10"
        />
      )}

      {/* Body */}
      <div>
        {article.content.map((block, i) => (
          <Block key={i} block={block} />
        ))}
      </div>

      {/* Tags */}
      {article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-line-glass">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs font-medium bg-surface-elevated/60 border border-line-glass text-content-subtle-inverse"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
};

export default ArticleRenderer;
