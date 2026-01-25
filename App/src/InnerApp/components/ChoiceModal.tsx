import React from "react";

type ModalProps = {
  title: string;
  message: string;
  keepText: string;
  deleteText: string;
  onKeep: () => void;
  onDelete: () => void;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "max-w-xs",
  md: "max-w-md",
  lg: "max-w-lg",
};

export const ChoiceModal: React.FC<ModalProps> = ({
  title,
  message,
  keepText,
  deleteText,
  onKeep,
  onDelete,
  size = "md",
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
    <div
      className={`bg-white rounded-[11px] border-2 border-[#E5E6E7] shadow-md w-full ${sizeClasses[size]}`}
    >
      <div className="h-[11px] border-0 border-b-1 rounded-t-[9px] border-[#E5E6E7] w-full bg-[#65558F]">
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold mb-3 pb-1">
          {title}
        </h3>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onKeep}
            className="border border-gray-600 rounded px-3 py-1 hover:bg-gray-100 transition"
          >
            {keepText}
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-1 bg-[#65558F] text-white rounded px-3 py-1 hover:bg-purple-800 transition"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v1h6V4a1 1 0 00-1-1m-4 0h4"
              />
            </svg>
            {deleteText}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};
