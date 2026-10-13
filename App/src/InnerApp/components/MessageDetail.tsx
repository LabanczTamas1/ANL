import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { InboxItem } from "../Inbox";
import { useLanguage } from "../../hooks/useLanguage";
import { parseTimestamp } from "../../utils/parseTimestamp";
import {
  Badge,
  Button,
  Card,
  Heading,
  IconButton,
  Spinner,
  Text,
  cn,
} from "@design-system/components";

interface MessageDetailProps {
  messageId?: string;
}

/**
 * Build a quoted copy of the original message, used to prefill the compose
 * form when replying or forwarding.
 */
const buildQuotedBody = (message: InboxItem): string => {
  const date = parseTimestamp(message.timeSended);
  const when = date ? date.toLocaleString("en-US") : "";
  const header = `--- ${message.fromName} <${message.fromEmail}>${when ? ` · ${when}` : ""} ---`;
  const quoted = (message.body ?? "")
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
  return `${header}\n${quoted}`;
};

const markdownComponents = (t: (key: string) => string) => ({
  a: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      {...props}
      className="text-brand dark:text-brand-focus hover:text-brand-hover underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  img: ({ ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img
      {...props}
      className="max-w-full h-auto rounded-lg my-4"
      alt={props.alt || t("msgDetail.imageAlt")}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.onerror = null;
        target.src = "https://via.placeholder.com/600x300?text=Image+Not+Found";
      }}
    />
  ),
});

const MessageDetail = ({ messageId }: MessageDetailProps) => {
  const { t } = useLanguage();
  const [message, setMessage] = useState<InboxItem | null>(null);
  const [thread, setThread] = useState<InboxItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("authToken");
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // A sent message isn't in the inbox list, so SentRowItem passes the full
  // item via router state to use as a fallback when the inbox lookup misses.
  const stateMessage = (location.state as { message?: InboxItem } | null)?.message ?? null;

  // Use messageId from props or from URL parameters (now named 'details')
  const id = messageId || params.details;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const username = localStorage.getItem("name") || "testuser";

      try {
        const response = await fetch(`${API_BASE_URL}/inbox/${username}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data: unknown = await response.json();
        const list: InboxItem[] = Array.isArray(data) ? data : [];
        const current = list.find((email) => email.id === id) ?? stateMessage;
        setMessage(current);
        setExpandedId(current?.id ?? null);

        const conversationId = current?.threadId ?? current?.id;
        if (current && conversationId) {
          try {
            const threadRes = await fetch(
              `${API_BASE_URL}/inbox/thread/${conversationId}?username=${encodeURIComponent(username)}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              },
            );
            if (threadRes.ok) {
              const threadData: InboxItem[] = await threadRes.json();
              setThread(
                Array.isArray(threadData) && threadData.length > 0
                  ? threadData
                  : [current],
              );
            } else {
              setThread([current]);
            }
          } catch {
            setThread([current]);
          }
        } else if (current) {
          setThread([current]);
        }
      } catch (error) {
        console.error("Error fetching message:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const formatDate = (timestamp: string | null): string => {
    const date = parseTimestamp(timestamp);
    if (!date) return t("msgDetail.noDate");

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
    navigate(stateMessage?.source === "sent" ? "/home/mail/last-outgoing" : "/home/mail/inbox");
  };

  const handleReply = () => {
    if (!message) return;
    const subject = message.subject?.startsWith("Re: ")
      ? message.subject
      : `Re: ${message.subject ?? ""}`;
    const quoted = buildQuotedBody(message);
    navigate("/home/mail/send", {
      state: {
        recipient: message.fromEmail,
        subject,
        body: `\n\n${quoted}`,
        threadId: message.threadId ?? message.id,
        parentId: message.id,
      },
    });
  };

  const handleForward = () => {
    if (!message) return;
    const subject = message.subject?.startsWith("Fwd: ")
      ? message.subject
      : `Fwd: ${message.subject ?? ""}`;
    const quoted = buildQuotedBody(message);
    navigate("/home/mail/send", {
      state: {
        recipient: "",
        subject,
        body: `\n\n${quoted}`,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-surface-light dark:bg-surface-dark">
        <div className="flex items-center gap-3 text-content dark:text-content-inverse">
          <Spinner size="lg" className="text-brand" label={t("msgDetail.loading")} />
          <Text>{t("msgDetail.loading")}</Text>
        </div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="flex justify-center items-center h-screen bg-surface-light dark:bg-surface-dark">
        <Text size="lg">{t("msgDetail.notFound")}</Text>
      </div>
    );
  }

  const isThreaded = thread.length > 1;

  return (
    <div className="h-screen overflow-auto bg-surface-light dark:bg-surface-dark p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start gap-4 mb-6">
          <div className="min-w-0">
            <Heading level={1} className="truncate">
              {message.subject || t("inboxRow.noSubject")}
            </Heading>
            {isThreaded && (
              <div className="mt-2">
                <Badge tone="brand" pill>
                  {t("msgDetail.messagesInThread", { count: String(thread.length) })}
                </Badge>
              </div>
            )}
          </div>
          <IconButton
            variant="ghost"
            onClick={handleGoBack}
            aria-label={t("msgDetail.closeMessage")}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6.4 19L5 17.6L10.6 12L5 6.4L6.4 5L12 10.6L17.6 5L19 6.4L13.4 12L19 17.6L17.6 19L12 13.4L6.4 19Z"
                fill="currentColor"
              />
            </svg>
          </IconButton>
        </div>

        {/* Conversation */}
        <div className="space-y-3">
          {thread.map((entry) => {
            const expanded = isThreaded ? expandedId === entry.id : true;
            const isSent = entry.source === "sent";
            return (
              <Card key={entry.id} padding="none" className="overflow-hidden">
                {/* Message header row */}
                <button
                  type="button"
                  onClick={() =>
                    isThreaded
                      ? setExpandedId((prev) => (prev === entry.id ? null : entry.id))
                      : undefined
                  }
                  className={cn(
                    "w-full flex items-center justify-between gap-3 px-5 py-4 text-left",
                    isThreaded && "hover:bg-black/[0.03] dark:hover:bg-white/5 transition-colors",
                  )}
                  aria-expanded={expanded}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                        isSent
                          ? "bg-brand-muted text-brand dark:text-brand-focus"
                          : "bg-black/[0.06] text-content-subtle dark:bg-white/10 dark:text-content-subtle-inverse",
                      )}
                      aria-hidden="true"
                    >
                      {(entry.fromName || "?").charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Text className="font-semibold truncate">
                          {entry.fromName || t("inboxRow.noName")}
                        </Text>
                        <Badge tone={isSent ? "brand" : "neutral"} size="sm">
                          {isSent ? t("msgDetail.sent") : t("msgDetail.received")}
                        </Badge>
                      </div>
                      <Text tone="muted" size="xs" className="truncate">
                        {entry.fromEmail || t("inboxRow.noEmail")}
                      </Text>
                    </div>
                  </div>
                  <Text tone="muted" size="xs" className="whitespace-nowrap shrink-0">
                    {formatDate(entry.timeSended)}
                  </Text>
                </button>

                {expanded && (
                  <div className="px-5 pb-5">
                    <div className="border-t border-line dark:border-line-dark pt-4 prose prose-sm sm:prose-base dark:prose-invert max-w-none text-content dark:text-content-inverse">
                      <ReactMarkdown components={markdownComponents(t)}>
                        {entry.body}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Button variant="secondary" onClick={handleGoBack}>
            {t("msgDetail.backToInbox")}
          </Button>
          <div className="flex gap-2">
            <Button variant="primary" onClick={handleReply}>
              {t("msgDetail.reply")}
            </Button>
            <Button variant="outline" onClick={handleForward}>
              {t("msgDetail.forward")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageDetail;