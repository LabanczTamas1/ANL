import React from 'react';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';

interface FormInputProps {
  id: string;
  type: string;
  placeholder: string;
  register: UseFormRegisterReturn;
  error?: FieldError;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

const FormInput: React.FC<FormInputProps> = ({
  id,
  type,
  placeholder,
  register,
  error,
  showPassword,
  onTogglePassword
}) => {
  const isPasswordField = type === 'password';
  const inputType = isPasswordField && showPassword ? 'text' : type;

  return (
    <>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          className={`w-full p-2 rounded border bg-[#080A0D] ${
            error ? "border-red-500" : "[#080A0D]"
          } ${isPasswordField ? 'pr-10' : ''}`}
          {...register}
        />
        {isPasswordField && onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1">
          {error.message}
        </p>
      )}
    </>
  );
};

export { FormInput };
export default FormInput;