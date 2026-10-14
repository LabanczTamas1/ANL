import React, { useEffect, useState } from "react";
import { getPublishedArticles, type Article } from "../../services/api/articleApi";
import ArticleCard from "./ArticleCard";

/** Dense editorial span mapping — mixes dominant and compact tiles. */
const spanBySize: Record<string, string> = {
  hero: "sm:col-span-2 lg:col-span-6",
  large: "sm:col-span-2 lg:col-span-4",
  medium: "sm:col-span-1 lg:col-span-3",
  small: "sm:col-span-1 lg:col-span-2",
};

interface ArticlesGridProps {
  title?: string;
  subtitle?: string;
  locale?: string;
  className?: string;
}

/**
 * Public home-page article grid. Renders published articles like a news-portal
 * front page, with each card sized by its `featuredSize`. Replaces the former
 * "Why Choose ANL" feature grid. Hides itself entirely when nothing is
 * published yet so the landing page never shows an empty section.
 */
const ArticlesGrid: React.FC<ArticlesGridProps> = ({
  title = "Latest from ANL",
  subtitle = "News, insights, and stories from our studio.",
  locale = "en-US",
  className = "",
}) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getPublishedArticles(12)
      .then((res) => {
        if (active) setArticles(res.data.articles ?? []);
      })
      .catch(() => {
        if (active) setArticles([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Nothing published yet (or still loading first paint) → render nothing.
  if (!loading && articles.length === 0) return null;

  return (
    <section className={`relative py-24 ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-surface-black via-surface-overlay to-surface-black" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mb-14 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-4xl font-bold text-white md:text-5xl">{title}</h2>
            <p className="mt-3 max-w-2xl text-lg text-content-muted">{subtitle}</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/2] animate-pulse rounded-3xl border border-line-glass bg-surface-elevated/50"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2 lg:grid-cols-6 [grid-auto-flow:dense]">
            {articles.map((article) => (
              <div key={article.id} className={spanBySize[article.featuredSize] || spanBySize.medium}>
                <ArticleCard article={article} size={article.featuredSize} locale={locale} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ArticlesGrid;
