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

const SlideContent: React.FC<{ chapter: Chapter; active: boolean }> = ({ chapter, active }) => {
  const isRight = chapter.align === 'right';
  return (
    <div className="relative h-full w-full flex items-center overflow-hidden bg-surface-black">
      {/* Accent glow */}
      <div
        className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at ${isRight ? '75%' : '25%'} 50%, ${chapter.accent}25 0%, transparent 65%)`,
          opacity: active ? 1 : 0,
        }}
      />
      {/* Side accent line */}
      <div
        className={`absolute ${isRight ? 'right-6 md:right-16' : 'left-6 md:left-16'} top-1/4 w-px transition-all duration-[900ms]`}
        style={{
          height: active ? '50%' : '0%',
          background: `linear-gradient(to bottom, transparent, ${chapter.accent}, transparent)`,
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 md:px-24">
        <div className={`flex flex-col ${isRight ? 'md:flex-row-reverse' : 'md:flex-row'} gap-12 md:gap-20 items-center`}>
          {/* Icon */}
          <div
            className={`flex-shrink-0 transition-all duration-700 delay-100 ${
              active ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-8'
            }`}
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-[40%] blur-[50px] opacity-60" style={{ backgroundColor: chapter.accent }} />
              <div
                className="relative w-28 h-28 md:w-44 md:h-44 rounded-[35%] flex items-center justify-center border"
                style={{ borderColor: `${chapter.accent}55`, backgroundColor: `${chapter.accent}12`, color: chapter.accent }}
              >
                {chapter.icon}
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="flex-1">
            <div className={`flex items-center gap-3 mb-5 transition-all duration-500 ${active ? 'opacity-100 translate-x-0' : isRight ? 'opacity-0 translate-x-10' : 'opacity-0 -translate-x-10'}`}>
              <div className="w-6 h-px" style={{ backgroundColor: chapter.accent }} />
              <span className="text-xs font-bold tracking-[0.28em] uppercase" style={{ color: chapter.accent }}>{chapter.chapterLabel}</span>
            </div>
            <p className={`text-content-muted text-sm uppercase tracking-widest mb-3 transition-all duration-500 delay-75 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
              {chapter.eyebrow}
            </p>
            <h2 className={`text-4xl md:text-6xl font-extrabold text-white leading-[1.08] mb-6 transition-all duration-600 delay-100 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {chapter.headline.split('\n').map((line, i, arr) => (
                <React.Fragment key={i}>{line}{i < arr.length - 1 && <br />}</React.Fragment>
              ))}
            </h2>
            <p className={`text-content-muted text-base md:text-lg leading-relaxed max-w-lg transition-all duration-600 delay-150 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {chapter.body}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AboutStoryChapters: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;

    const update = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // How many pixels we've scrolled into the container from its top
      const scrolledInto = -rect.top;
      const vh = window.innerHeight;

      // Each chapter occupies exactly 100vh of scroll space.
      // Transition fires at the 50% mark of each zone (Math.round).
      const raw = scrolledInto / vh;
      const idx = Math.min(Math.max(Math.round(raw), 0), chapters.length - 1);
      setActiveIndex(idx);
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    // Outer container creates the scroll space: N chapters × 100vh each
    <div ref={containerRef} style={{ height: `${chapters.length * 100}vh` }}>
      {/* Sticky viewport — stays fixed in screen while user scrolls through the container */}
      <div className="sticky top-0 overflow-hidden" style={{ height: '100vh' }}>

        {/* Progress dots */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 pointer-events-none">
          {chapters.map((ch, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full transition-all duration-500"
              style={{
                backgroundColor: i === activeIndex ? ch.accent : 'rgba(255,255,255,0.2)',
                transform: i === activeIndex ? 'scale(1.5)' : 'scale(1)',
                boxShadow: i === activeIndex ? `0 0 8px ${ch.accent}` : 'none',
              }}
            />
          ))}
        </div>

        {/* Slides rail — snaps to activeIndex with smooth CSS transition */}
        <div
          style={{
            height: `${chapters.length * 100}vh`,
            transform: `translateY(${-activeIndex * 100}vh)`,
            transition: 'transform 0.75s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {chapters.map((chapter, i) => (
            <div key={i} style={{ height: '100vh' }}>
              <SlideContent chapter={chapter} active={i === activeIndex} />
            </div>
          ))}
        </div>

      </div>
    </div>
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
