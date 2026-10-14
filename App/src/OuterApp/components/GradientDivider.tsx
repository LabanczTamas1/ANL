import React from 'react';

/**
 * GradientDivider — a set of minimal, modern section separators.
 *
 * Every variant is built on the same idea: a single center‑weighted hairline
 * that fades out toward both edges, keeping the transition between sections
 * calm and premium. Variants layer one subtle accent on top of that hairline.
 *
 * The `style` keys are kept for backwards compatibility with existing usages:
 *   - gradient → clean hairline, nothing else
 *   - glow     → hairline + soft radial bloom behind the center
 *   - wave     → hairline + a light that sweeps across it
 *   - mesh     → hairline + a small pulsing diamond node in the center
 */

type DividerStyle = 'wave' | 'gradient' | 'mesh' | 'glow';

interface GradientDividerProps {
  style?: DividerStyle;
  /** Kept for API compatibility. Dividers are vertically symmetric now, so
   *  this is accepted but has no visual effect. */
  flip?: boolean;
  className?: string;
}

const BRAND = '#65558F';
const TEAL = '#7AA49F';

const keyframes = `
  @keyframes divider-sweep {
    0%   { transform: translateX(-140%); opacity: 0; }
    15%  { opacity: 1; }
    85%  { opacity: 1; }
    100% { transform: translateX(140%); opacity: 0; }
  }
  @keyframes divider-node {
    0%, 100% { transform: translate(-50%, -50%) rotate(45deg) scale(1);    opacity: 0.9; }
    50%      { transform: translate(-50%, -50%) rotate(45deg) scale(1.35); opacity: 1; }
  }
  @keyframes divider-node-glow {
    0%, 100% { opacity: 0.35; transform: translate(-50%, -50%) scale(1); }
    50%      { opacity: 0.6;  transform: translate(-50%, -50%) scale(1.25); }
  }
`;

const GradientDivider: React.FC<GradientDividerProps> = ({
  style = 'gradient',
  className = '',
}) => {
  // The hairline: 1px tall, fades transparent → brand → teal → transparent.
  const hairline = (
    <div
      className="h-px w-full"
      style={{
        background: `linear-gradient(to right, transparent 0%, ${BRAND}00 8%, ${BRAND}B3 38%, ${TEAL}B3 62%, ${TEAL}00 92%, transparent 100%)`,
      }}
    />
  );

  const renderAccent = () => {
    switch (style) {
      case 'glow':
        return (
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-[42rem] max-w-[80%] -translate-x-1/2 -translate-y-1/2 blur-2xl"
            style={{
              background: `radial-gradient(ellipse at center, ${BRAND}40 0%, ${TEAL}1f 45%, transparent 70%)`,
            }}
          />
        );

      case 'wave':
        // A light that sweeps horizontally along the hairline.
        return (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className="absolute top-1/2 h-px w-1/3 -translate-y-1/2"
              style={{
                background: `linear-gradient(to right, transparent, #ffffffcc, transparent)`,
                animation: 'divider-sweep 4.5s ease-in-out infinite',
              }}
            />
          </div>
        );

      case 'mesh':
        // A small diamond node pulsing in the center.
        return (
          <>
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-10 w-10 rounded-full blur-md"
              style={{
                background: `radial-gradient(circle, ${BRAND}66 0%, transparent 70%)`,
                animation: 'divider-node-glow 3.5s ease-in-out infinite',
              }}
            />
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-2"
              style={{
                background: `linear-gradient(135deg, ${BRAND}, ${TEAL})`,
                boxShadow: `0 0 12px ${BRAND}99`,
                animation: 'divider-node 3.5s ease-in-out infinite',
              }}
            />
          </>
        );

      case 'gradient':
      default:
        return null;
    }
  };

  return (
    <>
      <style>{keyframes}</style>
      <div
        className={`relative flex w-full items-center justify-center py-14 ${className}`}
        aria-hidden="true"
      >
        <div className="relative mx-auto w-full max-w-5xl px-6">
          {renderAccent()}
          {hairline}
        </div>
      </div>
    </>
  );
};

export default GradientDivider;
