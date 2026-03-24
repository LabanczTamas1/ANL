// ---------------------------------------------------------------------------
// API Service — barrel export
// ---------------------------------------------------------------------------
//
// Usage:
//   import { authApi, userApi, kanbanApi } from '@/services/api';
//   const { data } = await authApi.login({ email, password });
//
// Or import individual functions:
//   import { login, register } from '@/services/api/authApi';
//

export { default as apiClient } from './client';

import * as authApi from './authApi';
import * as userApi from './userApi';
import * as adminApi from './adminApi';
import * as emailApi from './emailApi';
import * as kanbanApi from './kanbanApi';
import * as availabilityApi from './availabilityApi';
import * as bookingApi from './bookingApi';
import * as progressApi from './progressApi';
import * as fileApi from './fileApi';
import * as contactApi from './contactApi';
import * as reviewApi from './reviewApi';

export {
  authApi,
  userApi,
  adminApi,
  emailApi,
  kanbanApi,
  availabilityApi,
  bookingApi,
  progressApi,
  fileApi,
  contactApi,
  reviewApi,
};
