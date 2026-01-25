import React, { useEffect, useState } from "react";
import { InboxItem } from "./Inbox";
import SentRowItem from "./components/SentRowItem";

const SentEmails = () => {
  const [inboxData, setInboxData] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchInboxData = async () => {
      const username = localStorage.getItem("name");
      if (!username) {
        console.error("Username not found in localStorage");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/sentmails/${username}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data: InboxItem[] = await response.json();
          setInboxData(data);
        } else {
          console.error("Failed to fetch inbox data");
        }
      } catch (error) {
        console.error("Error fetching inbox data:", error);
      }
      setLoading(false);
    };

    fetchInboxData();
  }, [token]);

  const formatDate = (timestamp: string | null): string => {
    if (!timestamp) return "No date available";

    const date = new Date(Number(timestamp));
    const today = new Date();

    const isToday =
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();

    if (isToday) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }

    return `${date.getFullYear()}. ${date.toLocaleString("en-US", {
      month: "short",
    })} ${date.getDate()}.`;
  };

  return (
    <div className="p-2 border-[1px] border-[#E5E6E7] dark:border-gray-700 rounded-lg">
      <h2 className="font-[800] text-[2.375em] pl-2 mb-2">Last outgoing</h2>
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : !Array.isArray(inboxData) || inboxData.length === 0 ? (
        <div className="text-center py-4">No data available</div>
      ) : (
        inboxData.map((item, index) => (
          <SentRowItem key={index} item={item} formatDate={formatDate} />
        ))
      )}
    </div>
  );
};

export default SentEmails;