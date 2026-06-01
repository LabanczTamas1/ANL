// ---------------------------------------------------------------------------
// Review Service
// ---------------------------------------------------------------------------

import { v4 as uuidv4 } from 'uuid';
import { query } from '../../../utils/db.js';

export async function addReview(
  user: { role?: string },
  data: { username: string; score: number; description: string },
) {
  const reviewId = uuidv4();
  const role = user.role || 'user';

  const rows = await query(
    `INSERT INTO reviews (id, username, score, description, role)
     VALUES ($1, $2, $3, $4, $5) RETURNING id, username, score::text, description, created_at as time, role`,
    [reviewId, data.username, data.score, data.description, role],
  );

  return rows[0];
}

export async function getReviewsByScore(
  score: string | number,
  randomize = false,
) {
  const orderClause = randomize ? 'ORDER BY RANDOM()' : 'ORDER BY created_at DESC';
  return query(
    `SELECT id, username, score::text, description, created_at as time, role
     FROM reviews WHERE score = $1 ${orderClause}`,
    [score],
  );
}
