import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import MobileTopBar from "./mobile-nav/MobileTopBar";
import MobileMenuOverlay from "./mobile-nav/MobileMenuOverlay";

/**
 * Mobile navigation. Owns the shared open-state + side effects (body scroll
 * lock, background-animation pause, global Escape handling) and delegates the
 * visual pieces to small presentational components:
 *   - MobileTopBar       the always-visible bar (logo, CTA, hamburger)
 *   - MobileMenuOverlay  the fullscreen portalled dialog
 *   - LanguageSelector   the ARIA listbox inside the overlay
 */
const MobileNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { language, setLanguage, translations } = useLanguage();
  const t = translations[language];
  const location = useLocation();
  const dialogRef = useRef<HTMLDivElement>(null);
  const langTriggerRef = useRef<HTMLButtonElement>(null);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setLangOpen(false);
  }, [location.pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      // While the fullscreen menu is open, the animated page BEHIND it keeps
      // running its requestAnimationFrame canvas loops (FloatingParticles, etc.)
      // at full tilt. On a weak mobile CPU that starves React's state updates +
      // paint, so every tap inside the menu lags badly. Broadcast a pause signal
      // so background animations stop while the menu is open; resume on close.
      window.dispatchEvent(new CustomEvent("anl:pause-bg-animation"));
      // Focus the dialog container for a11y on the next frame (setTimeout here
      // could trigger a reflow/scroll jump on iOS).
      requestAnimationFrame(() => dialogRef.current?.focus());
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      window.dispatchEvent(new CustomEvent("anl:resume-bg-animation"));
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      window.dispatchEvent(new CustomEvent("anl:resume-bg-animation"));
    };
  }, [menuOpen]);

  // Close on Escape — closes the language dropdown first if it is open.
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

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setLangOpen(false);
  }, []);

  return (
    <>
      <MobileTopBar menuOpen={menuOpen} onOpenMenu={() => setMenuOpen(true)} t={t} />
      <MobileMenuOverlay
        open={menuOpen}
        onClose={closeMenu}
        t={t}
        dialogRef={dialogRef}
        langOpen={langOpen}
        setLangOpen={setLangOpen}
        language={language}
        setLanguage={setLanguage}
        langTriggerRef={langTriggerRef}
      />
    </>
  );
};

export default MobileNavbar;
