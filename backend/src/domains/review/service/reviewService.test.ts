// ---------------------------------------------------------------------------
// Review Service — Unit Tests
// ---------------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../utils/db.js', () => ({
  query: vi.fn(),
}));

import { addReview, getReviewsByScore } from './reviewService.js';
import { query } from '../../../utils/db.js';

const mockQuery = vi.mocked(query);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('addReview', () => {
  it('inserts a review with correct fields', async () => {
    const mockRow = {
      id: 'review-1',
      username: 'alice',
      score: '5',
      description: 'Great service',
      time: '2025-06-01T00:00:00Z',
      role: 'user',
    };
    mockQuery.mockResolvedValue([mockRow] as any);

    const result = await addReview(
      { role: 'user' },
      { username: 'alice', score: 5, description: 'Great service' },
    );

    expect(result).toEqual(mockRow);
    expect(mockQuery).toHaveBeenCalledOnce();

    // Verify the SQL and params
    const [sql, params] = mockQuery.mock.calls[0];
    expect(sql).toContain('INSERT INTO reviews');
    expect(params![1]).toBe('alice');
    expect(params![2]).toBe(5);
    expect(params![3]).toBe('Great service');
    expect(params![4]).toBe('user');
  });

  it('defaults role to user when not provided', async () => {
    mockQuery.mockResolvedValue([{ id: 'r1' }] as any);

    await addReview({}, { username: 'bob', score: 4, description: 'Good' });

    const [, params] = mockQuery.mock.calls[0];
    expect(params![4]).toBe('user');
  });
});

describe('getReviewsByScore', () => {
  it('returns reviews ordered by created_at DESC by default', async () => {
    const reviews = [
      { id: 'r1', score: '5', username: 'alice' },
      { id: 'r2', score: '5', username: 'bob' },
    ];
    mockQuery.mockResolvedValue(reviews as any);

    const result = await getReviewsByScore(5);

    expect(result).toEqual(reviews);
    const [sql] = mockQuery.mock.calls[0];
    expect(sql).toContain('ORDER BY created_at DESC');
    expect(sql).not.toContain('RANDOM');
  });

  it('randomizes order when requested', async () => {
    mockQuery.mockResolvedValue([] as any);

    await getReviewsByScore(5, true);

    const [sql] = mockQuery.mock.calls[0];
    expect(sql).toContain('ORDER BY RANDOM()');
  });

  it('filters by score parameter', async () => {
    mockQuery.mockResolvedValue([] as any);

    await getReviewsByScore(3);

    const [, params] = mockQuery.mock.calls[0];
    expect(params![0]).toBe(3);
  });
});
