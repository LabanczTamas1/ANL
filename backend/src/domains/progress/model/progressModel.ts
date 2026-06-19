// ---------------------------------------------------------------------------
// Progress Model — types, statuses, and the default milestone journey
// ---------------------------------------------------------------------------

export type MilestoneStatus = 'pending' | 'in_progress' | 'completed';

export const MILESTONE_STATUSES: MilestoneStatus[] = [
  'pending',
  'in_progress',
  'completed',
];

/** Database row shape (snake_case columns). */
export type MilestoneRow = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  position: number;
  note: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

/** API shape returned to the frontend (camelCase). */
export interface Milestone {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  position: number;
  note: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function toApiMilestone(row: MilestoneRow): Milestone {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description ?? '',
    status: row.status,
    position: row.position,
    note: row.note ?? '',
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * The default journey seeded for every user the first time their progress is
 * requested. Mirrors the original 7-stage ANL onboarding path.
 */
export const DEFAULT_MILESTONES: { title: string; description: string }[] = [
  { title: 'First Contact', description: 'Initial introduction to our services' },
  { title: 'Register to ANL', description: 'Complete your registration process' },
  { title: 'Meeting', description: 'Discuss your goals and requirements' },
  { title: 'Onboarding + Contract', description: 'Complete paperwork and get started' },
  { title: 'Strategy Session', description: 'Create your personalized growth plan' },
  { title: '90 Day Program', description: 'Execute your growth strategy' },
  { title: 'Enjoy Your Growth!', description: 'See the results of your journey' },
];
