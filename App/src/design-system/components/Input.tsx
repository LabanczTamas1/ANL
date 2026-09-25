import React from 'react';
import { cn } from './cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  containerClassName?: string;
}

const inputBase =
  'w-full rounded-lg border border-line dark:border-line-dark bg-surface-light dark:bg-surface-elevated px-3 py-2 text-sm text-content dark:text-content-inverse placeholder-content-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-colors disabled:opacity-50';

/**
 * Atomic text input. Supports an optional leading icon.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ leftIcon, className, containerClassName, ...rest }, ref) => (
    <div className={cn('relative', containerClassName)}>
      {leftIcon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none">
          {leftIcon}
        </span>
      )}
      <input ref={ref} className={cn(inputBase, leftIcon && 'pl-9', className)} {...rest} />
    </div>
  ),
);

Input.displayName = 'Input';

export default Input;
