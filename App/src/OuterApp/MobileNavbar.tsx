import { useState, useEffect, useCallback, useRef, memo } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaSignInAlt,
  FaUserPlus,
  FaGlobe,
  FaCalendarAlt,
} from "react-icons/fa";
import { useLanguage } from "../hooks/useLanguage";
import { LANGUAGES, flags, langLabels, type Language } from "./mobile-nav/languageData";

/**
 * Mobile navigation — rewritten for real-device performance.
 *
 * Design principles that keep taps instant on low-end phones:
 *   1. The fullscreen menu is CONDITIONALLY RENDERED (not always-mounted). When
 *      closed it contributes ZERO DOM and ZERO compositor layers. The previous
 *      "always-mounted + willChange:opacity" overlay kept a permanent
 *      full-viewport GPU layer alive on every page, which taxed every scroll
 *      and tap on mobile GPUs. That trick only existed to dodge PostHog rrweb
 *      serialization on desktop — but this component only renders on mobile,
 *      where session replay is now disabled, so it was pure overhead.
 *   2. Opening/closing only mounts/unmounts a small subtree and toggles one
 *      body style. No universal-selector CSS, no per-scroll reflow.
 *   3. Navigation is direct: close + let <Link> navigate in the same click.
 *   4. The enter animation is a one-shot GPU-composited keyframe (opacity +
 *      translateY); closing is instant (unmount) so it never feels stuck.
 */

const BAR_HEIGHT = 56;
const BAR_GRADIENT = "linear-gradient(to left, #1a1a2e, #0D0D1A)";

const MobileNavbar = () => {
  const { language, setLanguage, translations } = useLanguage();
  const t = translations[language];
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setLangOpen(false);
  }, []);

  // Close whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
    setLangOpen(false);
  }, [location.pathname]);

  // Lock body scroll + pause background canvas loops while the menu is open.
  useEffect(() => {
    if (!menuOpen) return;

    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    // The opaque fullscreen menu fully covers the animated page behind it, so
    // there's no reason to keep burning the main thread on it. Pausing frees
    // the CPU for the menu's own taps.
    window.dispatchEvent(new CustomEvent("anl:pause-bg-animation"));

    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
      // Defer resume one frame so the just-closed page repaints first, instead
      // of colliding with the first frame of every background animation.
      requestAnimationFrame(() => {
        window.dispatchEvent(new CustomEvent("anl:resume-bg-animation"));
      });
    };
  }, [menuOpen]);

  // Global Escape handling (closes the language list first, then the menu).
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setLangOpen((wasOpen) => {
        if (wasOpen) return false;
        setMenuOpen(false);
        return false;
      });
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <>
      <TopBar menuOpen={menuOpen} onOpenMenu={() => setMenuOpen(true)} t={t} />
      {menuOpen && (
        <MobileMenu
          t={t}
          onClose={closeMenu}
          language={language}
          setLanguage={setLanguage}
          langOpen={langOpen}
          setLangOpen={setLangOpen}
        />
      )}
    </>
  );
};

export default MobileNavbar;

/* ────────────────────────────── Top bar ────────────────────────────────── */

interface TopBarProps {
  menuOpen: boolean;
  onOpenMenu: () => void;
  t: Record<string, string>;
}

const TopBar = memo(({ menuOpen, onOpenMenu, t }: TopBarProps) => {
  const [showCta, setShowCta] = useState(false);
  const location = useLocation();

  // Reveal a compact "Book a Meeting" CTA once the hero's primary CTA
  // (#hero-cta-primary) scrolls up past the bar. Uses an IntersectionObserver
  // (off-main-thread, fires only on threshold crossings) — never a per-scroll
  // getBoundingClientRect(), which would reflow on every scroll frame.
  useEffect(() => {
    setShowCta(false);
    let observer: IntersectionObserver | null = null;
    let rafId = 0;
    let tries = 0;

    const attach = () => {
      const target = document.getElementById("hero-cta-primary");
      if (!target) {
        if (tries++ < 60) rafId = requestAnimationFrame(attach);
        return;
      }
      observer = new IntersectionObserver(
        ([entry]) => setShowCta(entry.boundingClientRect.bottom <= BAR_HEIGHT),
        { threshold: [0, 1], rootMargin: `-${BAR_HEIGHT}px 0px 0px 0px` }
      );
      observer.observe(target);
    };

    attach();
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      observer?.disconnect();
    };
  }, [location.pathname]);

  return (
    <nav
      className="fixed top-0 left-0 w-full flex items-center justify-between px-4"
      style={{
        zIndex: 9998,
        height: BAR_HEIGHT,
        background: BAR_GRADIENT,
        boxShadow: "0 2px 12px 0 rgba(0,0,0,0.25)",
      }}
    >
      <Link to="/" className="flex items-center gap-2" aria-label="Home">
        <img src="/light-logo.png" alt="Logo" style={{ height: "2rem", width: "auto" }} />
      </Link>
      <div className="flex items-center gap-2">
        <Link
          to="/booking"
          aria-hidden={!showCta}
          tabIndex={showCta ? 0 : -1}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-accent-rose/15 border border-accent-rose/40 text-white text-sm font-semibold whitespace-nowrap transition-opacity duration-300 ${
            showCta ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <FaCalendarAlt className="w-3.5 h-3.5" />
          <span>{t["cta.bookMeeting"]}</span>
        </Link>
        <button
          type="button"
          className="text-white text-2xl p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a78bfa] hover:bg-white/10 transition-colors"
          style={{ touchAction: "manipulation" }}
          onClick={onOpenMenu}
          aria-label={t["nav.openMenu"]}
          aria-expanded={menuOpen}
        >
          <FaBars />
        </button>
      </div>
    </nav>
  );
});
TopBar.displayName = "MobileTopBar";

/* ─────────────────────────── Fullscreen menu ───────────────────────────── */

interface MobileMenuProps {
  t: Record<string, string>;
  onClose: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  langOpen: boolean;
  setLangOpen: (open: boolean) => void;
}

const MobileMenu = ({
  t,
  onClose,
  language,
  setLanguage,
  langOpen,
  setLangOpen,
}: MobileMenuProps) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus the panel once for a11y (screen readers announce the dialog).
  useEffect(() => {
    const id = requestAnimationFrame(() => panelRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, []);

  const navLinks = [
    { to: "/contact", label: t.contact },
    { to: "/services", label: t.services },
    { to: "/aboutus", label: t.aboutUs },
  ];

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={t["nav.navigationMenu"]}
      tabIndex={-1}
      className="ph-no-capture fixed inset-0 outline-none flex flex-col"
      style={{
        zIndex: 9999,
        background: BAR_GRADIENT,
        // One-shot, GPU-composited enter. No persistent will-change layer.
        animation: "mobileMenuIn 150ms ease-out",
      }}
    >
      {/* Header row (mirrors the top bar) */}
      <div className="flex items-center justify-between px-4 shrink-0" style={{ height: BAR_HEIGHT }}>
        <Link to="/" onClick={onClose} className="flex items-center gap-2" aria-label="Home">
          <img src="/light-logo.png" alt="Logo" style={{ height: "2rem", width: "auto" }} />
        </Link>
        <button
          type="button"
          className="text-white text-2xl p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a78bfa] hover:bg-white/10 transition-colors"
          style={{ touchAction: "manipulation" }}
          onClick={onClose}
          aria-label={t["nav.closeMenu"]}
        >
          <FaTimes />
        </button>
      </div>

      <div className="mx-4 border-t border-white/10" />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <nav className="flex flex-col gap-1 px-4 mt-6">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className="flex items-center px-4 py-3 text-lg font-semibold text-white rounded-xl hover:bg-[#65558F]/20 focus:outline-none focus:ring-2 focus:ring-[#a78bfa] transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="mx-4 mt-4 border-t border-white/10" />

        <div className="flex gap-3 px-8 mt-6" role="group" aria-label={t["nav.authentication"]}>
          <Link
            to="/login"
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 bg-[#65558F] hover:bg-[#7c6bb7] text-white rounded-xl py-3 px-4 font-semibold text-base shadow transition-colors focus:outline-none focus:ring-2 focus:ring-[#a78bfa] text-center no-underline"
            role="button"
          >
            <FaSignInAlt size={18} aria-hidden="true" />
            {t.login}
          </Link>
          <Link
            to="/register"
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-xl py-3 px-4 font-semibold text-base border border-white/20 shadow transition-colors focus:outline-none focus:ring-2 focus:ring-[#a78bfa] text-center no-underline"
            role="button"
          >
            <FaUserPlus size={18} aria-hidden="true" />
            {t.signIn}
          </Link>
        </div>

        <LanguageSelect
          t={t}
          language={language}
          setLanguage={setLanguage}
          open={langOpen}
          setOpen={setLangOpen}
        />
      </div>
    </div>,
    document.body
  );
};

/* ─────────────────────────── Language selector ─────────────────────────── */

interface LanguageSelectProps {
  t: Record<string, string>;
  language: Language;
  setLanguage: (lang: Language) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const LanguageSelect = ({ t, language, setLanguage, open, setOpen }: LanguageSelectProps) => {
  const select = (lang: Language) => {
    setLanguage(lang);
    setOpen(false);
  };

  return (
    <div className="px-8 mt-8 pb-10">
      <button
        type="button"
        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#a78bfa]"
        style={{ touchAction: "manipulation" }}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <FaGlobe className="text-white/60" size={16} aria-hidden="true" />
        {flags[language]}
        <span className="font-medium text-white text-base">{langLabels[language]}</span>
        <svg
          className={`ml-auto w-4 h-4 text-white/40 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={t["language.selectLanguage"]}
          className="mt-2 rounded-xl bg-white/5 border border-white/10 overflow-hidden list-none m-0 p-0"
        >
          {LANGUAGES.map((lang) => (
            <li
              key={lang}
              role="option"
              aria-selected={lang === language}
              tabIndex={0}
              className={`flex items-center gap-3 w-full px-4 py-3 text-base text-white transition-colors cursor-pointer focus:outline-none focus:bg-[#65558F]/30 ${
                lang === language ? "bg-[#65558F]/20 font-semibold" : "hover:bg-white/10"
              }`}
              style={{ touchAction: "manipulation" }}
              onClick={() => select(lang)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  select(lang);
                }
              }}
            >
              {flags[lang]}
              <span>{langLabels[lang]}</span>
              {lang === language && (
                <svg
                  className="ml-auto w-5 h-5 text-[#a78bfa]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
