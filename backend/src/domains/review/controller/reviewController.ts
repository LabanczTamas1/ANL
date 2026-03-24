import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getRedisClient } from '../../../config/database.js';
import { logError } from '../../../utils/logger.js';

export async function addReview(req: Request, res: Response): Promise<void> {
  try {
    const { username, score, description } = req.body;

    if (!score || !description || !username) {
      res
        .status(400)
        .json({ error: 'Username, score and description are required' });
      return;
    }

    const r = getRedisClient();
    const reviewId = uuidv4();
    const time = new Date().toISOString();
    const role = req.user?.role || 'user';

    const reviewData: Record<string, string> = {
      id: reviewId,
      username,
      score: String(score),
      description,
      time,
      role,
    };

    await r.hSet(`review:${reviewId}`, reviewData);
    await r.sAdd(`reviews:score:${score}`, reviewId);

    res
      .status(201)
      .json({ message: 'Review added successfully', review: reviewData });
  } catch (error) {
    logError(error, { context: 'addReview' });
    res.status(500).json({ error: 'Failed to add review' });
  }
}

export async function getReviews(req: Request, res: Response): Promise<void> {
  try {
    const { score, random } = req.query;

    if (!score) {
      res
        .status(400)
        .json({ error: 'Score query parameter is required' });
      return;
    }

    const r = getRedisClient();
    const reviewIds = await r.sMembers(`reviews:score:${score}`);
    if (!reviewIds || reviewIds.length === 0) {
      res.json({ reviews: [] });
      return;
    }

    const reviews: Record<string, string>[] = [];
    for (const id of reviewIds) {
      const data = await r.hGetAll(`review:${id}`);
      if (Object.keys(data).length > 0) reviews.push(data);
    }

    let result = reviews;
    if (random === 'true') {
      result = reviews.sort(() => Math.random() - 0.5);
    }

    res.json({ reviews: result });
  } catch (error) {
    logError(error, { context: 'getReviews' });
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
}
