// ---------------------------------------------------------------------------
// Test helpers — mock Express req/res factories
// ---------------------------------------------------------------------------

import { vi } from 'vitest';
import type { Request, Response } from 'express';

export function mockRequest(overrides: Partial<Request> = {}): Request {
  const req = {
    params: {},
    query: {},
    body: {},
    headers: {},
    user: {
      id: 'test-user-id',
      email: 'admin@test.com',
      username: 'admin',
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
    },
    ...overrides,
  } as unknown as Request;
  return req;
}

export function mockResponse(): Response & {
  _status: number;
  _json: any;
} {
  const res: any = {
    _status: 200,
    _json: null,
    status(code: number) {
      res._status = code;
      return res;
    },
    json(data: any) {
      res._json = data;
      return res;
    },
    send(data: any) {
      res._json = data;
      return res;
    },
  };
  vi.spyOn(res, 'status');
  vi.spyOn(res, 'json');
  return res;
}

export function mockNext() {
  return vi.fn();
}

/** Standard test user row from PG */
export const testUserRow = {
  id: 'user-123',
  email: 'john@example.com',
  username: 'john',
  password: '$2b$10$hashed',
  first_name: 'John',
  last_name: 'Doe',
  role: 'user',
  verified: true,
  company: 'Acme',
  phone: '+40700000000',
  provider: 'local',
  google_id: null,
  facebook_id: null,
  profile_picture: null,
  progression_status: 'active',
  progression_category: 'standard',
  progression_timeline: '',
  created_at: new Date('2025-01-01'),
  updated_at: new Date('2025-06-01'),
};
