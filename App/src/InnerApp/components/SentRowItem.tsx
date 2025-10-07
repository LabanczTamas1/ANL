import React from "react";
import { InboxItem } from "../Inbox"; // ✅ reuse the same type
// If you want a separate type for Sent, you can, but it's compatible

interface SentRowItemProps {
  item: InboxItem;
  formatDate: (timestamp: string | null) => string;
}

const SentRowItem: React.FC<SentRowItemProps> = ({ item, formatDate }) => {
  return (
    <div
      className={`relative border-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer mb-2 border-[#E5E6E7] dark:border-gray-700`}
    >
      {/* Desktop view */}
      <div className="hidden md:flex flex-row justify-between px-2 py-2 pr-6 transition-all duration-300">
        <div className="flex-1 px-2 truncate">
          {item.fromEmail || "No email available"}
        </div>
        <div className="flex-1 px-2 truncate">
          {item.fromName || "No name available"}
        </div>
        <div className="flex-1 px-2 truncate font-medium">
          {item.subject || "No subject"}
        </div>
        <div className="flex-1 px-2 truncate text-gray-600 dark:text-gray-400">
          {item.body
            ? item.body.replace(/#|```|\*\*/g, "").slice(0, 30) +
              (item.body.length > 30 ? "..." : "")
            : "No message available"}
        </div>
        <div className="flex-none ml-auto px-2 text-right whitespace-nowrap">
          {formatDate(item.timeSended || null)}
        </div>
      </div>

      {/* Mobile view */}
      <div className="md:hidden p-3 pr-6 transition-all duration-300">
        <div className="flex justify-between items-center mb-1">
          <div className="font-medium text-sm truncate flex-1">
            {item.fromName || "No name available"}
          </div>
          <div className="text-xs text-gray-500 ml-2 flex items-center">
            {formatDate(item.timeSended || null)}
          </div>
        </div>

        <div className="truncate mb-1 font-medium">
          {item.subject || "No subject"}
        </div>

        <div className="text-sm truncate text-gray-600 dark:text-gray-400">
          {item.body
            ? item.body.replace(/#|```|\*\*/g, "").slice(0, 60) +
              (item.body.length > 60 ? "..." : "")
            : "No message available"}
        </div>

        <div className="text-xs text-gray-500 mt-1 truncate">
          {item.fromEmail || "No email available"}
        </div>
      </div>
    </div>
  );
};

export default SentRowItem;
