import React, { useState, useEffect } from 'react';

type FlashMessageProps = {
  message: string;
  type: 'success' | 'error' | 'info'; // Customize message types if needed
  duration: number; // Duration in milliseconds before the message disappears
};

const FlashMessage: React.FC<FlashMessageProps> = ({ message, type, duration }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => clearTimeout(timer); // Cleanup timeout on component unmount
  }, [duration]);

  const getMessageStyle = () => {
    switch (type) {
      case 'success':
        return 'bg-green-200 text-green-800';
      case 'error':
        return 'bg-red-200 text-red-800';
      case 'info':
        return 'bg-blue-200 text-blue-800';
      default:
        return '';
    }
  };

  return (
    visible && (
      <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-lg ${getMessageStyle()}`}>
        <div className="font-semibold">{message}</div>
      </div>
    )
  );
};

export default FlashMessage;
