import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
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
  const esRef = useRef<EventSource | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, [API_BASE_URL]);

  // Connect to SSE for real-time push updates; fall back to fetchUnreadCount
  // when the tab regains focus after the connection was closed.
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const connect = () => {
      if (retryRef.current) {
        clearTimeout(retryRef.current);
        retryRef.current = null;
      }

      const es = new EventSource(
        `${API_BASE_URL}/inbox/updates/stream?token=${encodeURIComponent(token)}`
      );
      esRef.current = es;

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (typeof data.count === "number") {
            setUnreadEmailCount(data.count);
          }
        } catch (_) { /* ignore malformed frames */ }
      };

      es.onerror = () => {
        es.close();
        esRef.current = null;
        // Retry connection after 30 s
        retryRef.current = setTimeout(connect, 30_000);
      };
    };

    connect();

    // Fallback: re-fetch when the browser tab becomes visible again
    // (handles the case where the SSE stream was idle / reconnecting)
    const handleVisibility = () => {
      if (!document.hidden) fetchUnreadCount();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      esRef.current?.close();
      esRef.current = null;
      if (retryRef.current) clearTimeout(retryRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [API_BASE_URL, fetchUnreadCount]);

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
