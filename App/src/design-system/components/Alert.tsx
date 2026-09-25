import React from 'react';
import { cn } from './cn';

export type AlertTone = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: AlertTone;
}

const toneStyles: Record<AlertTone, string> = {
  success: 'bg-status-success/10 border-status-success/40 text-status-success',
  error: 'bg-status-error/10 border-status-error/40 text-status-error',
  warning: 'bg-status-warning/10 border-status-warning/40 text-status-warning',
  info: 'bg-status-info/10 border-status-info/40 text-status-info',
};

/**
 * Atomic inline feedback message.
 */
export const Alert: React.FC<AlertProps> = ({ tone = 'info', className, children, ...rest }) => (
  <div
    role="alert"
    className={cn('rounded-lg border p-3 text-sm', toneStyles[tone], className)}
    {...rest}
  >
    {children}
  </div>
);

export default Alert;
