import React, { useEffect, useRef, useState } from 'react';
import FloatingParticles from './FloatingParticles';

const words = ['We', 'help', 'businesses', 'grow', 'beyond', 'what', 'they', 'thought', 'possible.'];

const AboutCinematicHero: React.FC = () => {
  const [revealedWords, setRevealedWords] = useState(0);
  const [lineVisible, setLineVisible] = useState(false);
  const [subVisible, setSubVisible] = useState(false);
  const [badgeVisible, setBadgeVisible] = useState(false);

  useEffect(() => {
    const t0 = setTimeout(() => setBadgeVisible(true), 300);
    const t1 = setTimeout(() => setLineVisible(true), 700);

    // Reveal words one by one after line appears
    words.forEach((_, i) => {
      const t = setTimeout(() => setRevealedWords(i + 1), 900 + i * 180);
      return t;
    });

    const t2 = setTimeout(() => setSubVisible(true), 900 + words.length * 180 + 300);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Layered backgrounds */}
      <div className="absolute inset-0 bg-surface-black" />
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 30%, rgba(101,85,143,0.35) 0%, transparent 55%),
            radial-gradient(ellipse at 80% 70%, rgba(122,164,159,0.25) 0%, transparent 55%),
            radial-gradient(ellipse at 50% 100%, rgba(154,70,71,0.2) 0%, transparent 45%)
          `,
        }}
      />
      {/* Cinematic horizontal scan lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.8) 0px, rgba(255,255,255,0.8) 1px, transparent 1px, transparent 4px)',
        }}
      />
      <FloatingParticles particleCount={50} />

      {/* Animated vertical accent line — Genshin-style intro bar */}
      <div
        className={`absolute left-12 md:left-24 top-1/4 w-[2px] bg-gradient-to-b from-transparent via-brand to-transparent transition-all duration-[1200ms] ease-out ${
          lineVisible ? 'h-64 opacity-100' : 'h-0 opacity-0'
        }`}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-8 md:px-24 pt-28 pb-20">
        {/* Chapter badge — Genshin chapter label style */}
        <div
          className={`flex items-center gap-3 mb-10 transition-all duration-700 ${
            badgeVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          }`}
        >
          <div className="w-8 h-px bg-brand" />
          <span className="text-brand text-xs font-bold tracking-[0.3em] uppercase">
            Chapter I — Origin
          </span>
        </div>

        {/* Word-by-word reveal headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white leading-[1.08] max-w-4xl">
          {words.map((word, i) => (
            <span
              key={i}
              className="inline-block mr-[0.25em] transition-all duration-500"
              style={{
                opacity: i < revealedWords ? 1 : 0,
                transform: i < revealedWords ? 'translateY(0)' : 'translateY(24px)',
                transitionDelay: `${i * 20}ms`,
                color: i === 0 || i === 1
                  ? '#ffffff'
                  : i >= 2 && i <= 4
                  ? '#9B7ADB'
                  : '#ffffff',
              }}
            >
              {word}
            </span>
          ))}
        </h1>

        {/* Sub-copy */}
        <p
          className={`mt-8 text-lg md:text-xl text-content-muted max-w-xl leading-relaxed transition-all duration-700 ${
            subVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          ANL was built by marketers who were tired of agencies that promised the world and delivered spreadsheets. 
          We do things differently — relentlessly, transparently, and with skin in the game.
        </p>

        {/* Cinematic bottom bar — like a chapter stat strip */}
        <div
          className={`mt-14 flex flex-wrap gap-8 transition-all duration-700 delay-300 ${
            subVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {[
            { label: 'Founded', value: '2022' },
            { label: 'Campaigns', value: '300+' },
            { label: 'Countries', value: '12' },
            { label: 'Avg. ROI', value: '4×' },
          ].map((s, i) => (
            <div key={i} className="flex flex-col gap-1">
              <span className="text-3xl font-extrabold text-white">{s.value}</span>
              <span className="text-xs text-content-muted tracking-widest uppercase">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom cinematic vignette */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-surface-black to-transparent pointer-events-none" />
    </section>
  );
};

export default AboutCinematicHero;
