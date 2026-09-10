import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaCalendarAlt } from 'react-icons/fa';
import AdPlatformsTicker from './AdPlatformsTicker';
import HeroColumnsBackground from './HeroColumnsBackground';
import { useLanguage } from '../../hooks/useLanguage';
import { useMediaQuery } from '../../hooks/useMediaQuery';

interface CTASectionProps {
  title?: string;
  subtitle?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  fullHeight?: boolean;
}

/**
 * Modern Call-to-Action section with animated gradient background
 */
const CTASection: React.FC<CTASectionProps> = ({
  title,
  subtitle,
  primaryButtonText,
  primaryButtonLink = "/booking",
  secondaryButtonText,
  secondaryButtonLink = "/about",
  fullHeight = false,
}) => {
  const { t } = useLanguage();
  const resolvedTitle = title ?? t("cta.defaultTitle");
  const resolvedSubtitle = subtitle ?? t("cta.defaultSubtitle");
  const resolvedPrimary = primaryButtonText ?? t("cta.bookMeeting");
  const resolvedSecondary = secondaryButtonText ?? t("cta.learnMore");

  // On mobile the hero has a fixed nav bar, so the "stick to top" behavior is
  // handled by the MobileNavbar (a compact CTA appears there once this hero
  // button scrolls out of view). Only run the desktop sticky/portal logic when
  // not on mobile.
  const isMobile = useMediaQuery("(max-width: 600px)");
  const useSticky = fullHeight && !isMobile;

  // Scroll-linked progress (hero only): 0 at top → 1 after scrolling ~60% of a
  // viewport. Drives the secondary button fade/rise.
  const [scrollProgress, setScrollProgress] = useState(0);

  // Smooth `position: sticky` emulation for the primary CTA (real sticky can't
  // be used because the hero has `overflow-hidden`). The button is rendered in
  // a body-level portal so it never hides behind later sections.
  //
  // During the free-scroll phase it uses `position: absolute` at its document
  // coordinate, so the browser scrolls it natively on the compositor — no
  // per-frame JS repositioning, hence no jitter/shake. Only once it reaches the
  // top does it flip to `position: fixed` and glide to the horizontal center
  // (a CSS transition smooths that recenter).
  const STICK_TOP = 16; // px from viewport top where it locks
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [home, setHome] = useState<{ docTop: number; left: number; width: number } | null>(null);
  const [pinned, setPinned] = useState(false);
  // Enables the `left` CSS transition only after the button has been placed at
  // its natural spot, so it never animates in from off-screen on page load.
  const [ready, setReady] = useState(false);

  // Measure the button's natural (in-flow) position from the placeholder.
  const measure = React.useCallback(() => {
    const ph = placeholderRef.current;
    if (!ph) return;
    const rect = ph.getBoundingClientRect();
    setHome({
      docTop: rect.top + window.scrollY,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  // Measure synchronously before the first paint so the portaled button is
  // painted directly at its home position (no off-screen -> home slide).
  useLayoutEffect(() => {
    if (!useSticky) {
      setReady(false);
      return;
    }
    measure();
  }, [useSticky, measure]);

  useEffect(() => {
    if (!useSticky) return;
    // Enable transitions one frame after the initial placement.
    const readyRaf = requestAnimationFrame(() => setReady(true));
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setScrollProgress(
          Math.min(Math.max(window.scrollY / (window.innerHeight * 0.6), 0), 1)
        );
        const ph = placeholderRef.current;
        if (!ph) return;
        const docTop = ph.getBoundingClientRect().top + window.scrollY;
        // Pin once the natural slot would scroll above the stick line.
        setPinned(window.scrollY >= docTop - STICK_TOP);
      });
    };
    const onResize = () => {
      measure();
      onScroll();
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(readyRaf);
    };
  }, [useSticky, measure]);

  const scrollToFounders = () => {
    document
      .getElementById("founders")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const primaryButtonClasses =
    "group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-accent-rose/10 backdrop-blur-md border border-accent-rose/30 rounded-2xl text-white font-semibold text-lg whitespace-nowrap overflow-hidden hover:bg-accent-rose/20 hover:border-accent-rose/50 hover:shadow-lg hover:shadow-accent-rose/20";

  return (
    <section className={`relative overflow-hidden flex flex-col justify-center ${fullHeight ? 'min-h-screen py-12' : 'py-24'}`}>
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-surface-black" />
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              background: `
                radial-gradient(ellipse at 20% 50%, rgba(101, 85, 143, 0.4) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 50%, rgba(122, 164, 159, 0.4) 0%, transparent 50%),
                radial-gradient(ellipse at 50% 100%, rgba(101, 85, 143, 0.3) 0%, transparent 50%)
              `,
            }}
          />
        </div>
        {/* Animated floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand/30 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-teal/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Rotated marquee columns (hero only) */}
        {fullHeight && <HeroColumnsBackground />}
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 text-center">
        {/* Title */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          {resolvedTitle}
        </h2>

        {/* Subtitle */}
        {resolvedSubtitle && (
          <p className="text-xl text-content-muted mb-12 max-w-2xl mx-auto">
            {resolvedSubtitle}
          </p>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {useSticky ? (
            <>
              {/* Invisible in-flow placeholder reserves the layout slot and
                  reports the position the portaled CTA should track. */}
              <div ref={placeholderRef} aria-hidden="true" className="invisible">
                <span className={primaryButtonClasses}>
                  <FaCalendarAlt className="w-5 h-5" />
                  <span>{resolvedPrimary}</span>
                  <FaArrowRight className="w-4 h-4" />
                </span>
              </div>
              {createPortal(
                <Link
                  to={primaryButtonLink}
                  style={
                    home
                      ? pinned
                        ? {
                            position: "fixed",
                            top: STICK_TOP,
                            left: window.innerWidth / 2 - home.width / 2,
                            width: home.width,
                            zIndex: 60,
                            transition: ready ? "left 350ms ease" : undefined,
                          }
                        : {
                            position: "absolute",
                            top: home.docTop,
                            left: home.left,
                            width: home.width,
                            zIndex: 60,
                            transition: ready ? "left 350ms ease" : undefined,
                          }
                      : { position: "absolute", top: -9999, left: -9999, opacity: 0 }
                  }
                  className={primaryButtonClasses}
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <FaCalendarAlt className="w-5 h-5" />
                  <span>{resolvedPrimary}</span>
                  <FaArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>,
                document.body
              )}
            </>
          ) : (
            <Link
              to={primaryButtonLink}
              id={fullHeight ? "hero-cta-primary" : undefined}
              className={primaryButtonClasses}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <FaCalendarAlt className="w-5 h-5" />
              <span>{resolvedPrimary}</span>
              <FaArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}

          {fullHeight ? (
            <button
              type="button"
              onClick={scrollToFounders}
              style={{
                opacity: 1 - scrollProgress,
                transform: `translateY(${-scrollProgress * 60}px)`,
              }}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-surface-elevated/50 backdrop-blur border border-line-glass rounded-2xl text-white font-semibold text-lg hover:bg-surface-elevated hover:border-accent-rose/40 transition-colors"
            >
              <span>{resolvedSecondary}</span>
              <FaArrowRight className="w-4 h-4 rotate-90 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
            </button>
          ) : (
            <Link
              to={secondaryButtonLink}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-surface-elevated/50 backdrop-blur border border-line-glass rounded-2xl text-white font-semibold text-lg hover:bg-surface-elevated hover:border-accent-rose/40 transition-all"
            >
              <span>{resolvedSecondary}</span>
              <FaArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
            </Link>
          )}
        </div>

        {!fullHeight && <AdPlatformsTicker />}
      </div>
    </section>
  );
};

export default CTASection;
