import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface NotificationContextType {
  unreadEmailCount: number;
  setUnreadEmailCount: (count: number) => void;
  fetchUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [unreadEmailCount, setUnreadEmailCount] = useState<number>(0);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("authToken");

  const fetchUnreadCount = async () => {
    const username = localStorage.getItem("name") || localStorage.getItem("userName");
    
    try {
      const response = await fetch(`${API_BASE_URL}/inbox/${username}/unread-count`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUnreadEmailCount(data.count);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // Initial fetch on load
  useEffect(() => {
    fetchUnreadCount();
    
    // Set up polling every 60 seconds
    const interval = setInterval(fetchUnreadCount, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadEmailCount, setUnreadEmailCount, fetchUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};