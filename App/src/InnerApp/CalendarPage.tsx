import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
} from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";
import { getUserBookings } from "../services/api/bookingApi";
import { getMyProgress, normalizeMilestone } from "../services/api/progressApi";
import GradientButton from "./components/GradientButton";

type CalendarEventType = "meeting" | "milestone";

interface CalendarEvent {
  id: string;
  type: CalendarEventType;
  title: string;
  subtitle?: string;
  date: Date;
  link?: string | null;
}

const localeMap: Record<string, string> = {
  english: "en-US",
  magyar: "hu",
  romana: "ro",
};

/** Build a "YYYY-MM-DD" key in local time (no timezone drift). */
const dayKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/** Parse a booking's date (DATE column) + time (minutes) into a local Date. */
const parseBookingDate = (raw: unknown, minutes: unknown): Date => {
  const datePart = String(raw ?? "").slice(0, 10);
  const [y, m, d] = datePart.split("-").map(Number);
  const total = Number(minutes) || 0;
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (!y || !m || !d) return new Date(NaN);
  return new Date(y, m - 1, d, hours, mins);
};

/** Month grid (weeks x days), starting Monday, padded with sibling months. */
const buildMonthMatrix = (year: number, month: number): Date[][] => {
  const first = new Date(year, month, 1);
  // getDay(): 0=Sun..6=Sat. Convert to Monday-first offset (0=Mon..6=Sun).
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - offset);
  const weeks: Date[][] = [];
  const cursor = new Date(start);
  for (let w = 0; w < 6; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
};

const CalendarPage = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const locale = localeMap[language] ?? "en-US";

  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedKey, setSelectedKey] = useState<string>(() => dayKey(new Date()));

  useEffect(() => {
    let active = true;

    const load = async () => {
      const collected: CalendarEvent[] = [];

      const [bookingsRes, progressRes] = await Promise.allSettled([
        getUserBookings(),
        getMyProgress(),
      ]);

      if (bookingsRes.status === "fulfilled") {
        const bookings =
          (bookingsRes.value.data as { bookings?: Record<string, unknown>[] })
            .bookings ?? [];
        for (const b of bookings) {
          const date = parseBookingDate(b.date, b.time);
          if (isNaN(date.getTime())) continue;
          collected.push({
            id: `meeting-${String(b.id)}`,
            type: "meeting",
            title: String(b.company || b.full_name || t("calendar.meeting")),
            subtitle: String(b.full_name || ""),
            date,
            link: (b.meet_link as string) ?? null,
          });
        }
      }

      if (progressRes.status === "fulfilled") {
        const milestones = (progressRes.value.data.milestones ?? []).map(
          normalizeMilestone,
        );
        for (const m of milestones) {
          if (m.status !== "completed" || !m.completedAt) continue;
          const date = new Date(m.completedAt);
          if (isNaN(date.getTime())) continue;
          collected.push({
            id: `milestone-${m.id}`,
            type: "milestone",
            title: m.title,
            subtitle: m.category || undefined,
            date,
          });
        }
      }

      if (active) {
        setEvents(collected);
        setIsLoading(false);
      }
    };

    load().catch(() => {
      if (active) setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, [t]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of events) {
      const key = dayKey(ev.date);
      const bucket = map.get(key);
      if (bucket) bucket.push(ev);
      else map.set(key, [ev]);
    }
    return map;
  }, [events]);

  const weeks = useMemo(
    () => buildMonthMatrix(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate],
  );

  const weekdayLabels = useMemo(() => {
    // Reference Monday: 2024-01-01 was a Monday.
    const labels: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(2024, 0, 1 + i);
      labels.push(d.toLocaleDateString(locale, { weekday: "short" }));
    }
    return labels;
  }, [locale]);

  const upcomingMeetings = useMemo(() => {
    const now = Date.now();
    return events
      .filter((e) => e.type === "meeting" && e.date.getTime() >= now)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [events]);

  const completedMilestones = useMemo(
    () =>
      events
        .filter((e) => e.type === "milestone")
        .sort((a, b) => b.date.getTime() - a.date.getTime()),
    [events],
  );

  const selectedEvents = useMemo(() => {
    const list = eventsByDay.get(selectedKey) ?? [];
    return [...list].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [eventsByDay, selectedKey]);

  const todayKey = dayKey(new Date());
  const monthTitle = viewDate.toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });

  const goToPrevMonth = () =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const goToNextMonth = () =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const goToToday = () => {
    const now = new Date();
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedKey(dayKey(now));
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  const formatFullDate = (date: Date) =>
    date.toLocaleDateString(locale, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface-light dark:bg-surface-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand mx-auto" />
          <p className="mt-4 text-content-subtle dark:text-content-subtle-inverse">
            {t("calendar.loading")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark py-8 px-6 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 mt-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-content dark:text-content-inverse mb-2 flex items-center gap-3">
              <CalendarIcon className="text-brand" size={32} />
              {t("calendar.title")}
            </h1>
            <p className="text-content-subtle dark:text-content-subtle-inverse">
              {t("calendar.subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-2 text-content-muted">
              <span className="w-3 h-3 rounded-full bg-accent-rose" />
              {t("calendar.legendMeeting")}
            </span>
            <span className="flex items-center gap-2 text-content-muted">
              <span className="w-3 h-3 rounded-full bg-brand" />
              {t("calendar.legendMilestone")}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar grid */}
          <div className="lg:col-span-2 bg-surface-light dark:bg-surface-elevated rounded-2xl shadow-card dark:shadow-dark-card border border-line dark:border-line-dark p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-content dark:text-content-inverse capitalize">
                {monthTitle}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToToday}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-brand hover:bg-brand/10 transition-colors"
                >
                  {t("calendar.today")}
                </button>
                <button
                  onClick={goToPrevMonth}
                  aria-label="Previous month"
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-content-muted hover:bg-brand/10 hover:text-brand transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={goToNextMonth}
                  aria-label="Next month"
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-content-muted hover:bg-brand/10 hover:text-brand transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekdayLabels.map((label) => (
                <div
                  key={label}
                  className="text-center text-xs font-semibold uppercase tracking-wide text-content-muted py-1"
                >
                  {label}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {weeks.flat().map((day) => {
                const key = dayKey(day);
                const inMonth = day.getMonth() === viewDate.getMonth();
                const isToday = key === todayKey;
                const isSelected = key === selectedKey;
                const dayEvents = eventsByDay.get(key) ?? [];
                const hasMeeting = dayEvents.some((e) => e.type === "meeting");
                const hasMilestone = dayEvents.some(
                  (e) => e.type === "milestone",
                );

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedKey(key)}
                    className={[
                      "relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-colors",
                      isSelected
                        ? "bg-brand text-white font-semibold"
                        : isToday
                          ? "bg-brand/10 text-brand font-semibold"
                          : inMonth
                            ? "text-content dark:text-content-inverse hover:bg-brand/5 dark:hover:bg-brand/10"
                            : "text-content-muted/50 hover:bg-brand/5 dark:hover:bg-brand/10",
                    ].join(" ")}
                  >
                    <span>{day.getDate()}</span>
                    {(hasMeeting || hasMilestone) && (
                      <span className="absolute bottom-1.5 flex items-center gap-0.5">
                        {hasMeeting && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected ? "bg-white" : "bg-accent-rose"
                            }`}
                          />
                        )}
                        {hasMilestone && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected ? "bg-white" : "bg-brand"
                            }`}
                          />
                        )}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected day detail */}
          <div className="bg-surface-light dark:bg-surface-elevated rounded-2xl shadow-card dark:shadow-dark-card border border-line dark:border-line-dark p-5">
            <h2 className="text-lg font-bold text-content dark:text-content-inverse mb-1">
              {formatFullDate(new Date(`${selectedKey}T00:00:00`))}
            </h2>
            <p className="text-sm text-content-muted mb-4">
              {selectedEvents.length === 1
                ? t("calendar.oneEvent")
                : t("calendar.eventCount", {
                    count: String(selectedEvents.length),
                  })}
            </p>

            {selectedEvents.length === 0 ? (
              <div className="text-center py-8 text-content-muted">
                <CalendarIcon className="mx-auto mb-2 opacity-40" size={32} />
                <p className="text-sm">{t("calendar.noEventsDay")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className={`rounded-xl border p-3 ${
                      ev.type === "meeting"
                        ? "border-accent-rose/30 bg-accent-rose/5"
                        : "border-brand/30 bg-brand/5"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className={`mt-0.5 ${
                          ev.type === "meeting"
                            ? "text-accent-rose"
                            : "text-brand"
                        }`}
                      >
                        {ev.type === "meeting" ? (
                          <CalendarIcon size={16} />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-content dark:text-content-inverse truncate">
                          {ev.title}
                        </p>
                        {ev.subtitle && (
                          <p className="text-xs text-content-muted truncate">
                            {ev.subtitle}
                          </p>
                        )}
                        <p className="text-xs text-content-muted mt-1 flex items-center gap-1">
                          <Clock size={12} />
                          {ev.type === "meeting"
                            ? formatTime(ev.date)
                            : t("calendar.completedLabel")}
                        </p>
                        {ev.type === "meeting" && ev.link && (
                          <a
                            href={ev.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-brand hover:text-brand-hover"
                          >
                            <ExternalLink size={12} />
                            {t("calendar.join")}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Upcoming meetings */}
          <div className="bg-surface-light dark:bg-surface-elevated rounded-2xl shadow-card dark:shadow-dark-card border border-line dark:border-line-dark p-5">
            <h2 className="text-lg font-bold text-content dark:text-content-inverse mb-4 flex items-center gap-2">
              <CalendarIcon className="text-accent-rose" size={20} />
              {t("calendar.upcomingMeetings")}
            </h2>
            {upcomingMeetings.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-content-muted mb-4">
                  {t("calendar.noUpcoming")}
                </p>
                <GradientButton onClick={() => navigate("/home/booking")}>
                  {t("bookMeeting")}
                </GradientButton>
              </div>
            ) : (
              <ul className="space-y-3">
                {upcomingMeetings.map((ev) => (
                  <li
                    key={ev.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-line dark:border-line-dark hover:bg-brand/5 dark:hover:bg-brand/10 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-accent-rose/10 text-accent-rose flex flex-col items-center justify-center leading-none">
                      <span className="text-[10px] uppercase">
                        {ev.date.toLocaleDateString(locale, { month: "short" })}
                      </span>
                      <span className="text-sm font-bold">
                        {ev.date.getDate()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-content dark:text-content-inverse truncate">
                        {ev.title}
                      </p>
                      <p className="text-xs text-content-muted flex items-center gap-1">
                        <Clock size={12} />
                        {formatTime(ev.date)}
                      </p>
                    </div>
                    {ev.link && (
                      <a
                        href={ev.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-hover"
                      >
                        <MapPin size={12} />
                        {t("calendar.join")}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Completed milestones */}
          <div className="bg-surface-light dark:bg-surface-elevated rounded-2xl shadow-card dark:shadow-dark-card border border-line dark:border-line-dark p-5">
            <h2 className="text-lg font-bold text-content dark:text-content-inverse mb-4 flex items-center gap-2">
              <CheckCircle2 className="text-brand" size={20} />
              {t("calendar.completedMilestones")}
            </h2>
            {completedMilestones.length === 0 ? (
              <p className="text-sm text-content-muted text-center py-6">
                {t("calendar.noCompleted")}
              </p>
            ) : (
              <ul className="space-y-3">
                {completedMilestones.map((ev) => (
                  <li
                    key={ev.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-line dark:border-line-dark hover:bg-brand/5 dark:hover:bg-brand/10 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
                      <CheckCircle2 size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-content dark:text-content-inverse truncate">
                        {ev.title}
                      </p>
                      <p className="text-xs text-content-muted">
                        {t("progress.completedOn", {
                          date: ev.date.toLocaleDateString(locale, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }),
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
