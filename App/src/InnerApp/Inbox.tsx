import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import ProgressBar from "./ProgressBar";
import LastOutGoing from "./LastOutGoing";

interface InboxItem {
  fromEmail: string;
  fromName: string; // Sender's name
  recipient: string; // Recipient's email
  subject: string; // Subject of the email
  body: string; // Body of the email
  timeSended: string; // Timestamp as a string
}

const Inbox = () => {
  const [inboxData, setInboxData] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchInboxData = async () => {
      const username = localStorage.getItem("name");
      if (!username) {
        console.error("Username not found in localStorage");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`http://localhost:3000/inbox/${username}`);
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
  }, []);

  const formatDate = (timestamp: string | null): string => {
    if (!timestamp) return "No date available";

    const date = new Date(Number(timestamp)); // Convert string to number
    const today = new Date();

    // Check if the date is today
    const isToday =
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();

    if (isToday) {
      // Format as time for "delivered today"
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }

    // Format as "YYYY. MMM DD." for other dates
    return `${date.getFullYear()}. ${date.toLocaleString("en-US", {
      month: "short",
    })} ${date.getDate()}.`;
  };

  return (
    <div className="h-screen bg-white dark:bg-[#121212]">
      <div className="flex flex-row w-full bg-[#1D2431] pt-3 h-full">
        <Sidebar />
        <div className="bg-white dark:bg-[#1e1e1e] w-full rounded-tl-lg">
          <ProgressBar />
          <div className="p-4 text-black dark:text-white">
            <div className="flex flex-row items-center">
              <svg
                className="mt-2"
                width="33"
                height="33"
                viewBox="0 0 33 33"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.5 27.5C4.74375 27.5 4.09635 27.2307 3.55781 26.6922C3.01927 26.1536 2.75 25.5063 2.75 24.75V8.25C2.75 7.49375 3.01927 6.84635 3.55781 6.30781C4.09635 5.76927 4.74375 5.5 5.5 5.5H27.5C28.2563 5.5 28.9036 5.76927 29.4422 6.30781C29.9807 6.84635 30.25 7.49375 30.25 8.25V24.75C30.25 25.5063 29.9807 26.1536 29.4422 26.6922C28.9036 27.2307 28.2563 27.5 27.5 27.5H5.5ZM16.5 17.875L5.5 11V24.75H27.5V11L16.5 17.875ZM16.5 15.125L27.5 8.25H5.5L16.5 15.125ZM5.5 11V8.25V24.75V11Z"
                  fill="#1D1B20"
                />
              </svg>
              <h2 className="font-[800] text-[2.375em] pl-2">Inbox</h2>
            </div>

            <LastOutGoing />

            <div className="p-2 border-[1px] border-[#E5E6E7] rounded-lg">
              <h2 className="font-[800] text-[2.375em] pl-2">Inbox</h2>

              <div className="max-h-96 overflow-y-auto">
              {/* Display loading state */}
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : !Array.isArray(inboxData) || inboxData.length === 0 ? (
                <div className="text-center py-4">No data available</div>
              ) : (
                inboxData.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-row justify-between px-2 py-2 border-2 border-[#E5E6E7] rounded-lg hover:bg-[#808080]"
                  >
                    <div className="flex-2">
                      <input type="checkbox" aria-label="Select message" />
                    </div>
                    <div className="flex-1 px-2">
                      {item.fromEmail || "No email available"}
                    </div>
                    <div className="flex-1 px-2">
                      {item.fromName || "No name available"}
                    </div>
                    <div className="flex-1 px-2">
                      {item.subject || "No subject"}
                    </div>
                    <div className="flex-1 px-2">
                      {item.body ? item.body.slice(0, 30) : "No message available"}...
                    </div>
                    <div className="flex-1 ml-auto px-2 text-right">
                      {formatDate(item.timeSended || null)}
                    </div>
                  </div>
                ))
              )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inbox;
