import React from 'react';

interface NotificationBadgeProps {
  count: number;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count }) => {
  if (count <= 0) return null;
  
  return (
    <span className="relative inline-flex items-center">
      <span className="ml-1 inline-flex items-center justify-center h-5 min-w-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
        {count > 99 ? '99+' : count}
      </span>
    </span>
  );
};

export default NotificationBadge;