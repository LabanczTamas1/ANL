import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface MobileActionSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  closeLabel?: string;
  children: React.ReactNode;
}

/**
 * Mobile-friendly bottom sheet used for reordering / moving Kanban items
 * when drag-and-drop is disabled on touch devices.
 */
const MobileActionSheet: React.FC<MobileActionSheetProps> = ({
  open,
  title,
  onClose,
  closeLabel = "Close",
  children,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.15s_ease]"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="relative w-full sm:max-w-md bg-white dark:bg-[#1f1f1f] rounded-t-2xl sm:rounded-2xl shadow-2xl border border-line dark:border-line-glass max-h-[80vh] flex flex-col"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2.5 sm:hidden">
          <span className="h-1.5 w-10 rounded-full bg-black/20 dark:bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-line dark:border-line-glass">
          <h3 className="text-base font-semibold text-content dark:text-content-inverse truncate">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-content-subtle dark:text-content-subtle-inverse hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions */}
        <div className="p-2 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body
  );
};

interface SheetActionProps {
  icon?: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export const SheetAction: React.FC<SheetActionProps> = ({
  icon,
  label,
  onClick,
  disabled,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-content dark:text-content-inverse hover:bg-black/[0.05] dark:hover:bg-white/[0.07] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
  >
    {icon && <span className="shrink-0 text-content-subtle dark:text-content-subtle-inverse">{icon}</span>}
    <span className="text-sm font-medium truncate">{label}</span>
  </button>
);

export default MobileActionSheet;
