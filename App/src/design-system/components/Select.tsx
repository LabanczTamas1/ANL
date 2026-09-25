import React from 'react';
import { cn } from './cn';

export type SelectSize = 'sm' | 'md';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  selectSize?: SelectSize;
}

const sizeStyles: Record<SelectSize, string> = {
  sm: 'px-1.5 py-1 text-xs',
  md: 'px-3 py-2 text-sm',
};

/**
 * Atomic select dropdown.
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ selectSize = 'md', className, children, ...rest }, ref) => (
    <select
      ref={ref}
      className={cn(
        'rounded-lg border border-line dark:border-line-dark bg-surface-light dark:bg-surface-elevated text-content dark:text-content-inverse focus:outline-none focus:ring-2 focus:ring-brand transition-colors',
        sizeStyles[selectSize],
        className,
      )}
      {...rest}
    >
      {children}
    </select>
  ),
);

Select.displayName = 'Select';

export default Select;
