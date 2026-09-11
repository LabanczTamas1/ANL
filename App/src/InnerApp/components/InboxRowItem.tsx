import React, { useState } from "react";
import { InboxItem } from "../Inbox"; 
import ConfirmModal from "./ConfirmModal";
import { useLanguage } from "../../hooks/useLanguage";

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
  const { t } = useLanguage();
  const [hovered, setHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div
        className={`relative border border-line dark:border-line-dark rounded-xl hover:bg-brand/5 dark:hover:bg-brand/10 cursor-pointer mb-2 transition-colors`}
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
          className={`absolute top-2 right-2 text-content-muted hover:text-status-error transition-opacity duration-200 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
          aria-label={t("inboxRow.deleteMessage")}
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
              aria-label={t("inboxRow.selectMessage")}
              className="accent-brand"
            />
          </div>
          <div className="flex-1 px-2 truncate">
            {item.fromEmail || t("inboxRow.noEmail")}
          </div>
          <div className="flex-1 px-2 truncate">
            {item.isRead === "false" && (
              <span className="inline-block w-2 h-2 bg-brand rounded-full mr-2"></span>
            )}
            <span className={`${item.isRead === "false" ? "font-bold" : ""}`}>
              {item.fromName || t("inboxRow.noName")}
            </span>
          </div>
          <div
            className={`flex-1 px-2 truncate ${
              item.isRead === "false" ? "font-bold" : "font-medium"
            }`}
          >
            {item.subject || t("inboxRow.noSubject")}
          </div>
          <div
            className={`flex-1 px-2 truncate ${
              item.isRead === "false"
                ? "text-content dark:text-content-inverse font-medium"
                : "text-content-muted"
            }`}
          >
            {item.body
              ? item.body.replace(/#|```|\*\*/g, "").slice(0, 30) +
                (item.body.length > 30 ? "..." : "")
              : t("inboxRow.noMessage")}
          </div>
          <div className="flex-none ml-auto px-2 text-right whitespace-nowrap">
            {item.isRead === "false" && (
              <span className="inline-block w-3 h-3 bg-brand rounded-full mr-2"></span>
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
                <span className="inline-block w-2 h-2 bg-brand rounded-full mr-2"></span>
              )}
              {item.fromName || t("inboxRow.noName")}
            </div>
            <div className="text-xs text-content-muted ml-2 flex items-center">
              {item.isRead === "false" && (
                <span className="inline-block w-2 h-2 bg-brand rounded-full mr-1"></span>
              )}
              {formatDate(item.timeSended || null)}
            </div>
          </div>

          <div
            className={`truncate mb-1 ${
              item.isRead === "false" ? "font-bold" : "font-medium"
            }`}
          >
            {item.subject || t("inboxRow.noSubject")}
          </div>

          <div
            className={`text-sm truncate ${
              item.isRead === "false"
                ? "text-content dark:text-content-inverse font-medium"
                : "text-content-muted"
            }`}
          >
            {item.body
              ? item.body.replace(/#|```|\*\*/g, "").slice(0, 60) +
                (item.body.length > 60 ? "..." : "")
              : t("inboxRow.noMessage")}
          </div>

          <div className="text-xs text-content-muted mt-1 truncate">
            {item.fromEmail || t("inboxRow.noEmail")}
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => onDelete(item.id)}
        question={t("inboxRow.confirmDelete")}
        confirmText={t("inboxRow.delete")}
        cancelText={t("inboxRow.cancel")}
      />
    </>
  );
};

export default InboxRowItem;
