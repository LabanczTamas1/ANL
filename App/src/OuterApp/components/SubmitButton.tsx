import React from 'react';

interface SubmitButtonProps {
  text: string;
  disabled?: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ text, disabled = false }) => {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full py-3 rounded-xl bg-brand hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition shadow-lg shadow-brand/20"
    >
      {text}
    </button>
  );
};

export default SubmitButton;