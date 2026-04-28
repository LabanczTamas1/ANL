import React, { useRef, useEffect } from 'react';
import { FaFacebook, FaInstagram, FaGoogle, FaBullhorn, FaChartLine, FaMousePointer, FaUsers, FaSearch } from 'react-icons/fa';
import gsap from 'gsap';

const items = [
  { icon: <FaFacebook className="w-4 h-4" />, label: 'Meta Ads' },
  { icon: <FaInstagram className="w-4 h-4" />, label: 'Instagram Ads' },
  { icon: <FaGoogle className="w-4 h-4" />, label: 'Google Ads' },
  { icon: <FaBullhorn className="w-4 h-4" />, label: 'Retargeting' },
  { icon: <FaChartLine className="w-4 h-4" />, label: 'ROAS Optimisation' },
  { icon: <FaMousePointer className="w-4 h-4" />, label: 'CTR Boost' },
  { icon: <FaUsers className="w-4 h-4" />, label: 'Lookalike Audiences' },
  { icon: <FaSearch className="w-4 h-4" />, label: 'A/B Testing' },
];

const AdPlatformsTicker: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Wait one frame so the DOM is fully painted and scrollWidth is accurate
    const raf = requestAnimationFrame(() => {
      const halfWidth = track.scrollWidth / 2;

      const tween = gsap.fromTo(
        track,
        { x: 0 },
        {
          x: -halfWidth,
          duration: 22,
          ease: 'none',
          repeat: -1,
        }
      );

      return () => { tween.kill(); };
    });

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="mt-16 pt-8 border-t border-line-glass">
      <div
        className="relative overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, white 15%, white 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, white 15%, white 85%, transparent 100%)',
        }}
      >
        {/* CSS-only center spotlight — glows the border/background of pills as they pass through */}
        <div
          className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-40 pointer-events-none z-10"
          style={{
            background: 'radial-gradient(ellipse 55% 120% at 50% 50%, rgba(180,150,255,0.55) 0%, rgba(100,200,190,0.25) 50%, transparent 75%)',
            mixBlendMode: 'screen',
          }}
        />

        <div ref={trackRef} className="flex gap-6 w-max will-change-transform">
          {[...items, ...items].map(({ icon, label }, i) => (
            <div
              key={i}
              className="relative flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/50 text-sm whitespace-nowrap"
            >
              {icon}
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdPlatformsTicker;
