import { useEffect, useMemo, useState } from 'react';
import { Loader2, ChevronLeft, Search } from 'lucide-react';
import {
  getUsersProgressSummary,
  ProgressUserSummary,
} from '../../services/api/progressApi';
import { useLanguage } from '../../hooks/useLanguage';
import UserProgressEditor from './UserProgressEditor';

const ProgressAdmin = () => {
  const { t } = useLanguage();

  const [summaries, setSummaries] = useState<ProgressUserSummary[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ProgressUserSummary | null>(null);

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

  const backToList = () => {
    setSelected(null);
    loadSummaries();
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

  // ── Detail view ────────────────────────────────────────────────────────────
  if (selected) {
    return (
      <div className="p-4 sm:p-6 max-w-3xl mx-auto">
        <button
          onClick={backToList}
          className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline mb-4"
        >
          <ChevronLeft size={16} />
          {t('progressAdmin.back')}
        </button>

        {/* User header card */}
        <div className="rounded-xl border border-line dark:border-line-dark bg-white dark:bg-surface-elevated p-5 shadow-soft mb-5">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center font-semibold">
              {initials(selected)}
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-content dark:text-content-inverse truncate">
                {displayName(selected)}
              </h1>
              <p className="text-sm text-content-muted truncate">
                {selected.email}
              </p>
            </div>
          </div>
        </div>

        <UserProgressEditor userId={selected.userId} />
      </div>
    );
  }

  // ── List view ────────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold text-content dark:text-content-inverse">
        {t('progressAdmin.title')}
      </h1>
      <p className="mt-1 text-sm text-content-muted mb-5">
        {t('progressAdmin.subtitle')}
      </p>

      <div className="relative mb-5">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('progressAdmin.searchPlaceholder')}
          className="w-full rounded-md border border-line dark:border-line-dark bg-white dark:bg-surface-dark text-sm pl-9 pr-3 py-2 text-content dark:text-content-inverse focus:outline-none focus:ring-2 focus:ring-brand-focus"
        />
      </div>

      {loadingList ? (
        <div className="flex items-center gap-2 text-content-muted py-8">
          <Loader2 className="animate-spin" size={20} />
          {t('progressAdmin.loading')}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-content-muted bg-black/[0.02] dark:bg-white/[0.03] rounded-lg border border-line dark:border-line-dark">
          {t('progressAdmin.noUsers')}
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((u) => {
            const pct = u.total > 0 ? Math.round((u.completed / u.total) * 100) : 0;
            const done = u.total > 0 && u.completed === u.total;
            return (
              <li
                key={u.userId}
                className="rounded-xl border border-line dark:border-line-dark bg-white dark:bg-surface-elevated p-4 shadow-soft flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center text-sm font-semibold">
                  {initials(u)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-content dark:text-content-inverse truncate">
                    {displayName(u)}
                  </p>
                  <p className="text-xs text-content-muted truncate">{u.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-2 bg-line/60 dark:bg-line-dark rounded-full overflow-hidden max-w-[220px]">
                      <div
                        className={`h-full rounded-full ${
                          done ? 'bg-status-success' : 'bg-brand'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-content-muted whitespace-nowrap">
                      {u.completed}/{u.total}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(u)}
                  className="self-start sm:self-center rounded-md bg-brand hover:bg-brand-hover text-white text-sm font-medium px-4 py-2 transition-colors"
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
