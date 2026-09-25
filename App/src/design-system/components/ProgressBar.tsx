import React from 'react';
import { cn } from './cn';

export type ProgressTone = 'brand' | 'success' | 'info' | 'warning' | 'danger' | 'purple';

export interface ProgressBarProps {
  /** 0–100 */
  value: number;
  tone?: ProgressTone;
  className?: string;
  trackClassName?: string;
}

const toneStyles: Record<ProgressTone, string> = {
  brand: 'bg-brand',
  success: 'bg-status-success',
  info: 'bg-status-info',
  warning: 'bg-status-warning',
  danger: 'bg-status-error',
  purple: 'bg-accent-purple',
};

/**
 * Atomic horizontal progress/meter bar.
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  tone = 'brand',
  className,
  trackClassName,
}) => {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(
        'w-full h-2.5 rounded-full bg-black/[0.08] dark:bg-white/10 overflow-hidden',
        trackClassName,
      )}
    >
      <div
        className={cn('h-full rounded-full transition-[width]', toneStyles[tone], className)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
};

export default ProgressBar;
