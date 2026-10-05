import React, { useId, useState } from 'react';
import { cn } from './cn';
import { Input, type InputProps } from './Input';
import { Label } from './Label';
import { Text } from './Typography';

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 7 10 7a13.2 13.2 0 0 1-1.67 2.68M6.1 6.1A13.2 13.2 0 0 0 2 11s3.5 7 10 7a9.12 9.12 0 0 0 3.9-.86M1 1l22 22"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.9 9.9a3 3 0 0 0 4.2 4.2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export interface PasswordInputProps extends Omit<InputProps, 'id' | 'type'> {
  label?: string;
  error?: string;
  containerClassName?: string;
  /** Accessible label for the visibility toggle. */
  toggleLabel?: { show: string; hide: string };
}

/**
 * Molecule: password input with a show/hide visibility toggle.
 */
export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      label,
      error,
      containerClassName,
      className,
      toggleLabel = { show: 'Show password', hide: 'Hide password' },
      ...inputProps
    },
    ref,
  ) => {
    const id = useId();
    const [visible, setVisible] = useState(false);

    return (
      <div className={cn('space-y-2', containerClassName)}>
        {label && <Label htmlFor={id}>{label}</Label>}
        <div className="relative">
          <Input
            ref={ref}
            id={id}
            type={visible ? 'text' : 'password'}
            className={cn(
              'pr-10',
              error && 'border-status-error focus:ring-status-error',
              className,
            )}
            aria-invalid={error ? true : undefined}
            {...inputProps}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-brand dark:hover:text-brand-focus transition-colors focus:outline-none"
            aria-label={visible ? toggleLabel.hide : toggleLabel.show}
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        {error && (
          <Text size="xs" className="text-status-error">
            {error}
          </Text>
        )}
      </div>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
