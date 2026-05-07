import React, { useEffect, useRef, useState } from 'react';
import GlowCard from './GlowCard';
import { FaLightbulb, FaHandshake, FaBullseye, FaShieldAlt, FaRocket, FaUsers } from 'react-icons/fa';

interface Chapter {
  chapterLabel: string;
  eyebrow: string;
  headline: string;
  body: string;
  accent: string;
  accentColor: string;
  icon: React.ReactNode;
  align: 'left' | 'right';
}

const chapters: Chapter[] = [
  {
    chapterLabel: 'Chapter II — The Problem',
    eyebrow: 'Why We Started',
    headline: 'The industry was broken.\nWe fixed it.',
    body: 'Most agencies charged premium retainers for smoke-and-mirrors reporting. Clients got dashboards full of vanity metrics — impressions, reach, "brand awareness" — but no real revenue. We built ANL to be the agency we always wished existed: radically transparent, obsessively ROI-focused, and built on partnerships rather than invoices.',
    accent: '#65558F',
    accentColor: 'rgba(101,85,143,0.7)',
    icon: <FaBullseye className="w-8 h-8" />,
    align: 'left',
  },
  {
    chapterLabel: 'Chapter III — The Mission',
    eyebrow: 'What Drives Us',
    headline: 'Every number\nhas a face behind it.',
    body: 'A conversion isn\'t a pixel event. It\'s a business owner who can finally hire their first employee. A lead isn\'t a row in a CRM. It\'s a family that found the service they were searching for. We run campaigns that way — with human stakes on the line, not just KPIs on a slide deck.',
    accent: '#7AA49F',
    accentColor: 'rgba(122,164,159,0.7)',
    icon: <FaHandshake className="w-8 h-8" />,
    align: 'right',
  },
  {
    chapterLabel: 'Chapter IV — The Craft',
    eyebrow: 'How We Work',
    headline: 'Strategy first.\nExecution always.',
    body: 'We don\'t run ads. We build growth systems. Every campaign starts with a deep market analysis, moves into a precision-targeted strategy, and is executed with continuous A/B testing and real-time optimization. We kill what doesn\'t work fast, and scale what does without mercy.',
    accent: '#9B7ADB',
    accentColor: 'rgba(155,122,219,0.7)',
    icon: <FaRocket className="w-8 h-8" />,
    align: 'left',
  },
];

const StoryChapter: React.FC<{ chapter: Chapter; index: number; active: boolean }> = ({
  chapter,
  active,
}) => {
  const isRight = chapter.align === 'right';

  return (
    /* Tall scroll-range wrapper — content stays sticky while scrolling through this height */
    <div className="relative" style={{ height: `${CHAPTER_HEIGHT_VH}vh` }}>
      {/* Sticky content panel — centered vertically in the viewport */}
      <div
        className="sticky top-0 h-screen flex items-center overflow-hidden"
      >
        {/* Background accent glow per chapter */}
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            background: `radial-gradient(ellipse at ${isRight ? '75%' : '25%'} 50%, ${chapter.accent}22 0%, transparent 65%)`,
            opacity: active ? 1 : 0,
          }}
        />

        {/* Side vertical accent line */}
        <div
          className={`absolute ${isRight ? 'right-6 md:right-16' : 'left-6 md:left-16'} top-1/4 w-px transition-all duration-[1000ms]`}
          style={{
            height: active ? '50%' : '0%',
            background: `linear-gradient(to bottom, transparent, ${chapter.accent}, transparent)`,
          }}
        />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-8 md:px-24">
          <div
            className={`flex flex-col ${isRight ? 'md:flex-row-reverse' : 'md:flex-row'} gap-12 md:gap-20 items-center`}
          >
            {/* Icon */}
            <div
              className={`flex-shrink-0 transition-all duration-700 delay-150 ${
                active ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-8'
              }`}
            >
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-[40%] blur-[50px] opacity-60"
                  style={{ backgroundColor: chapter.accent }}
                />
                <div
                  className="relative w-28 h-28 md:w-44 md:h-44 rounded-[35%] flex items-center justify-center border"
                  style={{
                    borderColor: `${chapter.accent}55`,
                    backgroundColor: `${chapter.accent}12`,
                    color: chapter.accent,
                  }}
                >
                  {chapter.icon}
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="flex-1">
              <div
                className={`flex items-center gap-3 mb-5 transition-all duration-500 ${
                  active ? 'opacity-100 translate-x-0' : isRight ? 'opacity-0 translate-x-10' : 'opacity-0 -translate-x-10'
                }`}
              >
                <div className="w-6 h-px" style={{ backgroundColor: chapter.accent }} />
                <span className="text-xs font-bold tracking-[0.28em] uppercase" style={{ color: chapter.accent }}>
                  {chapter.chapterLabel}
                </span>
              </div>

              <p
                className={`text-content-muted text-sm uppercase tracking-widest mb-3 transition-all duration-500 delay-75 ${
                  active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                }`}
              >
                {chapter.eyebrow}
              </p>

              <h2
                className={`text-4xl md:text-6xl font-extrabold text-white leading-[1.08] mb-6 transition-all duration-600 delay-100 ${
                  active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                {chapter.headline.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < chapter.headline.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </h2>

              <p
                className={`text-content-muted text-base md:text-lg leading-relaxed max-w-lg transition-all duration-600 delay-150 ${
                  active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                {chapter.body}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CHAPTER_HEIGHT_VH = 220;

const AboutStoryChapters: React.FC = () => {
  const [activeChapter, setActiveChapter] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isSnappingRef = useRef(false);
  const activeChapterRef = useRef(0);

  // Keep ref in sync so wheel handler always sees current value
  useEffect(() => { activeChapterRef.current = activeChapter; }, [activeChapter]);

  /** Scroll exactly to the center-viewport position of chapter `idx` */
  const snapToChapter = (idx: number) => {
    if (!sectionRef.current) return;
    const clamped = Math.min(Math.max(idx, 0), chapters.length - 1);
    const sectionTop = sectionRef.current.getBoundingClientRect().top + window.scrollY;
    const chapterHeight = window.innerHeight * (CHAPTER_HEIGHT_VH / 100);
    // Target: top of chapter's sticky zone (the content is sticky top:0 h-screen,
    // so landing at the chapter's own top puts the panel centered on screen)
    const target = sectionTop + clamped * chapterHeight;
    setActiveChapter(clamped);
    isSnappingRef.current = true;
    window.scrollTo({ top: target, behavior: 'smooth' });
    // Release snap-lock after animation finishes (~700 ms)
    setTimeout(() => { isSnappingRef.current = false; }, 750);
  };

  // Update active chapter on passive scroll (for when user scrolls past the section normally)
  useEffect(() => {
    const handleScroll = () => {
      if (isSnappingRef.current || !sectionRef.current) return;
      const sectionTop = sectionRef.current.getBoundingClientRect().top + window.scrollY;
      const scrolled = window.scrollY - sectionTop;
      const chapterHeight = window.innerHeight * (CHAPTER_HEIGHT_VH / 100);
      const idx = Math.min(Math.max(Math.floor(scrolled / chapterHeight), 0), chapters.length - 1);
      setActiveChapter(idx);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Wheel / touch intercept — snap to next/prev chapter
  useEffect(() => {
    let touchStartY = 0;

    const isInsideSection = () => {
      if (!sectionRef.current) return false;
      const rect = sectionRef.current.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    };

    const handleWheel = (e: WheelEvent) => {
      if (!isInsideSection() || isSnappingRef.current) return;
      e.preventDefault();
      const dir = e.deltaY > 0 ? 1 : -1;
      const next = activeChapterRef.current + dir;
      if (next < 0) {
        // Let browser scroll out of section naturally — snap to section entry point
        snapToChapter(0);
      } else if (next >= chapters.length) {
        // Let browser scroll out of section — just release
        isSnappingRef.current = false;
      } else {
        snapToChapter(next);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isInsideSection() || isSnappingRef.current) return;
      const dy = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(dy) < 30) return; // ignore tiny swipes
      const dir = dy > 0 ? 1 : -1;
      const next = activeChapterRef.current + dir;
      if (next >= 0 && next < chapters.length) {
        e.preventDefault();
        snapToChapter(next);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-surface-black">
      {/* Progress dots — right side */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 pointer-events-none">
        {chapters.map((ch, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-all duration-500"
            style={{
              backgroundColor: i === activeChapter ? ch.accent : 'rgba(255,255,255,0.2)',
              transform: i === activeChapter ? 'scale(1.5)' : 'scale(1)',
              boxShadow: i === activeChapter ? `0 0 8px ${ch.accent}` : 'none',
            }}
          />
        ))}
      </div>

      {chapters.map((chapter, i) => (
        <StoryChapter key={i} chapter={chapter} index={i} active={i === activeChapter} />
      ))}
    </section>
  );
};

export default AboutStoryChapters;


/* ──────────────────────────────────────────────────────────────
   Values grid — Genshin "attributes" panel style
────────────────────────────────────────────────────────────── */

interface Value {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: string;
  gradient: string;
}

const values: Value[] = [
  {
    icon: <FaShieldAlt className="w-7 h-7" />,
    title: 'Radical Transparency',
    description: 'You see everything — every test, every result, every failure. No hidden fees, no hidden metrics.',
    accent: '#65558F',
    gradient: 'from-brand to-accent-purple',
  },
  {
    icon: <FaBullseye className="w-7 h-7" />,
    title: 'Outcome Obsession',
    description: 'We care about one thing: your revenue. Not your impressions, not your reach — your bottom line.',
    accent: '#9A4647',
    gradient: 'from-accent-rose to-red-600',
  },
  {
    icon: <FaLightbulb className="w-7 h-7" />,
    title: 'Always Innovating',
    description: 'The algorithm changes daily. Our playbooks get rewritten weekly. We never stop testing.',
    accent: '#9B7ADB',
    gradient: 'from-accent-purple to-indigo-500',
  },
  {
    icon: <FaHandshake className="w-7 h-7" />,
    title: 'Partnership Mindset',
    description: 'We act as an extension of your team, not a vendor. Your win is our win.',
    accent: '#7AA49F',
    gradient: 'from-accent-teal to-cyan-500',
  },
  {
    icon: <FaUsers className="w-7 h-7" />,
    title: 'Human at Heart',
    description: 'Behind every KPI is a real person. We never forget the human story driving every conversion.',
    accent: '#22C55E',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: <FaRocket className="w-7 h-7" />,
    title: 'Move Fast',
    description: 'Decisions in days, not quarters. We ship, measure, adapt, and repeat — without the red tape.',
    accent: '#F59E0B',
    gradient: 'from-yellow-500 to-orange-500',
  },
];

export const AboutValues: React.FC = () => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-idx'));
            setVisibleItems((prev) => new Set([...prev, idx]));
          }
        });
      },
      { threshold: 0.2 }
    );
    itemRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-surface-overlay via-surface-black to-surface-overlay" />

      {/* Ambient orbs */}
      <div className="absolute top-1/3 left-0 w-80 h-80 bg-brand/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-0 w-80 h-80 bg-accent-teal/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-px bg-brand" />
            <span className="text-brand text-xs font-bold tracking-[0.3em] uppercase">Chapter V — Values</span>
            <div className="w-8 h-px bg-brand" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">The Code We Live By</h2>
          <p className="text-content-muted text-lg max-w-xl mx-auto">
            Not buzzwords on a wall — these are the principles that govern every decision we make.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((v, i) => (
            <div
              key={i}
              ref={(el) => (itemRefs.current[i] = el)}
              data-idx={i}
              className={`transition-all duration-500 ${
                visibleItems.has(i) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${(i % 3) * 80}ms` }}
            >
              <GlowCard glowColor={`${v.accent}90`} className="h-full">
                <div className="p-7 flex flex-col gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${v.gradient} flex items-center justify-center text-white shadow-lg`}
                  >
                    {v.icon}
                  </div>
                  <h3 className="text-white font-bold text-lg">{v.title}</h3>
                  <p className="text-content-muted text-sm leading-relaxed">{v.description}</p>
                </div>
              </GlowCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
