import React from 'react';
import { cn } from './cn';
import { Spinner } from './Spinner';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'dangerSoft'
  | 'success'
  | 'outline'
  | 'ghost';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const base =
  'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-focus disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap';

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-content-inverse hover:bg-brand-hover',
  secondary:
    'bg-surface-light dark:bg-surface-elevated text-content dark:text-content-inverse border border-line dark:border-line-dark hover:bg-black/[0.04] dark:hover:bg-white/5',
  danger: 'bg-status-error text-content-inverse hover:brightness-110',
  dangerSoft: 'bg-status-error/10 text-status-error hover:bg-status-error/20',
  success: 'bg-status-success text-content-inverse hover:brightness-110',
  outline:
    'border border-line dark:border-line-dark text-content dark:text-content-inverse hover:bg-black/[0.04] dark:hover:bg-white/5',
  ghost:
    'text-content-subtle dark:text-content-subtle-inverse hover:bg-black/[0.04] dark:hover:bg-white/5',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

/**
 * Atomic button. Every actionable button in the app should use this so a
 * future design-system update restyles them all at once.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      className,
      children,
      disabled,
      ...rest
    },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(base, variantStyles[variant], sizeStyles[size], fullWidth && 'w-full', className)}
      {...rest}
    >
      {loading ? <Spinner size="sm" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  ),
);

Button.displayName = 'Button';

export default Button;
