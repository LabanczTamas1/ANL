import React, { useState, useEffect } from "react";

type FlashMessageProps = {
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration: number;
  trigger?: number | string;
};

const FlashMessage: React.FC<FlashMessageProps> = ({
  message,
  type,
  duration,
  trigger,
}) => {
  const [visible, setVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setVisible(true);
    setAnimateOut(false);
    const timer = setTimeout(() => {
      setAnimateOut(true);
      setTimeout(() => setVisible(false), 400);
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, trigger]);

  const getMessageStyle = () => {
    switch (type) {
      case "success":
        return "bg-green-200 border-green-500 text-green-800";
      case "error":
        return "bg-red-200 border-red-500 text-red-800";
      case "info":
        return "bg-blue-200 border-blue-500 text-blue-800";
      case "warning":
        return "bg-yellow-200 border-yellow-500 text-yellow-900";
      default:
        return "";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9.75" fill="#FFFFFF" />
            <path fill="#32AB78" fillRule="evenodd" d="M2.25 12a9.75 9.75 0 1119.5 0 9.75 9.75 0 01-19.5 0zm13.03-3.78a.75.75 0 011.06 1.06l-5.25 5.25a.75.75 0 01-1.06 0l-2.25-2.25a.75.75 0 011.06-1.06l1.72 1.72 4.72-4.72z" clipRule="evenodd" />
          </svg>
        );
      case "error":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9.75" fill="#FFFFFF" />
            <path fill="#EF4444" fillRule="evenodd" d="M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5zm-2.47 12.22a.75.75 0 001.06 1.06L12 13.06l1.41 1.41a.75.75 0 101.06-1.06L13.06 12l1.41-1.41a.75.75 0 10-1.06-1.06L12 10.94l-1.41-1.41a.75.75 0 10-1.06 1.06L10.94 12l-1.41 1.41z" clipRule="evenodd" />
          </svg>
        );
      case "info":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9.75" fill="#FFFFFF" />
            <path fill="#2563EB" fillRule="evenodd" d="M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5zm0 5.25a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zm-1 4.25a1 1 0 112 0v4a1 1 0 11-2 0v-4z" clipRule="evenodd" />
          </svg>
        );
      case "warning":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9.75" fill="#FFFFFF" />
            <path fill="#F59E42" fillRule="evenodd" d="M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5zm0 5.5a1 1 0 01.993.883L13 8.75v4.5a1 1 0 01-1.993.117L11 13.25v-4.5a1 1 0 011-1zm0 8.25a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    visible && (
      <div
        className={`fixed z-40 transition-all duration-500 ease-in-out
          ${isMobile
            ? 'top-4 left-0 right-0 mx-auto max-w-[95vw] rounded-lg animate-slideDownToastMobile' + (animateOut ? ' animate-slideUpToastMobile' : '')
            : 'bottom-0 left-0 right-0 mx-auto w-[33.33vw] rounded-t-lg rounded-b-none animate-slideUpDesktop' + (animateOut ? ' animate-slideDownDesktop' : '')
          }
          border-2 ${getMessageStyle()}`}
      >
        <div className={`relative flex flex-row items-center shadow-lg h-[80px] ${isMobile ? 'rounded-lg' : 'rounded-t-lg rounded-b-none'}`}>
          <div className="static flex items-center justify-center h-20 w-20">{getIcon()}</div>
          <div>
            <label className="text-[1.25em] font-medium">{type.charAt(0).toUpperCase() + type.slice(1)}</label>
            <div className="font-medium text-[1em]">{message}</div>
          </div>
          <button className="absolute right-0 pr-8" onClick={() => { setAnimateOut(true); setTimeout(() => setVisible(false), 400); }}>X</button>
        </div>
        <div className={`w-full h-[11px] ${
          type === "success" ? "bg-green-500" :
          type === "error" ? "bg-red-500" :
          type === "info" ? "bg-blue-500" :
          type === "warning" ? "bg-yellow-500" : "bg-gray-300"
        } ${isMobile ? 'rounded-b-lg' : 'rounded-b-none'}`}></div>
      </div>
    )
  );
};

export default FlashMessage;
