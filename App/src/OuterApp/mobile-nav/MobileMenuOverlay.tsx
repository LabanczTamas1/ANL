import type { RefObject } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { FaTimes, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import LanguageSelector from "./LanguageSelector";
import type { Language } from "./languageData";

interface MobileMenuOverlayProps {
  open: boolean;
  onClose: () => void;
  t: Record<string, string>;
  dialogRef: RefObject<HTMLDivElement>;
  langOpen: boolean;
  setLangOpen: (open: boolean) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  langTriggerRef: RefObject<HTMLButtonElement>;
}

/**
 * The fullscreen overlay is rendered via a portal directly into document.body
 * so it is NOT a child of any parent that might clip it, apply blend-modes, or
 * have a semi-transparent background.
 *
 * It is ALWAYS mounted (visibility toggled via CSS) instead of conditionally
 * mounted/unmounted. Mounting/unmounting the whole subtree on every toggle is
 * cheap locally, but in production PostHog session replay (rrweb) has to
 * serialize the entire added/removed DOM batch on the main thread, which makes
 * open/close feel laggy on mobile. Keeping it mounted means toggling only
 * mutates a couple of style attributes.
 *
 * `ph-no-capture` (PostHog's default block class) tells session replay NOT to
 * record this subtree. Without it, toggling visibility still triggers a large
 * rrweb mutation that blocks the main thread for a second or two on mobile —
 * which kept the overlay painted on screen after tapping close, making it feel
 * like the menu took seconds to close.
 */
const MobileMenuOverlay = ({
  open,
  onClose,
  t,
  dialogRef,
  langOpen,
  setLangOpen,
  language,
  setLanguage,
  langTriggerRef,
}: MobileMenuOverlayProps) => {
  const navigate = useNavigate();

  // Close the overlay and navigate on the NEXT frame. If we let <Link> navigate
  // synchronously, React batches the menu-close state update together with the
  // (heavy) destination page render into one commit, so the main thread blocks
  // on the new page and the overlay looks frozen for a "huge delay" after the
  // tap. Splitting them lets the menu paint its closed state instantly first,
  // giving immediate feedback, then the route mounts.
  const closeAndNavigate = (to: string) => (e: React.MouseEvent) => {
    // Allow modifier-clicks / non-primary buttons to behave normally.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    onClose();
    requestAnimationFrame(() => requestAnimationFrame(() => navigate(to)));
  };

  const navLinks = [
    { to: "/contact", label: t.contact },
    { to: "/services", label: t.services },
    { to: "/aboutus", label: t.aboutUs },
  ];

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      aria-label={t["nav.navigationMenu"]}
      tabIndex={-1}
      className="ph-no-capture fixed inset-0 outline-none"
      style={{
        zIndex: 9999,
        background: "linear-gradient(to left, #1a1a2e, #0D0D1A)",
        isolation: "isolate",
        opacity: open ? 1 : 0,
        visibility: open ? "visible" : "hidden",
        pointerEvents: open ? "auto" : "none",
        // Fade IN smoothly, but close INSTANTLY. A fade-out would leave a
        // semi-transparent, non-interactive overlay (pointer-events: none) on
        // screen for the transition duration; a tap during that window leaks
        // through to the hamburger button underneath (same top-right position)
        // and re-opens the menu — which felt like "needs two taps to close" on
        // mobile.
        transition: open ? "opacity 180ms ease" : "none",
        willChange: "opacity",
      }}
    >
      {/* Top bar inside overlay (mirrors the main bar) */}
      <div className="flex items-center justify-between px-4" style={{ height: 56 }}>
        <Link to="/" onClick={closeAndNavigate("/")} className="flex items-center gap-2">
          <img src="/light-logo.png" alt="Logo" style={{ height: "2rem", width: "auto" }} />
        </Link>
        <button
          className="text-white text-2xl p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a78bfa] hover:bg-white/10 transition-colors"
          style={{ touchAction: "manipulation" }}
          onClick={onClose}
          aria-label={t["nav.closeMenu"]}
        >
          <FaTimes />
        </button>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-white/10" />

      {/* Navigation links */}
      <nav className="flex flex-col gap-1 px-4 mt-6">
        {navLinks.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            onClick={closeAndNavigate(to)}
            className="flex items-center px-4 py-3 text-lg font-semibold text-white rounded-xl hover:bg-[#65558F]/20 focus:outline-none focus:ring-2 focus:ring-[#a78bfa] transition-colors"
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-4 mt-4 border-t border-white/10" />

      {/* Auth buttons — using Link styled as buttons (single tab stop each) */}
      <div className="flex gap-3 px-8 mt-6" role="group" aria-label={t["nav.authentication"]}>
        <Link
          to="/login"
          onClick={closeAndNavigate("/login")}
          className="flex-1 flex items-center justify-center gap-2 bg-[#65558F] hover:bg-[#7c6bb7] text-white rounded-xl py-3 px-4 font-semibold text-base shadow transition-colors focus:outline-none focus:ring-2 focus:ring-[#a78bfa] text-center no-underline"
          role="button"
        >
          <FaSignInAlt size={18} aria-hidden="true" />
          {t.login}
        </Link>
        <Link
          to="/register"
          onClick={closeAndNavigate("/register")}
          className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-xl py-3 px-4 font-semibold text-base border border-white/20 shadow transition-colors focus:outline-none focus:ring-2 focus:ring-[#a78bfa] text-center no-underline"
          role="button"
        >
          <FaUserPlus size={18} aria-hidden="true" />
          {t.signIn}
        </Link>
      </div>

      {/* Language selector — proper ARIA listbox with roving tabindex */}
      <LanguageSelector
        open={langOpen}
        onOpenChange={setLangOpen}
        language={language}
        setLanguage={setLanguage}
        t={t}
        triggerRef={langTriggerRef}
      />
    </div>,
    document.body
  );
};

export default MobileMenuOverlay;
