import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../../../utils/db.js';
import { logError } from '../../../utils/logger.js';

export async function addReview(req: Request, res: Response): Promise<void> {
  try {
    const { username, score, description } = req.body;

    if (!score || !description || !username) {
      res.status(400).json({ error: 'Username, score and description are required' });
      return;
    }

    const reviewId = uuidv4();
    const role = req.user?.role || 'user';

    const rows = await query(
      `INSERT INTO reviews (id, username, score, description, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, username, score::text, description, created_at as time, role`,
      [reviewId, username, score, description, role],
    );

    res.status(201).json({ message: 'Review added successfully', review: rows[0] });
  } catch (error) {
    logError(error, { context: 'addReview' });
    res.status(500).json({ error: 'Failed to add review' });
  }
}

export async function getReviews(req: Request, res: Response): Promise<void> {
  try {
    const { score, random } = req.query;

    if (!score) {
      res.status(400).json({ error: 'Score query parameter is required' });
      return;
    }

    const orderClause = random === 'true' ? 'ORDER BY RANDOM()' : 'ORDER BY created_at DESC';
    const reviews = await query(
      `SELECT id, username, score::text, description, created_at as time, role
       FROM reviews WHERE score = $1 ${orderClause}`,
      [score],
    );

    res.json({ reviews });
  } catch (error) {
    logError(error, { context: 'getReviews' });
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
}
