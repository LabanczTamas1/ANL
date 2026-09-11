import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Activity, Users, Calendar, Settings, ChevronRight, Mail, Kanban } from "lucide-react";
import { useLanguage } from '../hooks/useLanguage';
import { getMyProgress, normalizeMilestone } from '../services/api/progressApi';
import { getUserBookings } from '../services/api/bookingApi';
import GradientButton from "./components/GradientButton";
import MeetingsDashboard from "./components/MeetingsDashboard";

const Home = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const locale = language === 'magyar' ? 'hu' : language === 'romana' ? 'ro' : 'en-US';
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState<{ percent: number; current: number; total: number } | null>(null);
  const [nextEvent, setNextEvent] = useState<{ title: string; date: Date } | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    let active = true;
    getMyProgress()
      .then((res) => {
        if (!active) return;
        const milestones = (res.data.milestones ?? []).map(normalizeMilestone);
        const total = milestones.length;
        const completed = milestones.filter((m) => m.status === 'completed').length;
        setProgress({
          percent: total > 0 ? Math.round((completed / total) * 100) : 0,
          current: Math.min(completed + 1, total),
          total,
        });
      })
      .catch(() => {
        if (active) setProgress(null);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    getUserBookings()
      .then((res) => {
        if (!active) return;
        const bookings =
          (res.data as { bookings?: Record<string, unknown>[] }).bookings ?? [];
        const now = Date.now();
        const upcoming = bookings
          .map((b) => {
            const datePart = String(b.date ?? '').slice(0, 10);
            const [y, m, d] = datePart.split('-').map(Number);
            const mins = Number(b.time) || 0;
            const date =
              y && m && d
                ? new Date(y, m - 1, d, Math.floor(mins / 60), mins % 60)
                : new Date(NaN);
            return {
              title: String(b.company || b.full_name || t('bookMeeting')),
              date,
            };
          })
          .filter((e) => !isNaN(e.date.getTime()) && e.date.getTime() >= now)
          .sort((a, b) => a.date.getTime() - b.date.getTime());
        setNextEvent(upcoming[0] ?? null);
      })
      .catch(() => {
        if (active) setNextEvent(null);
      });
    return () => {
      active = false;
    };
  }, [t]);

  const features = [
    {
      id: 1,
      title: t('bookMeeting'),
      icon: <Calendar size={24} />,
      description: t('stayOnTop'),
      link: "/home/booking",
      featured: true,
    },
    {
      id: 2,
      title: t('seeProgress'),
      icon: <Users size={24} />,
      description: t('connectUsers'),
      link: "/home/progress-tracker",
      progress: true,
    },
    {
      id: 3,
      title: t('eventCalendar'),
      icon: <Activity size={24} />,
      description: t('trackPerformance'),
      link: "/home/calendar",
      nextEvent: true,
    },
    {
      id: 4,
      title: t('userSettings'),
      icon: <Settings size={24} />,
      description: t('customizeExperience'),
      link: "/home/account",
    },
    {
      id: 5,
      title: t('mailingSystem'),
      icon: <Mail size={24} />,
      description: t('simpleMails'),
      link: "/home/mail/inbox",
    },
    {
      id: 6,
      title: t('projectManagement'),
      icon: <Kanban size={24} />,
      description: t('organizeWorkflows'),
      link: "/home/kanban",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface-light dark:bg-surface-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand mx-auto" />
          <p className="mt-4 text-content-subtle dark:text-content-subtle-inverse">{t('loadingContent')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark py-8 px-6 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">

        {/* Hero */}
        <div className="mb-12 mt-8">
          <h1 className="text-4xl font-bold text-content dark:text-content-inverse mb-3">
            {t('welcomeInner')} <span className="text-brand">{t('toDashboard')}</span>
          </h1>
          <p className="text-lg text-content-subtle dark:text-content-subtle-inverse max-w-2xl">
            {t('discoverBetterWay')}
          </p>
          <div className="mt-6">
            <GradientButton
              onClick={() => navigate('/home/booking')}
              className="inline-flex items-center gap-2"
            >
              {t('getStarted')} <ArrowRight size={18} />
            </GradientButton>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {features.map((feature) => (
            <div
              key={feature.id}
              onClick={() => navigate(feature.link)}
              className={
                feature.featured
                  ? "group relative rounded-2xl overflow-hidden cursor-pointer transition duration-300 hover:-translate-y-1 bg-accent-rose text-white border border-accent-rose shadow-lg shadow-accent-rose/30 hover:shadow-xl hover:shadow-accent-rose/40"
                  : "group rounded-2xl overflow-hidden cursor-pointer transition duration-300 hover:-translate-y-1 bg-surface-light dark:bg-surface-elevated shadow-card hover:shadow-card-hover border border-line dark:border-line-dark"
              }
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <div
                    className={
                      feature.featured
                        ? "w-10 h-10 rounded-xl flex items-center justify-center bg-white/20 text-white mr-3"
                        : "w-10 h-10 rounded-xl flex items-center justify-center bg-brand/10 text-brand mr-3"
                    }
                  >
                    {feature.icon}
                  </div>
                  <h3 className={`font-bold text-lg ${feature.featured ? "text-white" : "text-content dark:text-content-inverse"}`}>
                    {feature.title}
                  </h3>
                </div>
                {feature.progress && progress ? (
                  <div className="mb-4 flex-grow">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-2xl font-bold text-content dark:text-content-inverse">
                        {progress.percent}%
                      </span>
                      {progress.total > 0 && (
                        <span className="text-xs text-content-muted">
                          {t('progress.stepOf', {
                            current: String(progress.current),
                            total: String(progress.total),
                          })}
                        </span>
                      )}
                    </div>
                    <div className="h-2 w-full rounded-full bg-brand/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand transition-[width] duration-500"
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                  </div>
                ) : feature.nextEvent ? (
                  <div className="mb-4 flex-grow">
                    <p className="text-xs font-medium uppercase tracking-wide text-content-muted mb-1">
                      {t('home.nextEvent')}
                    </p>
                    {nextEvent ? (
                      <>
                        <p className="text-base font-semibold text-content dark:text-content-inverse truncate">
                          {nextEvent.title}
                        </p>
                        <p className="text-sm text-brand font-medium mt-0.5">
                          {nextEvent.date.toLocaleDateString(locale, {
                            month: 'short',
                            day: 'numeric',
                          })}
                          {' · '}
                          {nextEvent.date.toLocaleTimeString(locale, {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-content-subtle dark:text-content-subtle-inverse">
                        {t('home.noUpcomingEvent')}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className={`mb-4 flex-grow ${feature.featured ? "text-white/85" : "text-content-subtle dark:text-content-subtle-inverse"}`}>
                    {feature.description}
                  </p>
                )}
                <div className="mt-auto">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                      feature.featured
                        ? "text-white group-hover:bg-white group-hover:text-brand"
                        : "text-brand group-hover:bg-brand/10"
                    }`}
                  >
                    {t('learnMore')}
                    <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <MeetingsDashboard />

        {/* Footer */}
        <div className="mt-16 text-center text-content-muted">
          <p>© 2025 {t('companyName')}. {t('allRightsReserved')}</p>
        </div>

      </div>
    </div>
  );
};

export default Home;
