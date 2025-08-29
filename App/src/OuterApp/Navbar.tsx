import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import lightLogo from "/public/light-logo.png";
import { Link } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";

type Language = "english" | "magyar" | "romana";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState<boolean>(false);

  const { language, setLanguage, translations } = useLanguage();
  const t = translations[language];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (isLanguageMenuOpen) setIsLanguageMenuOpen(false);
  };

  const toggleLanguageMenu = () => {
    setIsLanguageMenuOpen(!isLanguageMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 50;
      setIsScrolled(window.scrollY > scrollThreshold);
    };

    let debounceTimeout: number | null = null;
    const debouncedHandleScroll = () => {
      if (debounceTimeout) clearTimeout(debounceTimeout);
      debounceTimeout = window.setTimeout(handleScroll, 50);
    };

    window.addEventListener("scroll", debouncedHandleScroll);
    return () => {
      if (debounceTimeout) clearTimeout(debounceTimeout);
      window.removeEventListener("scroll", debouncedHandleScroll);
    };
  }, []);

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

  const languageNames: Record<Language, string> = {
    english: "EN",
    magyar: "HU",
    romana: "RO",
  };

  return (
    <div
      className={`relative sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "lg:p-5 lg:pb-0 bg-[#080A0D] lg:pt-0 lg:mt-0" : "lg:p-10 lg:pt-[50px] lg:mt-0"
      }`}
    >
      {/* Desktop Navbar >1400px */}
      <div
        className={`hidden xl:flex items-center justify-between text-white lg:py-4 ${
          isScrolled ? "" : "lg:border-t-2 lg:border-white"
        }`}
      >
        <Link to="/" className="pl-5">
          <img
            src={lightLogo}
            alt="Logo"
            className={`transition-all duration-300 ${
              isScrolled ? "lg:h-16 h-[4rem] pt-1" : "lg:h-20 h-[5rem] pt-3"
            }`}
          />
        </Link>

        <div className="flex lg:items-center lg:h-full space-x-8 text-2xl font-bold font-inter mt-0">
          <Link to="/contact" className="hover:text-[#343E4C] p-5">{t.contact}</Link>
          <Link to="/services" className="hover:text-[#343E4C] p-5">{t.services}</Link>
          <Link to="/aboutus" className="hover:text-[#343E4C] p-5">{t.aboutUs}</Link>

          <div className="relative">
            <button onClick={toggleLanguageMenu} className="flex items-center space-x-2 hover:text-[#343E4C] p-5">
              <span className="inline-block">{flags[language]}</span>
              <span>{languageNames[language]}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <AnimatePresence>
              {isLanguageMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-40 bg-[#080A0D] border border-gray-700 rounded shadow-lg"
                >
                  <div className="py-1">
                    {( ["english", "magyar", "romana"] as const ).map((lang: Language) => (
                      <button
                        key={lang}
                        onClick={() => { setLanguage(lang); setIsLanguageMenuOpen(false); }}
                        className="flex items-center space-x-2 px-4 py-2 text-sm w-full text-left hover:bg-gray-800"
                      >
                        <span>{flags[lang]}</span>
                        <span>{lang === "romana" ? "Română" : lang.charAt(0).toUpperCase() + lang.slice(1)}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/login">
            <div className="bg-[#65558F] text-white p-4 px-20 rounded hover:bg-sky-700">{t.login}</div>
          </Link>
          <Link to="/register">
            <div className="bg-[#65558F] text-white p-4 px-20 rounded hover:bg-sky-700">{t.signIn}</div>
          </Link>
        </div>
      </div>

      {/* Mid-size Navbar 1024px–1400px */}
      <div className="hidden lg:flex xl:hidden items-center justify-center text-white relative">
        {/* Logo centered */}
        <Link to="/" className="mx-auto">
          <img
            src={lightLogo}
            alt="Logo"
            className={`transition-all duration-300 ${isScrolled ? "h-16" : "h-20"}`}
          />
        </Link>

        {/* Right side: login/sign in + dropdown */}
        <div className="absolute right-5 flex items-center gap-4">
          <Link to="/login">
            <div className="bg-[#65558F] text-white p-2 px-6 rounded hover:bg-sky-700">{t.login}</div>
          </Link>
          <Link to="/register">
            <div className="bg-[#65558F] text-white p-2 px-6 rounded hover:bg-sky-700">{t.signIn}</div>
          </Link>

          {/* Dropdown Hamburger */}
          <button className="text-white focus:outline-none" onClick={toggleMenu}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-5 mt-2 w-56 bg-[#080A0D] border border-gray-700 rounded shadow-lg z-20"
            >
              <div className="flex flex-col">
                <Link to="/contact" className="px-4 py-2 hover:bg-gray-800">{t.contact}</Link>
                <Link to="/services" className="px-4 py-2 hover:bg-gray-800">{t.services}</Link>
                <Link to="/aboutus" className="px-4 py-2 hover:bg-gray-800">{t.aboutUs}</Link>
                <Link to="/blog" className="px-4 py-2 hover:bg-gray-800">{t.blog}</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Navbar <1024px */}
      <div className="lg:hidden flex items-center justify-between text-white">
        <Link to="/" className="pl-5">
          <img src={lightLogo} alt="Logo" className={`h-16`} />
        </Link>

        <div className="flex items-center gap-5">
          <Link to="/login">
            <div className="bg-[#65558F] text-white p-0 px-4 md:p-3 md:px-12 rounded hover:bg-sky-700">{t.login}</div>
          </Link>
          <Link to="/register">
            <div className="bg-[#65558F] text-white p-0 px-4 md:p-3 md:px-12 rounded hover:bg-sky-700">{t.signIn}</div>
          </Link>
          <button className="text-white focus:outline-none pr-3" onClick={toggleMenu}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute z-10 w-full flex flex-col space-y-4 text-xl font-inter font-extrabold text-white p-5 rounded-md bg-[#080A0D]"
            >
              <Link to="/contact" className="hover:text-gray-300">{t.contact}</Link>
              <Link to="/services" className="hover:text-gray-300">{t.services}</Link>
              <Link to="/aboutus" className="hover:text-gray-300">{t.aboutUs}</Link>
              <Link to="/blog" className="hover:text-gray-300">{t.blog}</Link>

              <div className="pt-2 border-t border-gray-700">
                <div className="text-lg font-semibold mb-2">{t.languages}</div>
                <div className="flex flex-col space-y-2">
                  {( ["english", "magyar", "romana"] as const ).map((lang: Language) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`flex items-center space-x-3 py-2 text-left hover:bg-gray-800 ${language === lang ? 'text-blue-400' : ''}`}
                    >
                      <span>{flags[lang]}</span>
                      <span>{lang === "romana" ? "Română" : lang.charAt(0).toUpperCase() + lang.slice(1)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Navbar;
