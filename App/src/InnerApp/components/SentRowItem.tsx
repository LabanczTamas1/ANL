import React from "react";
import { InboxItem } from "../Inbox"; // ✅ reuse the same type
import { useLanguage } from "../../hooks/useLanguage";
import { Text } from "@design-system/components";

interface SentRowItemProps {
  item: InboxItem;
  formatDate: (timestamp: string | null) => string;
}

const SentRowItem: React.FC<SentRowItemProps> = ({ item, formatDate }) => {
  const { t } = useLanguage();
  return (
    <div className="relative border border-line dark:border-line-dark border-l-4 border-l-transparent rounded-xl hover:bg-brand/5 dark:hover:bg-brand/10 mb-2 transition-colors">
      {/* Desktop view */}
      <div className="hidden md:flex flex-row items-center justify-between px-2 py-2 pr-6">
        <div className="flex-1 px-2 truncate text-content-muted">
          {item.fromEmail || t("inboxRow.noEmail")}
        </div>
        <div className="flex-1 px-2 truncate text-content dark:text-content-inverse">
          {item.fromName || t("inboxRow.noName")}
        </div>
        <div className="flex-1 px-2 truncate font-medium">
          {item.subject || t("inboxRow.noSubject")}
        </div>
        <div className="flex-1 px-2 truncate text-content-muted">
          {item.body
            ? item.body.replace(/#|```|\*\*/g, "").slice(0, 30) +
              (item.body.length > 30 ? "..." : "")
            : t("inboxRow.noMessage")}
        </div>
        <div className="flex-none ml-auto px-2 text-right whitespace-nowrap text-content-muted">
          {formatDate(item.timeSended || null)}
        </div>
      </div>

      {/* Mobile view */}
      <div className="md:hidden p-3 pr-6">
        <div className="flex justify-between items-center mb-1">
          <Text className="font-medium text-sm truncate flex-1">
            {item.fromName || t("inboxRow.noName")}
          </Text>
          <Text tone="muted" size="xs" as="span" className="ml-2 whitespace-nowrap">
            {formatDate(item.timeSended || null)}
          </Text>
        </div>

        <div className="truncate mb-1 font-medium">
          {item.subject || t("inboxRow.noSubject")}
        </div>

        <Text tone="muted" size="sm" className="truncate">
          {item.body
            ? item.body.replace(/#|```|\*\*/g, "").slice(0, 60) +
              (item.body.length > 60 ? "..." : "")
            : t("inboxRow.noMessage")}
        </Text>

        <Text tone="muted" size="xs" className="mt-1 truncate">
          {item.fromEmail || t("inboxRow.noEmail")}
        </Text>
      </div>
    </div>
  );
};

export default SentRowItem;
