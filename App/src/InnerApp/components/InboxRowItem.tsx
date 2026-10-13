import React, { useState } from "react";
import { InboxItem } from "../Inbox"; 
import ConfirmModal from "./ConfirmModal";
import { useLanguage } from "../../hooks/useLanguage";
import { Badge, cn } from "@design-system/components";

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

  const isUnread = item.isRead === "false";

  return (
    <>
      <div
        className={cn(
          "relative border rounded-xl cursor-pointer mb-2 transition-colors",
          "border-l-4",
          isUnread
            ? "border-line border-l-brand bg-brand/[0.06] hover:bg-brand/10 dark:border-line-dark dark:bg-brand/[0.12] dark:hover:bg-brand/20"
            : "border-line border-l-transparent hover:bg-brand/5 dark:border-line-dark dark:hover:bg-brand/10",
        )}
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
          className={`hidden md:flex flex-row items-center justify-between px-2 py-2 transition-all duration-300 ${
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
          <div
            className={cn(
              "flex-1 px-2 truncate",
              isUnread
                ? "text-content dark:text-content-inverse"
                : "text-content-muted",
            )}
          >
            {item.fromEmail || t("inboxRow.noEmail")}
          </div>
          <div className="flex-1 px-2 truncate flex items-center gap-2">
            {isUnread && (
              <span
                className="inline-block w-2 h-2 bg-brand rounded-full shrink-0"
                aria-hidden="true"
              />
            )}
            <span className={isUnread ? "font-bold" : ""}>
              {item.fromName || t("inboxRow.noName")}
            </span>
            {isUnread && (
              <Badge tone="brand" size="sm" pill className="shrink-0 uppercase tracking-wide">
                {t("inboxRow.new")}
              </Badge>
            )}
          </div>
          <div
            className={cn(
              "flex-1 px-2 truncate",
              isUnread ? "font-bold text-content dark:text-content-inverse" : "font-medium",
            )}
          >
            {item.subject || t("inboxRow.noSubject")}
          </div>
          <div
            className={cn(
              "flex-1 px-2 truncate",
              isUnread
                ? "text-content dark:text-content-inverse font-medium"
                : "text-content-muted",
            )}
          >
            {item.body
              ? item.body.replace(/#|```|\*\*/g, "").slice(0, 30) +
                (item.body.length > 30 ? "..." : "")
              : t("inboxRow.noMessage")}
          </div>
          <div
            className={cn(
              "flex-none ml-auto px-2 text-right whitespace-nowrap",
              isUnread
                ? "text-content dark:text-content-inverse font-semibold"
                : "text-content-muted",
            )}
          >
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
              className={cn(
                "text-sm truncate flex-1 flex items-center gap-2",
                isUnread ? "font-bold" : "font-medium",
              )}
            >
              {isUnread && (
                <span
                  className="inline-block w-2 h-2 bg-brand rounded-full shrink-0"
                  aria-hidden="true"
                />
              )}
              <span className="truncate">{item.fromName || t("inboxRow.noName")}</span>
              {isUnread && (
                <Badge tone="brand" size="sm" pill className="shrink-0 uppercase tracking-wide">
                  {t("inboxRow.new")}
                </Badge>
              )}
            </div>
            <div
              className={cn(
                "text-xs ml-2 whitespace-nowrap",
                isUnread
                  ? "text-content dark:text-content-inverse font-semibold"
                  : "text-content-muted",
              )}
            >
              {formatDate(item.timeSended || null)}
            </div>
          </div>

          <div
            className={cn(
              "truncate mb-1",
              isUnread ? "font-bold text-content dark:text-content-inverse" : "font-medium",
            )}
          >
            {item.subject || t("inboxRow.noSubject")}
          </div>

          <div
            className={cn(
              "text-sm truncate",
              isUnread
                ? "text-content dark:text-content-inverse font-medium"
                : "text-content-muted",
            )}
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
