import React, { useState, useRef, useEffect } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import lightLogo from "/public/light-logo.png";
import darkLogo from "/public/dark-logo.png";
import { Link } from "react-router-dom";
import { useLanguage } from "./../hooks/useLanguage";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface FooterProps {
  darkMode?: boolean;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

/** Scroll the opened section into view on mobile. */
const scrollOnMobile = (ref: React.RefObject<HTMLDivElement>) => {
  if (ref.current && window.innerWidth <= 768) {
    ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

/* ─── Sub-components ─────────────────────────────────────────────────────── */

interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  sectionRef: React.RefObject<HTMLDivElement>;
}

/** Accordion column — collapsed on mobile, always visible on md+. */
const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  isOpen,
  onToggle,
  children,
  sectionRef,
}) => (
  <div className="w-full md:w-auto text-center md:text-left">
    <div className="mt-4 md:mt-0">
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center md:cursor-default font-semibold text-content-inverse"
      >
        {title}
        <span className="md:hidden text-content-inverse">
          {isOpen ? (
            <MdKeyboardArrowUp size={24} />
          ) : (
            <MdKeyboardArrowDown size={24} />
          )}
        </span>
      </button>
      <div
        ref={sectionRef}
        className={`${
          isOpen ? "flex" : "hidden"
        } md:flex flex-col gap-2 mt-2 text-content-muted`}
      >
        {children}
      </div>
    </div>
  </div>
);

/* ─── Footer ─────────────────────────────────────────────────────────────── */

const Footer: React.FC<FooterProps> = ({ darkMode }) => {
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [isLanguagesOpen, setIsLanguagesOpen] = useState(false);
  const { language, setLanguage, translations } = useLanguage();

  const termsRef = useRef<HTMLDivElement>(null);
  const companyRef = useRef<HTMLDivElement>(null);
  const languagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (isTermsOpen) scrollOnMobile(termsRef); }, [isTermsOpen]);
  useEffect(() => { if (isCompanyOpen) scrollOnMobile(companyRef); }, [isCompanyOpen]);
  useEffect(() => { if (isLanguagesOpen) scrollOnMobile(languagesRef); }, [isLanguagesOpen]);

  const handleLanguageChange = (lang: "english" | "magyar" | "romana") => {
    setLanguage(lang);
  };

  const t = translations[language];

  return (
    <footer
      className={[
        "flex flex-col lg:flex-row justify-center items-center lg:items-start gap-6 lg:gap-16 p-5 text-sm",
        darkMode
          ? "bg-surface-black text-content-inverse"
          : "bg-surface-light text-content border-t border-line shadow-footer mt-4",
      ].join(" ")}
    >
      {/* ── Brand column ────────────────────────────────────────────────── */}
      <div className="w-full lg:w-60 text-center lg:text-left shrink-0">
        <div className="flex flex-row justify-center lg:justify-start items-center gap-2 text-content-inverse">
          <img
            src={darkMode ? lightLogo : darkLogo}
            alt="Logo"
            className="w-18 h-10"
          />
          <span className="font-semibold">Ads and Leads srl.</span>
        </div>
        <p className="mt-2 text-content-muted leading-relaxed">
          {t.footerTagline}
        </p>
      </div>

      {/* ── Nav columns (wrap together at md) ───────────────────────────── */}
      <div className="w-full lg:w-auto flex flex-col md:flex-row flex-wrap justify-center gap-6 md:gap-10 lg:gap-16">
        {/* ── Terms & Policy ───────────────────────────────────────────── */}
        <CollapsibleSection
          title={t.termsAndPolicy}
          isOpen={isTermsOpen}
          onToggle={() => setIsTermsOpen((o) => !o)}
          sectionRef={termsRef}
        >
          <Link to="/information/cookie-policy" className="hover:text-brand-hover transition-colors duration-fast">
            {t.cookies}
          </Link>
          <Link to="/information/terms-and-conditions" className="hover:text-brand-hover transition-colors duration-fast">
            {t.termsAndConditions}
          </Link>
          <Link to="/information/privacy-policy" className="hover:text-brand-hover transition-colors duration-fast">
            {t.privacyPolicy}
          </Link>
        </CollapsibleSection>

        {/* ── Company ──────────────────────────────────────────────────── */}
        <CollapsibleSection
          title={t.company}
          isOpen={isCompanyOpen}
          onToggle={() => setIsCompanyOpen((o) => !o)}
          sectionRef={companyRef}
        >
          <Link to="/" className="hover:text-brand-hover transition-colors duration-fast">
            {t.aboutUs}
          </Link>
          <Link to="/" className="hover:text-brand-hover transition-colors duration-fast">
            {t.ourTeam}
          </Link>
          <Link to="/contact" className="hover:text-brand-hover transition-colors duration-fast">
            {t.contactUs}
          </Link>
        </CollapsibleSection>

        {/* ── Languages ────────────────────────────────────────────────── */}
        <CollapsibleSection
          title={t.languages}
          isOpen={isLanguagesOpen}
          onToggle={() => setIsLanguagesOpen((o) => !o)}
          sectionRef={languagesRef}
        >
          {(["english", "magyar", "romana"] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={[
                "text-left hover:text-brand-hover transition-colors duration-fast",
                language === lang ? "font-bold text-content-inverse" : "",
              ].join(" ")}
            >
              {lang === "english"
                ? t.englishLanguage
                : lang === "magyar"
                ? t.hungarianLanguage
                : t.romanianLanguage}
            </button>
          ))}
        </CollapsibleSection>

        {/* ── Copyright ────────────────────────────────────────────────── */}
        <div className="text-center md:text-left py-4 md:py-0 text-content-inverse">
          <div className="text-base font-semibold">Ads and Leads srl.</div>
          <div className="text-xs mt-2 text-content-muted">
            {t.allRightsReserved} &copy; {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;