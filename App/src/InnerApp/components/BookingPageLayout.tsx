import React from "react";

interface BookingPageLayoutProps {
  children: React.ReactNode;
  /** Extra classes for the outer wrapper */
  className?: string;
}

/**
 * Shared page layout for all booking-related pages.
 * Provides the glassmorphism background with gradient orbs,
 * matching the Booking page design system.
 */
const BookingPageLayout: React.FC<BookingPageLayoutProps> = ({ children, className = "" }) => (
  <div className={`h-full bg-[#F4F4F8] dark:bg-surface-overlay flex justify-center items-start lg:items-stretch p-3 md:p-4 lg:p-5 relative overflow-y-auto lg:overflow-hidden custom-scrollbar ${className}`}>
    {/* Background gradient orbs */}
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand/20 rounded-full blur-[120px] pointer-events-none" />
    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-teal/20 rounded-full blur-[120px] pointer-events-none" />

    <div className="relative z-10 flex flex-col lg:flex-row w-full h-auto lg:h-full bg-white/90 dark:bg-surface-elevated/80 backdrop-blur-xl border border-line dark:border-line-glass rounded-2xl md:rounded-3xl shadow-glass overflow-visible lg:overflow-hidden">
      {children}
    </div>

    {/* Shared scrollbar + animation styles */}
    <style>{`
      .custom-scrollbar::-webkit-scrollbar { width: 6px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); border-radius: 3px; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(101,85,143,0.4); border-radius: 3px; }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(101,85,143,0.6); }
      .dark .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
      .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(101,85,143,0.5); }
      .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(101,85,143,0.7); }
    `}</style>
  </div>
);

export default BookingPageLayout;
