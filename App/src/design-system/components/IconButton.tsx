import React from 'react';
import { cn } from './cn';

export type IconButtonVariant = 'solid' | 'ghost' | 'outline';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  /** Accessible label — required since the button has no visible text. */
  'aria-label': string;
}

const base =
  'inline-flex items-center justify-center rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-focus disabled:opacity-40 disabled:cursor-not-allowed';

const variantStyles: Record<IconButtonVariant, string> = {
  solid: 'bg-brand text-content-inverse hover:bg-brand-hover',
  ghost:
    'text-content-subtle dark:text-content-subtle-inverse hover:bg-black/[0.04] dark:hover:bg-white/5',
  outline:
    'border border-line dark:border-line-dark text-content-subtle dark:text-content-subtle-inverse hover:bg-black/[0.04] dark:hover:bg-white/5',
};

const sizeStyles: Record<IconButtonSize, string> = {
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-2.5',
};

/**
 * Atomic icon-only button. Requires an `aria-label` for accessibility.
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = 'ghost', size = 'md', className, children, ...rest }, ref) => (
    <button
      ref={ref}
      className={cn(base, variantStyles[variant], sizeStyles[size], className)}
      {...rest}
    >
      {children}
    </button>
  ),
);

IconButton.displayName = 'IconButton';

export default IconButton;
