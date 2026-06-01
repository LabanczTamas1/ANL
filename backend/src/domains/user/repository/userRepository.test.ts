// ---------------------------------------------------------------------------
// User Repository — Unit Tests
// ---------------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { testUserRow } from '../../../__tests__/helpers.js';

// Mock db module
vi.mock('../../../utils/db.js', () => ({
  query: vi.fn(),
  queryOne: vi.fn(),
  execute: vi.fn(),
  getCached: vi.fn(),
  setCache: vi.fn(),
  invalidateCache: vi.fn(),
}));

import {
  createUser,
  findById,
  findByEmail,
  findByUsername,
  findAll,
  updateUser,
  deleteUser,
  emailExists,
  usernameExists,
} from './userRepository.js';

import {
  query,
  queryOne,
  execute,
  getCached,
  setCache,
  invalidateCache,
} from '../../../utils/db.js';

const mockQuery = vi.mocked(query);
const mockQueryOne = vi.mocked(queryOne);
const mockExecute = vi.mocked(execute);
const mockGetCached = vi.mocked(getCached);
const mockSetCache = vi.mocked(setCache);
const mockInvalidateCache = vi.mocked(invalidateCache);

beforeEach(() => {
  vi.clearAllMocks();
});

// ═══════════════════════════════════════════════════════════════════════════
// Create
// ═══════════════════════════════════════════════════════════════════════════

describe('createUser', () => {
  it('inserts a user and caches the result', async () => {
    mockQueryOne.mockResolvedValue(testUserRow as any);

    const user = await createUser({
      id: 'user-123',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
    });

    expect(user.email).toBe('john@example.com');
    expect(mockQueryOne).toHaveBeenCalledOnce();
    expect(mockSetCache).toHaveBeenCalledWith(
      'user:user-123',
      testUserRow,
      600,
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Find
// ═══════════════════════════════════════════════════════════════════════════

describe('findById', () => {
  it('returns cached user when available', async () => {
    mockGetCached.mockResolvedValue(testUserRow as any);

    const user = await findById('user-123');

    expect(user).toEqual(testUserRow);
    expect(mockQueryOne).not.toHaveBeenCalled();
  });

  it('queries DB and caches when not cached', async () => {
    mockGetCached.mockResolvedValue(null);
    mockQueryOne.mockResolvedValue(testUserRow as any);

    const user = await findById('user-123');

    expect(user).toEqual(testUserRow);
    expect(mockQueryOne).toHaveBeenCalledOnce();
    expect(mockSetCache).toHaveBeenCalledWith(
      'user:user-123',
      testUserRow,
      600,
    );
  });

  it('returns null when user does not exist', async () => {
    mockGetCached.mockResolvedValue(null);
    mockQueryOne.mockResolvedValue(null);

    const user = await findById('nonexistent');

    expect(user).toBeNull();
    expect(mockSetCache).not.toHaveBeenCalled();
  });
});

describe('findByEmail', () => {
  it('uses email cache to look up by id', async () => {
    // First getCached returns the cached user id
    mockGetCached.mockResolvedValueOnce('user-123' as any);
    // Second getCached (from findById) returns the user
    mockGetCached.mockResolvedValueOnce(testUserRow as any);

    const user = await findByEmail('john@example.com');

    expect(user).toEqual(testUserRow);
    expect(mockQueryOne).not.toHaveBeenCalled();
  });

  it('queries DB when no email cache', async () => {
    mockGetCached.mockResolvedValue(null);
    mockQueryOne.mockResolvedValue(testUserRow as any);

    const user = await findByEmail('john@example.com');

    expect(user).toEqual(testUserRow);
    expect(mockSetCache).toHaveBeenCalledTimes(2); // user cache + email cache
  });
});

describe('findByUsername', () => {
  it('queries DB and caches result', async () => {
    mockQueryOne.mockResolvedValue(testUserRow as any);

    const user = await findByUsername('john');

    expect(user).toEqual(testUserRow);
    expect(mockSetCache).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Exists checks
// ═══════════════════════════════════════════════════════════════════════════

describe('emailExists', () => {
  it('returns true when email exists', async () => {
    mockQueryOne.mockResolvedValue({ exists: true } as any);
    expect(await emailExists('john@example.com')).toBe(true);
  });

  it('returns false when email does not exist', async () => {
    mockQueryOne.mockResolvedValue({ exists: false } as any);
    expect(await emailExists('nobody@example.com')).toBe(false);
  });
});

describe('usernameExists', () => {
  it('returns true when username exists', async () => {
    mockQueryOne.mockResolvedValue({ exists: true } as any);
    expect(await usernameExists('john')).toBe(true);
  });

  it('returns false when username does not exist', async () => {
    mockQueryOne.mockResolvedValue({ exists: false } as any);
    expect(await usernameExists('nobody')).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// List
// ═══════════════════════════════════════════════════════════════════════════

describe('findAll', () => {
  it('returns all users', async () => {
    mockQuery.mockResolvedValue([testUserRow, testUserRow] as any);

    const users = await findAll();

    expect(users).toHaveLength(2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Update
// ═══════════════════════════════════════════════════════════════════════════

describe('updateUser', () => {
  it('updates specified fields and invalidates cache', async () => {
    const updatedRow = { ...testUserRow, first_name: 'Jane' };
    mockQueryOne.mockResolvedValue(updatedRow as any);

    const user = await updateUser('user-123', { firstName: 'Jane' });

    expect(user?.first_name).toBe('Jane');
    expect(mockInvalidateCache).toHaveBeenCalled();
    expect(mockSetCache).toHaveBeenCalled();
  });

  it('returns existing user when no updates provided', async () => {
    mockGetCached.mockResolvedValue(testUserRow as any);

    const user = await updateUser('user-123', {});

    // Should call findById (no SET clauses)
    expect(user).toEqual(testUserRow);
    expect(mockInvalidateCache).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Delete
// ═══════════════════════════════════════════════════════════════════════════

describe('deleteUser', () => {
  it('deletes user and invalidates cache', async () => {
    mockGetCached.mockResolvedValue(testUserRow as any);
    mockExecute.mockResolvedValue(1);

    const result = await deleteUser('user-123');

    expect(result).toBe(true);
    expect(mockInvalidateCache).toHaveBeenCalled();
  });

  it('returns false when user does not exist', async () => {
    mockGetCached.mockResolvedValue(null);
    mockQueryOne.mockResolvedValue(null);
    mockExecute.mockResolvedValue(0);

    const result = await deleteUser('nonexistent');

    expect(result).toBe(false);
  });
});
