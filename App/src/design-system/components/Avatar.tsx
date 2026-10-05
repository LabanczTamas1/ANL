import React from 'react';
import { cn } from './cn';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Full name used to derive initials when no image is provided. */
  name?: string;
  /** Explicit initials; overrides the value derived from `name`. */
  initials?: string;
  /** Optional image source. */
  src?: string;
  size?: AvatarSize;
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: 'h-9 w-9 text-sm',
  md: 'h-12 w-12 text-base',
  lg: 'h-16 w-16 text-xl',
  xl: 'h-20 w-20 text-2xl',
};

const deriveInitials = (name?: string) => {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase() || '??';
};

/**
 * Atomic avatar. Renders an image when `src` is given, otherwise initials
 * derived from `name` (or the explicit `initials` prop).
 */
export const Avatar: React.FC<AvatarProps> = ({
  name,
  initials,
  src,
  size = 'md',
  className,
  ...rest
}) => (
  <div
    className={cn(
      'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand font-bold text-content-inverse',
      sizeStyles[size],
      className,
    )}
    {...rest}
  >
    {src ? (
      <img src={src} alt={name ?? 'avatar'} className="h-full w-full object-cover" />
    ) : (
      (initials ?? deriveInitials(name))
    )}
  </div>
);

export default Avatar;
