/**
 * Permission utilities for role-based access control
 * @file src/web/shared/utils/permissions.ts
 */

export const hasRole = (user: { role: string; level: string } | null, allowedRoles: string[]): boolean => {
  if (!user || !allowedRoles.length) return true;
  const userPermission = `${user.role}.${user.level}`;
  return allowedRoles.includes(userPermission);
};

export const hasAnyRole = (user: { role: string; level: string } | null, allowedRolesList: string[][]): boolean => {
  return allowedRolesList.some(roles => hasRole(user, roles));
};

export const isAdmin = (user: { role: string; level: string } | null): boolean => {
  return hasRole(user, ['admin.tenant', 'admin.org', 'admin.system']);
};

export const isModerator = (user: { role: string; level: string } | null): boolean => {
  return hasRole(user, ['moderator.review', 'moderator.approve', 'moderator.manage']);
};

export const isModeratorOrAdmin = (user: { role: string; level: string } | null): boolean => {
  return hasRole(user, [
    'moderator.review', 'moderator.approve', 'moderator.manage',
    'admin.tenant', 'admin.org', 'admin.system'
  ]);
};