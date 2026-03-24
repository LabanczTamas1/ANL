import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Calendar,
  Clock,
  Video,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Mail,
  PartyPopper,
} from "lucide-react";
import darkLogo from "/public/dark-logo.png";
import lightLogo from "/public/light-logo.png";
import ThemeIcon from "../components/Logo";
import BookingPageLayout from "../components/BookingPageLayout";
import GlassInfoCard from "../components/GlassInfoCard";
import GradientButton from "../components/GradientButton";

/* ─── Confetti particle type ─────────────────────────────────────────────── */
interface Particle {
  id: number;
  x: number;
  y: number;
  r: number;
  color: string;
  delay: number;
  duration: number;
  drift: number;
}

const CONFETTI_COLORS = ["#65558F", "#7AA49F", "#a78bfa", "#7c6bb7", "#22C55E", "#F59E0B", "#3B82F6", "#ec4899"];

function generateConfetti(count = 60): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -(Math.random() * 40 + 10),
    r: Math.random() * 360,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    delay: Math.random() * 0.8,
    duration: 1.8 + Math.random() * 1.5,
    drift: (Math.random() - 0.5) * 60,
  }));
}

const SuccessfulBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [confetti] = useState<Particle[]>(() => generateConfetti());
  const [showContent, setShowContent] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const [meetingDetails, setMeetingDetails] = useState<{
    date: string;
    time: string;
    link: string;
    type: string;
    loading: boolean;
    error: string | null;
  }>({
    date: "",
    time: "",
    link: "",
    type: "Kick Off Meeting",
    loading: true,
    error: null,
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${formattedHours}:${mins < 10 ? `0${mins}` : mins} ${period}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // ── Staggered reveal ──────────────────────────────────────────────────────
  useEffect(() => {
    const t1 = setTimeout(() => setShowContent(true), 400);
    const t2 = setTimeout(() => setShowDetails(true), 900);
    const t3 = setTimeout(() => setShowActions(true), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  // ── Data fetching ─────────────────────────────────────────────────────────
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get("token");
    const meetingId = searchParams.get("meetingId");

    if (token) {
      // Redirect to the public confirmation page
      navigate(`/booking/confirmation/${token}`, { replace: true });
      return;
    } else if (meetingId) {
      fetchMeetingById(meetingId);
      window.history.replaceState({}, document.title, "/home/successful-booking");
    } else {
      fetchLatestMeeting();
    }
  }, [location]);

  const fetchMeetingById = async (meetingId: string) => {
    try {
      setMeetingDetails((prev) => ({ ...prev, loading: true, error: null }));
      const token = localStorage.getItem("authToken");

      const response = await fetch(`${API_BASE_URL}/api/booking/${meetingId}`, {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch meeting details");

      const data = await response.json();
      const booking = data.booking || data;

      setMeetingDetails({
        date: formatDate(booking.date),
        time: booking.formattedTime || formatTime(booking.time || booking.startTime || booking.at || 0),
        link: booking.meet_link || booking.meetLink || booking.link || "",
        type: booking.meetingType || booking.type || "Kick Off Meeting",
        loading: false,
        error: null,
      });
    } catch {
      setMeetingDetails((prev) => ({
        ...prev,
        loading: false,
        error: "Unable to load meeting details.",
      }));
    }
  };

  const fetchLatestMeeting = async () => {
    try {
      setMeetingDetails((prev) => ({ ...prev, loading: true, error: null }));
      const token = localStorage.getItem("authToken");

      const response = await fetch(`${API_BASE_URL}/api/booking/latest`, {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const bookings = data.bookings || [];
        const booking = bookings[0] || data.booking || data;

        setMeetingDetails({
          date: formatDate(booking.date),
          time: booking.formattedTime || formatTime(booking.time || booking.startTime || booking.at || 0),
          link: booking.meet_link || booking.meetLink || booking.link || "",
          type: booking.meetingType || booking.type || "Kick Off Meeting",
          loading: false,
          error: null,
        });
        return;
      }

      throw new Error("Failed to fetch latest booking");
    } catch {
      // Graceful fallback — the booking was just created so show a generic success
      setMeetingDetails({
        date: "",
        time: "",
        link: "",
        type: "Kick Off Meeting",
        loading: false,
        error: null,
      });
    }
  };

  return (
    <BookingPageLayout>
      {/* ── Confetti overlay ──────────────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
        {confetti.map((p) => (
          <div
            key={p.id}
            className="confetti-piece absolute"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              backgroundColor: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              "--drift": `${p.drift}px`,
              "--rot": `${p.r}deg`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* ── Main content card ─────────────────────────────────────────────── */}
      <div className="flex flex-col items-center justify-center w-full py-10 px-5 md:px-10 lg:py-16 relative z-10">
        {/* Success badge with pulse ring */}
        <div className={`relative mb-6 transition-all duration-700 ${showContent ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}>
          <div className="success-ring absolute inset-0 rounded-full" />
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-status-success to-accent-teal flex items-center justify-center shadow-xl shadow-status-success/30 relative z-10">
            <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-white success-check" />
          </div>
          {/* Sparkle accents */}
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-accent-teal sparkle-float" />
          <Sparkles className="absolute -bottom-1 -left-3 w-5 h-5 text-brand sparkle-float-delayed" />
        </div>

        {/* Title + subtitle */}
        <div className={`text-center mb-8 transition-all duration-700 delay-200 ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h2 className="text-2xl md:text-4xl font-bold text-content-inverse mb-3 flex items-center justify-center gap-2">
            Booking Confirmed! <PartyPopper className="w-7 h-7 md:w-8 md:h-8 text-accent-teal party-pop" />
          </h2>
          <p className="text-content-subtle-inverse text-sm md:text-base leading-relaxed max-w-md mx-auto">
            Your appointment has been scheduled successfully. A confirmation with all the details has been sent to your email.
          </p>
        </div>

        {/* Meeting details card */}
        {meetingDetails.loading ? (
          <div className="flex flex-col items-center py-8">
            <div className="w-10 h-10 border-[3px] border-brand border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-content-subtle-inverse text-sm">Loading meeting details...</p>
          </div>
        ) : meetingDetails.error && !meetingDetails.date ? (
          <div className={`w-full max-w-lg p-4 rounded-xl bg-status-error/10 border border-status-error/30 text-center transition-all duration-500 ${showDetails ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <p className="text-status-error text-sm">{meetingDetails.error}</p>
          </div>
        ) : (
          <div className={`w-full max-w-lg transition-all duration-700 ${showDetails ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="bg-surface-elevated/60 backdrop-blur-md border border-line-glass rounded-2xl p-5 md:p-6 space-y-3 meeting-card-glow">
              <h3 className="text-xs uppercase tracking-widest text-content-subtle-inverse font-semibold mb-2">
                Meeting Details
              </h3>

              {meetingDetails.date && (
                <GlassInfoCard
                  icon={<Calendar className="w-4 h-4 text-white" />}
                  gradient="from-brand to-accent-teal"
                >
                  {meetingDetails.date}
                </GlassInfoCard>
              )}

              {meetingDetails.time && (
                <GlassInfoCard
                  icon={<Clock className="w-4 h-4 text-white" />}
                  gradient="from-accent-teal to-brand"
                >
                  {meetingDetails.time}
                </GlassInfoCard>
              )}

              <GlassInfoCard
                icon={<Video className="w-4 h-4 text-white" />}
                gradient="from-blue-500 to-cyan-500"
              >
                {meetingDetails.type}
              </GlassInfoCard>

              <GlassInfoCard
                icon={<Mail className="w-4 h-4 text-white" />}
                gradient="from-brand-hover to-accent-teal"
              >
                Confirmation sent to your email
              </GlassInfoCard>

              {meetingDetails.link && (
                <a
                  href={meetingDetails.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl
                    bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-sm
                    hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] transition-all duration-200"
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
        <div className={`flex flex-col sm:flex-row gap-3 mt-8 w-full max-w-lg transition-all duration-700 ${showActions ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <GradientButton
            variant="primary"
            fullWidth
            onClick={() => navigate("/home")}
          >
            <span className="flex items-center justify-center gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </span>
          </GradientButton>

          <GradientButton
            variant="secondary"
            fullWidth
            onClick={() => navigate("/home/booking")}
          >
            Book Another Meeting
          </GradientButton>
        </div>

        {/* Logo */}
        <div className={`mt-10 transition-all duration-700 delay-500 ${showActions ? "opacity-100" : "opacity-0"}`}>
          <ThemeIcon
            lightIcon={<img src={darkLogo} alt="Light Logo" className="h-8 w-8 opacity-40" />}
            darkIcon={<img src={lightLogo} alt="Dark Logo" className="h-8 w-8 opacity-40" />}
            size="m"
            ariaLabel="ANL logo"
          />
        </div>
      </div>

      {/* ── Animations ────────────────────────────────────────────────────── */}
      <style>{`
        /* Confetti pieces */
        .confetti-piece {
          width: 8px;
          height: 8px;
          border-radius: 2px;
          animation: confetti-fall var(--duration, 2s) ease-out forwards;
          opacity: 0;
        }
        @keyframes confetti-fall {
          0% {
            opacity: 1;
            transform: translateY(0) translateX(0) rotate(0deg) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(calc(100vh + 20px)) translateX(var(--drift, 0px)) rotate(var(--rot, 720deg)) scale(0.4);
          }
        }

        /* Success ring pulse */
        .success-ring {
          animation: ring-pulse 2s ease-out infinite;
          border: 3px solid rgba(34, 197, 94, 0.3);
        }
        @keyframes ring-pulse {
          0% { transform: scale(1); opacity: 0.6; }
          70% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        /* Check mark draw-in */
        .success-check {
          animation: check-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both;
        }
        @keyframes check-in {
          from { opacity: 0; transform: scale(0) rotate(-45deg); }
          to { opacity: 1; transform: scale(1) rotate(0deg); }
        }

        /* Sparkle float */
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

        /* Party popper bounce */
        .party-pop {
          animation: pop 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.5s both;
        }
        @keyframes pop {
          0% { transform: scale(0) rotate(-30deg); }
          60% { transform: scale(1.3) rotate(10deg); }
          100% { transform: scale(1) rotate(0deg); }
        }

        /* Card glow */
        .meeting-card-glow {
          animation: card-glow 3s ease-in-out infinite alternate;
        }
        @keyframes card-glow {
          0% { box-shadow: 0 0 20px -8px rgba(101, 85, 143, 0); }
          100% { box-shadow: 0 0 30px -8px rgba(101, 85, 143, 0.15); }
        }
      `}</style>
    </BookingPageLayout>
  );
};

export default SuccessfulBooking;