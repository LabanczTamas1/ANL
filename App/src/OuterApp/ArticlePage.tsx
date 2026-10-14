import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ArticleRenderer from "./components/ArticleRenderer";
import { getPublishedArticle, type Article } from "../services/api/articleApi";
import { useLanguage } from "../hooks/useLanguage";

const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const locale = language === "magyar" ? "hu" : language === "romana" ? "ro" : "en-US";

  const [article, setArticle] = useState<Article | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "notfound">("loading");

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setStatus("loading");
    getPublishedArticle(slug)
      .then((res) => {
        if (!active) return;
        setArticle(res.data.article);
        setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("notfound");
      });
    return () => {
      active = false;
    };
  }, [slug]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-surface-overlay">
      <Helmet>
        <title>{article ? `${article.title} — ANL` : "Article — ANL"}</title>
        {article?.excerpt && <meta name="description" content={article.excerpt} />}
      </Helmet>

      {/* Top scrim behind the transparent navbar */}
      <div
        className="pointer-events-none fixed left-0 top-0 z-40 h-40 w-full"
        style={{
          background:
            "linear-gradient(to bottom, #080A0D 0%, rgba(8,10,13,0.6) 45%, rgba(8,10,13,0) 100%)",
        }}
      />

      <Navbar />

      {/* Ambient brand bloom */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-brand/20 blur-[160px]" />

      <main className="relative z-10 pb-24 pt-36">
        {status === "loading" && (
          <div className="mx-auto max-w-3xl px-6">
            <div className="mb-6 h-6 w-32 animate-pulse rounded bg-surface-elevated/60" />
            <div className="mb-4 h-14 w-full animate-pulse rounded bg-surface-elevated/60" />
            <div className="mb-10 h-14 w-2/3 animate-pulse rounded bg-surface-elevated/60" />
            <div className="aspect-[16/9] w-full animate-pulse rounded-3xl bg-surface-elevated/60" />
          </div>
        )}

        {status === "notfound" && (
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h1 className="mb-4 text-4xl font-extrabold text-white">Article not found</h1>
            <p className="mb-8 text-content-muted">
              This article may have been unpublished or moved.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 font-semibold text-white transition-colors hover:bg-brand-hover"
            >
              Back to home
            </Link>
          </div>
        )}

        {status === "ready" && article && (
          <>
            <div className="mx-auto mb-8 max-w-3xl px-6">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-content-muted transition-colors hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                Back to home
              </Link>
            </div>
            <ArticleRenderer article={article} locale={locale} />
          </>
        )}
      </main>

      <Footer darkMode={true} />
    </div>
  );
};

export default ArticlePage;
