/**
 * User Feature - Main Export
 * @file src/web/features/user/index.ts
 */

// Types
export type { User, UserProfile, ChangePasswordData, UserContextType, UserState } from './types';

// Context & Hooks
export { UserProvider, useUser } from './context/UserContext';

// Components
export { ErrorBoundary } from './components';

// Role constants for user feature (use with AuthGuard at component level)
export const USER_ROLES = {
  PROFILE_ACCESS: [], // All authenticated users can access profile
  ADMIN_ACCESS: ['admin.tenant', 'admin.org', 'admin.system'],
  MODERATOR_ACCESS: ['moderator.review', 'moderator.approve', 'moderator.manage', 'admin.tenant', 'admin.org', 'admin.system'],
  FULL_ADMIN: ['admin.system']
};