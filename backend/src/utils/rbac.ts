// ---------------------------------------------------------------------------
// RBAC — Roles, Permissions, and Mapping
// ---------------------------------------------------------------------------

/** User roles recognised by the system. */
export enum UserRole {
  ADMIN = 'admin',
  OWNER = 'owner',
  MODERATOR = 'moderator',
  USER = 'user',
  GUEST = 'guest',
}

/** Fine-grained permissions. */
export enum Permission {
  // User management
  MANAGE_USERS = 'manage_users',
  DELETE_USERS = 'delete_users',
  VIEW_USERS = 'view_users',

  // Booking
  CREATE_BOOKING = 'create_booking',
  EDIT_BOOKING = 'edit_booking',
  DELETE_BOOKING = 'delete_booking',
  VIEW_BOOKINGS = 'view_bookings',
  MANAGE_BOOKINGS = 'manage_bookings',

  // Kanban
  CREATE_KANBAN = 'create_kanban',
  EDIT_KANBAN = 'edit_kanban',
  DELETE_KANBAN = 'delete_kanban',
  VIEW_KANBAN = 'view_kanban',

  // Email
  SEND_EMAIL = 'send_email',
  VIEW_EMAIL = 'view_email',
  DELETE_EMAIL = 'delete_email',

  // Reviews
  CREATE_REVIEW = 'create_review',
  EDIT_REVIEW = 'edit_review',
  DELETE_REVIEW = 'delete_review',
  MODERATE_REVIEWS = 'moderate_reviews',

  // Availability
  MANAGE_AVAILABILITY = 'manage_availability',
  VIEW_AVAILABILITY = 'view_availability',

  // Admin / System
  ACCESS_ADMIN = 'access_admin',
  VIEW_LOGS = 'view_logs',
  BAN_IPS = 'ban_ips',
  VIEW_STATS = 'view_stats',

  // Progress
  MANAGE_PROGRESS = 'manage_progress',
  VIEW_PROGRESS = 'view_progress',

  // Contact
  SUBMIT_CONTACT = 'submit_contact',

  // File management
  IMPORT_DATA = 'import_data',
  EXPORT_DATA = 'export_data',
}

// ---------------------------------------------------------------------------
// Role → Permission mapping
// ---------------------------------------------------------------------------

export const RolePermissionMap: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: Object.values(Permission), // all
  [UserRole.OWNER]: Object.values(Permission), // all

  [UserRole.MODERATOR]: [
    Permission.VIEW_USERS,
    Permission.VIEW_BOOKINGS,
    Permission.VIEW_KANBAN,
    Permission.CREATE_REVIEW,
    Permission.MODERATE_REVIEWS,
    Permission.VIEW_AVAILABILITY,
    Permission.VIEW_PROGRESS,
    Permission.VIEW_STATS,
  ],

  [UserRole.USER]: [
    Permission.VIEW_USERS,
    Permission.CREATE_BOOKING,
    Permission.VIEW_BOOKINGS,
    Permission.DELETE_BOOKING,
    Permission.CREATE_KANBAN,
    Permission.EDIT_KANBAN,
    Permission.DELETE_KANBAN,
    Permission.VIEW_KANBAN,
    Permission.SEND_EMAIL,
    Permission.VIEW_EMAIL,
    Permission.DELETE_EMAIL,
    Permission.CREATE_REVIEW,
    Permission.EDIT_REVIEW,
    Permission.VIEW_AVAILABILITY,
    Permission.MANAGE_AVAILABILITY,
    Permission.VIEW_PROGRESS,
    Permission.SUBMIT_CONTACT,
  ],

  [UserRole.GUEST]: [
    Permission.VIEW_BOOKINGS,
    Permission.VIEW_AVAILABILITY,
    Permission.SUBMIT_CONTACT,
  ],
};

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/** Get all permissions granted to a role. */
export function getPermissionsForRole(role: UserRole): Permission[] {
  return RolePermissionMap[role] ?? [];
}

/** Check if a role has a specific permission. */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return getPermissionsForRole(role).includes(permission);
}

/** Check if a role has **any** of the listed permissions. */
export function hasAnyPermission(
  role: UserRole,
  permissions: Permission[],
): boolean {
  const granted = getPermissionsForRole(role);
  return permissions.some((p) => granted.includes(p));
}

/** Check if a role has **all** of the listed permissions. */
export function hasAllPermissions(
  role: UserRole,
  permissions: Permission[],
): boolean {
  const granted = getPermissionsForRole(role);
  return permissions.every((p) => granted.includes(p));
}
