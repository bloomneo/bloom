// Auth Types - Centralized type definitions

export interface User {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  role: string;
  level: string;
  tenantId: string | null;
  isVerified: boolean;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface VerifyEmailData {
  token: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: (redirectTo?: string) => void;
  verifyEmail: (data: VerifyEmailData) => Promise<{ success: boolean; error?: string }>;
  resendVerification: (email: string) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (data: ForgotPasswordData) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (data: ResetPasswordData) => Promise<{ success: boolean; error?: string }>;
}