import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { FaBars, FaTimes, FaSignInAlt, FaUserPlus, FaGlobe } from "react-icons/fa";
import { createPortal } from "react-dom";

type Language = "english" | "magyar" | "romana";

const LANGUAGES: Language[] = ["english", "magyar", "romana"];

const flags: Record<Language, JSX.Element> = {
  english: (
    <svg viewBox="0 0 60 30" className="w-6 h-4" aria-hidden="true">
      <clipPath id="mob-s">
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id="mob-t">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath="url(#mob-s)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#mob-t)" stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  ),
  magyar: (
    <svg viewBox="0 0 6 3" className="w-6 h-4" aria-hidden="true">
      <rect width="6" height="1" fill="#CE2939" />
      <rect width="6" height="1" y="1" fill="#fff" />
      <rect width="6" height="1" y="2" fill="#477050" />
    </svg>
  ),
  romana: (
    <svg viewBox="0 0 3 2" className="w-6 h-4" aria-hidden="true">
      <rect width="1" height="2" fill="#002B7F" />
      <rect width="1" height="2" x="1" fill="#FCD116" />
      <rect width="1" height="2" x="2" fill="#CE1126" />
    </svg>
  ),
};

const langLabels: Record<Language, string> = {
  english: "English",
  magyar: "Magyar",
  romana: "Română",
};

const MobileNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [activeDescendant, setActiveDescendant] = useState<number>(-1);
  const { language, setLanguage, translations } = useLanguage();
  const t = translations[language];
  const location = useLocation();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const langTriggerRef = useRef<HTMLButtonElement>(null);
  const langOptionRefs = useRef<(HTMLLIElement | null)[]>([]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setLangOpen(false);
  }, [location.pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => closeButtonRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && menuOpen) {
        if (langOpen) {
          setLangOpen(false);
          langTriggerRef.current?.focus();
        } else {
          setMenuOpen(false);
        }
      }
    },
    [menuOpen, langOpen]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // When lang dropdown opens, set active descendant to current language
  useEffect(() => {
    if (langOpen) {
      const idx = LANGUAGES.indexOf(language);
      setActiveDescendant(idx >= 0 ? idx : 0);
    } else {
      setActiveDescendant(-1);
    }
  }, [langOpen, language]);

  // Scroll active option into view & focus it
  useEffect(() => {
    if (langOpen && activeDescendant >= 0) {
      langOptionRefs.current[activeDescendant]?.focus();
    }
  }, [langOpen, activeDescendant]);

  const closeMenu = () => {
    setMenuOpen(false);
    setLangOpen(false);
  };

  const toggleLangDropdown = () => {
    setLangOpen((open) => !open);
  };

  const selectLanguage = (lang: Language) => {
    setLanguage(lang);
    setLangOpen(false);
    langTriggerRef.current?.focus();
  };

  const handleLangListKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        setActiveDescendant((prev) =>
          prev < LANGUAGES.length - 1 ? prev + 1 : 0
        );
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        setActiveDescendant((prev) =>
          prev > 0 ? prev - 1 : LANGUAGES.length - 1
        );
        break;
      }
      case "Home": {
        e.preventDefault();
        setActiveDescendant(0);
        break;
      }
      case "End": {
        e.preventDefault();
        setActiveDescendant(LANGUAGES.length - 1);
        break;
      }
      case "Enter":
      case " ": {
        e.preventDefault();
        if (activeDescendant >= 0) {
          selectLanguage(LANGUAGES[activeDescendant]);
        }
        break;
      }
      case "Escape": {
        e.preventDefault();
        setLangOpen(false);
        langTriggerRef.current?.focus();
        break;
      }
      case "Tab": {
        // Close dropdown on tab out
        setLangOpen(false);
        break;
      }
    }
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setLangOpen(true);
    }
  };

  // The fullscreen overlay is rendered via a portal directly into document.body
  // so it is NOT a child of any parent that might clip it, apply blend-modes,
  // or have a semi-transparent background.
  const overlay =
    menuOpen &&
    createPortal(
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className="fixed inset-0"
        style={{
          zIndex: 9999,
          background: "linear-gradient(to left, #1a1a2e, #0D0D1A)",
          isolation: "isolate",
        }}
      >
        {/* Top bar inside overlay (mirrors the main bar) */}
        <div
          className="flex items-center justify-between px-4"
          style={{ height: 56 }}
        >
          <Link to="/" onClick={closeMenu} className="flex items-center gap-2">
            <img
              src="/public/light-logo.png"
              alt="Logo"
              style={{ height: "2rem", width: "auto" }}
            />
          </Link>
          <button
            ref={closeButtonRef}
            className="text-white text-2xl p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a78bfa] hover:bg-white/10 transition-colors"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <FaTimes />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-4 border-t border-white/10" />

        {/* Navigation links */}
        <nav className="flex flex-col gap-1 px-4 mt-6">
          {[
            { to: "/contact", label: t.contact },
            { to: "/services", label: t.services },
            { to: "/aboutus", label: t.aboutUs },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={closeMenu}
              className="flex items-center px-4 py-3 text-lg font-semibold text-white rounded-xl hover:bg-[#65558F]/20 focus:outline-none focus:ring-2 focus:ring-[#a78bfa] transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div className="mx-4 mt-4 border-t border-white/10" />

        {/* Auth buttons — using Link styled as buttons (single tab stop each) */}
        <div className="flex gap-3 px-8 mt-6" role="group" aria-label="Authentication">
          <Link
            to="/login"
            onClick={closeMenu}
            className="flex-1 flex items-center justify-center gap-2 bg-[#65558F] hover:bg-[#7c6bb7] text-white rounded-xl py-3 px-4 font-semibold text-base shadow transition-colors focus:outline-none focus:ring-2 focus:ring-[#a78bfa] text-center no-underline"
            role="button"
          >
            <FaSignInAlt size={18} aria-hidden="true" />
            {t.login}
          </Link>
          <Link
            to="/register"
            onClick={closeMenu}
            className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-xl py-3 px-4 font-semibold text-base border border-white/20 shadow transition-colors focus:outline-none focus:ring-2 focus:ring-[#a78bfa] text-center no-underline"
            role="button"
          >
            <FaUserPlus size={18} aria-hidden="true" />
            {t.signIn}
          </Link>
        </div>

        {/* Language selector — proper ARIA listbox with roving tabindex */}
        <div className="px-8 mt-8">
          <button
            ref={langTriggerRef}
            id="lang-trigger"
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#a78bfa]"
            onClick={toggleLangDropdown}
            onKeyDown={handleTriggerKeyDown}
            aria-expanded={langOpen}
            aria-haspopup="listbox"
            aria-controls="lang-listbox"
          >
            <FaGlobe className="text-white/60" size={16} aria-hidden="true" />
            {flags[language]}
            <span className="font-medium text-white text-base">
              {langLabels[language]}
            </span>
            <svg
              className={`ml-auto w-4 h-4 text-white/40 transition-transform ${langOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {langOpen && (
            <ul
              id="lang-listbox"
              role="listbox"
              aria-label="Select language"
              aria-activedescendant={activeDescendant >= 0 ? `lang-option-${LANGUAGES[activeDescendant]}` : undefined}
              className="mt-2 rounded-xl bg-white/5 border border-white/10 overflow-hidden list-none m-0 p-0"
              onKeyDown={handleLangListKeyDown}
            >
              {LANGUAGES.map((lang, index) => (
                <li
                  key={lang}
                  id={`lang-option-${lang}`}
                  ref={(el) => { langOptionRefs.current[index] = el; }}
                  role="option"
                  aria-selected={lang === language}
                  tabIndex={index === activeDescendant ? 0 : -1}
                  className={`flex items-center gap-3 w-full px-4 py-3 text-base text-white transition-colors cursor-pointer focus:outline-none focus:bg-[#65558F]/30 ${
                    lang === language
                      ? "bg-[#65558F]/20 font-semibold"
                      : "hover:bg-white/10"
                  }`}
                  onClick={() => selectLanguage(lang)}
                >
                  {flags[lang]}
                  <span>{langLabels[lang]}</span>
                  {lang === language && (
                    <svg className="ml-auto w-5 h-5 text-[#a78bfa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>,
      document.body
    );

  return (
    <>
      {/* Top bar — always visible */}
      <nav
        className="fixed top-0 left-0 w-full flex items-center justify-between px-4"
        style={{
          zIndex: 9998,
          height: 56,
          background: "linear-gradient(to left, #1a1a2e, #0D0D1A)",
          boxShadow: "0 2px 12px 0 rgba(0,0,0,0.25)",
          isolation: "isolate",
        }}
      >
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/public/light-logo.png"
            alt="Logo"
            style={{ height: "2rem", width: "auto" }}
          />
        </Link>
        <button
          className="text-white text-2xl p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a78bfa] hover:bg-white/10 transition-colors"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
        >
          <FaBars />
        </button>
      </nav>

      {/* Fullscreen overlay (portalled to body) */}
      {overlay}
    </>
  );
};

export default MobileNavbar;
