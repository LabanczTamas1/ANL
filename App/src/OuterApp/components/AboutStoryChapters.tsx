import React, { useEffect, useRef, useState } from 'react';
import GlowCard from './GlowCard';
import { FaLightbulb, FaHandshake, FaBullseye, FaShieldAlt, FaRocket, FaUsers } from 'react-icons/fa';

interface Chapter {
  chapterLabel: string;
  eyebrow: string;
  headline: string;
  body: string;
  accent: string;
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
    icon: <FaBullseye className="w-8 h-8" />,
    align: 'left',
  },
  {
    chapterLabel: 'Chapter III — The Mission',
    eyebrow: 'What Drives Us',
    headline: 'Every number\nhas a face behind it.',
    body: "A conversion isn't a pixel event. It's a business owner who can finally hire their first employee. A lead isn't a row in a CRM. It's a family that found the service they were searching for. We run campaigns that way — with human stakes on the line, not just KPIs on a slide deck.",
    accent: '#7AA49F',
    icon: <FaHandshake className="w-8 h-8" />,
    align: 'right',
  },
  {
    chapterLabel: 'Chapter IV — The Craft',
    eyebrow: 'How We Work',
    headline: 'Strategy first.\nExecution always.',
    body: "We don't run ads. We build growth systems. Every campaign starts with a deep market analysis, moves into a precision-targeted strategy, and is executed with continuous A/B testing and real-time optimization. We kill what doesn't work fast, and scale what does without mercy.",
    accent: '#9B7ADB',
    icon: <FaRocket className="w-8 h-8" />,
    align: 'left',
  },
];

/* ── Single chapter row ──────────────────────────────────────── */
const ChapterRow: React.FC<{ chapter: Chapter; index: number }> = ({ chapter, index }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const isRight = chapter.align === 'right';

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="relative flex flex-col md:flex-row items-center gap-10 md:gap-20 py-24 px-6 md:px-0"
      style={{ flexDirection: isRight ? undefined : undefined }}
    >
      {/* Connecting line to next chapter (not on last) */}
      {index < chapters.length - 1 && (
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-0 w-px"
          style={{
            height: '100%',
            background: `linear-gradient(to bottom, ${chapter.accent}40, transparent)`,
            top: '50%',
          }}
        />
      )}

      {/* Icon side */}
      <div
        className={`flex-shrink-0 order-1 ${isRight ? 'md:order-2' : 'md:order-1'} transition-all duration-700`}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible
            ? 'translateX(0) scale(1)'
            : isRight
              ? 'translateX(60px) scale(0.85)'
              : 'translateX(-60px) scale(0.85)',
          transitionDelay: '100ms',
        }}
      >
        <div className="relative">
          <div
            className="absolute inset-0 rounded-[40%] blur-[60px] opacity-50"
            style={{ backgroundColor: chapter.accent }}
          />
          <div
            className="relative w-32 h-32 md:w-48 md:h-48 rounded-[35%] flex items-center justify-center border-2"
            style={{
              borderColor: `${chapter.accent}55`,
              backgroundColor: `${chapter.accent}10`,
              color: chapter.accent,
            }}
          >
            <span className="text-5xl md:text-6xl">{chapter.icon}</span>
          </div>
        </div>
      </div>

      {/* Text side */}
      <div
        className={`flex-1 order-2 ${isRight ? 'md:order-1 md:text-right' : 'md:order-2'} transition-all duration-700`}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible
            ? 'translateY(0)'
            : 'translateY(40px)',
          transitionDelay: '200ms',
        }}
      >
        <div className={`flex items-center gap-3 mb-4 ${isRight ? 'md:flex-row-reverse' : ''}`}>
          <div className="w-6 h-px" style={{ backgroundColor: chapter.accent }} />
          <span className="text-xs font-bold tracking-[0.28em] uppercase" style={{ color: chapter.accent }}>
            {chapter.chapterLabel}
          </span>
        </div>
        <p className="text-content-muted text-sm uppercase tracking-widest mb-3">{chapter.eyebrow}</p>
        <h2 className="text-4xl md:text-6xl font-extrabold text-white leading-[1.08] mb-6">
          {chapter.headline.split('\n').map((line, i, arr) => (
            <React.Fragment key={i}>{line}{i < arr.length - 1 && <br />}</React.Fragment>
          ))}
        </h2>
        <p className="text-content-muted text-base md:text-lg leading-relaxed max-w-lg" style={{ marginLeft: isRight ? 'auto' : undefined }}>
          {chapter.body}
        </p>
      </div>
    </div>
  );
};

const AboutStoryChapters: React.FC = () => {
  return (
    <section className="relative bg-surface-black overflow-hidden py-12">
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-teal/10 rounded-full blur-[140px]" />
        <div className="absolute top-3/4 left-1/2 w-96 h-96 bg-accent-purple/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {chapters.map((chapter, i) => (
          <ChapterRow key={i} chapter={chapter} index={i} />
        ))}
      </div>
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
