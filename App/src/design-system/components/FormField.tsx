import React, { useId } from 'react';
import { cn } from './cn';
import { Input, type InputProps } from './Input';
import { Label } from './Label';
import { Text } from './Typography';

export interface FormFieldProps extends Omit<InputProps, 'id'> {
  label: string;
  /** Optional leading icon shown beside the label. */
  icon?: React.ReactNode;
  /** Helper text shown below the input. */
  hint?: string;
  /** Validation message shown in the error tone (replaces hint when set). */
  error?: string;
  containerClassName?: string;
}

/**
 * Molecule: labelled text input composed from the Label, Input and Text atoms.
 */
export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, icon, hint, error, containerClassName, className, ...inputProps }, ref) => {
    const id = useId();
    return (
      <div className={cn('space-y-2', containerClassName)}>
        <Label htmlFor={id} icon={icon}>
          {label}
        </Label>
        <Input
          ref={ref}
          id={id}
          className={cn(error && 'border-status-error focus:ring-status-error', className)}
          aria-invalid={error ? true : undefined}
          {...inputProps}
        />
        {error ? (
          <Text size="xs" className="text-status-error">
            {error}
          </Text>
        ) : (
          hint && (
            <Text tone="subtle" size="xs">
              {hint}
            </Text>
          )
        )}
      </div>
    );
  },
);

FormField.displayName = 'FormField';

export default FormField;
