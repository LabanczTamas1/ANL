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
  @keyframes blob-drift-1 {
    0%   { transform: translate(-8%, 10%)  rotate(-12deg) scale(1);    opacity: 0.5; }
    30%  { transform: translate(10%, -5%)  rotate(8deg)  scale(1.15);  opacity: 0.7; }
    65%  { transform: translate(3%, 15%)   rotate(-6deg) scale(0.92);  opacity: 0.55; }
    100% { transform: translate(-8%, 10%)  rotate(-12deg) scale(1);    opacity: 0.5; }
  }
  @keyframes blob-drift-2 {
    0%   { transform: translate(12%, -8%)  rotate(18deg)  scale(1.05); opacity: 0.4; }
    40%  { transform: translate(-9%, 12%)  rotate(-10deg) scale(0.88); opacity: 0.65; }
    75%  { transform: translate(5%, -3%)   rotate(22deg)  scale(1.1);  opacity: 0.45; }
    100% { transform: translate(12%, -8%)  rotate(18deg)  scale(1.05); opacity: 0.4; }
  }
  @keyframes blob-drift-3 {
    0%   { transform: translate(0%, 0%)    rotate(-5deg)  scale(1);    opacity: 0.35; }
    45%  { transform: translate(-12%, 8%)  rotate(15deg)  scale(1.2);  opacity: 0.6; }
    100% { transform: translate(0%, 0%)    rotate(-5deg)  scale(1);    opacity: 0.35; }
  }
  @keyframes wave-flow-1 {
    0%   { d: path("M0,70 C80,20 200,110 360,55 C520,0 600,90 720,65 C840,40 950,105 1100,45 C1250,-15 1380,75 1440,60 L1440,160 L0,160 Z"); }
    33%  { d: path("M0,50 C120,110 280,15 400,70 C520,125 660,10 780,60 C900,110 1020,20 1180,75 C1300,115 1400,45 1440,80 L1440,160 L0,160 Z"); }
    66%  { d: path("M0,85 C100,30 240,120 380,50 C520,-20 680,100 820,55 C960,10 1080,90 1240,40 C1360,-5 1420,70 1440,55 L1440,160 L0,160 Z"); }
    100% { d: path("M0,70 C80,20 200,110 360,55 C520,0 600,90 720,65 C840,40 950,105 1100,45 C1250,-15 1380,75 1440,60 L1440,160 L0,160 Z"); }
  }
  @keyframes wave-flow-2 {
    0%   { d: path("M0,105 C140,55 300,130 460,80 C620,30 740,120 900,70 C1060,20 1200,100 1340,60 C1400,40 1430,85 1440,95 L1440,160 L0,160 Z"); }
    40%  { d: path("M0,90 C160,140 320,50 500,100 C660,145 800,40 960,85 C1120,130 1240,55 1360,90 C1410,110 1435,75 1440,80 L1440,160 L0,160 Z"); }
    80%  { d: path("M0,115 C120,65 260,145 420,75 C580,5 720,125 880,65 C1040,5 1180,110 1320,55 C1400,20 1430,90 1440,100 L1440,160 L0,160 Z"); }
    100% { d: path("M0,105 C140,55 300,130 460,80 C620,30 740,120 900,70 C1060,20 1200,100 1340,60 C1400,40 1430,85 1440,95 L1440,160 L0,160 Z"); }
  }
  @keyframes wave-flow-3 {
    0%   { d: path("M0,130 C200,90 380,150 560,110 C740,70 860,145 1020,100 C1180,55 1320,125 1440,115 L1440,160 L0,160 Z"); }
    50%  { d: path("M0,120 C180,155 340,85 540,125 C720,160 880,80 1060,120 C1220,155 1340,95 1440,130 L1440,160 L0,160 Z"); }
    100% { d: path("M0,130 C200,90 380,150 560,110 C740,70 860,145 1020,100 C1180,55 1320,125 1440,115 L1440,160 L0,160 Z"); }
  }
`;

const GradientDivider: React.FC<GradientDividerProps> = ({
  style = 'wave',
  flip = false,
  className = '',
}) => {
  const renderDivider = () => {
    switch (style) {
      case 'wave':
        return (
          <div className={`relative w-full h-48 overflow-hidden ${flip ? 'scale-y-[-1]' : ''}`}>
            {/* Background aurora blobs — organic, angled */}
            <div
              className="absolute w-[80%] h-[200%] left-[-10%] top-[-50%] rounded-[60%_40%_55%_45%/50%_60%_40%_50%] blur-[60px]"
              style={{
                background: 'radial-gradient(ellipse, #65558F 0%, #7AA49F 45%, transparent 70%)',
                animation: 'blob-drift-1 13s ease-in-out infinite',
                opacity: 0.45,
              }}
            />
            <div
              className="absolute w-[70%] h-[180%] right-[-5%] top-[-40%] rounded-[45%_55%_40%_60%/55%_45%_60%_40%] blur-[70px]"
              style={{
                background: 'radial-gradient(ellipse, #9B7ADB 0%, #9A4647 50%, transparent 70%)',
                animation: 'blob-drift-2 17s ease-in-out infinite',
                opacity: 0.4,
              }}
            />
            <div
              className="absolute w-[60%] h-[150%] left-[20%] top-[-30%] rounded-[50%_50%_45%_55%/45%_55%_50%_50%] blur-[55px]"
              style={{
                background: 'radial-gradient(ellipse, #7AA49F 0%, #65558F 60%, transparent 75%)',
                animation: 'blob-drift-3 21s ease-in-out infinite',
                opacity: 0.35,
              }}
            />
            {/* Animated SVG waves — 3 layers with organic paths */}
            <svg
              viewBox="0 0 1440 160"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute inset-0 w-full h-full"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="waveGradA" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="#65558F" stopOpacity="0.6">
                    <animate attributeName="stop-color" values="#65558F;#7AA49F;#9B7ADB;#65558F" dur="9s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="40%"  stopColor="#9B7ADB" stopOpacity="0.5">
                    <animate attributeName="stop-color" values="#9B7ADB;#9A4647;#7AA49F;#9B7ADB" dur="11s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" stopColor="#7AA49F" stopOpacity="0.6">
                    <animate attributeName="stop-color" values="#7AA49F;#65558F;#9A4647;#7AA49F" dur="9s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>
                <linearGradient id="waveGradB" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="#9A4647" stopOpacity="0.4">
                    <animate attributeName="stop-color" values="#9A4647;#9B7ADB;#65558F;#9A4647" dur="13s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" stopColor="#65558F" stopOpacity="0.4">
                    <animate attributeName="stop-color" values="#65558F;#7AA49F;#9B7ADB;#65558F" dur="13s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>
              </defs>
              {/* Back wave — most organic */}
              <path
                d="M0,130 C200,90 380,150 560,110 C740,70 860,145 1020,100 C1180,55 1320,125 1440,115 L1440,160 L0,160 Z"
                fill="url(#waveGradB)"
                style={{ animation: 'wave-flow-3 15s ease-in-out infinite' }}
              />
              {/* Mid wave */}
              <path
                d="M0,105 C140,55 300,130 460,80 C620,30 740,120 900,70 C1060,20 1200,100 1340,60 C1400,40 1430,85 1440,95 L1440,160 L0,160 Z"
                fill="url(#waveGradA)"
                opacity="0.6"
                style={{ animation: 'wave-flow-2 12s ease-in-out infinite' }}
              />
              {/* Front wave — sharpest detail */}
              <path
                d="M0,70 C80,20 200,110 360,55 C520,0 600,90 720,65 C840,40 950,105 1100,45 C1250,-15 1380,75 1440,60 L1440,160 L0,160 Z"
                fill="url(#waveGradA)"
                style={{ animation: 'wave-flow-1 9s ease-in-out infinite' }}
              />
            </svg>
          </div>
        );

      case 'gradient':
        return (
          <div className={`w-full h-32 relative overflow-hidden ${flip ? 'scale-y-[-1]' : ''}`}>
            <div
              className="absolute w-[90%] h-[300%] left-[-5%] top-[-100%] rounded-[50%_50%_45%_55%/45%_55%_50%_50%] blur-[50px]"
              style={{
                background: 'radial-gradient(ellipse, #65558F 0%, #7AA49F 40%, transparent 70%)',
                animation: 'blob-drift-1 14s ease-in-out infinite',
                opacity: 0.25,
              }}
            />

          </div>
        );

      case 'mesh':
        return (
          <div className={`w-full h-48 relative overflow-hidden ${flip ? 'scale-y-[-1]' : ''}`}>
            <div
              className="absolute w-[75%] h-[200%] left-[-5%] top-[-60%] rounded-[55%_45%_50%_50%/60%_40%_55%_45%] blur-[65px]"
              style={{
                background: 'radial-gradient(ellipse, #65558F 0%, #7AA49F 50%, transparent 70%)',
                animation: 'blob-drift-1 15s ease-in-out infinite',
                opacity: 0.4,
              }}
            />
            <div
              className="absolute w-[65%] h-[180%] right-[-10%] top-[-40%] rounded-[40%_60%_55%_45%/50%_50%_45%_55%] blur-[70px]"
              style={{
                background: 'radial-gradient(ellipse, #9B7ADB 0%, #9A4647 50%, transparent 70%)',
                animation: 'blob-drift-2 19s ease-in-out infinite',
                opacity: 0.35,
              }}
            />
            <svg viewBox="0 0 1440 160" className="absolute inset-0 w-full h-full z-10" preserveAspectRatio="none">
              <defs>
                <pattern id="meshPatternC" patternUnits="userSpaceOnUse" width="40" height="40">
                  <circle cx="20" cy="20" r="1" fill="rgba(101, 85, 143, 0.3)" />
                </pattern>
              </defs>
              <rect width="1440" height="160" fill="url(#meshPatternC)" />
            </svg>
          </div>
        );

      case 'glow':
        return (
          <div className={`w-full h-32 relative overflow-hidden ${flip ? 'scale-y-[-1]' : ''}`}>
            {/* Organic blob glow — not a straight line */}
            <div
              className="absolute w-[80%] h-[160%] left-[10%] top-[-30%] rounded-[50%_50%_45%_55%/55%_45%_50%_50%] blur-[50px]"
              style={{
                background: 'radial-gradient(ellipse at 50% 50%, #7AA49F 0%, #65558F 40%, transparent 70%)',
                animation: 'blob-drift-1 11s ease-in-out infinite',
                opacity: 0.5,
              }}
            />
            <div
              className="absolute w-[60%] h-[120%] left-[25%] top-[-10%] rounded-[45%_55%_50%_50%/50%_50%_45%_55%] blur-[35px]"
              style={{
                background: 'radial-gradient(ellipse at 50% 50%, #9B7ADB 0%, #9A4647 50%, transparent 70%)',
                animation: 'blob-drift-2 14s ease-in-out infinite',
                opacity: 0.4,
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
      <div
        className={`relative ${className}`}
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)',
        }}
      >
        {renderDivider()}
      </div>
    </>
  );
};

export default GradientDivider;
