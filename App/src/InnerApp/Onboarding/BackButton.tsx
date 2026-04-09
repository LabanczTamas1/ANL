import React from "react";
import { ChevronLeft } from "lucide-react";

interface BackButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

export const BackButton: React.FC<BackButtonProps> = ({ children, onClick, disabled = false }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={disabled ? "No previous step" : `Back to ${children}`}
      className={[
        "group flex items-center gap-2 sm:gap-3 rounded-xl px-3 py-2.5 sm:px-5 sm:py-3",
        "min-h-[2.75rem] min-w-[2.75rem] max-w-[45%]",
        "text-sm sm:text-base font-medium leading-tight",
        "transition-all duration-normal",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-focus",
        disabled
          ? "opacity-0 pointer-events-none"
          : "bg-glass text-content-inverse backdrop-blur-glass shadow-card hover:shadow-card-hover hover:bg-brand/30 active:scale-[0.97]",
      ].join(" ")}
    >
      <ChevronLeft
        className="h-5 w-5 shrink-0 transition-transform duration-normal group-hover:-translate-x-0.5"
        aria-hidden="true"
      />
      <div className="flex flex-col items-start overflow-hidden">
        <span className="hidden sm:block text-xs text-content-muted">Back</span>
        <span className="truncate">{children}</span>
      </div>
    </button>
  );
};
