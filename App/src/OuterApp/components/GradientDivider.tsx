import React from 'react';

type DividerStyle = 'wave' | 'gradient' | 'mesh' | 'glow';

interface GradientDividerProps {
  style?: DividerStyle;
  flip?: boolean;
  className?: string;
}

/**
 * Modern section divider with various visual styles
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
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`w-full ${flip ? 'rotate-180' : ''}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#65558F" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#7AA49F" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#65558F" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <path
              d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z"
              fill="url(#waveGradient)"
            />
            <path
              d="M0,80 C360,20 720,100 1080,40 C1260,10 1380,60 1440,80 L1440,120 L0,120 Z"
              fill="url(#waveGradient)"
              opacity="0.5"
            />
          </svg>
        );

      case 'gradient':
        return (
          <div className={`w-full h-24 ${flip ? 'rotate-180' : ''}`}>
            <div className="w-full h-full bg-gradient-to-b from-transparent via-brand/20 to-transparent" />
            <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent" />
          </div>
        );

      case 'mesh':
        return (
          <div className={`w-full h-32 relative overflow-hidden ${flip ? 'rotate-180' : ''}`}>
            <div className="absolute inset-0">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-brand/30 rounded-full blur-[80px] animate-pulse" />
              <div className="absolute top-0 right-1/4 w-64 h-64 bg-accent-teal/30 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
            <svg viewBox="0 0 1440 120" className="w-full relative z-10" preserveAspectRatio="none">
              <defs>
                <pattern id="meshPattern" patternUnits="userSpaceOnUse" width="40" height="40">
                  <circle cx="20" cy="20" r="1" fill="rgba(101, 85, 143, 0.3)" />
                </pattern>
              </defs>
              <rect width="1440" height="120" fill="url(#meshPattern)" />
            </svg>
          </div>
        );

      case 'glow':
        return (
          <div className={`w-full h-16 relative ${flip ? 'rotate-180' : ''}`}>
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand to-transparent blur-md" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-teal to-transparent blur-lg opacity-50" />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return <div className={`relative ${className}`}>{renderDivider()}</div>;
};

export default GradientDivider;
