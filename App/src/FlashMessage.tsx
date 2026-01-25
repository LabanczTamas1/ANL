import React, { useState, useEffect } from "react";
import { FlashMessageProps } from "./FlashMessage.type";

const FlashMessage: React.FC<FlashMessageProps> = ({
  message,
  type,
  duration,
  onClose,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  const getMessageStyle = () => {
    switch (type) {
      case "success":
        return "bg-green-200";
      case "error":
        return "bg-red-200";
      case "info":
        return "bg-blue-200";
      case "warning":
        return "bg-yellow-200";
      default:
        return "";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-[#32AB78]"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="12" cy="12" r="9.75" fill="#FFFFFF" />
            <path
              fill="#32AB78"
              fillRule="evenodd"
              d="M2.25 12a9.75 9.75 0 1119.5 0 9.75 9.75 0 01-19.5 0zm13.03-3.78a.75.75 0 011.06 1.06l-5.25 5.25a.75.75 0 01-1.06 0l-2.25-2.25a.75.75 0 011.06-1.06l1.72 1.72 4.72-4.72z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "error":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-[#E53935]"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="12" cy="12" r="9.75" fill="#FFFFFF" />
            <path
              fill="#E53935"
              fillRule="evenodd"
              d="M8.47 8.47a.75.75 0 011.06 0L12 10.94l2.47-2.47a.75.75 0 111.06 1.06L13.06 12l2.47 2.47a.75.75 0 11-1.06 1.06L12 13.06l-2.47 2.47a.75.75 0 11-1.06-1.06L10.94 12 8.47 9.53a.75.75 0 010-1.06z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "info":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-[#1E88E5]"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="12" cy="12" r="9.75" fill="#FFFFFF" />
            <path
              fill="#1E88E5"
              fillRule="evenodd"
              d="M12 7.5a1 1 0 110 2 1 1 0 010-2zM11.25 11a.75.75 0 011.5 0v5a.75.75 0 01-1.5 0v-5z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "warning":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-[#FBC02D]"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="12" cy="12" r="9.75" fill="#FFFFFF" />
            <path
              fill="#FBC02D"
              fillRule="evenodd"
              d="M12 7.5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0112 7.5zm0 8a1 1 0 100 2 1 1 0 000-2z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed z-40 bottom-0 left-1/2 transform -translate-x-1/2 rounded-lg shadow-lg`}
    >
      <div
        className={`relative flex flex-row items-center rounded-lg shadow-lg w-[33.33vw] h-[80px] ${getMessageStyle()}`}
      >
        <div
          className={`static flex items-center justify-center h-20 w-20 rounded-full ${getMessageStyle()}`}
        >
          {getIcon()}
        </div>
        <div>
          <label className="text-[1.25em] font-medium">
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </label>
          <div className="font-medium text-[1em]">{message}</div>
        </div>

        <button
          className="absolute right-0 pr-8"
          onClick={() => {
            setVisible(false);
            if (onClose) onClose();
          }}
        >
          X
        </button>
      </div>
      <div
        className={`w-full h-[11px] ${
          type === "success"
            ? "bg-[#0BA555]"
            : type === "error"
            ? "bg-[#E53935]"
            : type === "info"
            ? "bg-[#1E88E5]"
            : "bg-[#FBC02D]"
        }`}
      ></div>
    </div>
  );
};

export default FlashMessage;
