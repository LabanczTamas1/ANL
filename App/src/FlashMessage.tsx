import React, { useState, useEffect } from "react";

type FlashMessageProps = {
  message: string;
  type: "success" | "error" | "info" | "warning"; // Customize message types if needed
  duration: number; // Duration in milliseconds before the message disappears
};

const FlashMessage: React.FC<FlashMessageProps> = ({
  message,
  type,
  duration,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true); // Reset visibility whenever the message changes
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => clearTimeout(timer); // Cleanup timeout on component unmount
  }, [message, duration]); // Add `message` as a dependency

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

  return (
    visible && (
      <div
        className={`fixed z-40 bottom-0 left-1/2 transform -translate-x-1/2 rounded-lg shadow-lg`}
      >
        <div className={`relative flex flex-row items-center rounded-lg shadow-lg w-[33.33vw] h-[80px] ${getMessageStyle()}`}>
        <div className={`static flex items-center justify-center h-20 w-20 rounded-full ${getMessageStyle()}`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-[#32AB78]"
            viewBox="0 0 24 24"
            fill="none"  // Set fill to none for the whole SVG
          >
            <circle cx="12" cy="12" r="9.75" fill="#FFFFFF" /> {/* This keeps the circle's color unchanged */}
            <path
              fill="#32AB78" // Set the fill color of the icon inside to white
              fillRule="evenodd"
              d="M2.25 12a9.75 9.75 0 1119.5 0 9.75 9.75 0 01-19.5 0zm13.03-3.78a.75.75 0 011.06 1.06l-5.25 5.25a.75.75 0 01-1.06 0l-2.25-2.25a.75.75 0 011.06-1.06l1.72 1.72 4.72-4.72z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div>
          <label className="text-[1.25em] font-medium">{type.charAt(0).toUpperCase() + type.slice(1)}</label>
          <div className="font-medium color-[red] text-[1em]">{message}</div></div>
        
        <button className="absolute right-0 pr-8">X</button>
        </div>
        <div className="w-full h-[11px] bg-[#0BA555]">

        </div>
      </div>

    )
  );
};

export default FlashMessage;
