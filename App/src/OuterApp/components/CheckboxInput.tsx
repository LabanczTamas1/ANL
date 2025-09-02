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
      <label className="flex items-center">
        <input
          type="checkbox"
          className="mr-2"
          {...register}
        />
        {label}
      </label>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error.message}</p>
      )}
    </>
  );
};

export default CheckboxInput;