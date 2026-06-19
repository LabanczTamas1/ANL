import { useEffect, useState } from 'react';
import { CheckCircle, Circle, Loader2, Clock } from 'lucide-react';
import { getMyProgress, Milestone } from '../../services/api/progressApi';
import { useLanguage } from '../../hooks/useLanguage';

const ProgressTracker = () => {
  const { t, language } = useLanguage();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await getMyProgress();
        if (active) setMilestones(res.data.milestones ?? []);
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const localeMap: Record<string, string> = {
    english: 'en-US',
    magyar: 'hu-HU',
    romana: 'ro-RO',
  };

  const formatDate = (value: string | null) => {
    if (!value) return '';
    try {
      return new Date(value).toLocaleDateString(localeMap[language] || 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const total = milestones.length;
  const completedCount = milestones.filter((m) => m.status === 'completed').length;
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const currentStep = Math.min(completedCount + 1, total);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-500 dark:text-gray-400">
        <Loader2 className="animate-spin mb-3" size={32} />
        <p>{t('progress.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 m-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
        {t('progress.errorLoad')}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
              {t('progress.title')}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('progress.subtitle')}
            </p>
          </div>
          {total > 0 && (
            <span className="inline-flex items-center self-start sm:self-auto px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
              {t('progress.stepOf', {
                current: String(currentStep),
                total: String(total),
              })}
            </span>
          )}
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div className="mt-5">
            <div className="flex justify-between mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
              <span>{t('progress.percentComplete', { percent: String(percent) })}</span>
              <span>
                {completedCount}/{total}
              </span>
            </div>
            <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Empty state */}
      {total === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
          {t('progress.empty')}
        </div>
      ) : (
        /* Vertical timeline */
        <ol className="relative">
          {milestones.map((m, idx) => {
            const isComplete = m.status === 'completed';
            const isInProgress = m.status === 'in_progress';
            const isLast = idx === milestones.length - 1;

            return (
              <li key={m.id} className="relative pl-12 pb-8">
                {/* Connector line */}
                {!isLast && (
                  <span
                    className={`absolute left-[18px] top-9 -bottom-1 w-0.5 ${
                      isComplete
                        ? 'bg-emerald-400 dark:bg-emerald-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                    aria-hidden="true"
                  />
                )}

                {/* Status icon */}
                <span className="absolute left-0 top-0.5 flex items-center justify-center">
                  {isComplete ? (
                    <CheckCircle
                      size={36}
                      className="text-emerald-500 bg-white dark:bg-gray-900 rounded-full"
                    />
                  ) : isInProgress ? (
                    <Clock
                      size={36}
                      className="text-blue-500 bg-white dark:bg-gray-900 rounded-full p-0.5"
                    />
                  ) : (
                    <Circle
                      size={36}
                      className="text-gray-300 dark:text-gray-600 bg-white dark:bg-gray-900 rounded-full"
                    />
                  )}
                </span>

                {/* Card */}
                <div
                  className={`rounded-lg border p-4 shadow-sm transition-colors ${
                    isInProgress
                      ? 'border-blue-300 dark:border-blue-700 bg-blue-50/60 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3
                      className={`text-base font-semibold ${
                        isComplete
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : isInProgress
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      {m.title}
                    </h3>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        isComplete
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : isInProgress
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {isComplete
                        ? t('progress.completed')
                        : isInProgress
                        ? t('progress.inProgress')
                        : t('progress.pending')}
                    </span>
                  </div>

                  {m.description && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      {m.description}
                    </p>
                  )}

                  {isComplete && m.completedAt && (
                    <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                      {t('progress.completedOn', { date: formatDate(m.completedAt) })}
                    </p>
                  )}

                  {m.note && (
                    <div className="mt-3 text-sm rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-2 text-amber-800 dark:text-amber-200">
                      <span className="font-medium">{t('progress.noteLabel')}: </span>
                      {m.note}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};

export default ProgressTracker;
