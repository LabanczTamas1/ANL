import React from 'react';
import { FaFacebook, FaInstagram, FaGoogle, FaBullhorn, FaChartLine, FaMousePointer, FaUsers, FaSearch } from 'react-icons/fa';

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

const AdPlatformsTicker: React.FC = () => (
  <div className="mt-16 pt-8 border-t border-line-glass">
    <div
      className="relative overflow-hidden"
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, white 18%, white 82%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, white 18%, white 82%, transparent 100%)',
      }}
    >
      {/* Center color spotlight — items glow as they pass through */}
      <div
        className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-56 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(101,85,143,0.75) 0%, rgba(122,164,159,0.35) 45%, transparent 70%)',
          mixBlendMode: 'screen',
        }}
      />
      <div
        className="flex gap-6 w-max"
        style={{ animation: 'ctaTicker 22s linear infinite' }}
      >
        {[...items, ...items].map(({ icon, label }, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-line-glass rounded-xl text-white/40 text-sm whitespace-nowrap"
          >
            {icon}
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
    <style>{`
      @keyframes ctaTicker {
        from { transform: translateX(0); }
        to   { transform: translateX(-50%); }
      }
    `}</style>
  </div>
);

export default AdPlatformsTicker;
