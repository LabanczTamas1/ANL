import React from "react";
import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
  darkMode: boolean;
  onToggle: () => void;
  className?: string;
  /** Accessible label / tooltip when switching to light. */
  labelLight?: string;
  /** Accessible label / tooltip when switching to dark. */
  labelDark?: string;
}

/**
 * Small sun/moon toggle for switching the colour theme.
 * Used on the public (logged-out) booking pages so visitors can pick a theme;
 * the choice persists to localStorage and is respected across the whole app.
 */
const ThemeToggle: React.FC<ThemeToggleProps> = ({
  darkMode,
  onToggle,
  className = "",
  labelLight = "Switch to light mode",
  labelDark = "Switch to dark mode",
}) => {
  const label = darkMode ? labelLight : labelDark;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border transition-colors
        border-line bg-white text-content-subtle hover:bg-black/[0.04]
        dark:border-line-glass dark:bg-surface-elevated/60 dark:text-content-subtle-inverse dark:hover:bg-white/[0.06]
        focus:outline-none focus:ring-2 focus:ring-brand-focus ${className}`}
    >
      {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
};

export default ThemeToggle;
