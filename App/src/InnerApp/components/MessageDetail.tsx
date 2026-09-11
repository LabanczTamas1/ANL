import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { InboxItem } from "../Inbox";
import { useLanguage } from "../../hooks/useLanguage";
import GradientButton from "./GradientButton";

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
  const { t } = useLanguage();
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
    if (!timestamp) return t("msgDetail.noDate");

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
      <div className="flex justify-center items-center h-screen bg-surface-light dark:bg-surface-dark">
        <div className="text-content dark:text-content-inverse text-xl">{t("msgDetail.loading")}</div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="flex justify-center items-center h-screen bg-surface-light dark:bg-surface-dark">
        <div className="text-content dark:text-content-inverse text-xl">{t("msgDetail.notFound")}</div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-auto bg-surface-light dark:bg-surface-dark p-4">
      <div className="bg-surface-light dark:bg-surface-elevated border border-line dark:border-line-dark rounded-2xl shadow-card dark:shadow-dark-card p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-content dark:text-content-inverse">{message.subject}</h1>
          <button 
            onClick={handleGoBack}
            className="p-2 rounded-full text-content dark:text-content-inverse hover:bg-brand/5 dark:hover:bg-brand/10 transition-colors"
            aria-label={t("msgDetail.closeMessage")}
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-content dark:text-content-inverse"
            >
              <path 
                d="M6.4 19L5 17.6L10.6 12L5 6.4L6.4 5L12 10.6L17.6 5L19 6.4L13.4 12L19 17.6L17.6 19L12 13.4L6.4 19Z" 
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        
        <div className="border-b border-line dark:border-line-dark pb-4 mb-4">
          <div className="flex items-center mb-2">
            <span className="font-medium text-content-muted mr-2">{t("msgDetail.from")}</span>
            <span className="text-content dark:text-content-inverse">{message.fromName} &lt;{message.fromEmail}&gt;</span>
          </div>
          <div className="flex items-center mb-2">
            <span className="font-medium text-content-muted mr-2">{t("msgDetail.to")}</span>
            <span className="text-content dark:text-content-inverse">{message.recipient}</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-content-muted mr-2">{t("msgDetail.date")}</span>
            <span className="text-content dark:text-content-inverse">{formatDate(message.timeSended)}</span>
          </div>
        </div>
        
        <div className="prose prose-lg dark:prose-invert max-w-none text-content dark:text-content-inverse">
          <ReactMarkdown
            components={{
              a: ({children, ...props}) => (
                <a 
                  {...props} 
                  className="text-brand dark:text-brand-focus hover:text-brand-hover underline" 
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
                  alt={props.alt || t("msgDetail.imageAlt")} 
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
          <GradientButton onClick={handleGoBack}>
            {t("msgDetail.backToInbox")}
          </GradientButton>
          <div className="flex gap-2">
            <GradientButton>
              {t("msgDetail.reply")}
            </GradientButton>
            <GradientButton>
              {t("msgDetail.forward")}
            </GradientButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageDetail;