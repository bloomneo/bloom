/**
 * Auth Feature Service - Authentication business logic with AppKit integration
 * @file src/api/features/auth/auth.service.ts
 *
 * @llm-rule WHEN: Need authentication business logic with JWT, validation, email verification, and password reset
 * @llm-rule AVOID: Direct database calls from routes - always use service layer
 * @llm-rule NOTE: Implements complete authentication flow with AppKit auth, email, database, logger, and error patterns
 */

import { databaseClass } from '@bloomneo/appkit/database';
import { loggerClass } from '@bloomneo/appkit/logger';
import { errorClass } from '@bloomneo/appkit/error';
import { authClass } from '@bloomneo/appkit/auth';
import { generateVerificationToken, sendVerificationEmail, generatePasswordResetToken, sendPasswordResetEmail, isTokenExpired } from './auth.util.js';
import type { AuthLoginRequest, AuthRegisterRequest, AuthLoginResponse, AuthRegisterResponse } from './auth.types.js';

// Initialize AppKit modules following the pattern
const logger = loggerClass.get('auth-service');
const error = errorClass.get();
const auth = authClass.get();

export const authService = {
  // User registration service
  async register(data: AuthRegisterRequest): Promise<AuthRegisterResponse> {
    try {
      logger.info('Processing user registration', { email: data.email, role: data.role, level: data.level });

      // Validate input
      if (!data.email || !this.validateEmail(data.email)) {
        throw error.badRequest('Valid email is required');
      }

      if (!data.password || !this.validatePassword(data.password)) {
        throw error.badRequest('Password must be at least 8 characters long');
      }

      // Check if user already exists
      const db = await databaseClass.get();
      const existingUser = await db.user.findUnique({
        where: { email: data.email }
      });

      if (existingUser) {
        logger.warn('User already exists', { email: data.email });
        throw error.badRequest('User already exists with this email');
      }

      // Hash password using AppKit auth
      const hashedPassword = await auth.hashPassword(data.password);

      // Create user
      const user = await db.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name || null,
          phone: data.phone || null,
          role: data.role || 'user',
          level: data.level || 'basic',
          isVerified: false,
          isActive: true
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          level: true,
          tenantId: true,
          isVerified: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      });

      // Send verification email asynchronously (don't block registration)
      this.sendEmailVerification(user.id).catch(err => {
        logger.warn('Failed to send verification email', {
          userId: user.id,
          email: user.email,
          error: err.message
        });
      });

      logger.info('User registration completed', { userId: user.id, email: user.email });
      return {
        message: 'User registered successfully',
        user
      };

    } catch (err: any) {
      if (err.statusCode) {
        throw err;
      }
      logger.error('Failed to register user', { data, error: err });
      throw error.serverError('Failed to register user');
    }
  },

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
      const db = await databaseClass.get();
      const user = await db.user.findUnique({
        where: { email: data.email }
      });

      if (!user) {
        logger.warn('User not found for login', { email: data.email });
        throw error.badRequest('Invalid email or password');
      }

      logger.info('User found, verifying password', { userId: user.id, email: data.email });

      // Verify password using AppKit auth (compatible with all hashing methods)
      const isPasswordValid = await auth.comparePassword(data.password, user.password);

      if (!isPasswordValid) {
        logger.warn('Invalid password for login', { email: data.email, userId: user.id });
        throw error.badRequest('Invalid email or password');
      }

      logger.info('Password verified, checking user status', { userId: user.id, isActive: user.isActive });

      // Check if user is active
      if (!user.isActive) {
        logger.warn('Inactive user login attempt', { email: data.email, userId: user.id });
        throw error.badRequest('Account is deactivated');
      }

      logger.info('User is active, generating JWT token', {
        userId: user.id,
        role: user.role,
        level: user.level,
        roleLevel: `${user.role}.${user.level}`
      });

      // Generate JWT token with detailed error handling
      let token;
      try {
        token = auth.generateLoginToken({
          userId: user.id,
          role: user.role,
          level: user.level
        });
        logger.info('JWT token generated successfully', { userId: user.id });
      } catch (tokenErr: any) {
        logger.error('JWT token generation failed', {
          userId: user.id,
          role: user.role,
          level: user.level,
          roleLevel: `${user.role}.${user.level}`,
          tokenError: tokenErr.message
        });

        // Check if it's a role validation error
        if (tokenErr.message?.includes('Invalid role.level')) {
          throw error.badRequest(`Invalid user role configuration: ${user.role}.${user.level}. Please contact administrator.`);
        }

        throw error.serverError(`Failed to generate authentication token: ${tokenErr.message}`);
      }

      // Update last login
      await db.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });

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

      // More specific error messages based on error type
      if (err.message?.includes('User not found')) {
        logger.error('Database error during user lookup', { email: data.email, error: err.message });
        throw error.badRequest('Invalid email or password');
      }

      if (err.message?.includes('password')) {
        logger.error('Password verification error', { email: data.email, error: err.message });
        throw error.badRequest('Invalid email or password');
      }

      if (err.message?.includes('role') || err.message?.includes('token')) {
        logger.error('Authentication system error', { email: data.email, error: err.message });
        throw error.serverError('Authentication system error. Please contact administrator.');
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

  // Email verification service
  async sendEmailVerification(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get user details
      const db = await databaseClass.get();
      const user = await db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw error.badRequest('User not found');
      }

      if (user.isVerified) {
        throw error.badRequest('Email is already verified');
      }

      // Generate new verification token
      const { token, expiry } = generateVerificationToken();

      // Update user with verification token
      await db.user.update({
        where: { id: userId },
        data: {
          verificationToken: token,
          verificationExpiry: expiry,
        },
      });

      // Send verification email
      const emailResult = await sendVerificationEmail(user.email, user.name || '', token);

      if (!emailResult.success) {
        return {
          success: false,
          error: emailResult.error || 'Failed to send verification email'
        };
      }

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to send verification email'
      };
    }
  },

  // Verify email with token
  async verifyEmailToken(token: string): Promise<{ success: boolean; error?: string; user?: any }> {
    try {
      // Find user with this verification token
      const db = await databaseClass.get();
      const user = await db.user.findFirst({
        where: { verificationToken: token },
      });

      if (!user) {
        throw error.badRequest('Invalid or expired verification token');
      }

      if (user.isVerified) {
        throw error.badRequest('Email is already verified');
      }

      if (!user.verificationExpiry || isTokenExpired(user.verificationExpiry)) {
        throw error.badRequest('Verification token has expired');
      }

      // Mark email as verified and clear verification token
      const updatedUser = await db.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          verificationToken: null,
          verificationExpiry: null,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          level: true,
          isVerified: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        success: true,
        user: updatedUser
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Email verification failed'
      };
    }
  },

  // Resend verification email
  async resendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Find user by email
      const db = await databaseClass.get();
      const user = await db.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw error.badRequest('User not found with this email address');
      }

      if (user.isVerified) {
        throw error.badRequest('Email is already verified');
      }

      // Generate new verification token
      const { token, expiry } = generateVerificationToken();

      // Update user with new verification token
      await db.user.update({
        where: { id: user.id },
        data: {
          verificationToken: token,
          verificationExpiry: expiry,
        },
      });

      // Send verification email
      const emailResult = await sendVerificationEmail(user.email, user.name || '', token);

      if (!emailResult.success) {
        return {
          success: false,
          error: emailResult.error || 'Failed to send verification email'
        };
      }

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to resend verification email'
      };
    }
  },

  // Send password reset email
  async sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Find user by email
      const db = await databaseClass.get();
      const user = await db.user.findUnique({
        where: { email },
      });

      if (!user) {
        // For security, don't reveal if email exists or not
        return { success: true };
      }

      // Generate new password reset token
      const { token, expiry } = generatePasswordResetToken();

      // Update user with reset token
      await db.user.update({
        where: { id: user.id },
        data: {
          resetToken: token,
          resetTokenExpiry: expiry,
        },
      });

      // Send password reset email
      const emailResult = await sendPasswordResetEmail(user.email, user.name || '', token);

      if (!emailResult.success) {
        return {
          success: false,
          error: emailResult.error || 'Failed to send password reset email'
        };
      }

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to send password reset email'
      };
    }
  },

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Find user with this reset token
      const db = await databaseClass.get();
      const user = await db.user.findFirst({
        where: { resetToken: token },
      });

      if (!user) {
        throw error.badRequest('Invalid or expired password reset token');
      }

      if (!user.resetTokenExpiry || isTokenExpired(user.resetTokenExpiry)) {
        throw error.badRequest('Password reset token has expired');
      }

      // Hash new password using AppKit auth
      const hashedPassword = await auth.hashPassword(newPassword);

      // Update password and clear reset token
      await db.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Password reset failed'
      };
    }
  }
};