// ---------------------------------------------------------------------------
// Progress Repository — PostgreSQL CRUD for per-user milestones
// ---------------------------------------------------------------------------

import { query, queryOne, execute } from '../../../utils/db.js';
import { createLogger } from '../../../utils/logger.js';
import {
  DEFAULT_MILESTONES,
  MilestoneRow,
  MilestoneStatus,
} from '../model/progressModel.js';

const logger = createLogger('progress', 'repository');

export interface CreateMilestoneInput {
  userId: string;
  title: string;
  description?: string;
  category?: string;
  status?: MilestoneStatus;
  position: number;
  note?: string;
}

export interface UpdateMilestoneInput {
  title?: string;
  description?: string;
  category?: string;
  status?: MilestoneStatus;
  position?: number;
  note?: string;
}

class ProgressRepository {
  /** Ensure the table exists (defensive — migrations own the schema). */
  async createTable(): Promise<void> {
    await execute(`
      CREATE TABLE IF NOT EXISTS progress_milestones (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        category VARCHAR(120) NOT NULL DEFAULT '',
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        position INTEGER NOT NULL DEFAULT 0,
        note TEXT NOT NULL DEFAULT '',
        completed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_progress_milestones_user_id ON progress_milestones(user_id);
      CREATE INDEX IF NOT EXISTS idx_progress_milestones_user_position ON progress_milestones(user_id, position);
    `);
  }

  async findByUserId(userId: string): Promise<MilestoneRow[]> {
    return query<MilestoneRow>(
      `SELECT * FROM progress_milestones WHERE user_id = $1 ORDER BY position ASC, created_at ASC`,
      [userId],
    );
  }

  async findById(id: string): Promise<MilestoneRow | null> {
    return queryOne<MilestoneRow>(
      `SELECT * FROM progress_milestones WHERE id = $1`,
      [id],
    );
  }

  async countForUser(userId: string): Promise<number> {
    const row = await queryOne<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM progress_milestones WHERE user_id = $1`,
      [userId],
    );
    return row ? parseInt(row.count, 10) : 0;
  }

  async create(input: CreateMilestoneInput): Promise<MilestoneRow> {
    const status = input.status ?? 'pending';
    const completedAt = status === 'completed' ? new Date().toISOString() : null;
    const row = await queryOne<MilestoneRow>(
      `INSERT INTO progress_milestones
         (user_id, title, description, category, status, position, note, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        input.userId,
        input.title,
        input.description ?? '',
        input.category ?? '',
        status,
        input.position,
        input.note ?? '',
        completedAt,
      ],
    );
    if (!row) throw new Error('Failed to create milestone');
    return row;
  }

  /** Seed the default journey for a user in a single statement. */
  async seedDefaults(userId: string): Promise<MilestoneRow[]> {
    const values: string[] = [];
    const params: unknown[] = [];
    DEFAULT_MILESTONES.forEach((m, i) => {
      const base = i * 6;
      values.push(
        `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6})`,
      );
      // Explicit status so we never depend on column defaults.
      params.push(userId, m.title, m.description, m.category, i, 'pending');
    });

    const rows = await query<MilestoneRow>(
      `INSERT INTO progress_milestones (user_id, title, description, category, position, status)
       VALUES ${values.join(', ')}
       RETURNING *`,
      params,
    );
    logger.info({ userId, count: rows.length }, 'Seeded default milestones');
    return rows.sort((a, b) => a.position - b.position);
  }

  async update(id: string, input: UpdateMilestoneInput): Promise<MilestoneRow | null> {
    const sets: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (input.title !== undefined) {
      sets.push(`title = $${idx++}`);
      params.push(input.title);
    }
    if (input.description !== undefined) {
      sets.push(`description = $${idx++}`);
      params.push(input.description);
    }
    if (input.category !== undefined) {
      sets.push(`category = $${idx++}`);
      params.push(input.category);
    }
    if (input.position !== undefined) {
      sets.push(`position = $${idx++}`);
      params.push(input.position);
    }
    if (input.note !== undefined) {
      sets.push(`note = $${idx++}`);
      params.push(input.note);
    }
    if (input.status !== undefined) {
      sets.push(`status = $${idx++}`);
      params.push(input.status);
      // Keep completed_at consistent with status transitions.
      if (input.status === 'completed') {
        sets.push(`completed_at = COALESCE(completed_at, now())`);
      } else {
        sets.push(`completed_at = NULL`);
      }
    }

    if (sets.length === 0) {
      return this.findById(id);
    }

    sets.push(`updated_at = now()`);
    params.push(id);

    return queryOne<MilestoneRow>(
      `UPDATE progress_milestones SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      params,
    );
  }

  async delete(id: string): Promise<boolean> {
    const affected = await execute(
      `DELETE FROM progress_milestones WHERE id = $1`,
      [id],
    );
    return affected > 0;
  }

  /** Aggregated per-user progress summary for admin/owner overview. */
  async summaryByUser(): Promise<
    {
      userId: string;
      email: string;
      firstName: string;
      lastName: string;
      username: string;
      company: string;
      total: string;
      completed: string;
      inProgress: string;
    }[]
  > {
    return query(
      `SELECT u.id AS "userId",
              u.email AS "email",
              COALESCE(u.first_name, '') AS "firstName",
              COALESCE(u.last_name, '') AS "lastName",
              COALESCE(u.username, '') AS "username",
              COALESCE(u.company, '') AS "company",
              COUNT(pm.id)::text AS "total",
              COUNT(pm.id) FILTER (WHERE pm.status = 'completed')::text AS "completed",
              COUNT(pm.id) FILTER (WHERE pm.status = 'in_progress')::text AS "inProgress"
       FROM users u
       LEFT JOIN progress_milestones pm ON pm.user_id = u.id
       WHERE u.email IS NOT NULL
       GROUP BY u.id, u.email, u.first_name, u.last_name, u.username, u.company
       ORDER BY u.first_name ASC, u.email ASC`,
    );
  }
}

export const progressRepository = new ProgressRepository();
export default progressRepository;
