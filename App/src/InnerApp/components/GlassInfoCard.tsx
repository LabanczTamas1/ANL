import React from "react";

interface GlassInfoCardProps {
  icon: React.ReactNode;
  /** Gradient classes for the icon badge, e.g. "from-brand to-accent-teal" */
  gradient?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * A small glassmorphism info card used across booking pages
 * for displaying meeting details, user info, etc.
 */
const GlassInfoCard: React.FC<GlassInfoCardProps> = ({
  icon,
  gradient = "from-brand to-accent-teal",
  children,
  className = "",
}) => (
  <div className={`flex items-center gap-2.5 p-2 bg-surface-elevated/50 rounded-lg border border-line-glass ${className}`}>
    <div className={`w-8 h-8 rounded-md bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}>
      {icon}
    </div>
    <span className="text-content-inverse text-xs md:text-sm truncate">{children}</span>
  </div>
);

export default GlassInfoCard;
