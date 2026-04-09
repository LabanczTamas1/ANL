import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  FaCalendarAlt,
  FaEnvelope,
  FaComments,
  FaArrowRight,
  FaTimes,
} from "react-icons/fa";

interface RippleHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRect: DOMRect | null;
}

const helpItems = [
  {
    icon: FaCalendarAlt,
    title: "Book a Meeting",
    description: "Schedule a free consultation with our team",
    link: "/booking",
    color: "from-brand to-brand-hover",
  },
  {
    icon: FaEnvelope,
    title: "Send Us a Message",
    description: "Drop us an email and we'll respond within 24h",
    link: "#contact-form",
    anchor: true,
    color: "from-accent-teal to-brand",
  },
  {
    icon: FaComments,
    title: "Quick Questions?",
    description: "Check our services or reach out on social media",
    link: "/services",
    color: "from-brand-hover to-accent-teal",
  },
];

type Phase = "closed" | "entering" | "open" | "leaving";

const RippleHelpModal: React.FC<RippleHelpModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [phase, setPhase] = useState<Phase>("closed");
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Open / close state machine ──────────────────────────────────────
  useEffect(() => {
    if (isOpen && (phase === "closed" || phase === "leaving")) {
      // Cancel any pending close
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      setPhase("entering");
      openTimerRef.current = setTimeout(() => setPhase("open"), 700);
    }

    if (!isOpen && (phase === "entering" || phase === "open")) {
      // Cancel any pending open
      if (openTimerRef.current) {
        clearTimeout(openTimerRef.current);
        openTimerRef.current = null;
      }
      setPhase("leaving");
      closeTimerRef.current = setTimeout(() => setPhase("closed"), 550);
    }

    return () => {
      // Cleanup on unmount only — don't clear on every render
    };
  }, [isOpen]); // intentionally only depend on isOpen

  // ── ESC key ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase === "closed") return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, onClose]);

  // ── Lock body scroll ────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "closed") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  // ── Backdrop click ──────────────────────────────────────────────────
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  // Don't render anything when fully closed
  if (phase === "closed") return null;

  const showing = phase === "entering" || phase === "open";

  return createPortal(
    <>
      {/* ── Desaturation + darken overlay ──────────────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 9998,
          backdropFilter: showing
            ? "saturate(0.2) brightness(0.65)"
            : "saturate(1) brightness(1)",
          WebkitBackdropFilter: showing
            ? "saturate(0.2) brightness(0.65)"
            : "saturate(1) brightness(1)",
          transition: `backdrop-filter ${phase === "leaving" ? "550ms" : "700ms"} cubic-bezier(0.4, 0, 0.2, 1), -webkit-backdrop-filter ${phase === "leaving" ? "550ms" : "700ms"} cubic-bezier(0.4, 0, 0.2, 1)`,
        }}
      />

      {/* ── Modal container ────────────────────────────────────────── */}
      <div
        className="fixed inset-0 flex items-center justify-center p-4 md:p-8"
        style={{
          zIndex: 10000,
          pointerEvents: "auto",
        }}
        onClick={handleBackdropClick}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="How can we help you?"
          className="relative w-full max-w-4xl border border-line-glass overflow-hidden"
          style={{
            background: "rgba(20, 20, 30, 0.92)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow:
              "0 32px 64px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(101,85,143,0.15), 0 0 120px -20px rgba(101,85,143,0.25)",
            transformOrigin: "center center",
            animation: showing
              ? "modalDropIn 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
              : phase === "leaving"
              ? "modalDropOut 0.45s cubic-bezier(0.55, 0, 1, 0.45) forwards"
              : "none",
            borderRadius: "1.5rem",
          }}
        >
          {/* Inner gradient glow */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: -80,
              left: "50%",
              transform: "translateX(-50%)",
              width: 700,
              height: 350,
              background:
                "radial-gradient(ellipse at center, rgba(101,85,143,0.2) 0%, rgba(122,164,159,0.1) 50%, transparent 80%)",
              filter: "blur(40px)",
            }}
          />

          {/* Close button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-4 right-4 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-surface-elevated/60 border border-line-glass text-content-muted hover:text-white hover:bg-brand/30 transition-all duration-200"
            aria-label="Close modal"
          >
            <FaTimes className="w-4 h-4" />
          </button>

          {/* Content */}
          <div className="relative z-10 p-8 md:p-12">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand/20 rounded-full text-brand-hover text-xs font-medium mb-4">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-hover opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-hover" />
                </span>
                Available now
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                How can we help you?
              </h2>
              <p className="text-content-muted text-base max-w-lg mx-auto">
                Choose the best way to reach us. We&apos;re always happy to
                assist you with your project.
              </p>
            </div>

            {/* Help cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {helpItems.map(
                ({ icon: Icon, title, description, link, anchor, color }, i) => {
                  const card = (
                    <div
                      className="group relative flex flex-col items-center text-center p-6 md:p-8 rounded-2xl border border-line-glass bg-surface-elevated/30 hover:bg-surface-elevated/60 hover:border-brand/40 transition-all duration-300 cursor-pointer"
                      style={{
                        animation: showing
                          ? `cardFadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${0.35 + i * 0.1}s both`
                          : "none",
                      }}
                    >
                      <div
                        className={`flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${color} text-white mb-5 shadow-lg shadow-brand/20 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-2">
                        {title}
                      </h3>
                      <p className="text-content-muted text-sm mb-4 leading-relaxed">
                        {description}
                      </p>
                      <span className="inline-flex items-center gap-1.5 text-brand-hover text-sm font-medium group-hover:gap-2.5 transition-all duration-200">
                        Get started
                        <FaArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  );

                  if (anchor) {
                    return (
                      <a key={title} href={link} onClick={onClose}>
                        {card}
                      </a>
                    );
                  }
                  return (
                    <Link key={title} to={link} onClick={onClose}>
                      {card}
                    </Link>
                  );
                }
              )}
            </div>

            {/* Footer */}
            <p className="text-center text-content-disabled text-xs mt-8">
              Press{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-surface-elevated/50 border border-line-glass text-content-muted text-[10px] font-mono">
                ESC
              </kbd>{" "}
              to close
            </p>
          </div>
        </div>
      </div>

      {/* ── Keyframes ──────────────────────────────────────────────── */}
      <style>{`
        @keyframes modalDropIn {
          0% {
            opacity: 0;
            transform: scale(0.15);
            border-radius: 50%;
            filter: blur(8px);
          }
          30% {
            opacity: 1;
            filter: blur(0px);
            border-radius: 40%;
          }
          60% {
            transform: scale(1.03);
            border-radius: 2rem;
          }
          80% {
            transform: scale(0.98);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            border-radius: 1.5rem;
            filter: blur(0);
          }
        }

        @keyframes modalDropOut {
          0% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0);
          }
          40% {
            transform: scale(1.03);
          }
          100% {
            opacity: 0;
            transform: scale(0.15);
            border-radius: 50%;
            filter: blur(6px);
          }
        }

        @keyframes cardFadeUp {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.92);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>,
    document.body
  );
};

export default RippleHelpModal;
