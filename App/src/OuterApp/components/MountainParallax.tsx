import React, { useEffect, useRef } from 'react';

// Static star positions (x%, y%) — kept deterministic to avoid hydration issues
const STARS: { x: number; y: number; size: number; glow: boolean }[] = [
  { x: 4,  y: 6,  size: 1, glow: false },
  { x: 11, y: 14, size: 2, glow: true  },
  { x: 18, y: 5,  size: 1, glow: false },
  { x: 26, y: 20, size: 1, glow: false },
  { x: 33, y: 9,  size: 2, glow: true  },
  { x: 40, y: 17, size: 1, glow: false },
  { x: 49, y: 4,  size: 1, glow: false },
  { x: 57, y: 24, size: 2, glow: true  },
  { x: 64, y: 11, size: 1, glow: false },
  { x: 71, y: 7,  size: 1, glow: false },
  { x: 79, y: 19, size: 2, glow: true  },
  { x: 87, y: 13, size: 1, glow: false },
  { x: 94, y: 5,  size: 1, glow: false },
  { x: 14, y: 29, size: 1, glow: false },
  { x: 44, y: 31, size: 2, glow: true  },
  { x: 74, y: 27, size: 1, glow: false },
  { x: 23, y: 37, size: 1, glow: false },
  { x: 59, y: 34, size: 1, glow: false },
  { x: 89, y: 30, size: 2, glow: true  },
  { x: 8,  y: 44, size: 1, glow: false },
  { x: 53, y: 41, size: 1, glow: false },
  { x: 84, y: 22, size: 1, glow: false },
  { x: 32, y: 16, size: 2, glow: true  },
  { x: 66, y: 26, size: 1, glow: false },
  { x: 3,  y: 33, size: 1, glow: false },
  { x: 48, y: 8,  size: 1, glow: false },
  { x: 77, y: 38, size: 2, glow: true  },
  { x: 92, y: 42, size: 1, glow: false },
];

const MountainParallax: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef        = useRef<HTMLDivElement>(null);
  const mgRef        = useRef<HTMLDivElement>(null);
  const fgRef        = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;

    const update = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // Distance between section center and viewport center.
      // Positive  → section below center (not yet scrolled to).
      // Negative  → section above center (scrolled past).
      const dist = (rect.top + rect.height / 2) - window.innerHeight / 2;

      // Background barely moves (feels far away); foreground moves most (feels close).
      if (bgRef.current) bgRef.current.style.transform = `translateY(${dist * 0.06}px)`;
      if (mgRef.current) mgRef.current.style.transform = `translateY(${dist * 0.16}px)`;
      if (fgRef.current) fgRef.current.style.transform = `translateY(${dist * 0.32}px)`;
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update(); // set initial position
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      style={{ height: '75vh' }}
      aria-hidden="true"
    >
      {/* ── Sky gradient ─────────────────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, #030112 0%, #16093a 30%, #2c1860 58%, #190e38 80%, #050210 100%)',
        }}
      />

      {/* ── Moon halo ─────────────────────────────────────────────── */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '7%',
          left: '63%',
          width: 200,
          height: 200,
          background:
            'radial-gradient(circle, rgba(155,122,219,0.3) 0%, rgba(155,122,219,0.06) 55%, transparent 70%)',
          borderRadius: '50%',
        }}
      />
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          top: '10%',
          left: '65.5%',
          width: 44,
          height: 44,
          background:
            'radial-gradient(circle, rgba(235,225,255,0.95) 0%, rgba(200,175,255,0.35) 60%, transparent 100%)',
        }}
      />

      {/* ── Stars ─────────────────────────────────────────────────── */}
      {STARS.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${s.x}%`,
            top:  `${s.y}%`,
            width:  s.size,
            height: s.size,
            backgroundColor: 'rgba(255,255,255,0.8)',
            boxShadow: s.glow ? '0 0 5px 1px rgba(200,175,255,0.7)' : 'none',
          }}
        />
      ))}

      {/* ── Background mountains — slowest ───────────────────────── */}
      <div
        ref={bgRef}
        className="absolute bottom-0 left-0 right-0 will-change-transform"
        style={{ height: '150%' }}
      >
        <svg
          viewBox="0 0 1440 600"
          preserveAspectRatio="xMidYMax slice"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5a4490" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#3a2e6e" stopOpacity="0.65" />
            </linearGradient>
          </defs>
          {/* Distant ridge — soft undulating silhouette */}
          <path
            d="M0,430 C90,408 180,378 270,350 C360,322 435,368 520,342
               C605,316 680,352 765,325 C850,298 925,338 1010,312
               C1095,286 1170,326 1255,300 C1340,274 1400,308 1440,292
               L1440,600 L0,600 Z"
            fill="url(#bgGrad)"
          />
          {/* Second distant layer for depth */}
          <path
            d="M0,468 C110,450 210,428 320,408 C430,388 510,418 630,396
               C750,374 840,406 960,384 C1080,362 1160,394 1280,372
               C1360,356 1415,374 1440,362
               L1440,600 L0,600 Z"
            fill="#261b54"
            fillOpacity="0.45"
          />
        </svg>
      </div>

      {/* ── Atmospheric mist band ─────────────────────────────────── */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          bottom: '28%',
          height: '10%',
          background:
            'linear-gradient(to bottom, transparent, rgba(101,85,143,0.1), transparent)',
        }}
      />

      {/* ── Midground mountains — medium speed ───────────────────── */}
      <div
        ref={mgRef}
        className="absolute bottom-0 left-0 right-0 will-change-transform"
        style={{ height: '150%' }}
      >
        <svg
          viewBox="0 0 1440 600"
          preserveAspectRatio="xMidYMax slice"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="mgGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38287a" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#1e1640" stopOpacity="1" />
            </linearGradient>
          </defs>
          <path
            d="M0,480 C55,452 110,415 195,372 C280,329 340,396 438,354
               C536,312 590,388 700,342 C810,296 870,378 990,330
               C1110,282 1175,368 1295,322 C1390,284 1430,326 1440,312
               L1440,600 L0,600 Z"
            fill="url(#mgGrad)"
          />
        </svg>
      </div>

      {/* ── Foreground mountains — fastest (closest) ─────────────── */}
      <div
        ref={fgRef}
        className="absolute bottom-0 left-0 right-0 will-change-transform"
        style={{ height: '150%' }}
      >
        <svg
          viewBox="0 0 1440 600"
          preserveAspectRatio="xMidYMax slice"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="fgGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#100b22" stopOpacity="0.96" />
              <stop offset="100%" stopColor="#05030e" stopOpacity="1" />
            </linearGradient>
          </defs>
          {/* Dramatic near-silhouette with tall spiky peaks */}
          <path
            d="M-20,590 C15,572 50,550 90,520 C130,490 158,535 205,502
               C252,469 278,406 335,358 C392,310 428,440 500,408
               C572,376 595,272 660,228 C725,184 750,390 830,358
               C910,326 928,468 1008,436 C1088,404 1105,222 1188,188
               C1271,154 1308,370 1380,342 C1420,328 1446,380 1460,398
               L1460,600 L-20,600 Z"
            fill="url(#fgGrad)"
          />
        </svg>
      </div>

      {/* ── Bottom fade to surface-black ─────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: '22%',
          background: 'linear-gradient(to bottom, transparent, #000000)',
        }}
      />

      {/* ── Text overlay ──────────────────────────────────────────── */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center pointer-events-none px-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-px opacity-60" style={{ backgroundColor: '#9B7ADB' }} />
          <span
            className="text-xs font-bold tracking-[0.3em] uppercase opacity-75"
            style={{ color: '#9B7ADB' }}
          >
            The Horizon
          </span>
          <div className="w-8 h-px opacity-60" style={{ backgroundColor: '#9B7ADB' }} />
        </div>
        <h2 className="text-5xl md:text-7xl font-extrabold text-white leading-tight drop-shadow-lg">
          We Don&apos;t Chase
          <br />
          <span style={{ color: '#9B7ADB' }}>We Build</span>
        </h2>
      </div>
    </div>
  );
};

export default MountainParallax;
