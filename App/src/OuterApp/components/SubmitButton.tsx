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
      className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white font-bold py-2 px-4 rounded"
    >
      {text}
    </button>
  );
};

export default SubmitButton;