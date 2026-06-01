// ---------------------------------------------------------------------------
// User Repository — PostgreSQL CRUD + Redis cache
// ---------------------------------------------------------------------------

import { query, queryOne, execute, getCached, setCache, invalidateCache } from '../../../utils/db.js';

export interface UserRow {
  id: string;
  email: string;
  username: string | null;
  password: string | null;
  first_name: string;
  last_name: string;
  role: string;
  verified: boolean;
  company: string;
  phone: string;
  provider: string;
  google_id: string | null;
  facebook_id: string | null;
  profile_picture: string | null;
  progression_status: string;
  progression_category: string;
  progression_timeline: string;
  created_at: Date;
  updated_at: Date;
}

const CACHE_TTL = 600; // 10 min
const cacheKey = (id: string) => `user:${id}`;
const emailCacheKey = (email: string) => `user:email:${email}`;

// ─── Create ──────────────────────────────────────────────────────────────

export async function createUser(data: {
  id: string;
  email: string;
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  verified?: boolean;
  company?: string;
  phone?: string;
  provider?: string;
  googleId?: string;
  facebookId?: string;
  profilePicture?: string;
}): Promise<UserRow> {
  const row = await queryOne<UserRow>(
    `INSERT INTO users (id, email, username, password, first_name, last_name, role, verified, company, phone, provider, google_id, facebook_id, profile_picture)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     RETURNING *`,
    [
      data.id,
      data.email,
      data.username || null,
      data.password || null,
      data.firstName || '',
      data.lastName || '',
      data.role || 'user',
      data.verified ?? false,
      data.company || '',
      data.phone || '',
      data.provider || 'local',
      data.googleId || null,
      data.facebookId || null,
      data.profilePicture || null,
    ],
  );
  if (row) await setCache(cacheKey(data.id), row, CACHE_TTL);
  return row!;
}

// ─── Find ────────────────────────────────────────────────────────────────

export async function findById(id: string): Promise<UserRow | null> {
  const cached = await getCached<UserRow>(cacheKey(id));
  if (cached) return cached;
  const row = await queryOne<UserRow>('SELECT * FROM users WHERE id = $1', [id]);
  if (row) await setCache(cacheKey(id), row, CACHE_TTL);
  return row;
}

export async function findByEmail(email: string): Promise<UserRow | null> {
  const cachedId = await getCached<string>(emailCacheKey(email));
  if (cachedId) return findById(cachedId);
  const row = await queryOne<UserRow>('SELECT * FROM users WHERE email = $1', [email]);
  if (row) {
    await setCache(cacheKey(row.id), row, CACHE_TTL);
    await setCache(emailCacheKey(email), row.id, CACHE_TTL);
  }
  return row;
}

export async function findByUsername(username: string): Promise<UserRow | null> {
  const row = await queryOne<UserRow>('SELECT * FROM users WHERE username = $1', [username]);
  if (row) await setCache(cacheKey(row.id), row, CACHE_TTL);
  return row;
}

export async function findByGoogleId(googleId: string): Promise<UserRow | null> {
  return queryOne<UserRow>('SELECT * FROM users WHERE google_id = $1', [googleId]);
}

export async function findByFacebookId(facebookId: string): Promise<UserRow | null> {
  return queryOne<UserRow>('SELECT * FROM users WHERE facebook_id = $1', [facebookId]);
}

export async function emailExists(email: string): Promise<boolean> {
  const row = await queryOne<{ exists: boolean }>(
    'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1) as exists',
    [email],
  );
  return row?.exists ?? false;
}

export async function usernameExists(username: string): Promise<boolean> {
  const row = await queryOne<{ exists: boolean }>(
    'SELECT EXISTS(SELECT 1 FROM users WHERE username = $1) as exists',
    [username],
  );
  return row?.exists ?? false;
}

// ─── List ────────────────────────────────────────────────────────────────

export async function findAll(): Promise<UserRow[]> {
  return query<UserRow>(
    `SELECT id, email, username, first_name, last_name, role, verified, company, phone,
            provider, google_id, facebook_id, profile_picture,
            progression_status, progression_category, progression_timeline,
            created_at, updated_at
     FROM users ORDER BY created_at DESC`,
  );
}

export async function findByRole(role: string): Promise<UserRow[]> {
  return query<UserRow>(
    'SELECT * FROM users WHERE role = $1 ORDER BY created_at DESC',
    [role],
  );
}

// ─── Update ──────────────────────────────────────────────────────────────

export async function updateUser(
  id: string,
  updates: Partial<{
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    verified: boolean;
    company: string;
    phone: string;
    provider: string;
    googleId: string;
    facebookId: string;
    profilePicture: string;
    progressionStatus: string;
    progressionCategory: string;
    progressionTimeline: string;
  }>,
): Promise<UserRow | null> {
  const sets: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  const map: Record<string, string> = {
    email: 'email',
    username: 'username',
    password: 'password',
    firstName: 'first_name',
    lastName: 'last_name',
    role: 'role',
    verified: 'verified',
    company: 'company',
    phone: 'phone',
    provider: 'provider',
    googleId: 'google_id',
    facebookId: 'facebook_id',
    profilePicture: 'profile_picture',
    progressionStatus: 'progression_status',
    progressionCategory: 'progression_category',
    progressionTimeline: 'progression_timeline',
  };

  for (const [key, col] of Object.entries(map)) {
    if (key in updates) {
      sets.push(`${col} = $${idx}`);
      values.push((updates as any)[key]);
      idx++;
    }
  }

  if (sets.length === 0) return findById(id);

  sets.push(`updated_at = now()`);
  values.push(id);

  const row = await queryOne<UserRow>(
    `UPDATE users SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
    values,
  );

  if (row) {
    await invalidateCache(cacheKey(id), emailCacheKey(row.email));
    await setCache(cacheKey(id), row, CACHE_TTL);
  }

  return row;
}

// ─── Delete ──────────────────────────────────────────────────────────────

export async function deleteUser(id: string): Promise<boolean> {
  const user = await findById(id);
  const count = await execute('DELETE FROM users WHERE id = $1', [id]);
  if (user) {
    await invalidateCache(cacheKey(id), emailCacheKey(user.email));
  }
  return count > 0;
}

// ─── Helpers ─────────────────────────────────────────────────────────────

/** Convert DB row to the camelCase shape the API returns (strips password). */
export function toApiUser(row: UserRow): Record<string, unknown> {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    firstName: row.first_name,
    lastName: row.last_name,
    role: row.role,
    verified: row.verified,
    company: row.company,
    phone: row.phone,
    provider: row.provider,
    googleId: row.google_id,
    facebookId: row.facebook_id,
    profilePicture: row.profile_picture,
    progressionStatus: row.progression_status,
    progressionCategory: row.progression_category,
    progressionTimeline: row.progression_timeline,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
