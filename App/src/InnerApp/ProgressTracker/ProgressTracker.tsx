import { useEffect, useState } from 'react';
import { Loader2, Trophy } from 'lucide-react';
import { getMyProgress, Milestone, normalizeMilestone } from '../../services/api/progressApi';
import { useLanguage } from '../../hooks/useLanguage';
import MilestoneJourney from './MilestoneJourney';

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
        if (active) setMilestones((res.data.milestones ?? []).map(normalizeMilestone));
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
  const allComplete = total > 0 && completedCount === total;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-content-muted">
        <Loader2 className="animate-spin mb-3" size={32} />
        <p>{t('progress.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 m-4 rounded-lg bg-status-error/10 text-status-error border border-status-error/30">
        {t('progress.errorLoad')}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      {/* Journey panel header */}
      <div className="rounded-2xl border border-line dark:border-line-dark bg-white dark:bg-surface-elevated p-5 sm:p-6 shadow-soft mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-content dark:text-content-inverse">
              {t('progress.title')}
            </h1>
            <p className="mt-1 text-sm text-content-muted">
              {t('progress.subtitle')}
            </p>
          </div>
          {total > 0 && (
            <span
              className={`inline-flex items-center gap-1.5 self-start sm:self-auto px-3 py-1 rounded-full text-sm font-medium ${
                allComplete
                  ? 'bg-status-success/10 text-status-success'
                  : 'bg-brand/10 text-brand dark:bg-brand/20'
              }`}
            >
              {allComplete && <Trophy size={15} />}
              {allComplete
                ? t('progress.allComplete')
                : t('progress.stepOf', {
                    current: String(currentStep),
                    total: String(total),
                  })}
            </span>
          )}
        </div>

        {/* Overall progress bar */}
        {total > 0 && (
          <div className="mt-5">
            <div className="flex justify-between mb-1.5 text-xs font-medium text-content-muted">
              <span>{t('progress.percentComplete', { percent: String(percent) })}</span>
              <span>
                {completedCount}/{total}
              </span>
            </div>
            <div className="w-full h-2.5 bg-line/60 dark:bg-line-dark rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  allComplete ? 'bg-status-success' : 'bg-brand'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Grouped collapsible journey */}
      {total === 0 ? (
        <div className="p-8 text-center text-content-muted bg-black/[0.02] dark:bg-white/[0.03] rounded-xl border border-line dark:border-line-dark">
          {t('progress.empty')}
        </div>
      ) : (
        <MilestoneJourney milestones={milestones} formatDate={formatDate} />
      )}
    </div>
  );
};

export default ProgressTracker;
