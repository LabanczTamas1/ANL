// ---------------------------------------------------------------------------
// Authorization Middleware — RBAC role and permission guards
// ---------------------------------------------------------------------------

import { Request, Response, NextFunction } from 'express';
import {
  UserRole,
  Permission,
  hasAnyPermission,
  hasAllPermissions,
} from '../utils/rbac.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('authorization', 'middleware');

/**
 * Allow if the authenticated user has one of the given roles.
 *
 * ```ts
 * router.post('/admin', authMiddleware, authorizeRole(UserRole.ADMIN), handler);
 * router.delete('/item', authMiddleware, authorizeRole(UserRole.ADMIN, UserRole.MODERATOR), handler);
 * ```
 */
export function authorizeRole(...allowedRoles: (UserRole | string)[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      logger.warn(
        { user: req.user?.id, role: req.user?.role, required: allowedRoles },
        'Insufficient role',
      );
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    next();
  };
}

/**
 * Allow if the authenticated user has the required permissions.
 *
 * @param permissions — list of permissions to check
 * @param mode — `'any'` (default) = at least one; `'all'` = every one
 */
export function authorizePermission(
  permissions: Permission[],
  mode: 'any' | 'all' = 'any',
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const role = req.user.role as UserRole;
    const allowed =
      mode === 'all'
        ? hasAllPermissions(role, permissions)
        : hasAnyPermission(role, permissions);

    if (!allowed) {
      logger.warn(
        { userId: req.user.id, role, permissions, mode },
        'Insufficient permissions',
      );
      res.status(403).json({ error: 'Forbidden: insufficient permissions' });
      return;
    }

    next();
  };
}

/**
 * Allow if the user owns the resource OR is an admin.
 *
 * @param getResourceOwnerId — function that extracts the owner's ID from the request
 */
export function authorizeOwnerOrAdmin(
  getResourceOwnerId: (req: Request) => string,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const ownerId = getResourceOwnerId(req);
    const isOwner = req.user.id === ownerId || req.user.sub === ownerId;
    const isAdmin =
      req.user.role === UserRole.ADMIN || req.user.role === UserRole.OWNER;

    if (!isOwner && !isAdmin) {
      logger.warn(
        { userId: req.user.id, ownerId },
        'Not owner or admin',
      );
      res.status(403).json({ error: 'You can only modify your own resources' });
      return;
    }

    next();
  };
}

/**
 * Custom authorization with an async predicate.
 */
export function authorizeCustom(
  predicate: (req: Request, user: Express.User) => Promise<boolean>,
  message = 'Forbidden',
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const allowed = await predicate(req, req.user);
    if (!allowed) {
      res.status(403).json({ error: message });
      return;
    }

    next();
  };
}
