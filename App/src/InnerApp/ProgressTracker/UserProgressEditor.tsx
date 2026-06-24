import { useEffect, useRef, useState } from 'react';
import { Loader2, Plus, ArrowRight } from 'lucide-react';
import {
  getUserProgress,
  updateMilestone,
  createMilestone,
  deleteMilestone,
  normalizeMilestone,
  Milestone,
  MilestoneStatus,
} from '../../services/api/progressApi';
import { useLanguage } from '../../hooks/useLanguage';
import MilestoneJourney, { MilestoneSaveState } from './MilestoneJourney';

interface UserProgressEditorProps {
  userId: string;
  /** Compact spacing for embedding inside a modal. */
  compact?: boolean;
  /** Notified after any change so parents can refresh summaries. */
  onChanged?: () => void;
}

/**
 * Self-contained admin/owner editor for a single user's milestone journey.
 * Loads the user's milestones, renders the grouped journey with edit controls,
 * and persists status / note / add / delete changes (optimistic).
 */
const UserProgressEditor = ({
  userId,
  compact = false,
  onChanged,
}: UserProgressEditorProps) => {
  const { t, language } = useLanguage();

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<Record<string, MilestoneSaveState>>(
    {},
  );

  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [adding, setAdding] = useState(false);

  const savedTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    let active = true;
    setLoading(true);
    getUserProgress(userId)
      .then((res) => {
        if (active)
          setMilestones((res.data.milestones ?? []).map(normalizeMilestone));
      })
      .catch(() => {
        if (active) setMilestones([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    const timers = savedTimers.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
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

  const flagSaved = (id: string) => {
    setSaveState((s) => ({ ...s, [id]: 'saved' }));
    clearTimeout(savedTimers.current[id]);
    savedTimers.current[id] = setTimeout(() => {
      setSaveState((s) => ({ ...s, [id]: undefined }));
    }, 1800);
  };

  const patchMilestone = async (
    id: string,
    payload: { status?: MilestoneStatus; note?: string },
  ) => {
    setSaveState((s) => ({ ...s, [id]: 'saving' }));
    try {
      const res = await updateMilestone(id, payload);
      const updated = normalizeMilestone(res.data.milestone);
      setMilestones((prev) => prev.map((x) => (x.id === id ? updated : x)));
      flagSaved(id);
      onChanged?.();
      return updated;
    } catch {
      setSaveState((s) => ({ ...s, [id]: undefined }));
      return null;
    }
  };

  const handleSetStatus = (m: Milestone, status: MilestoneStatus) => {
    if (m.status === status) return;
    setMilestones((prev) =>
      prev.map((x) => (x.id === m.id ? { ...x, status } : x)),
    );
    patchMilestone(m.id, { status });
  };

  const handleNoteChange = (id: string, note: string) => {
    setMilestones((prev) => prev.map((x) => (x.id === id ? { ...x, note } : x)));
  };

  const handleNoteBlur = (m: Milestone, note: string, original: string) => {
    if (note === original) return;
    patchMilestone(m.id, { note });
  };

  const handleDelete = async (m: Milestone) => {
    if (!window.confirm(t('progressAdmin.confirmDelete'))) return;
    setSaveState((s) => ({ ...s, [m.id]: 'saving' }));
    try {
      await deleteMilestone(m.id);
      setMilestones((prev) => prev.filter((x) => x.id !== m.id));
      onChanged?.();
    } catch {
      setSaveState((s) => ({ ...s, [m.id]: undefined }));
    }
  };

  const handleAdvance = async () => {
    const ordered = [...milestones].sort((a, b) => a.position - b.position);
    const next = ordered.find((m) => m.status !== 'completed');
    if (!next) return;
    setMilestones((prev) =>
      prev.map((x) => (x.id === next.id ? { ...x, status: 'completed' } : x)),
    );
    await patchMilestone(next.id, { status: 'completed' });
    const idx = ordered.findIndex((x) => x.id === next.id);
    const following = ordered[idx + 1];
    if (following && following.status === 'pending') {
      setMilestones((prev) =>
        prev.map((x) =>
          x.id === following.id ? { ...x, status: 'in_progress' } : x,
        ),
      );
      await patchMilestone(following.id, { status: 'in_progress' });
    }
  };

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      const res = await createMilestone(userId, {
        title: newTitle.trim(),
        category: newCategory.trim() || undefined,
      });
      setMilestones((prev) => [...prev, normalizeMilestone(res.data.milestone)]);
      setNewTitle('');
      setNewCategory('');
      onChanged?.();
    } finally {
      setAdding(false);
    }
  };

  const total = milestones.length;
  const completedCount = milestones.filter((m) => m.status === 'completed').length;
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const allComplete = total > 0 && completedCount === total;

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-content-muted py-6">
        <Loader2 className="animate-spin" size={18} />
        {t('progressAdmin.loading')}
      </div>
    );
  }

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      {/* Overall progress + advance */}
      <div className="rounded-xl border border-line dark:border-line-dark bg-white dark:bg-surface-elevated p-4">
        <div className="flex items-center justify-between text-xs font-medium text-content-muted mb-1.5">
          <span>{t('progressAdmin.overallProgress')}</span>
          <span>
            {t('progressAdmin.completedCount', {
              completed: String(completedCount),
              total: String(total),
            })}
          </span>
        </div>
        <div className="w-full h-2 bg-line/60 dark:bg-line-dark rounded-full overflow-hidden">
          <div
            className="h-full bg-brand rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <button
          type="button"
          onClick={handleAdvance}
          disabled={allComplete}
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-brand hover:bg-brand-hover text-white text-sm font-medium px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowRight size={16} />
          {allComplete
            ? t('progressAdmin.allComplete')
            : t('progressAdmin.advance')}
        </button>
      </div>

      {/* Grouped editable journey */}
      <MilestoneJourney
        milestones={milestones}
        editable
        formatDate={formatDate}
        saveState={saveState}
        onSetStatus={handleSetStatus}
        onNoteChange={handleNoteChange}
        onNoteBlur={handleNoteBlur}
        onDelete={handleDelete}
      />

      {/* Add milestone */}
      <div className="rounded-xl border border-dashed border-line dark:border-line-dark p-4">
        <h3 className="text-sm font-semibold text-content-subtle dark:text-content-subtle-inverse mb-3 flex items-center gap-2">
          <Plus size={16} />
          {t('progressAdmin.addMilestone')}
        </h3>
        <div className="flex flex-col gap-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={t('progressAdmin.newTitle')}
            className="rounded-md border border-line dark:border-line-dark bg-white dark:bg-surface-dark text-sm px-3 py-2 text-content dark:text-content-inverse focus:outline-none focus:ring-2 focus:ring-brand-focus"
          />
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder={t('progressAdmin.newCategory')}
            className="rounded-md border border-line dark:border-line-dark bg-white dark:bg-surface-dark text-sm px-3 py-2 text-content dark:text-content-inverse focus:outline-none focus:ring-2 focus:ring-brand-focus"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={adding || !newTitle.trim()}
            className="inline-flex items-center justify-center gap-1 self-start rounded-md bg-brand hover:bg-brand-hover text-white text-sm font-medium px-4 py-2 disabled:opacity-50 transition-colors"
          >
            {adding ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Plus size={16} />
            )}
            {t('progressAdmin.add')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProgressEditor;
