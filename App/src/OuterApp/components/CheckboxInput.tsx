import React from 'react';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';

interface CheckboxInputProps {
  register: UseFormRegisterReturn;
  error?: FieldError;
  label: React.ReactNode;
}

const CheckboxInput: React.FC<CheckboxInputProps> = ({
  register,
  error,
  label
}) => {
  return (
    <>
      <label className="flex items-start gap-2 text-sm text-content-subtle-inverse">
        <input
          type="checkbox"
          className="mt-0.5 accent-brand"
          {...register}
        />
        <span>{label}</span>
      </label>
      {error && (
        <p className="text-status-error text-sm mt-1">{error.message}</p>
      )}
    </>
  );
};

export default CheckboxInput;