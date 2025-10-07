import React, { useState } from "react";
import { InboxItem } from "../Inbox"; 
import ConfirmModal from "./ConfirmModal";

interface InboxRowItemProps {
  item: InboxItem;
  isSelected: boolean;
  onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>, id: string) => void;
  onMessageClick: (id: string) => void;
  onDelete: (id: string) => void;
  formatDate: (timestamp: string | null) => string;
}

const InboxRowItem: React.FC<InboxRowItemProps> = ({
  item,
  isSelected,
  onCheckboxChange,
  onMessageClick,
  onDelete,
  formatDate,
}) => {
  const [hovered, setHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div
        className={`relative border-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer mb-2 transition-colors`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onMessageClick(item.id)}
      >
        {/* Delete Icon (absolute, but space reserved with padding) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(true);
          }}
          className={`absolute top-2 right-2 text-gray-400 hover:text-red-600 transition-opacity duration-200 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Delete message"
        >
          🗑️
        </button>

        {/* Desktop view */}
        <div
          className={`hidden md:flex flex-row justify-between px-2 py-2 transition-all duration-300 ${
            hovered ? "pr-10" : "pr-6"
          }`}
        >
          <div className="flex-none pr-2" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onCheckboxChange(e, item.id)}
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
            <span className={`${item.isRead === "false" ? "font-bold" : ""}`}>
              {item.fromName || "No name available"}
            </span>
          </div>
          <div
            className={`flex-1 px-2 truncate ${
              item.isRead === "false" ? "font-bold" : "font-medium"
            }`}
          >
            {item.subject || "No subject"}
          </div>
          <div
            className={`flex-1 px-2 truncate ${
              item.isRead === "false"
                ? "text-black dark:text-white font-medium"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {item.body
              ? item.body.replace(/#|```|\*\*/g, "").slice(0, 30) +
                (item.body.length > 30 ? "..." : "")
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
        <div
          className={`md:hidden p-3 transition-all duration-300 ${
            hovered ? "pr-10" : "pr-6"
          }`}
        >
          <div className="flex justify-between items-center mb-1">
            <div
              className={`font-medium text-sm truncate flex-1 ${
                item.isRead === "false" ? "font-bold" : ""
              }`}
            >
              {item.isRead === "false" && (
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              )}
              {item.fromName || "No name available"}
            </div>
            <div className="text-xs text-gray-500 ml-2 flex items-center">
              {item.isRead === "false" && (
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
              )}
              {formatDate(item.timeSended || null)}
            </div>
          </div>

          <div
            className={`truncate mb-1 ${
              item.isRead === "false" ? "font-bold" : "font-medium"
            }`}
          >
            {item.subject || "No subject"}
          </div>

          <div
            className={`text-sm truncate ${
              item.isRead === "false"
                ? "text-black dark:text-white font-medium"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
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

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => onDelete(item.id)}
        question="Are you sure you want to delete this message?"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};

export default InboxRowItem;
