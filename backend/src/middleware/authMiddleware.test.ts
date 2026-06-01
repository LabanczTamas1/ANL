// ---------------------------------------------------------------------------
// Auth Middleware — Unit Tests
// ---------------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockRequest, mockResponse, mockNext, testUserRow } from '../__tests__/helpers.js';

// Mock JWT service
vi.mock('../utils/jwt.js', () => ({
  JwtService: {
    verifyAccessToken: vi.fn(),
    verifyLegacy: vi.fn(),
  },
}));

// Mock user repository
vi.mock('../domains/user/repository/userRepository.js', () => ({
  findById: vi.fn(),
}));

import { authMiddleware } from './authMiddleware.js';
import { JwtService } from '../utils/jwt.js';
import * as userRepo from '../domains/user/repository/userRepository.js';

const mockVerifyAccess = vi.mocked(JwtService.verifyAccessToken);
const mockVerifyLegacy = vi.mocked(JwtService.verifyLegacy);
const mockFindById = vi.mocked(userRepo.findById);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('authMiddleware', () => {
  it('returns 401 when no Authorization header', async () => {
    const req = mockRequest({ headers: {} });
    const res = mockResponse();
    const next = mockNext();

    await authMiddleware(req, res, next);

    expect(res._status).toBe(401);
    expect(res._json.error).toMatch(/Access token required/);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when Authorization header is not Bearer', async () => {
    const req = mockRequest({
      headers: { authorization: 'Basic abc123' },
    });
    const res = mockResponse();
    const next = mockNext();

    await authMiddleware(req, res, next);

    expect(res._status).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when token has no sub/id', async () => {
    mockVerifyAccess.mockReturnValue({ email: 'test@test.com' } as any);
    const req = mockRequest({
      headers: { authorization: 'Bearer valid-token' },
    });
    const res = mockResponse();
    const next = mockNext();

    await authMiddleware(req, res, next);

    expect(res._status).toBe(401);
    expect(res._json.error).toMatch(/Invalid token payload/);
  });

  it('returns 404 when user not found in DB', async () => {
    mockVerifyAccess.mockReturnValue({ sub: 'user-123' } as any);
    mockFindById.mockResolvedValue(null);

    const req = mockRequest({
      headers: { authorization: 'Bearer valid-token' },
    });
    const res = mockResponse();
    const next = mockNext();

    await authMiddleware(req, res, next);

    expect(res._status).toBe(404);
    expect(res._json.error).toMatch(/User not found/);
  });

  it('attaches user to req and calls next on success', async () => {
    mockVerifyAccess.mockReturnValue({ sub: 'user-123' } as any);
    mockFindById.mockResolvedValue(testUserRow as any);

    const req = mockRequest({
      headers: { authorization: 'Bearer valid-token' },
    });
    const res = mockResponse();
    const next = mockNext();

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.user).toBeDefined();
    expect(req.user!.id).toBe('user-123');
    expect(req.user!.email).toBe('john@example.com');
    expect(req.user!.role).toBe('user');
  });

  it('falls back to legacy token verification', async () => {
    mockVerifyAccess.mockImplementation(() => {
      throw new Error('RS256 failed');
    });
    mockVerifyLegacy.mockReturnValue({ id: 'user-123' } as any);
    mockFindById.mockResolvedValue(testUserRow as any);

    const req = mockRequest({
      headers: { authorization: 'Bearer legacy-token' },
    });
    const res = mockResponse();
    const next = mockNext();

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.user!.id).toBe('user-123');
  });

  it('returns 403 when both token verifications fail', async () => {
    mockVerifyAccess.mockImplementation(() => {
      throw new Error('RS256 failed');
    });
    mockVerifyLegacy.mockImplementation(() => {
      throw new Error('HS256 failed');
    });

    const req = mockRequest({
      headers: { authorization: 'Bearer bad-token' },
    });
    const res = mockResponse();
    const next = mockNext();

    await authMiddleware(req, res, next);

    expect(res._status).toBe(403);
    expect(res._json.error).toMatch(/Invalid or expired/);
    expect(next).not.toHaveBeenCalled();
  });
});
