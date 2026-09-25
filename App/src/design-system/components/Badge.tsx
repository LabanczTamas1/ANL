import React from 'react';
import { cn } from './cn';

export type BadgeTone =
  | 'neutral'
  | 'brand'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger'
  | 'purple';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  size?: BadgeSize;
  pill?: boolean;
}

const toneStyles: Record<BadgeTone, string> = {
  neutral: 'bg-black/[0.06] text-content-subtle dark:bg-white/10 dark:text-content-subtle-inverse',
  brand: 'bg-brand-muted text-brand dark:text-brand-focus',
  success: 'bg-status-success/15 text-status-success',
  info: 'bg-status-info/15 text-status-info',
  warning: 'bg-status-warning/20 text-status-warning',
  danger: 'bg-status-error/15 text-status-error',
  purple: 'bg-accent-purple/15 text-accent-purple',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

/**
 * Atomic status/label badge.
 */
export const Badge: React.FC<BadgeProps> = ({
  tone = 'neutral',
  size = 'sm',
  pill = false,
  className,
  children,
  ...rest
}) => (
  <span
    className={cn(
      'inline-flex items-center font-semibold',
      pill ? 'rounded-full' : 'rounded',
      sizeStyles[size],
      toneStyles[tone],
      className,
    )}
    {...rest}
  >
    {children}
  </span>
);

/** Shared HTTP-method → tone mapping so method colors stay consistent. */
export const METHOD_TONES: Record<string, BadgeTone> = {
  GET: 'success',
  POST: 'info',
  PUT: 'warning',
  PATCH: 'purple',
  DELETE: 'danger',
};

/** Shared user-role → tone mapping. */
export const ROLE_TONES: Record<string, BadgeTone> = {
  admin: 'danger',
  owner: 'purple',
  user: 'info',
  moderator: 'warning',
  guest: 'neutral',
};

export default Badge;
