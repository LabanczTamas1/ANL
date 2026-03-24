// ---------------------------------------------------------------------------
// Review Service
// ---------------------------------------------------------------------------

import { v4 as uuidv4 } from 'uuid';
import { getRedisClient } from '../../../config/database.js';

export async function addReview(
  user: { role?: string },
  data: { username: string; score: number; description: string },
) {
  const r = getRedisClient();
  const reviewId = uuidv4();
  const time = new Date().toISOString();
  const role = user.role || 'user';

  const reviewData: Record<string, string> = {
    id: reviewId,
    username: data.username,
    score: String(data.score),
    description: data.description,
    time,
    role,
  };

  await r.hSet(`review:${reviewId}`, reviewData);
  await r.sAdd(`reviews:score:${data.score}`, reviewId);

  return reviewData;
}

export async function getReviewsByScore(
  score: string | number,
  randomize = false,
) {
  const r = getRedisClient();
  const reviewIds = await r.sMembers(`reviews:score:${score}`);
  if (!reviewIds || reviewIds.length === 0) return [];

  const reviews: Record<string, string>[] = [];
  for (const id of reviewIds) {
    const data = await r.hGetAll(`review:${id}`);
    if (Object.keys(data).length > 0) reviews.push(data);
  }

  if (randomize) return reviews.sort(() => Math.random() - 0.5);
  return reviews;
}
