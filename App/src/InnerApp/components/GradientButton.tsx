import React from "react";

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant */
  variant?: "primary" | "secondary" | "danger";
  /** Show loading spinner */
  loading?: boolean;
  /** Loading text */
  loadingText?: string;
  /** Full width */
  fullWidth?: boolean;
  children: React.ReactNode;
}

const VARIANT_CLASSES: Record<string, string> = {
  primary:
    "bg-gradient-to-r from-brand to-accent-teal text-white hover:shadow-lg hover:shadow-brand/30 hover:scale-[1.02]",
  secondary:
    "bg-transparent border border-line-glass text-content-subtle-inverse hover:border-brand/40 hover:text-content-inverse",
  danger:
    "bg-gradient-to-r from-status-error to-red-600 text-white hover:shadow-lg hover:shadow-status-error/30 hover:scale-[1.02]",
};

/**
 * Consistently styled gradient button used across all booking pages.
 * Follows the design-system brand/accent tokens.
 */
const GradientButton: React.FC<GradientButtonProps> = ({
  variant = "primary",
  loading = false,
  loadingText = "Processing...",
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...rest
}) => (
  <button
    className={`
      px-5 py-2.5 font-semibold rounded-xl text-sm transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none
      ${VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary}
      ${fullWidth ? "w-full" : ""}
      ${className}
    `}
    disabled={disabled || loading}
    {...rest}
  >
    {loading ? (
      <span className="flex items-center justify-center gap-2">
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        {loadingText}
      </span>
    ) : (
      children
    )}
  </button>
);

export default GradientButton;
