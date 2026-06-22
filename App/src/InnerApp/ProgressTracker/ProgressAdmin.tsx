import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Loader2,
  ChevronLeft,
  Trash2,
  Plus,
  Search,
  CheckCircle,
  Circle,
  Clock,
  Check,
  ArrowRight,
} from 'lucide-react';
import {
  getUsersProgressSummary,
  getUserProgress,
  updateMilestone,
  createMilestone,
  deleteMilestone,
  normalizeMilestone,
  Milestone,
  MilestoneStatus,
  ProgressUserSummary,
} from '../../services/api/progressApi';
import { useLanguage } from '../../hooks/useLanguage';

type SaveState = 'saving' | 'saved' | undefined;

const STATUS_META: Record<
  MilestoneStatus,
  { labelKey: string; Icon: typeof Circle; active: string }
> = {
  pending: {
    labelKey: 'progress.pending',
    Icon: Circle,
    active: 'bg-gray-600 text-white border-gray-600',
  },
  in_progress: {
    labelKey: 'progress.inProgress',
    Icon: Clock,
    active: 'bg-blue-600 text-white border-blue-600',
  },
  completed: {
    labelKey: 'progress.completed',
    Icon: CheckCircle,
    active: 'bg-emerald-600 text-white border-emerald-600',
  },
};

const STATUS_ORDER: MilestoneStatus[] = ['pending', 'in_progress', 'completed'];

const ProgressAdmin = () => {
  const { t } = useLanguage();

  const [summaries, setSummaries] = useState<ProgressUserSummary[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [search, setSearch] = useState('');

  const [selected, setSelected] = useState<ProgressUserSummary | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saveState, setSaveState] = useState<Record<string, SaveState>>({});

  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [adding, setAdding] = useState(false);

  const savedTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const loadSummaries = async () => {
    setLoadingList(true);
    try {
      const res = await getUsersProgressSummary();
      setSummaries(res.data.data ?? []);
    } catch {
      setSummaries([]);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadSummaries();
    return () => {
      Object.values(savedTimers.current).forEach(clearTimeout);
    };
  }, []);

  const openUser = async (user: ProgressUserSummary) => {
    setSelected(user);
    setLoadingDetail(true);
    setMilestones([]);
    try {
      const res = await getUserProgress(user.userId);
      setMilestones((res.data.milestones ?? []).map(normalizeMilestone));
    } catch {
      setMilestones([]);
    } finally {
      setLoadingDetail(false);
    }
  };

  const backToList = () => {
    setSelected(null);
    setMilestones([]);
    setNewTitle('');
    setNewDescription('');
    setSaveState({});
    loadSummaries();
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
      return updated;
    } catch {
      setSaveState((s) => ({ ...s, [id]: undefined }));
      return null;
    }
  };

  const handleStatusChange = (m: Milestone, status: MilestoneStatus) => {
    if (m.status === status) return;
    // Optimistic update for instant feedback.
    setMilestones((prev) =>
      prev.map((x) => (x.id === m.id ? { ...x, status } : x)),
    );
    patchMilestone(m.id, { status });
  };

  const handleNoteEdit = (id: string, note: string) => {
    setMilestones((prev) => prev.map((x) => (x.id === id ? { ...x, note } : x)));
  };

  const handleNoteBlur = (m: Milestone, note: string, original: string) => {
    if (note === original) return;
    patchMilestone(m.id, { note });
  };

  const handleAdvance = async () => {
    const next = milestones.find((m) => m.status !== 'completed');
    if (!next) return;
    const idx = milestones.findIndex((x) => x.id === next.id);
    setMilestones((prev) =>
      prev.map((x) => (x.id === next.id ? { ...x, status: 'completed' } : x)),
    );
    await patchMilestone(next.id, { status: 'completed' });
    const following = milestones[idx + 1];
    if (following && following.status === 'pending') {
      setMilestones((prev) =>
        prev.map((x) =>
          x.id === following.id ? { ...x, status: 'in_progress' } : x,
        ),
      );
      await patchMilestone(following.id, { status: 'in_progress' });
    }
  };

  const handleDelete = async (m: Milestone) => {
    if (!window.confirm(t('progressAdmin.confirmDelete'))) return;
    setSaveState((s) => ({ ...s, [m.id]: 'saving' }));
    try {
      await deleteMilestone(m.id);
      setMilestones((prev) => prev.filter((x) => x.id !== m.id));
    } catch {
      setSaveState((s) => ({ ...s, [m.id]: undefined }));
    }
  };

  const handleAdd = async () => {
    if (!selected || !newTitle.trim()) return;
    setAdding(true);
    try {
      const res = await createMilestone(selected.userId, {
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
      });
      setMilestones((prev) => [...prev, normalizeMilestone(res.data.milestone)]);
      setNewTitle('');
      setNewDescription('');
    } finally {
      setAdding(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return summaries;
    return summaries.filter((u) =>
      `${u.firstName} ${u.lastName} ${u.username} ${u.email}`
        .toLowerCase()
        .includes(q),
    );
  }, [summaries, search]);

  const displayName = (u: ProgressUserSummary) => {
    const full = `${u.firstName} ${u.lastName}`.trim();
    return full || u.username || u.email;
  };

  const initials = (u: ProgressUserSummary) => {
    const f = u.firstName?.[0] ?? '';
    const l = u.lastName?.[0] ?? '';
    const combo = `${f}${l}`.trim();
    return (combo || u.email?.[0] || '?').toUpperCase();
  };

  const completedCount = milestones.filter((m) => m.status === 'completed').length;
  const total = milestones.length;
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const allComplete = total > 0 && completedCount === total;

  const SaveIndicator = ({ id }: { id: string }) => {
    const state = saveState[id];
    if (state === 'saving')
      return (
        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
          <Loader2 className="animate-spin" size={13} />
          {t('progressAdmin.saving')}
        </span>
      );
    if (state === 'saved')
      return (
        <span className="inline-flex items-center gap-1 text-xs text-emerald-500">
          <Check size={13} />
          {t('progressAdmin.saved')}
        </span>
      );
    return null;
  };

  // ── Detail view ────────────────────────────────────────────────────────────
  if (selected) {
    return (
      <div className="p-4 sm:p-6 max-w-3xl mx-auto">
        <button
          onClick={backToList}
          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline mb-4"
        >
          <ChevronLeft size={16} />
          {t('progressAdmin.back')}
        </button>

        {/* User header card */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm mb-5">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 text-white flex items-center justify-center font-semibold">
              {initials(selected)}
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white truncate">
                {displayName(selected)}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {selected.email}
              </p>
            </div>
          </div>

          {total > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                <span>{t('progressAdmin.overallProgress')}</span>
                <span>
                  {t('progressAdmin.completedCount', {
                    completed: String(completedCount),
                    total: String(total),
                  })}
                </span>
              </div>
              <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <button
                onClick={handleAdvance}
                disabled={allComplete}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowRight size={16} />
                {allComplete
                  ? t('progressAdmin.allComplete')
                  : t('progressAdmin.advance')}
              </button>
            </div>
          )}
        </div>

        {loadingDetail ? (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 py-8">
            <Loader2 className="animate-spin" size={20} />
            {t('progressAdmin.loading')}
          </div>
        ) : (
          <>
            <ol className="space-y-3">
              {milestones.map((m, idx) => {
                const isComplete = m.status === 'completed';
                const isInProgress = m.status === 'in_progress';
                return (
                  <li
                    key={m.id}
                    className={`rounded-xl border p-4 shadow-sm transition-colors ${
                      isInProgress
                        ? 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/15'
                        : isComplete
                        ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-900/10'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`flex-shrink-0 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                          isComplete
                            ? 'bg-emerald-500 text-white'
                            : isInProgress
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300'
                        }`}
                      >
                        {isComplete ? <Check size={15} /> : idx + 1}
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                              {m.title}
                            </h3>
                            {m.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                {m.description}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDelete(m)}
                            className="flex-shrink-0 text-gray-400 hover:text-red-500 p-1"
                            aria-label={t('progressAdmin.delete')}
                            title={t('progressAdmin.delete')}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Segmented status control */}
                        <div className="mt-3 inline-flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                          {STATUS_ORDER.map((s) => {
                            const meta = STATUS_META[s];
                            const isActive = m.status === s;
                            const StatusIcon = meta.Icon;
                            return (
                              <button
                                key={s}
                                onClick={() => handleStatusChange(m, s)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-r last:border-r-0 border-gray-200 dark:border-gray-600 transition-colors ${
                                  isActive
                                    ? meta.active
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                              >
                                <StatusIcon size={14} />
                                {t(meta.labelKey)}
                              </button>
                            );
                          })}
                        </div>

                        {/* Note */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                              {t('progressAdmin.noteLabel')}
                            </label>
                            <SaveIndicator id={m.id} />
                          </div>
                          <textarea
                            value={m.note}
                            onChange={(e) => handleNoteEdit(m.id, e.target.value)}
                            onBlur={(e) =>
                              handleNoteBlur(m, e.target.value, m.note)
                            }
                            rows={2}
                            placeholder={t('progressAdmin.notePlaceholder')}
                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-3 py-2 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>

            {/* Add milestone */}
            <div className="mt-6 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                <Plus size={16} />
                {t('progressAdmin.addMilestone')}
              </h3>
              <div className="flex flex-col gap-2">
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={t('progressAdmin.newTitle')}
                  className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-3 py-2 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder={t('progressAdmin.newDescription')}
                  className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-3 py-2 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAdd}
                  disabled={adding || !newTitle.trim()}
                  className="inline-flex items-center justify-center gap-1 self-start rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 disabled:opacity-50"
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
          </>
        )}
      </div>
    );
  }

  // ── List view ────────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
        {t('progressAdmin.title')}
      </h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 mb-5">
        {t('progressAdmin.subtitle')}
      </p>

      <div className="relative mb-5">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('progressAdmin.searchPlaceholder')}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm pl-9 pr-3 py-2 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loadingList ? (
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 py-8">
          <Loader2 className="animate-spin" size={20} />
          {t('progressAdmin.loading')}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
          {t('progressAdmin.noUsers')}
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((u) => {
            const pct = u.total > 0 ? Math.round((u.completed / u.total) * 100) : 0;
            return (
              <li
                key={u.userId}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 text-white flex items-center justify-center text-sm font-semibold">
                  {initials(u)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                    {displayName(u)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {u.email}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden max-w-[220px]">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {u.completed}/{u.total}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => openUser(u)}
                  className="self-start sm:self-center rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2"
                >
                  {t('progressAdmin.manage')}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ProgressAdmin;
