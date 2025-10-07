import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LastOutGoing from "./SentEmails";
import InboxRowItem from "./components/InboxRowItem";
import ConfirmModal from "./components/ConfirmModal";
import { useNotification } from "../contexts/NotificationContext";

export interface InboxItem {
  id: string;
  fromEmail: string;
  fromName: string;
  subject: string;
  body: string;
  timeSended: string | null;
  isRead: string;
  fromId?: string;
  recipient?: string;
}

const Inbox = () => {
  const [inboxData, setInboxData] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);

  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("authToken");
  const { fetchUnreadCount } = useNotification();

  useEffect(() => {
    const fetchInboxData = async () => {
      const username = localStorage.getItem("name") || "testuser";

      try {
        const response = await fetch(`${API_BASE_URL}/inbox/${username}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();

        const sortedData = [...data].sort((a, b) => {
          const timeA = a.timeSended ? Number(a.timeSended) : 0;
          const timeB = b.timeSended ? Number(b.timeSended) : 0;
          return timeB - timeA;
        });

        setInboxData(sortedData);
        fetchUnreadCount();
      } catch (error) {
        console.error("Error fetching inbox data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInboxData();
  }, []);

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    emailId: string
  ) => {
    e.stopPropagation();
    setSelectedEmails((prev) =>
      prev.includes(emailId)
        ? prev.filter((id) => id !== emailId)
        : [...prev, emailId]
    );
  };

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

  const handleDeleteSelected = async () => {
    if (selectedEmails.length === 0) return;
    const currentUsername = localStorage.getItem("name") || "testuser";

    try {
      const response = await fetch(`${API_BASE_URL}/api/delete-emails`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailIds: selectedEmails,
          username: currentUsername,
        }),
      });

      if (response.ok) {
        setInboxData((prevData) =>
          prevData.filter((item) => !selectedEmails.includes(item.id))
        );
        setSelectedEmails([]);
        fetchUnreadCount();
      } else {
        console.error("Failed to delete emails");
      }
    } catch (error) {
      console.error("Error deleting emails:", error);
    }
  };

  const handleDeleteSingle = async (emailId: string) => {
    const currentUsername = localStorage.getItem("name") || "testuser";
    try {
      const response = await fetch(`${API_BASE_URL}/api/delete-emails`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailIds: [emailId],
          username: currentUsername,
        }),
      });

      if (response.ok) {
        setInboxData((prevData) =>
          prevData.filter((item) => item.id !== emailId)
        );
        setSelectedEmails((prev) => prev.filter((id) => id !== emailId));
        fetchUnreadCount();
      } else {
        console.error("Failed to delete email");
      }
    } catch (error) {
      console.error("Error deleting email:", error);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedEmails(inboxData.map((item) => item.id));
    } else {
      setSelectedEmails([]);
    }
  };

  const handleMessageClick = async (messageId: string) => {
    try {
      if (selectedEmails.includes(messageId)) return;
      const currentUsername = localStorage.getItem("name") || "testuser";

      await fetch(`${API_BASE_URL}/api/mark-as-read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailIds: [messageId],
          username: currentUsername,
        }),
      });

      setInboxData((prevData) =>
        prevData.map((item) =>
          item.id === messageId ? { ...item, isRead: "true" } : item
        )
      );

      fetchUnreadCount();
      navigate(`/home/mail/inbox/${messageId}`);
    } catch (error) {
      console.error("Error marking message as read:", error);
      navigate(`/home/mail/inbox/${messageId}`);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212]">
      <div className="bg-white dark:bg-[#1e1e1e] w-full rounded-tl-lg">
        <div className="p-4 text-black dark:text-white">
          {/* Header */}
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
              <h2 className="font-bold text-xl md:text-2xl lg:text-4xl pl-2">
                Inbox
              </h2>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate("/home/mail/send")}
                className="flex items-center px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
              >
                <svg
                  className="w-5 h-5 mr-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Write Mail
              </button>

              {selectedEmails.length > 0 && (
                <button
                  onClick={() => setBulkDeleteModal(true)}
                  className="flex items-center p-2 bg-red-500 hover:bg-red-600 text-white rounded"
                >
                  <svg
                    className="w-5 h-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
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
              )}
            </div>
          </div>

          {/* Main Inbox */}
          <div className="p-2 border border-[#E5E6E7] dark:border-gray-700 rounded-lg mt-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-xl md:text-2xl lg:text-4xl pl-2">
                Inbox
              </h2>

              <div className="flex items-center">
                <div className="mr-4 flex items-center">
                  <input
                    type="checkbox"
                    id="selectAll"
                    checked={
                      selectedEmails.length === inboxData.length &&
                      inboxData.length > 0
                    }
                    onChange={handleSelectAll}
                    className="mr-2"
                  />
                  <label htmlFor="selectAll" className="text-sm">
                    Select All
                  </label>
                </div>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : !Array.isArray(inboxData) || inboxData.length === 0 ? (
                <div className="text-center py-4">You don't have any emails yet.</div>
              ) : (
                inboxData.map((item) => (
                  <InboxRowItem
                    key={item.id}
                    item={item}
                    isSelected={selectedEmails.includes(item.id)}
                    onCheckboxChange={handleCheckboxChange}
                    onMessageClick={handleMessageClick}
                    onDelete={handleDeleteSingle}
                    formatDate={formatDate}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={bulkDeleteModal}
        onClose={() => setBulkDeleteModal(false)}
        onConfirm={handleDeleteSelected}
        question={`Are you sure you want to delete ${selectedEmails.length} message(s)?`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Inbox;
