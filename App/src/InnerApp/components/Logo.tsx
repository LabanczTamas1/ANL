import React from "react";

interface ThemeIconProps {
  /** Icon/image to display in light mode */
  lightIcon: React.ReactNode;
  /** Icon/image to display in dark mode */
  darkIcon: React.ReactNode;
  /** Semantic size of the icon */
  size?: "xs" | "s" | "m" | "l" | "xl" | "xxl";
  /** Accessible label */
  ariaLabel?: string;
  /** Optional extra class for the wrapper */
  className?: string;
}

const SIZE_MAP: Record<NonNullable<ThemeIconProps["size"]>, string> = {
  xs: "w-4 h-4",
  s: "w-6 h-6",
  m: "w-8 h-8",
  l: "w-12 h-12",
  xl: "w-16 h-16",
  xxl: "w-24 h-24",
};

const ThemeIcon: React.FC<ThemeIconProps> = ({
  lightIcon,
  darkIcon,
  size = "m",
  ariaLabel,
  className = "",
}) => {
  const sizeClass = SIZE_MAP[size];

  return (
    <span
      role="img"
      aria-label={ariaLabel}
      className={`inline-flex ${sizeClass} ${className}`}
    >
      <span className="block dark:hidden">{lightIcon}</span>
      <span className="hidden dark:block">{darkIcon}</span>
    </span>
  );
};

export default ThemeIcon;
