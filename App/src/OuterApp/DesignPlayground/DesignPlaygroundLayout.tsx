import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Search, LayoutGrid, Menu, X, Sun, Moon } from "lucide-react";
import {
  playgroundEntries,
  type PlaygroundCategory,
  type PlaygroundEntry,
} from "./registry";
import "./playground-theme.css";

const CATEGORY_ORDER: PlaygroundCategory[] = ["Foundations", "Components"];

type PlaygroundTheme = "dark" | "light";
const THEME_STORAGE_KEY = "pg-theme";

const getInitialTheme = (): PlaygroundTheme => {
  if (typeof window === "undefined") return "dark";
  const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
  return saved === "light" ? "light" : "dark";
};

const matches = (entry: PlaygroundEntry, query: string): boolean => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    entry.title.toLowerCase().includes(q) ||
    entry.description.toLowerCase().includes(q) ||
    entry.keywords.some((k) => k.toLowerCase().includes(q))
  );
};

const DesignPlaygroundLayout: React.FC = () => {
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<PlaygroundTheme>(getInitialTheme);
  const location = useLocation();

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((t) => (t === "dark" ? "light" : "dark"));

  const grouped = useMemo(() => {
    const filtered = playgroundEntries.filter((e) => matches(e, query));
    return CATEGORY_ORDER.map((category) => ({
      category,
      items: filtered.filter((e) => e.category === category),
    })).filter((g) => g.items.length > 0);
  }, [query]);

  const totalMatches = grouped.reduce((n, g) => n + g.items.length, 0);

  const closeMobile = () => setMobileOpen(false);

  const ThemeToggle: React.FC<{ className?: string }> = ({ className = "" }) => (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg border border-line-glass text-content-muted hover:text-white hover:bg-surface-elevated/50 transition ${className}`}
      title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      aria-label={
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      }
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );

  return (
    <div
      className="pg-shell relative min-h-screen bg-surface-overlay"
      data-theme={theme}
    >
      <Helmet>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
        <meta name="googlebot" content="noindex, nofollow" />
        <title>Design Playground — ANL (internal)</title>
      </Helmet>

      {/* ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse at 15% 30%, rgba(101,85,143,0.4) 0%, transparent 50%),
                radial-gradient(ellipse at 85% 70%, rgba(122,164,159,0.4) 0%, transparent 50%)
              `,
            }}
          />
        </div>
      </div>

      {/* mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 border-b border-line-glass bg-surface-overlay/80 backdrop-blur">
        <span className="text-white font-semibold">Design Playground</span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="p-2 rounded-lg border border-line-glass text-content-muted hover:text-white transition"
            aria-label="Toggle component menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <div className="relative z-10 flex">
        {/* ── Sidebar ── */}
        <aside
          className={`${
            mobileOpen ? "block" : "hidden"
          } lg:block fixed lg:sticky top-0 lg:top-0 left-0 z-30 h-screen w-72 shrink-0 border-r border-line-glass bg-surface-overlay/95 lg:bg-surface-overlay/50 backdrop-blur overflow-y-auto`}
        >
          <div className="p-4">
            {/* header */}
            <div className="hidden lg:flex items-center gap-2 mb-4">
              <NavLink
                to="/design-playground"
                end
                onClick={closeMobile}
                className="flex items-center gap-2 group min-w-0"
              >
                <span className="w-8 h-8 rounded-lg bg-accent-rose flex items-center justify-center shrink-0">
                  <LayoutGrid size={16} className="text-white" />
                </span>
                <span className="text-white font-bold leading-tight group-hover:text-brand-hover transition truncate">
                  Design Playground
                </span>
              </NavLink>
              <ThemeToggle className="ml-auto shrink-0" />
            </div>

            {/* search */}
            <div className="relative mb-4">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search components…"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-line-dark bg-surface-overlay text-white text-sm placeholder-content-muted focus:outline-none focus:ring-2 focus:ring-brand-focus transition"
              />
            </div>

            {/* overview link */}
            <NavLink
              to="/design-playground"
              end
              onClick={closeMobile}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition mb-2 ${
                  isActive
                    ? "bg-brand-muted text-white"
                    : "text-content-muted hover:text-white hover:bg-surface-elevated/50"
                }`
              }
            >
              <LayoutGrid size={16} />
              Overview
            </NavLink>

            {/* grouped nav */}
            {grouped.map((group) => (
              <div key={group.category} className="mb-4">
                <p className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-content-muted">
                  {group.category}
                </p>
                <nav className="space-y-0.5">
                  {group.items.map((entry) => {
                    const Icon = entry.icon;
                    return (
                      <NavLink
                        key={entry.slug}
                        to={`/design-playground/${entry.slug}`}
                        onClick={closeMobile}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${
                            isActive
                              ? "bg-brand-muted text-white font-medium"
                              : "text-content-muted hover:text-white hover:bg-surface-elevated/50"
                          }`
                        }
                      >
                        <Icon size={16} className="shrink-0" />
                        {entry.title}
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            ))}

            {totalMatches === 0 && (
              <p className="px-3 py-6 text-center text-content-muted text-sm">
                No components match “{query}”.
              </p>
            )}
          </div>
        </aside>

        {/* mobile backdrop */}
        {mobileOpen && (
          <div
            className="lg:hidden fixed inset-0 z-20 bg-black/50"
            onClick={closeMobile}
          />
        )}

        {/* ── Content ── */}
        <main className="flex-1 min-w-0 px-4 sm:px-8 py-8 sm:py-12">
          <div className="max-w-4xl mx-auto" key={location.pathname}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DesignPlaygroundLayout;
