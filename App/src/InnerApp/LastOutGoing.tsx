import React, { useEffect, useState } from 'react'

interface InboxItem {
    fromEmail: string;
    fromName: string; // Sender's name
    recipient: string; // Recipient's email
    subject: string; // Subject of the email
    body: string; // Body of the email
    timeSended: string; // Timestamp as a string
  }

const LastOutComing = () => {

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
          const response = await fetch(`http://localhost:3000/sentmails/${username}`);
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
    <div>
       <div className="p-2 border-[1px] border-[#E5E6E7] rounded-lg">
            <h2 className="font-[800] text-[2.375em] pl-2">Last outgoing</h2>
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
  )
}

export default LastOutComing
