import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";

interface NotificationContextType {
  unreadEmailCount: number;
  fetchUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [unreadEmailCount, setUnreadEmailCount] = useState<number>(0);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // useCallback ensures the function is stable for useEffect
  const fetchUnreadCount = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    const username =
      localStorage.getItem("name") || localStorage.getItem("userName");

    if (!token || !username) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/inbox/unread-count?username=${encodeURIComponent(
          username
        )}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUnreadEmailCount(data.count);
      } else {
        console.warn("Failed to fetch unread count:", response.status);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, [API_BASE_URL]);

  // Initial fetch and polling
  useEffect(() => {
    fetchUnreadCount(); // fetch immediately

    const interval = setInterval(fetchUnreadCount, 60000); // fetch every 60 seconds
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{ unreadEmailCount, fetchUnreadCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};
