import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Mail,
  PartyPopper,
  Building2,
  User,
  ArrowRight,
} from "lucide-react";

/* ─── Confetti ───────────────────────────────────────────────────────────── */
interface Particle {
  id: number;
  x: number;
  y: number;
  r: number;
  color: string;
  delay: number;
  duration: number;
  drift: number;
  size: number;
}

const CONFETTI_COLORS = [
  "#65558F",
  "#7AA49F",
  "#a78bfa",
  "#7c6bb7",
  "#22C55E",
  "#F59E0B",
  "#3B82F6",
  "#ec4899",
];

function generateConfetti(count = 80): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -(Math.random() * 40 + 10),
    r: Math.random() * 360,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    delay: Math.random() * 1,
    duration: 2 + Math.random() * 2,
    drift: (Math.random() - 0.5) * 80,
    size: 6 + Math.random() * 6,
  }));
}

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface MeetingDetails {
  date: string;
  time: string;
  link: string;
  type: string;
  fullName: string;
  email: string;
  company: string;
  loading: boolean;
  error: string | null;
}

/* ─── Component ──────────────────────────────────────────────────────────── */
const BookingConfirmation: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [confetti] = useState<Particle[]>(() => generateConfetti());
  const [showBadge, setShowBadge] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const [details, setDetails] = useState<MeetingDetails>({
    date: "",
    time: "",
    link: "",
    type: "Kick Off Meeting",
    fullName: "",
    email: "",
    company: "",
    loading: true,
    error: null,
  });

  // ── Helpers ─────────────────────────────────────────────────────────────
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${formattedHours}:${mins < 10 ? `0${mins}` : mins} ${period}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // ── Staggered reveal ──────────────────────────────────────────────────
  useEffect(() => {
    const t1 = setTimeout(() => setShowBadge(true), 300);
    const t2 = setTimeout(() => setShowTitle(true), 700);
    const t3 = setTimeout(() => setShowCard(true), 1100);
    const t4 = setTimeout(() => setShowActions(true), 1600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  // ── Data fetching ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      setDetails((prev) => ({
        ...prev,
        loading: false,
        error: "No booking token provided.",
      }));
      return;
    }

    (async () => {
      try {
        setDetails((prev) => ({ ...prev, loading: true, error: null }));
        const response = await fetch(
          `${API_BASE_URL}/api/booking/view/${token}`,
          { method: "GET", headers: { "Content-Type": "application/json" } }
        );

        if (!response.ok) throw new Error("Booking not found");

        const data = await response.json();
        const booking = data.booking || data;

        setDetails({
          date: formatDate(booking.date),
          time:
            booking.formattedTime ||
            (typeof booking.time === "number"
              ? formatTime(booking.time)
              : booking.time || ""),
          link: booking.meet_link || booking.meetLink || booking.link || "",
          type: booking.meetingType || booking.type || "Kick Off Meeting",
          fullName: booking.full_name || booking.fullName || "",
          email: booking.email || "",
          company: booking.company || "",
          loading: false,
          error: null,
        });
      } catch {
        setDetails((prev) => ({
          ...prev,
          loading: false,
          error: "Unable to load booking details. The link may be invalid or expired.",
        }));
      }
    })();
  }, [token]);

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#080A0D] relative overflow-hidden flex items-center justify-center p-4 md:p-8">
      {/* ── Ambient gradient orbs ──────────────────────────────────────── */}
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#65558F]/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#7AA49F]/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[400px] h-[400px] bg-[#65558F]/8 rounded-full blur-[120px] pointer-events-none" />

      {/* ── Grid pattern overlay ───────────────────────────────────────── */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── Confetti overlay ───────────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
        {confetti.map((p) => (
          <div
            key={p.id}
            className="confetti-piece absolute"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              "--drift": `${p.drift}px`,
              "--rot": `${p.r}deg`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* ── Main card ──────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-xl">
        {/* Logo */}
        <div
          className={`flex justify-center mb-8 transition-all duration-700 ${
            showBadge ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <img
            src="/light-logo.png"
            alt="Logo"
            className="h-10 w-10 opacity-60"
          />
        </div>

        {/* Glass card */}
        <div className="bg-[#1e1e1e]/80 backdrop-blur-2xl border border-white/[0.08] rounded-3xl shadow-[0_4px_32px_0_rgba(0,0,0,0.18)] overflow-hidden">
          {/* ── Gradient Header Bar ────────────────────────────────────── */}
          <div className="h-1.5 bg-gradient-to-r from-[#65558F] via-[#7AA49F] to-[#65558F]" />

          <div className="p-6 md:p-10">
            {/* Success badge */}
            <div
              className={`flex justify-center mb-6 transition-all duration-700 ${
                showBadge
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-50"
              }`}
            >
              <div className="relative">
                <div className="success-ring absolute inset-0 rounded-full" />
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#22C55E] to-[#7AA49F] flex items-center justify-center shadow-xl shadow-[#22C55E]/25 relative z-10">
                  <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-white success-check" />
                </div>
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-[#7AA49F] sparkle-float" />
                <Sparkles className="absolute -bottom-1 -left-3 w-5 h-5 text-[#65558F] sparkle-float-delayed" />
              </div>
            </div>

            {/* Title */}
            <div
              className={`text-center mb-8 transition-all duration-700 ${
                showTitle
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
            >
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 flex items-center justify-center gap-2">
                Booking Confirmed!{" "}
                <PartyPopper className="w-7 h-7 text-[#7AA49F] party-pop" />
              </h1>
              <p className="text-[#D1D5DB] text-sm md:text-base leading-relaxed max-w-md mx-auto">
                Your appointment has been scheduled successfully. We look
                forward to meeting you!
              </p>
            </div>

            {/* Loading */}
            {details.loading && (
              <div className="flex flex-col items-center py-8">
                <div className="w-10 h-10 border-[3px] border-[#65558F] border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-[#D1D5DB] text-sm">
                  Loading booking details...
                </p>
              </div>
            )}

            {/* Error */}
            {!details.loading && details.error && (
              <div className="p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-center mb-6">
                <p className="text-[#EF4444] text-sm">{details.error}</p>
              </div>
            )}

            {/* Details card */}
            {!details.loading && !details.error && (
              <div
                className={`transition-all duration-700 ${
                  showCard
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
              >
                <div className="bg-white/[0.04] backdrop-blur-md border border-white/[0.06] rounded-2xl p-5 md:p-6 space-y-3 meeting-card-glow">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#A5A5A5] font-semibold mb-3">
                    Meeting Details
                  </h3>

                  {/* Detail rows */}
                  {details.fullName && (
                    <DetailRow
                      icon={<User className="w-4 h-4 text-white" />}
                      gradient="from-[#65558F] to-[#7c6bb7]"
                      label={details.fullName}
                    />
                  )}

                  {details.company && (
                    <DetailRow
                      icon={<Building2 className="w-4 h-4 text-white" />}
                      gradient="from-[#7c6bb7] to-[#65558F]"
                      label={details.company}
                    />
                  )}

                  {details.date && (
                    <DetailRow
                      icon={<Calendar className="w-4 h-4 text-white" />}
                      gradient="from-[#65558F] to-[#7AA49F]"
                      label={details.date}
                    />
                  )}

                  {details.time && (
                    <DetailRow
                      icon={<Clock className="w-4 h-4 text-white" />}
                      gradient="from-[#7AA49F] to-[#65558F]"
                      label={details.time}
                    />
                  )}

                  <DetailRow
                    icon={<Video className="w-4 h-4 text-white" />}
                    gradient="from-[#3B82F6] to-[#06b6d4]"
                    label={details.type}
                  />

                  <DetailRow
                    icon={<Mail className="w-4 h-4 text-white" />}
                    gradient="from-[#7c6bb7] to-[#7AA49F]"
                    label="Confirmation sent to your email"
                  />

                  {/* Join Meet button */}
                  {details.link && (
                    <a
                      href={details.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-xl
                        bg-gradient-to-r from-[#3B82F6] to-[#06b6d4] text-white font-semibold text-sm
                        hover:shadow-lg hover:shadow-[#3B82F6]/30 hover:scale-[1.02] transition-all duration-200"
                    >
                      <Video className="w-4 h-4" />
                      Join Google Meet
                      <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div
              className={`mt-8 space-y-3 transition-all duration-700 ${
                showActions
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <button
                onClick={() => navigate("/booking")}
                className="w-full px-5 py-3 rounded-xl text-sm font-semibold
                  bg-gradient-to-r from-[#65558F] to-[#7AA49F] text-white
                  hover:shadow-lg hover:shadow-[#65558F]/30 hover:scale-[1.02] transition-all duration-200
                  flex items-center justify-center gap-2"
              >
                Book Another Meeting
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate("/")}
                className="w-full px-5 py-3 rounded-xl text-sm font-semibold
                  bg-transparent border border-white/[0.08] text-[#D1D5DB]
                  hover:border-[#65558F]/40 hover:text-white transition-all duration-200"
              >
                Back to Homepage
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p
          className={`text-center mt-8 text-[#A5A5A5] text-xs transition-all duration-700 ${
            showActions ? "opacity-60" : "opacity-0"
          }`}
        >
          This booking confirmation is private. Do not share the link.
        </p>
      </div>

      {/* ── Animations ─────────────────────────────────────────────────── */}
      <style>{`
        .confetti-piece {
          border-radius: 2px;
          animation: confetti-fall var(--duration, 2s) ease-out forwards;
          opacity: 0;
        }
        @keyframes confetti-fall {
          0% { opacity: 1; transform: translateY(0) translateX(0) rotate(0deg) scale(1); }
          100% { opacity: 0; transform: translateY(calc(100vh + 20px)) translateX(var(--drift, 0px)) rotate(var(--rot, 720deg)) scale(0.4); }
        }
        .success-ring {
          animation: ring-pulse 2s ease-out infinite;
          border: 3px solid rgba(34, 197, 94, 0.3);
        }
        @keyframes ring-pulse {
          0% { transform: scale(1); opacity: 0.6; }
          70% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .success-check {
          animation: check-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both;
        }
        @keyframes check-in {
          from { opacity: 0; transform: scale(0) rotate(-45deg); }
          to { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        .sparkle-float {
          animation: sparkle 2.5s ease-in-out infinite;
        }
        .sparkle-float-delayed {
          animation: sparkle 2.5s ease-in-out 0.6s infinite;
        }
        @keyframes sparkle {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.7; }
          50% { transform: translateY(-6px) scale(1.15); opacity: 1; }
        }
        .party-pop {
          animation: pop 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.5s both;
        }
        @keyframes pop {
          0% { transform: scale(0) rotate(-30deg); }
          60% { transform: scale(1.3) rotate(10deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        .meeting-card-glow {
          animation: card-glow 3s ease-in-out infinite alternate;
        }
        @keyframes card-glow {
          0% { box-shadow: 0 0 20px -8px rgba(101, 85, 143, 0); }
          100% { box-shadow: 0 0 30px -8px rgba(101, 85, 143, 0.15); }
        }
      `}</style>
    </div>
  );
};

/* ─── Detail Row Sub-Component ───────────────────────────────────────────── */
const DetailRow: React.FC<{
  icon: React.ReactNode;
  gradient: string;
  label: string;
}> = ({ icon, gradient, label }) => (
  <div className="flex items-center gap-3 p-2.5 bg-white/[0.03] rounded-lg border border-white/[0.05]">
    <div
      className={`w-8 h-8 rounded-md bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}
    >
      {icon}
    </div>
    <span className="text-white text-xs md:text-sm">{label}</span>
  </div>
);

export default BookingConfirmation;
