import { useEffect, useState } from "react";
import { InboxItem } from "./Inbox";
import SentRowItem from "./components/SentRowItem";
import { useLanguage } from "../hooks/useLanguage";
import { parseTimestamp } from "../utils/parseTimestamp";
import { Card, Heading, Spinner, Text } from "@design-system/components";

const SentEmails = () => {
  const { t } = useLanguage();
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
        const response = await fetch(`${API_BASE_URL}/api/email/sentmails/${username}`, {
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
    const date = parseTimestamp(timestamp);
    if (!date) return t("msgDetail.noDate");

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
    <Card padding="sm" className="text-content dark:text-content-inverse">
      <Heading level={2} className="mb-3 px-1">{t("sentEmails.title")}</Heading>
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8">
          <Spinner className="text-brand" label={t("sentEmails.loading")} />
          <Text tone="muted">{t("sentEmails.loading")}</Text>
        </div>
      ) : !Array.isArray(inboxData) || inboxData.length === 0 ? (
        <Text tone="muted" className="text-center py-8">{t("sentEmails.noData")}</Text>
      ) : (
        inboxData.map((item, index) => (
          <SentRowItem key={index} item={item} formatDate={formatDate} />
        ))
      )}
    </Card>
  );
};

export default SentEmails;