import React from 'react';
import { cn } from './cn';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

export interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  label?: string;
}

const sizeStyles: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

/**
 * Atomic loading spinner. Inherits color via `currentColor`, so wrap it in a
 * text-color utility (e.g. `text-brand`) to tint it.
 */
export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className, label }) => (
  <svg
    className={cn('animate-spin', sizeStyles[size], className)}
    viewBox="0 0 24 24"
    fill="none"
    role={label ? 'status' : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v8z" />
  </svg>
);

export default Spinner;
