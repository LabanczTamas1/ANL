import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Minus,
  Trash2,
  RotateCcw,
  Loader2,
  Users,
  Filter,
  X,
  Mail,
  Building2,
  Globe,
  Video,
  FileText,
  Tag,
  CalendarCheck,
} from "lucide-react";
import {
  getAdminDayOverview,
  removeAddedTime,
  removeDeletedTime,
} from "../../services/api/availabilityApi";
import { ToastContainer, Bounce, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ─── Types ──────────────────────────────────────────────────────────────────

interface BookedMeeting {
  id: string;
  time: number;
  fullName: string;
  company: string;
  email: string;
  referralSource: string;
  referralSourceOther: string | null;
  timezone: string;
  meetLink: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
}

interface DayOverview {
  date: string;
  dayName: string;
  isDayOff: boolean;
  standardTimes: number[];
  addedTimes: number[];
  deletedTimes: number[];
  bookedMeetings: BookedMeeting[];
  effectiveTimes: number[];
  totalHours: number;
}

type ViewFilter = "both" | "availability" | "bookings";

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatMinutes = (m: number): string => {
  const h = Math.floor(m / 60);
  const mins = m % 60;
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return mins === 0 ? `${h12} ${suffix}` : `${h12}:${String(mins).padStart(2, "0")} ${suffix}`;
};

const toDateString = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const getMonthRange = (year: number, month: number) => {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return { start, end };
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ─── Component ──────────────────────────────────────────────────────────────

const AvailabilityOverview: React.FC = () => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [days, setDays] = useState<DayOverview[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [viewFilter, setViewFilter] = useState<ViewFilter>("both");
  const [bookingModal, setBookingModal] = useState<BookedMeeting | null>(null);

  // ── Fetch month data ────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { start, end } = getMonthRange(viewYear, viewMonth);
      const res = await getAdminDayOverview(toDateString(start), toDateString(end));
      setDays(res.data as DayOverview[]);
    } catch {
      toast.error("Failed to load availability data");
    } finally {
      setLoading(false);
    }
  }, [viewYear, viewMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Month navigation ───────────────────────────────────────────────────

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // ── Build calendar grid (pad leading/trailing empty slots) ─────────────

  const calendarCells = useMemo(() => {
    const { start, end } = getMonthRange(viewYear, viewMonth);
    const startDow = (start.getDay() + 6) % 7; // 0=Mon
    const totalDays = end.getDate();

    const cells: Array<DayOverview | null> = [];

    // leading blanks
    for (let i = 0; i < startDow; i++) cells.push(null);

    // days of month
    for (let d = 1; d <= totalDays; d++) {
      const ds = toDateString(new Date(viewYear, viewMonth, d));
      const match = days.find((x) => x.date === ds);
      cells.push(
        match ?? {
          date: ds,
          dayName: "",
          isDayOff: false,
          standardTimes: [],
          addedTimes: [],
          deletedTimes: [],
          bookedMeetings: [],
          effectiveTimes: [],
          totalHours: 0,
        }
      );
    }

    return cells;
  }, [days, viewYear, viewMonth]);

  // ── Selected day detail ────────────────────────────────────────────────

  const selectedDay = useMemo(
    () => days.find((d) => d.date === selectedDate) ?? null,
    [days, selectedDate]
  );

  // ── Actions ────────────────────────────────────────────────────────────

  const handleRemoveAdded = async (date: string, time: number) => {
    setActionLoading(true);
    try {
      await removeAddedTime({ date, times: [time] });
      toast.success(`Removed added time ${formatMinutes(time)}`);
      await fetchData();
    } catch {
      toast.error("Failed to remove added time");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestoreDeleted = async (date: string, time: number) => {
    setActionLoading(true);
    try {
      await removeDeletedTime({ date, times: [time] });
      toast.success(`Restored deleted time ${formatMinutes(time)}`);
      await fetchData();
    } catch {
      toast.error("Failed to restore time");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Hour badge color ───────────────────────────────────────────────────

  const hourColor = (h: number): string => {
    if (h === 0) return "text-content-muted";
    if (h <= 4) return "text-status-error";
    if (h <= 6) return "text-status-warning";
    return "text-status-success";
  };

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="h-full bg-surface-overlay flex flex-col lg:flex-row relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-teal/20 rounded-full blur-[120px] pointer-events-none" />

      {/* ── Calendar side ──────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col p-4 md:p-6 overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex flex-col gap-3 mb-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold text-content-inverse flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-brand" />
              Availability Overview
            </h2>
            <div className="flex items-center gap-1">
              <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-brand/20 text-content-inverse transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-semibold text-content-inverse min-w-[140px] text-center">
                {monthLabel}
              </span>
              <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-brand/20 text-content-inverse transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter buttons */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-content-muted" />
            {([
              { key: "both" as ViewFilter, label: "Both" },
              { key: "availability" as ViewFilter, label: "Availability" },
              { key: "bookings" as ViewFilter, label: "Bookings" },
            ]).map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setViewFilter(key)}
                className={[
                  "px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200",
                  viewFilter === key
                    ? "bg-brand text-white shadow-md shadow-brand/30"
                    : "bg-surface-elevated/50 text-content-muted hover:bg-brand/20 hover:text-content-inverse",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand" />
          </div>
        ) : (
          <>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map((w) => (
                <div key={w} className="text-center text-xs font-semibold text-content-muted uppercase tracking-wider py-1">
                  {w}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((cell, idx) => {
                if (!cell) {
                  return <div key={`blank-${idx}`} className="aspect-square" />;
                }

                const dayNum = parseInt(cell.date.split("-")[2], 10);
                const isSelected = cell.date === selectedDate;
                const isToday = cell.date === toDateString(today);
                const hasCustom = cell.addedTimes.length > 0 || cell.deletedTimes.length > 0;
                const bookingCount = cell.bookedMeetings?.length ?? 0;
                const showHours = viewFilter !== "bookings";
                const showBookingBadge = viewFilter !== "availability" && bookingCount > 0;

                return (
                  <button
                    key={cell.date}
                    type="button"
                    onClick={() => setSelectedDate(cell.date === selectedDate ? null : cell.date)}
                    className={[
                      "aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all duration-200 relative group",
                      "text-sm font-medium",
                      isSelected
                        ? "bg-brand text-white shadow-lg shadow-brand/30 scale-105"
                        : isToday
                          ? "bg-brand/15 text-content-inverse border border-brand/30"
                          : cell.isDayOff
                            ? "bg-surface-elevated/30 text-content-muted hover:bg-surface-elevated/50"
                            : "bg-surface-elevated/50 text-content-inverse hover:bg-brand/20",
                    ].join(" ")}
                  >
                    <span className="text-xs md:text-sm">{dayNum}</span>
                    {showHours && (
                      <span className={`text-[10px] md:text-xs font-bold leading-none ${isSelected ? "text-white/90" : hourColor(cell.totalHours)}`}>
                        {cell.totalHours}h
                      </span>
                    )}
                    {!showHours && showBookingBadge && (
                      <span className={`text-[10px] md:text-xs font-bold leading-none ${isSelected ? "text-white/90" : "text-accent-purple"}`}>
                        {bookingCount} mtg{bookingCount !== 1 ? "s" : ""}
                      </span>
                    )}
                    {/* Booking count badge (top-left, when also showing hours) */}
                    {showHours && showBookingBadge && !isSelected && (
                      <span className="absolute top-0.5 right-0.5 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-accent-purple text-[8px] font-bold text-white leading-none px-0.5">
                        {bookingCount}
                      </span>
                    )}
                    {/* Custom indicator dot */}
                    {hasCustom && !isSelected && viewFilter !== "bookings" && (
                      <span className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-accent-teal" />
                    )}
                    {cell.isDayOff && !isSelected && (
                      <span className="absolute bottom-0.5 left-1 text-[7px] text-status-error font-bold uppercase">OFF</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-content-muted">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-status-success" /> 7+ hours
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-status-warning" /> 5-6 hours
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-status-error" /> 1-4 hours
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-accent-teal" /> Custom modified
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-accent-purple" /> Has bookings
              </span>
            </div>
          </>
        )}
      </div>

      {/* ── Detail panel (right side / bottom on mobile) ────────────────── */}
      <div
        className={[
          "relative z-10 border-t lg:border-t-0 lg:border-l border-line-glass",
          "w-full lg:w-[360px] lg:min-w-[320px] lg:shrink-0",
          "bg-surface-elevated/60 backdrop-blur-xl",
          "overflow-y-auto custom-scrollbar",
          "transition-all duration-300",
          selectedDay ? "max-h-[50vh] lg:max-h-none p-4 md:p-5" : "max-h-0 lg:max-h-none p-0 lg:p-5",
        ].join(" ")}
      >
        {selectedDay ? (
          <>
            {/* Day header */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-content-inverse">
                {new Date(selectedDay.date + "T12:00:00").toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </h3>
              <div className="flex items-center gap-3 mt-1">
                <span className={`text-sm font-semibold ${hourColor(selectedDay.totalHours)}`}>
                  {selectedDay.totalHours} active hour{selectedDay.totalHours !== 1 ? "s" : ""}
                </span>
                {selectedDay.isDayOff && (
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-status-error/20 text-status-error">
                    Day Off
                  </span>
                )}
              </div>
            </div>

            {/* Standard times */}
            {viewFilter !== "bookings" && selectedDay.standardTimes.length > 0 && (
              <Section
                title="Standard Availability"
                icon={<Clock className="w-3.5 h-3.5" />}
                color="text-accent-teal"
              >
                <div className="flex flex-wrap gap-1.5">
                  {selectedDay.standardTimes.map((t) => (
                    <TimePill key={`std-${t}`} time={t} variant="standard" />
                  ))}
                </div>
              </Section>
            )}

            {/* Custom-added times */}
            {viewFilter !== "bookings" && selectedDay.addedTimes.length > 0 && (
              <Section
                title="Custom Added"
                icon={<Plus className="w-3.5 h-3.5" />}
                color="text-status-success"
              >
                <div className="flex flex-wrap gap-1.5">
                  {selectedDay.addedTimes.map((t) => (
                    <TimePill
                      key={`add-${t}`}
                      time={t}
                      variant="added"
                      actionIcon={<Trash2 className="w-3 h-3" />}
                      actionLabel="Remove this custom-added time"
                      onAction={() => handleRemoveAdded(selectedDay.date, t)}
                      disabled={actionLoading}
                    />
                  ))}
                </div>
              </Section>
            )}

            {/* Custom-deleted times */}
            {viewFilter !== "bookings" && selectedDay.deletedTimes.length > 0 && (
              <Section
                title="Custom Removed"
                icon={<Minus className="w-3.5 h-3.5" />}
                color="text-status-error"
              >
                <div className="flex flex-wrap gap-1.5">
                  {selectedDay.deletedTimes.map((t) => (
                    <TimePill
                      key={`del-${t}`}
                      time={t}
                      variant="deleted"
                      actionIcon={<RotateCcw className="w-3 h-3" />}
                      actionLabel="Restore this deleted time"
                      onAction={() => handleRestoreDeleted(selectedDay.date, t)}
                      disabled={actionLoading}
                    />
                  ))}
                </div>
              </Section>
            )}

            {/* Booked Meetings */}
            {viewFilter !== "availability" && selectedDay.bookedMeetings && selectedDay.bookedMeetings.length > 0 && (
              <Section
                title="Booked Meetings"
                icon={<Users className="w-3.5 h-3.5" />}
                color="text-accent-purple"
              >
                <div className="flex flex-col gap-2">
                  {selectedDay.bookedMeetings.map((mtg, i) => (
                    <button
                      key={`mtg-${i}`}
                      type="button"
                      onClick={() => setBookingModal(mtg)}
                      className="flex items-start gap-2 p-2 rounded-lg bg-accent-purple/10 border border-accent-purple/20 hover:bg-accent-purple/20 transition-colors cursor-pointer w-full text-left"
                    >
                      <TimePill time={mtg.time} variant="booked" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-content-inverse truncate">
                          {mtg.fullName}
                        </span>
                        {mtg.company && (
                          <span className="text-[10px] text-content-muted truncate">
                            {mtg.company}
                          </span>
                        )}
                        <span className="text-[10px] text-content-muted truncate">
                          {mtg.email}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </Section>
            )}

            {/* Effective times */}
            {viewFilter !== "bookings" && (
              <Section
                title="Effective Schedule"
                icon={<CalendarIcon className="w-3.5 h-3.5" />}
                color="text-brand"
              >
                {selectedDay.effectiveTimes.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDay.effectiveTimes.map((t) => {
                      const isFromCustom = selectedDay.addedTimes.includes(t);
                      const isBooked = selectedDay.bookedMeetings?.some((m) => m.time === t);
                      return (
                        <TimePill
                          key={`eff-${t}`}
                          time={t}
                          variant={isBooked ? "booked" : isFromCustom ? "effective-custom" : "effective"}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-content-muted italic">No active hours</p>
                )}
              </Section>
            )}

            {/* Empty state for bookings-only filter with no bookings */}
            {viewFilter === "bookings" && (!selectedDay.bookedMeetings || selectedDay.bookedMeetings.length === 0) && (
              <div className="flex flex-col items-center justify-center py-8 text-content-muted">
                <Users className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm font-medium">No bookings on this day</p>
              </div>
            )}
          </>
        ) : (
          <div className="hidden lg:flex flex-col items-center justify-center h-full text-content-muted">
            <CalendarIcon className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">Select a day to see details</p>
          </div>
        )}
      </div>

      {/* ─── Scrollbar + toast styles ──────────────────────────────────── */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(101,85,143,0.5); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(101,85,143,0.7); }
      `}</style>

      {/* ─── Booking Detail Modal ──────────────────────────────────── */}
      {bookingModal && (
        <BookingDetailModal
          booking={bookingModal}
          onClose={() => setBookingModal(null)}
        />
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
      />
    </div>
  );
};

export default AvailabilityOverview;

// ─── Sub-components ─────────────────────────────────────────────────────────

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, icon, color, children }) => (
  <div className="mb-4">
    <div className="flex items-center gap-1.5 mb-2">
      <span className={color}>{icon}</span>
      <span className={`text-xs uppercase tracking-wider font-semibold ${color}`}>{title}</span>
      <div className="flex-1 h-px bg-line-glass/50" />
    </div>
    {children}
  </div>
);

interface TimePillProps {
  time: number;
  variant: "standard" | "added" | "deleted" | "effective" | "effective-custom" | "booked";
  actionIcon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  disabled?: boolean;
}

const VARIANT_STYLES: Record<TimePillProps["variant"], string> = {
  standard: "bg-surface-elevated/80 text-content-inverse border-line-glass",
  added: "bg-status-success/15 text-status-success border-status-success/30",
  deleted: "bg-status-error/15 text-status-error border-status-error/30 line-through",
  effective: "bg-brand/15 text-content-inverse border-brand/30",
  "effective-custom": "bg-accent-teal/15 text-accent-teal border-accent-teal/30",
  booked: "bg-accent-purple/15 text-accent-purple border-accent-purple/30",
};

const TimePill: React.FC<TimePillProps> = ({
  time,
  variant,
  actionIcon,
  actionLabel,
  onAction,
  disabled,
}) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium transition-colors ${VARIANT_STYLES[variant]}`}
  >
    {formatMinutes(time)}
    {onAction && (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onAction();
        }}
        disabled={disabled}
        aria-label={actionLabel}
        className="ml-0.5 p-0.5 rounded hover:bg-white/10 disabled:opacity-40 transition-colors"
      >
        {actionIcon}
      </button>
    )}
  </span>
);

// ─── Booking Detail Modal ───────────────────────────────────────────────────

interface BookingDetailModalProps {
  booking: BookedMeeting;
  onClose: () => void;
}

const DetailRow: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({
  icon,
  label,
  value,
}) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-line-glass/30 last:border-b-0">
    <span className="text-content-muted mt-0.5 shrink-0">{icon}</span>
    <div className="flex flex-col min-w-0">
      <span className="text-[10px] uppercase tracking-wider text-content-muted font-semibold">{label}</span>
      <span className="text-sm text-content-inverse break-words">{value}</span>
    </div>
  </div>
);

const BookingDetailModal: React.FC<BookingDetailModalProps> = ({ booking, onClose }) => {
  const formattedDate = (() => {
    const [y, m, d] = (booking.createdAt?.split("T")[0] ?? "").split("-").map(Number);
    if (!y) return "—";
    return new Date(y, m - 1, d).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  })();

  const statusColor =
    booking.status === "confirmed"
      ? "bg-status-success/15 text-status-success border-status-success/30"
      : booking.status === "cancelled"
        ? "bg-status-error/15 text-status-error border-status-error/30"
        : "bg-status-warning/15 text-status-warning border-status-warning/30";

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
      onClick={onClose}
    >
      <div
        className="bg-surface-elevated border border-line-glass/30 rounded-2xl shadow-2xl w-[420px] max-w-[92vw] max-h-[85vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-line-glass/30">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-accent-purple" />
            <h3 className="text-base font-bold text-content-inverse">Booking Details</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-brand/20 text-content-muted hover:text-content-inverse transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-0">
          {/* Name + status badge */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-content-inverse truncate mr-2">
              {booking.fullName}
            </span>
            <span className={`shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusColor}`}>
              {booking.status}
            </span>
          </div>

          <DetailRow
            icon={<Clock className="w-3.5 h-3.5" />}
            label="Time"
            value={formatMinutes(booking.time)}
          />
          <DetailRow
            icon={<Mail className="w-3.5 h-3.5" />}
            label="Email"
            value={
              <a href={`mailto:${booking.email}`} className="text-brand hover:underline">
                {booking.email}
              </a>
            }
          />
          {booking.company && (
            <DetailRow
              icon={<Building2 className="w-3.5 h-3.5" />}
              label="Company"
              value={booking.company}
            />
          )}
          <DetailRow
            icon={<Globe className="w-3.5 h-3.5" />}
            label="Timezone"
            value={booking.timezone}
          />
          <DetailRow
            icon={<Tag className="w-3.5 h-3.5" />}
            label="Referral Source"
            value={
              booking.referralSourceOther
                ? `${booking.referralSource} — ${booking.referralSourceOther}`
                : booking.referralSource
            }
          />
          {booking.meetLink && (
            <DetailRow
              icon={<Video className="w-3.5 h-3.5" />}
              label="Meet Link"
              value={
                <a
                  href={booking.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand hover:underline break-all"
                >
                  {booking.meetLink}
                </a>
              }
            />
          )}
          {booking.notes && (
            <DetailRow
              icon={<FileText className="w-3.5 h-3.5" />}
              label="Notes"
              value={booking.notes}
            />
          )}
          <DetailRow
            icon={<CalendarCheck className="w-3.5 h-3.5" />}
            label="Booked On"
            value={formattedDate}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-line-glass/30">
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2 rounded-xl bg-brand/15 text-brand font-semibold text-sm hover:bg-brand/25 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
