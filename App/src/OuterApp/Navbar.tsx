import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import lightLogo from "/public/light-logo.png";
import { Link } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { FaSignInAlt, FaUserPlus } from "react-icons/fa";
import MobileNavbar from "./MobileNavbar";
import { useMediaQuery } from "../hooks/useMediaQuery";

type Language = "english" | "magyar" | "romana";

const Navbar: React.FC = () => {
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState<boolean>(false);
  const isMobile = useMediaQuery("(max-width: 600px)");

  const { language, setLanguage, translations } = useLanguage();
  const t = translations[language];

  const toggleLanguageMenu = () => {
    setIsLanguageMenuOpen(!isLanguageMenuOpen);
  };

  const flags: Record<Language, JSX.Element> = {
    english: (
      <svg viewBox="0 0 60 30" className="w-6 h-4">
        <clipPath id="s">
          <path d="M0,0 v30 h60 v-30 z" />
        </clipPath>
        <clipPath id="t">
          <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
        </clipPath>
        <g clipPath="url(#s)">
          <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
          <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
          <path
            d="M0,0 L60,30 M60,0 L0,30"
            clipPath="url(#t)"
            stroke="#C8102E"
            strokeWidth="4"
          />
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

  // Responsive: show MobileNavbar on small screens
  if (isMobile) {
    return <MobileNavbar />;
  }

  const blendStyle = { mixBlendMode: "exclusion" as const };

  return (
    <div
      className="relative sticky top-[1.5rem] z-50 w-full"
      style={{
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        background: "rgba(20, 20, 30, 0.7)",
        borderRadius: "2.5rem",
        margin: "0 auto",
        maxWidth: "900px",
        boxShadow: "0 4px 32px 0 rgba(0,0,0,0.18)",
        border: "1.5px solid rgba(255,255,255,0.08)",
        padding: "0.5rem 2rem",
        display: "flex",
        alignItems: "center",
        minHeight: "64px",
        justifyContent: "space-between",
      }}
    >
      {/* Logo left */}
      <Link to="/" className="flex items-center gap-2" style={blendStyle}>
        <img
          src={lightLogo}
          alt="Logo"
          style={{ height: "2.5rem", width: "auto" }}
        />
      </Link>
      {/* Center nav links - perfectly centered between logo and auth icons */}
      <div
        className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
        style={{ pointerEvents: "none", width: "fit-content", ...blendStyle }}
      >
        <div
          className="flex gap-6 items-center text-white font-semibold text-lg"
          style={{ textAlign: "center", justifyContent: "center" }}
        >
          <Link to="/contact" className="hover:text-[#65558F] whitespace-nowrap" style={{ pointerEvents: "auto" }}>
            {t.contact}
          </Link>
          <Link to="/services" className="hover:text-[#65558F] whitespace-nowrap" style={{ pointerEvents: "auto" }}>
            {t.services}
          </Link>
          <Link to="/aboutus" className="hover:text-[#65558F] whitespace-nowrap" style={{ pointerEvents: "auto" }}>
            {t.aboutUs}
          </Link>
        </div>
      </div>
      {/* Right: language + auth icons */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={toggleLanguageMenu}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#65558F]/30 focus:outline-none"
          >
            {flags[language]}
          </button>
          <AnimatePresence>
            {isLanguageMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 mt-2 w-40 bg-[#181828] border border-gray-700 rounded shadow-lg"
                style={{ zIndex: 100, top: "100%" }}
              >
                <div className="py-2 px-2">
                  {(["english", "magyar", "romana"] as const).map((lang: Language) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang);
                        setIsLanguageMenuOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-base w-full text-left hover:bg-[#65558F]/20 rounded text-white font-medium"
                    >
                      {flags[lang]}
                      <span style={{ fontWeight: 600, letterSpacing: "0.02em" }}>
                        {lang === "romana"
                          ? "Română"
                          : lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <Link to="/login" className="ml-2" style={blendStyle}>
          <button
            className="flex items-center justify-center bg-[#65558F] hover:bg-[#7c6bb7] text-white rounded-full p-2 shadow-md"
            title={t.login}
            style={{ width: 38, height: 38 }}
          >
            <FaSignInAlt size={18} />
          </button>
        </Link>
        <Link to="/register" style={blendStyle}>
          <button
            className="flex items-center justify-center bg-[#65558F] hover:bg-[#7c6bb7] text-white rounded-full p-2 shadow-md"
            title={t.signIn}
            style={{ width: 38, height: 38 }}
          >
            <FaUserPlus size={18} />
          </button>
        </Link>
      </div>
      {/* Mobile view optimizations */}
      <style>{`
        @media (max-width: 600px) {
          .sticky.top-0 {
            border-radius: 1.2rem;
            margin: 0.5rem auto 0 auto;
            max-width: 98vw;
            padding: 0.3rem 0.7rem;
            min-height: 54px;
          }
          .absolute.left-1\/2.top-1\/2.transform.-translate-x-1\/2.-translate-y-1\/2 {
            width: 100vw;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
          }
          .flex.items-center.gap-3.relative {
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Navbar;
