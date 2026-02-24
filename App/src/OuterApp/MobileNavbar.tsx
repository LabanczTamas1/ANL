import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { FaBars, FaSignInAlt, FaUserPlus } from "react-icons/fa";

// Add Language type definition
type Language = "english" | "magyar" | "romana";

// Mobile flags
const flags: Record<Language, JSX.Element> = {
  english: (
    <svg viewBox="0 0 60 30" className="w-6 h-4">
      <clipPath id="s"><path d="M0,0 v30 h60 v-30 z" /></clipPath>
      <clipPath id="t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" /></clipPath>
      <g clipPath="url(#s)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  ),
  magyar: (
    <svg viewBox="0 0 6 3" className="w-6 h-4">
      <rect width="6" height="1" fill="#CE2939" />
      <rect width="6" height="1" y="1" fill="#fff" />
      <rect width="6" height="1" y="2" fill="#477050" />
    </svg>
  ),
  romana: (
    <svg viewBox="0 0 3 2" className="w-6 h-4">
      <rect width="1" height="2" fill="#002B7F" />
      <rect width="1" height="2" x="1" fill="#FCD116" />
      <rect width="1" height="2" x="2" fill="#CE1126" />
    </svg>
  ),
};

const MobileNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { language, setLanguage, translations } = useLanguage();
  const t = translations[language];

  return (
    <nav
      className="fixed top-0 left-0 w-full z-50 bg-[#181828]/80 text-white flex items-center justify-between px-3 py-2"
      style={{ borderRadius: 0, backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", boxShadow: "0 2px 12px 0 rgba(0,0,0,0.12)" }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <img src="/public/light-logo.png" alt="Logo" style={{ height: "2rem", width: "auto" }} />
      </Link>
      {/* Hamburger */}
      <button
        className="text-white text-2xl p-2 focus:outline-none"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label="Open menu"
      >
        <FaBars />
      </button>
      {/* Slide-out menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50" style={{ borderRadius: 0 }}>
          {/* Background layer */}
          <div className="absolute inset-0 bg-[#181828]" style={{ borderRadius: 0, zIndex: 0 }}></div>
          {/* Menu content */}
          <div className="relative flex flex-col items-center justify-start pt-16 h-full" style={{ zIndex: 1 }}>
            <button
              className="absolute top-4 right-4 text-2xl text-white focus:outline-none"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              ×
            </button>
            <div className="flex flex-col gap-6 text-xl font-semibold mt-4">
              <Link to="/contact" onClick={() => setMenuOpen(false)}>{t.contact}</Link>
              <Link to="/services" onClick={() => setMenuOpen(false)}>{t.services}</Link>
              <Link to="/aboutus" onClick={() => setMenuOpen(false)}>{t.aboutUs}</Link>
            </div>
            <div className="flex gap-4 mt-8">
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                <button className="bg-[#65558F] rounded-full p-2 text-white" title={t.login}>
                  <FaSignInAlt size={20} />
                </button>
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>
                <button className="bg-[#65558F] rounded-full p-2 text-white" title={t.signIn}>
                  <FaUserPlus size={20} />
                </button>
              </Link>
            </div>
            <div className="mt-8">
              <button
                className="flex items-center gap-2 px-3 py-2 rounded bg-[#181828]/60 hover:bg-[#65558F]/30"
                onClick={() => setLangOpen((open) => !open)}
              >
                {flags[language]}
                <span className="font-medium text-lg">{language.charAt(0).toUpperCase() + language.slice(1)}</span>
              </button>
              {langOpen && (
                <div className="mt-2 bg-[#181828] rounded shadow-lg border border-gray-700 p-2 flex flex-col gap-2">
                  {(Object.keys(flags) as Language[]).map((lang) => (
                    <button
                      key={lang}
                      className="flex items-center gap-2 px-2 py-1 text-base text-white hover:bg-[#65558F]/20 rounded"
                      onClick={() => {
                        setLanguage(lang);
                        setLangOpen(false);
                        setMenuOpen(false);
                      }}
                    >
                      {flags[lang]}
                      <span>{lang.charAt(0).toUpperCase() + lang.slice(1)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default MobileNavbar;
