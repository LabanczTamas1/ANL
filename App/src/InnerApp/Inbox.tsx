import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LastOutGoing from "./LastOutGoing";
// Define the InboxItem interface directly
interface InboxItem {
  id: string;
  fromEmail: string;
  fromName: string;
  subject: string;
  body: string;
  timeSended: string | null;
  isRead: string; // Changed to string since API returns "false"/"true" as strings
  fromId?: string;
  recipient?: string;
}
import { useNotification } from "../contexts/NotificationContext";

const Inbox = () => {
  const [inboxData, setInboxData] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("authToken");
  const { fetchUnreadCount } = useNotification();

  useEffect(() => {
    const fetchInboxData = async () => {
      const username = localStorage.getItem("name") || "testuser";
  
      try {
        const response = await fetch(`${API_BASE_URL}/inbox/${username}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        console.log(data);
        
        // Sort messages by timeSended to show newest first
        const sortedData = [...data].sort((a, b) => {
          const timeA = a.timeSended ? Number(a.timeSended) : 0;
          const timeB = b.timeSended ? Number(b.timeSended) : 0;
          return timeB - timeA; // Descending order (newest first)
        });
        
        setInboxData(sortedData);
        
        // Fetch updated unread count after loading inbox
        fetchUnreadCount();
      } catch (error) {
        console.error("Error fetching inbox data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchInboxData();
  }, []);

  // Handle checkbox selection
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, emailId: string) => {
    e.stopPropagation(); // Prevent triggering the row click
    
    setSelectedEmails(prev => {
      if (prev.includes(emailId)) {
        return prev.filter(id => id !== emailId);
      } else {
        return [...prev, emailId];
      }
    });
  };

  const formatDate = (timestamp: string | null): string => {
    if (!timestamp) return "No date available";

    const date = new Date(Number(timestamp));
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
  
  // Handle delete selected emails
  const handleDeleteSelected = async () => {
    if (selectedEmails.length === 0) return;
    
    const currentUsername = localStorage.getItem("name") || "testuser";
    
    try {
      // Call API to delete emails
      const response = await fetch(`${API_BASE_URL}/api/delete-emails`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailIds: selectedEmails,
          username: currentUsername
        }),
      });
      
      if (response.ok) {
        // Remove deleted emails from UI
        setInboxData(prevData => 
          prevData.filter(item => !selectedEmails.includes(item.id))
        );
        // Clear selection
        setSelectedEmails([]);
        // Update unread count if any unread emails were deleted
        fetchUnreadCount();
      } else {
        console.error("Failed to delete emails");
      }
    } catch (error) {
      console.error("Error deleting emails:", error);
    }
  };
  
  // Select all emails
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedEmails(inboxData.map(item => item.id));
    } else {
      setSelectedEmails([]);
    }
  };
  // Update the handleMessageClick to mark messages as read
  const handleMessageClick = async (messageId: string) => {
    try {
      // Skip navigation if the message is selected
      if (selectedEmails.includes(messageId)) {
        return;
      }
      
      // Get current username from wherever it's stored in your app
      // This could be from Redux/Context state, localStorage, or wherever you store the current user
      const currentUsername = localStorage.getItem("name") || "testuser";
      // Update the endpoint to match the backend route
      await fetch(`${API_BASE_URL}/api/mark-as-read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          emailIds: [messageId],
          username: currentUsername // Add the username parameter
        }),
      });
      
      // Update local state to mark the message as read
      setInboxData(prevData => 
        prevData.map(item => 
          item.id === messageId ? { ...item, isRead: "true" } : item
        )
      );
      
      // Update unread count after marking as read
      fetchUnreadCount();
      
      // Navigate to message details
      navigate(`/home/mail/inbox/${messageId}`);
    } catch (error) {
      console.error("Error marking message as read:", error);
      // Still navigate even if there's an error
      navigate(`/home/mail/inbox/${messageId}`);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212]">
      <div className="bg-white dark:bg-[#1e1e1e] w-full rounded-tl-lg">
        <div className="p-4 text-black dark:text-white">
          <div className="flex flex-row mb-2 items-center justify-between">
            <div className="flex items-center">
              <svg
                className="mt-2 w-6 h-6 md:w-8 md:h-8"
                viewBox="0 0 33 33"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.5 27.5C4.74375 27.5 4.09635 27.2307 3.55781 26.6922C3.01927 26.1536 2.75 25.5063 2.75 24.75V8.25C2.75 7.49375 3.01927 6.84635 3.55781 6.30781C4.09635 5.76927 4.74375 5.5 5.5 5.5H27.5C28.2563 5.5 28.9036 5.76927 29.4422 6.30781C29.9807 6.84635 30.25 7.49375 30.25 8.25V24.75C30.25 25.5063 29.9807 26.1536 29.4422 26.6922C28.9036 27.2307 28.2563 27.5 27.5 27.5H5.5ZM16.5 17.875L5.5 11V24.75H27.5V11L16.5 17.875ZM16.5 15.125L27.5 8.25H5.5L16.5 15.125ZM5.5 11V8.25V24.75V11Z"
                  fill="currentColor"
                />
              </svg>
              <h2 className="font-bold text-xl md:text-2xl lg:text-4xl pl-2">Inbox</h2>
            </div>

            
            
            {selectedEmails.length > 0 && (
              <div className="flex items-center">
                <button 
                  onClick={handleDeleteSelected}
                  className="flex items-center p-2 bg-red-500 hover:bg-red-600 text-white rounded"
                >
                  <svg 
                    className="w-5 h-5 mr-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete ({selectedEmails.length})
                </button>
              </div>
            )}
          </div>

          <LastOutGoing />

          <div className="p-2 border border-[#E5E6E7] dark:border-gray-700 rounded-lg mt-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-xl md:text-2xl lg:text-4xl pl-2">Inbox</h2>
              
              <div className="flex items-center">
                <div className="mr-4 flex items-center">
                  <input 
                    type="checkbox" 
                    id="selectAll" 
                    checked={selectedEmails.length === inboxData.length && inboxData.length > 0}
                    onChange={handleSelectAll}
                    className="mr-2"
                  />
                  <label htmlFor="selectAll" className="text-sm">Select All</label>
                </div>
              </div>
            </div>

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
                    className={`border-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer mb-2 ${
                      item.isRead === "false" 
                        ? 'border-blue-500 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-[#E5E6E7] dark:border-gray-700'
                    }`}
                    onClick={() => handleMessageClick(item.id)}
                  >
                    {/* Desktop view */}
                    <div className="hidden md:flex flex-row justify-between px-2 py-2">
                      <div 
                        className="flex-none pr-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input 
                          type="checkbox" 
                          checked={selectedEmails.includes(item.id)}
                          onChange={(e) => handleCheckboxChange(e, item.id)}
                          aria-label="Select message" 
                        />
                      </div>
                      <div className="flex-1 px-2 truncate">
                        {item.fromEmail || "No email available"}
                      </div>
                      <div className="flex-1 px-2 truncate">
                        {item.isRead === "false" && (
                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        )}
                        <span className={`${item.isRead === "false" ? 'font-bold' : ''}`}>
                          {item.fromName || "No name available"}
                        </span>
                      </div>
                      <div className={`flex-1 px-2 truncate ${item.isRead === "false" ? 'font-bold' : 'font-medium'}`}>
                        {item.subject || "No subject"}
                      </div>
                      <div className={`flex-1 px-2 truncate ${item.isRead === "false" ? 'text-black dark:text-white font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                        {item.body
                          ? item.body.replace(/#|```|\*\*/g, '').slice(0, 30) + (item.body.length > 30 ? "..." : "")
                          : "No message available"}
                      </div>
                      <div className="flex-none ml-auto px-2 text-right whitespace-nowrap">
                        {item.isRead === "false" && (
                          <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                        )}
                        {formatDate(item.timeSended || null)}
                      </div>
                    </div>
                    
                    {/* Mobile view */}
                    <div className="md:hidden p-3">
                      <div className="flex justify-between items-center mb-1">
                        <div className={`font-medium text-sm truncate flex-1 ${!item.isRead ? 'font-bold' : ''}`}>
                          {!item.isRead && (
                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          )}
                          {item.fromName || "No name available"}
                        </div>
                        <div className="text-xs text-gray-500 ml-2 flex items-center">
                          {!item.isRead && (
                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                          )}
                          {formatDate(item.timeSended || null)}
                        </div>
                      </div>
                      
                      <div className={`truncate mb-1 ${!item.isRead ? 'font-bold' : 'font-medium'}`}>
                        {item.subject || "No subject"}
                      </div>
                      
                      <div className={`text-sm truncate ${!item.isRead ? 'text-black dark:text-white font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                        {item.body
                          ? item.body.replace(/#|```|\*\*/g, '').slice(0, 60) + (item.body.length > 60 ? "..." : "")
                          : "No message available"}
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-1 truncate">
                        {item.fromEmail || "No email available"}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inbox;