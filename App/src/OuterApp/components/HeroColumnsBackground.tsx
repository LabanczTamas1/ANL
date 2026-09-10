import React, { useEffect, useRef } from "react";
import {
  FaFacebook,
  FaInstagram,
  FaGoogle,
  FaBullhorn,
  FaChartLine,
  FaMousePointer,
  FaUsers,
  FaSearch,
} from "react-icons/fa";
import gsap from "gsap";

const items = [
  { icon: <FaFacebook className="w-6 h-6" />, label: "Meta Ads" },
  { icon: <FaInstagram className="w-6 h-6" />, label: "Instagram Ads" },
  { icon: <FaGoogle className="w-6 h-6" />, label: "Google Ads" },
  { icon: <FaBullhorn className="w-6 h-6" />, label: "Retargeting" },
  { icon: <FaChartLine className="w-6 h-6" />, label: "ROAS Optimisation" },
  { icon: <FaMousePointer className="w-6 h-6" />, label: "CTR Boost" },
  { icon: <FaUsers className="w-6 h-6" />, label: "Lookalike Audiences" },
  { icon: <FaSearch className="w-6 h-6" />, label: "A/B Testing" },
];

// Three distinct column orderings so the columns don't look identical.
const columns = [
  [items[0], items[3], items[6], items[1]],
  [items[2], items[5], items[0], items[7]],
  [items[4], items[1], items[6], items[2]],
];

/**
 * Decorative hero background: three vertical marquee columns of "capability"
 * cards, scrolling in alternating directions and rotated 25°.
 */
const HeroColumnsBackground: React.FC = () => {
  const colRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const tweens: gsap.core.Tween[] = [];
    const raf = requestAnimationFrame(() => {
      colRefs.current.forEach((col, idx) => {
        if (!col) return;
        const half = col.scrollHeight / 2;
        const goingUp = idx % 2 === 0;
        tweens.push(
          gsap.fromTo(
            col,
            { y: goingUp ? 0 : -half },
            {
              y: goingUp ? -half : 0,
              duration: 34 + idx * 6,
              ease: "none",
              repeat: -1,
              force3D: true,
            }
          )
        );
      });
    });

    return () => {
      cancelAnimationFrame(raf);
      tweens.forEach((t) => t.kill());
    };
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
      style={{
        maskImage:
          "radial-gradient(ellipse 80% 70% at 50% 45%, transparent 20%, black 85%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 80% 70% at 50% 45%, transparent 20%, black 85%)",
      }}
    >
      {/* Oversized rotated stage so the tilt still covers the viewport corners */}
      <div
        className="absolute left-1/2 top-1/2 flex gap-8"
        style={{
          width: "160%",
          height: "160%",
          transform: "translate(-50%, -50%) rotate(25deg)",
        }}
      >
        {columns.map((col, idx) => (
          <div key={idx} className="flex-1 overflow-hidden">
            <div
              ref={(el) => (colRefs.current[idx] = el)}
              className="flex flex-col gap-8 will-change-transform"
            >
              {[...col, ...col].map(({ icon, label }, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-8 py-6 bg-white/5 border border-white/10 rounded-2xl text-white/30 text-lg font-medium whitespace-nowrap"
                >
                  {icon}
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroColumnsBackground;
