import React from 'react';

type DividerStyle = 'wave' | 'gradient' | 'mesh' | 'glow';

interface GradientDividerProps {
  style?: DividerStyle;
  flip?: boolean;
  className?: string;
}

const auroraKeyframes = `
  @keyframes aurora-shift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes aurora-drift-1 {
    0%   { transform: translateX(-10%) scaleX(1);   opacity: 0.55; }
    33%  { transform: translateX(8%)  scaleX(1.08); opacity: 0.75; }
    66%  { transform: translateX(-4%) scaleX(0.95); opacity: 0.60; }
    100% { transform: translateX(-10%) scaleX(1);   opacity: 0.55; }
  }
  @keyframes aurora-drift-2 {
    0%   { transform: translateX(12%)  scaleX(1);    opacity: 0.45; }
    40%  { transform: translateX(-10%) scaleX(1.12); opacity: 0.70; }
    80%  { transform: translateX(6%)   scaleX(0.92); opacity: 0.50; }
    100% { transform: translateX(12%)  scaleX(1);    opacity: 0.45; }
  }
  @keyframes aurora-drift-3 {
    0%   { transform: translateX(0%)   scaleX(1);    opacity: 0.35; }
    50%  { transform: translateX(-14%) scaleX(1.15); opacity: 0.60; }
    100% { transform: translateX(0%)   scaleX(1);    opacity: 0.35; }
  }
  @keyframes wave-undulate {
    0%   { d: path("M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z"); }
    50%  { d: path("M0,40 C200,100 500,10 720,55 C940,100 1180,5 1440,45 L1440,120 L0,120 Z"); }
    100% { d: path("M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z"); }
  }
  @keyframes wave-undulate-2 {
    0%   { d: path("M0,80 C360,20 720,100 1080,40 C1260,10 1380,60 1440,80 L1440,120 L0,120 Z"); }
    50%  { d: path("M0,65 C320,30 700,110 1060,50 C1240,20 1370,70 1440,65 L1440,120 L0,120 Z"); }
    100% { d: path("M0,80 C360,20 720,100 1080,40 C1260,10 1380,60 1440,80 L1440,120 L0,120 Z"); }
  }
`;

/**
 * Section divider with aurora borealis animations
 */
const GradientDivider: React.FC<GradientDividerProps> = ({
  style = 'wave',
  flip = false,
  className = '',
}) => {
  const renderDivider = () => {
    switch (style) {
      case 'wave':
        return (
          <div className={`relative w-full h-28 overflow-hidden ${flip ? 'rotate-180' : ''}`}>
            {/* Aurora bands behind the SVG */}
            <div
              className="absolute inset-x-0 top-0 h-full"
              style={{
                background: 'linear-gradient(120deg, #65558F 0%, #7AA49F 25%, #9A4647 50%, #9B7ADB 75%, #65558F 100%)',
                backgroundSize: '300% 100%',
                animation: 'aurora-shift 8s ease-in-out infinite',
                opacity: 0.18,
              }}
            />
            {/* Drifting aurora streaks */}
            <div
              className="absolute inset-x-[-20%] top-[10%] h-[60%] rounded-full blur-[28px]"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, #65558F 30%, #7AA49F 60%, transparent 100%)',
                animation: 'aurora-drift-1 11s ease-in-out infinite',
              }}
            />
            <div
              className="absolute inset-x-[-20%] top-[25%] h-[50%] rounded-full blur-[36px]"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, #9B7ADB 20%, #9A4647 55%, transparent 100%)',
                animation: 'aurora-drift-2 14s ease-in-out infinite',
              }}
            />
            <div
              className="absolute inset-x-[-20%] top-[0%] h-[80%] rounded-full blur-[50px]"
              style={{
                background: 'linear-gradient(90deg, transparent 10%, #7AA49F 40%, #65558F 70%, transparent 100%)',
                animation: 'aurora-drift-3 17s ease-in-out infinite',
              }}
            />
            {/* SVG wave on top */}
            <svg
              viewBox="0 0 1440 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute inset-0 w-full h-full"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="waveGradientA" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="#65558F" stopOpacity="0.5">
                    <animate attributeName="stop-color" values="#65558F;#7AA49F;#9B7ADB;#65558F" dur="8s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="50%"  stopColor="#7AA49F" stopOpacity="0.7">
                    <animate attributeName="stop-color" values="#7AA49F;#9A4647;#65558F;#7AA49F" dur="8s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" stopColor="#9B7ADB" stopOpacity="0.5">
                    <animate attributeName="stop-color" values="#9B7ADB;#65558F;#7AA49F;#9B7ADB" dur="8s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>
              </defs>
              <path
                d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z"
                fill="url(#waveGradientA)"
                style={{ animation: 'wave-undulate 9s ease-in-out infinite' }}
              />
              <path
                d="M0,80 C360,20 720,100 1080,40 C1260,10 1380,60 1440,80 L1440,120 L0,120 Z"
                fill="url(#waveGradientA)"
                opacity="0.5"
                style={{ animation: 'wave-undulate-2 12s ease-in-out infinite' }}
              />
            </svg>
          </div>
        );

      case 'gradient':
        return (
          <div className={`w-full h-24 relative overflow-hidden ${flip ? 'rotate-180' : ''}`}>
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(120deg, #65558F, #7AA49F, #9A4647, #9B7ADB, #65558F)',
                backgroundSize: '300% 100%',
                animation: 'aurora-shift 9s ease-in-out infinite',
                opacity: 0.2,
              }}
            />
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent" />
          </div>
        );

      case 'mesh':
        return (
          <div className={`w-full h-36 relative overflow-hidden ${flip ? 'rotate-180' : ''}`}>
            {/* Aurora layers */}
            <div
              className="absolute inset-x-[-20%] top-[5%] h-[90%] rounded-full blur-[40px]"
              style={{
                background: 'linear-gradient(90deg, transparent, #65558F 30%, #7AA49F 60%, transparent)',
                animation: 'aurora-drift-1 13s ease-in-out infinite',
              }}
            />
            <div
              className="absolute inset-x-[-20%] top-[20%] h-[60%] rounded-full blur-[50px]"
              style={{
                background: 'linear-gradient(90deg, transparent, #9B7ADB 25%, #9A4647 65%, transparent)',
                animation: 'aurora-drift-2 16s ease-in-out infinite',
              }}
            />
            {/* Dot mesh on top */}
            <svg viewBox="0 0 1440 120" className="absolute inset-0 w-full h-full relative z-10" preserveAspectRatio="none">
              <defs>
                <pattern id="meshPatternB" patternUnits="userSpaceOnUse" width="40" height="40">
                  <circle cx="20" cy="20" r="1" fill="rgba(101, 85, 143, 0.35)" />
                </pattern>
              </defs>
              <rect width="1440" height="120" fill="url(#meshPatternB)" />
            </svg>
          </div>
        );

      case 'glow':
        return (
          <div className={`w-full h-20 relative overflow-hidden ${flip ? 'rotate-180' : ''}`}>
            {/* Animated aurora line */}
            <div
              className="absolute inset-x-[-10%] top-1/2 -translate-y-1/2 h-[3px] rounded-full blur-[2px]"
              style={{
                background: 'linear-gradient(90deg, transparent, #65558F 20%, #7AA49F 50%, #9B7ADB 80%, transparent)',
                backgroundSize: '300% 100%',
                animation: 'aurora-shift 6s ease-in-out infinite',
              }}
            />
            {/* Wide soft glow */}
            <div
              className="absolute inset-x-[-20%] top-1/2 -translate-y-1/2 h-12 rounded-full blur-[24px]"
              style={{
                background: 'linear-gradient(90deg, transparent, #65558F 25%, #7AA49F 55%, #9A4647 80%, transparent)',
                animation: 'aurora-drift-1 10s ease-in-out infinite',
                opacity: 0.55,
              }}
            />
            <div
              className="absolute inset-x-[-20%] top-1/2 -translate-y-1/2 h-8 rounded-full blur-[40px]"
              style={{
                background: 'linear-gradient(90deg, transparent, #9B7ADB 30%, #7AA49F 70%, transparent)',
                animation: 'aurora-drift-2 13s ease-in-out infinite',
                opacity: 0.45,
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <style>{auroraKeyframes}</style>
      <div className={`relative ${className}`}>{renderDivider()}</div>
    </>
  );
};

export default GradientDivider;
