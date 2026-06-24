import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle,
  Circle,
  Clock,
  ChevronDown,
  Check,
  Loader2,
  Trash2,
  Pencil,
  X,
} from 'lucide-react';
import {
  Milestone,
  MilestoneStatus,
  MilestoneGroup,
  groupMilestonesByCategory,
} from '../../services/api/progressApi';
import { useLanguage } from '../../hooks/useLanguage';

export type MilestoneSaveState = 'saving' | 'saved' | undefined;

interface StatusMeta {
  labelKey: string;
  Icon: typeof Circle;
  dot: string;
  text: string;
  badge: string;
  segActive: string;
}

const STATUS_META: Record<MilestoneStatus, StatusMeta> = {
  pending: {
    labelKey: 'progress.pending',
    Icon: Circle,
    dot: 'bg-line dark:bg-line-dark',
    text: 'text-content-muted',
    badge:
      'bg-black/5 text-content-muted dark:bg-white/10 dark:text-content-subtle-inverse',
    segActive: 'bg-content-muted text-white border-content-muted',
  },
  in_progress: {
    labelKey: 'progress.inProgress',
    Icon: Clock,
    dot: 'bg-brand',
    text: 'text-brand',
    badge: 'bg-brand/10 text-brand dark:bg-brand/20',
    segActive: 'bg-brand text-white border-brand',
  },
  completed: {
    labelKey: 'progress.completed',
    Icon: CheckCircle,
    dot: 'bg-status-success',
    text: 'text-status-success',
    badge: 'bg-status-success/10 text-status-success dark:bg-status-success/20',
    segActive: 'bg-status-success text-white border-status-success',
  },
};

const STATUS_ORDER: MilestoneStatus[] = ['pending', 'in_progress', 'completed'];

interface MilestoneJourneyProps {
  milestones: Milestone[];
  /** Enables admin/owner editing controls (status, note, delete). */
  editable?: boolean;
  formatDate: (value: string | null) => string;
  saveState?: Record<string, MilestoneSaveState>;
  onSetStatus?: (m: Milestone, status: MilestoneStatus) => void;
  onSaveNote?: (m: Milestone, note: string) => void;
  onDelete?: (m: Milestone) => void;
}

const SaveIndicator = ({
  state,
  t,
}: {
  state: MilestoneSaveState;
  t: (k: string) => string;
}) => {
  if (state === 'saving')
    return (
      <span className="inline-flex items-center gap-1 text-xs text-content-muted">
        <Loader2 className="animate-spin" size={13} />
        {t('progressAdmin.saving')}
      </span>
    );
  if (state === 'saved')
    return (
      <span className="inline-flex items-center gap-1 text-xs text-status-success">
        <Check size={13} />
        {t('progressAdmin.saved')}
      </span>
    );
  return null;
};

/** Editable note with explicit edit / save / cancel controls. */
const NoteEditor = ({
  milestone,
  saveState,
  onSave,
  t,
}: {
  milestone: Milestone;
  saveState: MilestoneSaveState;
  onSave: (note: string) => void;
  t: (k: string) => string;
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(milestone.note);

  // Keep the draft in sync when the saved note changes from outside.
  useEffect(() => {
    if (!editing) setDraft(milestone.note);
  }, [milestone.note, editing]);

  const startEdit = () => {
    setDraft(milestone.note);
    setEditing(true);
  };

  const cancel = () => {
    setDraft(milestone.note);
    setEditing(false);
  };

  const save = () => {
    onSave(draft);
    setEditing(false);
  };

  const dirty = draft.trim() !== milestone.note.trim();

  return (
    <div className="mt-2.5">
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-medium text-content-subtle dark:text-content-subtle-inverse">
          {t('progressAdmin.noteLabel')}
        </label>
        <SaveIndicator state={saveState} t={t} />
      </div>

      {editing ? (
        <div className="space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            autoFocus
            placeholder={t('progressAdmin.notePlaceholder')}
            className="w-full rounded-md border border-line dark:border-line-dark bg-white dark:bg-surface-dark text-sm px-3 py-2 text-content dark:text-content-inverse focus:outline-none focus:ring-2 focus:ring-brand-focus"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={save}
              disabled={!dirty || saveState === 'saving'}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand hover:bg-brand-hover text-white text-xs font-medium px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Check size={13} />
              {t('progressAdmin.saveNote')}
            </button>
            <button
              type="button"
              onClick={cancel}
              className="inline-flex items-center gap-1.5 rounded-md border border-line dark:border-line-dark text-content-subtle dark:text-content-subtle-inverse text-xs font-medium px-3 py-1.5 hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors"
            >
              <X size={13} />
              {t('progressAdmin.cancel')}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2">
          <div
            className={`flex-1 min-w-0 rounded-md border px-3 py-2 text-sm ${
              milestone.note
                ? 'border-brand/20 bg-brand/[0.06] dark:bg-brand/[0.12] text-content-subtle dark:text-content-subtle-inverse'
                : 'border-dashed border-line dark:border-line-dark text-content-muted italic'
            }`}
          >
            {milestone.note || t('progressAdmin.noNote')}
          </div>
          <button
            type="button"
            onClick={startEdit}
            className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-md border border-line dark:border-line-dark text-content-subtle dark:text-content-subtle-inverse text-xs font-medium px-3 py-2 hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors"
          >
            <Pencil size={13} />
            {milestone.note
              ? t('progressAdmin.editNote')
              : t('progressAdmin.addNote')}
          </button>
        </div>
      )}
    </div>
  );
};

const MilestoneJourney = ({
  milestones,
  editable = false,
  formatDate,
  saveState = {},
  onSetStatus,
  onSaveNote,
  onDelete,
}: MilestoneJourneyProps) => {
  const { t } = useLanguage();

  const groups: MilestoneGroup[] = useMemo(
    () => groupMilestonesByCategory(milestones),
    [milestones],
  );

  // The category holding the first not-yet-completed milestone is "current".
  const activeCategory = useMemo(() => {
    const current = [...milestones]
      .sort((a, b) => a.position - b.position)
      .find((m) => m.status !== 'completed');
    return current ? (current.category ?? '').trim() : null;
  }, [milestones]);

  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [userTouched, setUserTouched] = useState(false);

  // Auto-expand the active phase (until the user manually toggles things).
  useEffect(() => {
    if (userTouched) return;
    const next: Record<string, boolean> = {};
    groups.forEach((g) => {
      next[g.category] = activeCategory !== null
        ? g.category === activeCategory
        : g.percent < 100;
    });
    setOpen(next);
  }, [groups, activeCategory, userTouched]);

  const toggle = (category: string) => {
    setUserTouched(true);
    setOpen((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const groupLabel = (category: string) =>
    category || t('progress.ungrouped');

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const isOpen = open[group.category] ?? false;
        const isActive = group.category === activeCategory;
        const allDone = group.total > 0 && group.completed === group.total;
        const phaseDot = allDone
          ? 'bg-status-success'
          : group.inProgress > 0 || isActive
            ? 'bg-brand'
            : 'bg-line dark:bg-line-dark';

        return (
          <div
            key={group.category || '__ungrouped'}
            className={`rounded-xl border overflow-hidden transition-colors ${
              isActive
                ? 'border-brand/50 dark:border-brand/60'
                : 'border-line dark:border-line-dark'
            } bg-white dark:bg-surface-elevated`}
          >
            {/* Phase header */}
            <button
              type="button"
              onClick={() => toggle(group.category)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors"
            >
              <span
                className={`flex-shrink-0 w-2.5 h-2.5 rounded-full ${phaseDot}`}
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-content dark:text-content-inverse truncate">
                  {groupLabel(group.category)}
                </h3>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1.5 w-28 sm:w-40 rounded-full bg-line/60 dark:bg-line-dark overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        allDone ? 'bg-status-success' : 'bg-brand'
                      }`}
                      style={{ width: `${group.percent}%` }}
                    />
                  </div>
                  <span className="text-xs text-content-muted whitespace-nowrap">
                    {group.completed}/{group.total}
                  </span>
                </div>
              </div>
              <ChevronDown
                size={18}
                className={`flex-shrink-0 text-content-muted transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Phase body */}
            {isOpen && (
              <ol className="px-3 pb-3 pt-1 space-y-2 border-t border-line/70 dark:border-line-dark">
                {group.milestones.map((m, idx) => {
                  const meta = STATUS_META[m.status] ?? STATUS_META.pending;
                  const Icon = meta.Icon;
                  const isComplete = m.status === 'completed';
                  const isInProgress = m.status === 'in_progress';
                  return (
                    <li
                      key={m.id}
                      className={`rounded-lg border p-3 transition-colors ${
                        isInProgress
                          ? 'border-brand/40 bg-brand/[0.04] dark:bg-brand/[0.08]'
                          : isComplete
                            ? 'border-status-success/30 bg-status-success/[0.04] dark:bg-status-success/[0.08]'
                            : 'border-line dark:border-line-dark bg-white dark:bg-surface-elevated'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 mt-0.5">
                          {editable ? (
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                                isComplete
                                  ? 'bg-status-success text-white'
                                  : isInProgress
                                    ? 'bg-brand text-white'
                                    : 'bg-line/70 dark:bg-line-dark text-content-muted'
                              }`}
                            >
                              {isComplete ? <Check size={14} /> : idx + 1}
                            </span>
                          ) : (
                            <Icon size={22} className={meta.text} />
                          )}
                        </span>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4
                              className={`text-sm font-semibold ${
                                isComplete
                                  ? 'text-status-success'
                                  : isInProgress
                                    ? 'text-brand'
                                    : 'text-content dark:text-content-inverse'
                              }`}
                            >
                              {m.title}
                            </h4>
                            {editable ? (
                              <div className="flex-shrink-0 flex items-center gap-2">
                                <span
                                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${meta.badge}`}
                                >
                                  {t(meta.labelKey)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onDelete?.(m)}
                                  className="text-content-muted hover:text-status-error p-1"
                                  aria-label={t('progressAdmin.delete')}
                                  title={t('progressAdmin.delete')}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            ) : (
                              <span
                                className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${meta.badge}`}
                              >
                                {t(meta.labelKey)}
                              </span>
                            )}
                          </div>

                          {m.description && (
                            <p className="mt-0.5 text-sm text-content-subtle dark:text-content-subtle-inverse">
                              {m.description}
                            </p>
                          )}

                          {!editable && isComplete && m.completedAt && (
                            <p className="mt-1.5 text-xs text-status-success">
                              {t('progress.completedOn', {
                                date: formatDate(m.completedAt),
                              })}
                            </p>
                          )}

                          {/* Editable status control */}
                          {editable && (
                            <div className="mt-2.5 inline-flex rounded-lg border border-line dark:border-line-dark overflow-hidden">
                              {STATUS_ORDER.map((s) => {
                                const sm = STATUS_META[s];
                                const SIcon = sm.Icon;
                                const active = m.status === s;
                                return (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => onSetStatus?.(m, s)}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border-r last:border-r-0 border-line dark:border-line-dark transition-colors ${
                                      active
                                        ? sm.segActive
                                        : 'bg-white dark:bg-surface-elevated text-content-subtle dark:text-content-subtle-inverse hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
                                    }`}
                                  >
                                    <SIcon size={13} />
                                    {t(sm.labelKey)}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* Note — editable editor or read-only box */}
                          {editable ? (
                            <NoteEditor
                              milestone={m}
                              saveState={saveState[m.id]}
                              onSave={(note) => onSaveNote?.(m, note)}
                              t={t}
                            />
                          ) : (
                            m.note && (
                              <div className="mt-2 text-sm rounded-md bg-brand/[0.06] dark:bg-brand/[0.12] border border-brand/20 px-3 py-2 text-content-subtle dark:text-content-subtle-inverse">
                                <span className="font-medium text-brand">
                                  {t('progress.noteLabel')}:{' '}
                                </span>
                                {m.note}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MilestoneJourney;
