import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { playgroundEntries, type PlaygroundCategory } from "./registry";

const CATEGORY_ORDER: PlaygroundCategory[] = ["Foundations", "Components"];

const PlaygroundOverview: React.FC = () => (
  <div>
    <header className="mb-10">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
        Design Playground
      </h1>
      <p className="text-content-muted max-w-2xl">
        Interactive showcase of ANL's atomic design-system components. Browse the
        sidebar or search, then open a component to tweak its props live and copy
        ready-to-use code.
      </p>
    </header>

    {CATEGORY_ORDER.map((category) => {
      const items = playgroundEntries.filter((e) => e.category === category);
      if (items.length === 0) return null;
      return (
        <section key={category} className="mb-10">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-content-muted mb-3">
            {category}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((entry) => {
              const Icon = entry.icon;
              return (
                <Link
                  key={entry.slug}
                  to={`/design-playground/${entry.slug}`}
                  className="group p-5 rounded-2xl border border-line-glass bg-surface-elevated/30 hover:bg-surface-elevated/60 hover:border-brand/40 transition"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-9 h-9 rounded-lg bg-accent-rose flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-white" />
                    </span>
                    <h3 className="text-white font-semibold">{entry.title}</h3>
                    <ArrowRight
                      size={16}
                      className="ml-auto text-content-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition"
                    />
                  </div>
                  <p className="text-content-muted text-sm">
                    {entry.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      );
    })}

    <footer className="text-center text-content-muted text-sm pt-8 border-t border-line-glass">
      ANL Design System — Internal playground. Not indexed.
    </footer>
  </div>
);

export default PlaygroundOverview;
