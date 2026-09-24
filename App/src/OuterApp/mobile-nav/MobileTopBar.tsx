import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBars, FaCalendarAlt } from "react-icons/fa";

interface MobileTopBarProps {
  menuOpen: boolean;
  onOpenMenu: () => void;
  t: Record<string, string>;
}

/**
 * The always-visible top bar: logo, a compact "Book a Meeting" CTA that appears
 * once the hero's primary CTA scrolls out of view, and the hamburger button.
 */
const MobileTopBar = ({ menuOpen, onOpenMenu, t }: MobileTopBarProps) => {
  const [showNavCta, setShowNavCta] = useState(false);
  const location = useLocation();

  // Show a compact "Book a Meeting" CTA in the top bar once the hero's primary
  // CTA (#hero-cta-primary) has scrolled out of view. Only active on pages that
  // render that hero button (the landing page). A scroll listener is used
  // instead of IntersectionObserver because it reliably re-checks even if the
  // target mounts after this effect and works across all mobile browsers.
  useEffect(() => {
    setShowNavCta(false);
    const check = () => {
      const target = document.getElementById("hero-cta-primary");
      if (!target) {
        setShowNavCta(false);
        return;
      }
      const rect = target.getBoundingClientRect();
      // Once the hero button's bottom passes above the 56px nav bar, show it.
      setShowNavCta(rect.bottom <= 56);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [location.pathname]);

  return (
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
        <img src="/light-logo.png" alt="Logo" style={{ height: "2rem", width: "auto" }} />
      </Link>
      <div className="flex items-center gap-2">
        {/* Compact CTA — appears once the hero's Book a Meeting button
            scrolls out of view. */}
        <Link
          to="/booking"
          aria-hidden={!showNavCta}
          tabIndex={showNavCta ? 0 : -1}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-accent-rose/15 border border-accent-rose/40 text-white text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
            showNavCta
              ? "opacity-100 translate-x-0 pointer-events-auto"
              : "opacity-0 translate-x-3 pointer-events-none"
          }`}
        >
          <FaCalendarAlt className="w-3.5 h-3.5" />
          <span>{t["cta.bookMeeting"]}</span>
        </Link>
        <button
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
};

export default MobileTopBar;
