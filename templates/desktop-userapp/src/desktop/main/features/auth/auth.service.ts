/**
 * Auth Feature Service - Authentication business logic
 * @file src/api/features/auth/auth.service.ts
 *
 * Simplified authentication for desktop app with better-sqlite3
 */

import { db } from '../../lib/db-client.js';
import { loggerClass } from '@voilajsx/appkit/logger';
import { errorClass } from '@voilajsx/appkit/error';
import { authClass } from '@voilajsx/appkit/auth';
import type { AuthLoginRequest, AuthLoginResponse } from './auth.types.js';

// Initialize AppKit modules
const logger = loggerClass.get('auth-service');
const error = errorClass.get();
const auth = authClass.get();

export const authService = {
  // User login service
  async login(data: AuthLoginRequest): Promise<AuthLoginResponse> {
    try {
      logger.info('Processing user login', { email: data.email });

      // Validate input
      if (!data.email || !this.validateEmail(data.email)) {
        throw error.badRequest('Valid email is required');
      }

      if (!data.password) {
        throw error.badRequest('Password is required');
      }

      // Find user by email
      const user = db.user.findByEmail(data.email);

      if (!user) {
        logger.warn('User not found for login', { email: data.email });
        throw error.badRequest('Invalid email or password');
      }

      logger.info('User found, verifying password', { userId: user.id, email: data.email });

      // Verify password using AppKit auth
      const isPasswordValid = await auth.comparePassword(data.password, user.password);

      if (!isPasswordValid) {
        logger.warn('Invalid password for login', { email: data.email, userId: user.id });
        throw error.badRequest('Invalid email or password');
      }

      logger.info('Password verified, generating JWT token', {
        userId: user.id
      });

      // Generate JWT token with user's actual role and level from database
      let token;
      try {
        token = auth.generateLoginToken({
          userId: user.id,
          role: user.role,  // Use actual role from database (e.g., 'admin')
          level: user.level  // Use actual level from database (e.g., 'system')
        });
        logger.info('JWT token generated successfully', {
          userId: user.id,
          role: user.role,
          level: user.level,
          combinedRole: `${user.role}.${user.level}`
        });
      } catch (tokenErr: any) {
        logger.error('JWT token generation failed', {
          userId: user.id,
          tokenError: tokenErr.message
        });
        throw error.serverError(`Failed to generate authentication token: ${tokenErr.message}`);
      }

      // Return user data with token (exclude password)
      const { password: _, ...userWithoutPassword } = user;

      logger.info('User login completed', { userId: user.id, email: data.email });
      return {
        message: 'Login successful',
        user: userWithoutPassword,
        token
      };

    } catch (err: any) {
      if (err.statusCode) {
        throw err;
      }

      logger.error('Unexpected login error', { email: data.email, error: err });
      throw error.serverError('Login failed due to unexpected error. Please try again.');
    }
  },

  // Validation helper methods
  validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  validatePassword(password: string): boolean {
    return !!(password && password.length >= 8);
  },

  // User registration service (simplified for desktop app - no email verification)
  async register(data: { name: string; email: string; phone?: string; password: string }): Promise<any> {
    try {
      logger.info('Processing user registration', { email: data.email });

      // Validate input
      if (!data.email || !this.validateEmail(data.email)) {
        throw error.badRequest('Valid email is required');
      }

      if (!data.password || !this.validatePassword(data.password)) {
        throw error.badRequest('Password must be at least 8 characters long');
      }

      if (!data.name || data.name.trim().length === 0) {
        throw error.badRequest('Name is required');
      }

      // Check if user already exists
      const existingUser = db.user.findByEmail(data.email);
      if (existingUser) {
        logger.warn('Registration attempted with existing email', { email: data.email });
        throw error.badRequest('Email address is already registered');
      }

      // Hash password
      const hashedPassword = await auth.hashPassword(data.password);

      // Create user (active by default for desktop app)
      const user = db.user.create({
        email: data.email.toLowerCase().trim(),
        password: hashedPassword,
        name: data.name.trim(),
        phone: data.phone?.trim() || null,
        role: 'user',
        level: 'basic',
        isVerified: true,  // Auto-verified for desktop app
        isActive: true
      });

      logger.info('User registered successfully', { userId: user.id, email: data.email });

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        message: 'Registration successful',
        user: userWithoutPassword
      };

    } catch (err: any) {
      if (err.statusCode) {
        throw err;
      }

      logger.error('Registration error', { email: data.email, error: err });
      throw error.serverError('Registration failed. Please try again.');
    }
  },

  async verifyEmailToken(_token: string): Promise<any> {
    return { success: false, error: 'Email verification is not available in desktop app' };
  },

  async resendVerificationEmail(_email: string): Promise<any> {
    return { success: false, error: 'Email verification is not available in desktop app' };
  },

  async sendPasswordResetEmail(_email: string): Promise<any> {
    return { success: false, error: 'Password reset is not available in desktop app' };
  },

  async resetPassword(_token: string, _newPassword: string): Promise<any> {
    return { success: false, error: 'Password reset is not available in desktop app' };
  }
};
