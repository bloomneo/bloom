/**
 * User Feature Types
 * @file src/web/features/user/types/index.ts
 */

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: string;
  level?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  name: string;
  phone?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Profile management
  getProfile: () => Promise<User | null>;
  updateProfile: (data: UserProfile) => Promise<{ success: boolean; error?: string }>;
  changePassword: (data: ChangePasswordData) => Promise<{ success: boolean; error?: string }>;

  // Utility
  refreshProfile: () => Promise<void>;
  clearError: () => void;
  makeAuthenticatedRequest: (endpoint: string, options?: RequestInit) => Promise<any>;
}

export interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}