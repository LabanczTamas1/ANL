// ---------------------------------------------------------------------------
// User Domain — Public API
// ---------------------------------------------------------------------------
// Cross-domain consumers should import from this barrel instead of reaching
// into the repository internals directly.
// ---------------------------------------------------------------------------

export type { UserRow } from './repository/userRepository.js';

export {
  findById,
  findByEmail,
  findByUsername,
  findByRole,
  findAll,
  updateUser,
  toApiUser,
} from './repository/userRepository.js';
