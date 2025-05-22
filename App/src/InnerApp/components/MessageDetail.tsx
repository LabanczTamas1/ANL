import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import mockApi, { InboxItem } from "../mockApi";

interface MessageDetailProps {
  messageId?: string;
}

interface EmailMessage {
  id: string;
  fromId: string;
  fromName: string;
  fromEmail: string;
  recipient: string;
  subject: string;
  body: string;
  timeSended: string;
}


const MessageDetail = ({ messageId }: MessageDetailProps) => {
  const [message, setMessage] = useState<InboxItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("authToken");
  const params = useParams();
  const navigate = useNavigate();
  
  // Use messageId from props or from URL parameters (now named 'details')
  const id = messageId || params.details;

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
        
        setMessage(data.find((email: EmailMessage) => email.id === id));
      } catch (error) {
        console.error("Error fetching inbox data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchInboxData();
  }, [id]);

  const formatDate = (timestamp: string | null): string => {
    if (!timestamp) return "No date available";

    const date = new Date(Number(timestamp));
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleGoBack = () => {
    navigate("/home/mail/inbox");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white dark:bg-[#121212]">
        <div className="text-black dark:text-white text-xl">Loading message...</div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="flex justify-center items-center h-screen bg-white dark:bg-[#121212]">
        <div className="text-black dark:text-white text-xl">Message not found</div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-auto bg-white dark:bg-[#121212] p-4">
      <div className="bg-white dark:bg-[#1e1e1e] rounded-lg p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-black dark:text-white">{message.subject}</h1>
          <button 
            onClick={handleGoBack}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Close message"
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-black dark:text-white"
            >
              <path 
                d="M6.4 19L5 17.6L10.6 12L5 6.4L6.4 5L12 10.6L17.6 5L19 6.4L13.4 12L19 17.6L17.6 19L12 13.4L6.4 19Z" 
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        
        <div className="border-b border-gray-300 dark:border-gray-700 pb-4 mb-4">
          <div className="flex items-center mb-2">
            <span className="font-medium text-gray-600 dark:text-gray-300 mr-2">From:</span>
            <span className="text-black dark:text-white">{message.fromName} &lt;{message.fromEmail}&gt;</span>
          </div>
          <div className="flex items-center mb-2">
            <span className="font-medium text-gray-600 dark:text-gray-300 mr-2">To:</span>
            <span className="text-black dark:text-white">{message.recipient}</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-gray-600 dark:text-gray-300 mr-2">Date:</span>
            <span className="text-black dark:text-white">{formatDate(message.timeSended)}</span>
          </div>
        </div>
        
        <div className="prose prose-lg dark:prose-invert max-w-none text-black dark:text-white">
          <ReactMarkdown
            components={{
              a: ({children, ...props}) => (
                <a 
                  {...props} 
                  className="text-blue-500 hover:text-blue-700 underline" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              img: ({...props}) => (
                <img 
                  {...props} 
                  className="max-w-full h-auto rounded my-4" 
                  alt={props.alt || "Image"} 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "https://via.placeholder.com/600x300?text=Image+Not+Found";
                  }}
                />
              ),
            }}
          >
            {message.body}
          </ReactMarkdown>
        </div>

        <div className="mt-6 flex justify-between">
          <button 
            onClick={handleGoBack}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Back to Inbox
          </button>
          <div>
            <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition mr-2">
              Reply
            </button>
            <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition">
              Forward
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageDetail;