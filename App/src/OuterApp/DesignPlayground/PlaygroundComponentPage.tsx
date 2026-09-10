import React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getEntryBySlug, playgroundEntries } from "./registry";

const PlaygroundComponentPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const entry = getEntryBySlug(slug);

  if (!entry) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-white mb-2">
          Component not found
        </h1>
        <p className="text-content-muted mb-6">
          There's no playground entry for “{slug}”.
        </p>
        <Link
          to="/design-playground"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-muted text-white hover:bg-brand transition"
        >
          <ArrowLeft size={16} />
          Back to overview
        </Link>
      </div>
    );
  }

  const index = playgroundEntries.findIndex((e) => e.slug === entry.slug);
  const prev = index > 0 ? playgroundEntries[index - 1] : undefined;
  const next =
    index < playgroundEntries.length - 1
      ? playgroundEntries[index + 1]
      : undefined;

  const { Component } = entry;

  return (
    <div>
      <Link
        to="/design-playground"
        className="inline-flex items-center gap-1.5 text-sm text-content-muted hover:text-white transition mb-6"
      >
        <ArrowLeft size={15} />
        All components
      </Link>

      <Component />

      {/* prev / next */}
      <nav className="flex items-stretch gap-3 mt-12 pt-6 border-t border-line-glass">
        {prev ? (
          <Link
            to={`/design-playground/${prev.slug}`}
            className="flex-1 p-4 rounded-xl border border-line-glass hover:border-brand/40 hover:bg-surface-elevated/40 transition"
          >
            <span className="block text-xs text-content-muted mb-1">
              ← Previous
            </span>
            <span className="text-white font-medium">{prev.title}</span>
          </Link>
        ) : (
          <span className="flex-1" />
        )}
        {next ? (
          <Link
            to={`/design-playground/${next.slug}`}
            className="flex-1 p-4 rounded-xl border border-line-glass hover:border-brand/40 hover:bg-surface-elevated/40 transition text-right"
          >
            <span className="block text-xs text-content-muted mb-1">
              Next →
            </span>
            <span className="text-white font-medium">{next.title}</span>
          </Link>
        ) : (
          <span className="flex-1" />
        )}
      </nav>
    </div>
  );
};

export default PlaygroundComponentPage;
