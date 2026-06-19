import { useEffect, useMemo, useState } from 'react';
import { Loader2, ChevronLeft, Trash2, Plus, Search } from 'lucide-react';
import {
  getUsersProgressSummary,
  getUserProgress,
  updateMilestone,
  createMilestone,
  deleteMilestone,
  Milestone,
  MilestoneStatus,
  ProgressUserSummary,
} from '../../services/api/progressApi';
import { useLanguage } from '../../hooks/useLanguage';

const STATUS_OPTIONS: MilestoneStatus[] = ['pending', 'in_progress', 'completed'];

const ProgressAdmin = () => {
  const { t } = useLanguage();

  const [summaries, setSummaries] = useState<ProgressUserSummary[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [search, setSearch] = useState('');

  const [selected, setSelected] = useState<ProgressUserSummary | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [adding, setAdding] = useState(false);

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
  }, []);

  const openUser = async (user: ProgressUserSummary) => {
    setSelected(user);
    setLoadingDetail(true);
    setMilestones([]);
    try {
      const res = await getUserProgress(user.userId);
      setMilestones(res.data.milestones ?? []);
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
    loadSummaries();
  };

  const handleStatusChange = async (m: Milestone, status: MilestoneStatus) => {
    setSavingId(m.id);
    try {
      const res = await updateMilestone(m.id, { status });
      setMilestones((prev) =>
        prev.map((x) => (x.id === m.id ? res.data.milestone : x)),
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleNoteBlur = async (m: Milestone, note: string) => {
    if (note === m.note) return;
    setSavingId(m.id);
    try {
      const res = await updateMilestone(m.id, { note });
      setMilestones((prev) =>
        prev.map((x) => (x.id === m.id ? res.data.milestone : x)),
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleNoteEdit = (id: string, note: string) => {
    setMilestones((prev) => prev.map((x) => (x.id === id ? { ...x, note } : x)));
  };

  const handleDelete = async (m: Milestone) => {
    if (!window.confirm(t('progressAdmin.confirmDelete'))) return;
    setSavingId(m.id);
    try {
      await deleteMilestone(m.id);
      setMilestones((prev) => prev.filter((x) => x.id !== m.id));
    } finally {
      setSavingId(null);
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
      setMilestones((prev) => [...prev, res.data.milestone]);
      setNewTitle('');
      setNewDescription('');
    } finally {
      setAdding(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return summaries;
    return summaries.filter((u) => {
      const name = `${u.firstName} ${u.lastName} ${u.username} ${u.email}`.toLowerCase();
      return name.includes(q);
    });
  }, [summaries, search]);

  const displayName = (u: ProgressUserSummary) => {
    const full = `${u.firstName} ${u.lastName}`.trim();
    return full || u.username || u.email;
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

        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-1">
          {t('progressAdmin.milestonesFor', { name: displayName(selected) })}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{selected.email}</p>

        {loadingDetail ? (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 py-8">
            <Loader2 className="animate-spin" size={20} />
            {t('progressAdmin.loading')}
          </div>
        ) : (
          <>
            <ul className="space-y-4">
              {milestones.map((m) => (
                <li
                  key={m.id}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
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
                      disabled={savingId === m.id}
                      className="text-red-500 hover:text-red-700 disabled:opacity-40 p-1"
                      aria-label={t('progressAdmin.delete')}
                      title={t('progressAdmin.delete')}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      {t('progressAdmin.status')}
                    </label>
                    <select
                      value={m.status}
                      onChange={(e) =>
                        handleStatusChange(m, e.target.value as MilestoneStatus)
                      }
                      disabled={savingId === m.id}
                      className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {t(`progress.${s === 'in_progress' ? 'inProgress' : s}`)}
                        </option>
                      ))}
                    </select>
                    {savingId === m.id && (
                      <Loader2 className="animate-spin text-gray-400" size={16} />
                    )}
                  </div>

                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                      {t('progressAdmin.noteLabel')}
                    </label>
                    <textarea
                      value={m.note}
                      onChange={(e) => handleNoteEdit(m.id, e.target.value)}
                      onBlur={(e) => handleNoteBlur(m, e.target.value)}
                      rows={2}
                      placeholder={t('progressAdmin.notePlaceholder')}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-3 py-2 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </li>
              ))}
            </ul>

            {/* Add milestone */}
            <div className="mt-6 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
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
            const percent =
              u.total > 0 ? Math.round((u.completed / u.total) * 100) : 0;
            return (
              <li
                key={u.userId}
                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3"
              >
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
                        style={{ width: `${percent}%` }}
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
