import React from "react";

interface ProgressProps {
  value: number;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({ value, className = "" }) => {
  return (
    <div
      className={`w-full h-1.5 rounded-full bg-content-muted/20 overflow-hidden ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-brand transition-all duration-normal ease-out"
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
};
