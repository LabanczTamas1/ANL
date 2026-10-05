import React from 'react';
import { cn } from './cn';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Optional leading icon node. */
  icon?: React.ReactNode;
}

/**
 * Atomic form label. Colors adapt to light/dark via content tokens.
 */
export const Label: React.FC<LabelProps> = ({ icon, className, children, ...rest }) => (
  <label
    className={cn(
      'flex items-center gap-2 text-sm font-medium text-content dark:text-content-inverse',
      className,
    )}
    {...rest}
  >
    {icon && <span className="text-brand dark:text-brand-focus">{icon}</span>}
    {children}
  </label>
);

export default Label;
