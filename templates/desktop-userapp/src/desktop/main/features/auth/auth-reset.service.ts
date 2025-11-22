/**
 * Password Reset Service - PIN-based password reset for desktop app
 * @file src/desktop/main/features/auth/auth-reset.service.ts
 *
 * Implements PIN-based password reset for admin users
 * Regular users must contact admin to reset their password
 */

import { db } from '../../lib/db-client.js';
import { loggerClass } from '@voilajsx/appkit/logger';
import { errorClass } from '@voilajsx/appkit/error';
import { authClass } from '@voilajsx/appkit/auth';

const logger = loggerClass.get('auth-reset');
const error = errorClass.get();
const auth = authClass.get();

export const authResetService = {
  /**
   * Initiate password reset - Check if user exists and their role
   */
  async initiateReset(email: string): Promise<{
    success: boolean;
    isAdmin: boolean;
    message: string;
    error?: string;
  }> {
    try {
      logger.info('Password reset initiated', { email });

      // Find user by email
      const user = db.user.findByEmail(email.toLowerCase().trim());

      if (!user) {
        // For security, don't reveal if user exists
        logger.warn('Reset attempted for non-existent user', { email });
        return {
          success: false,
          isAdmin: false,
          message: 'If this email is registered, you will receive reset instructions.',
          error: 'User not found'
        };
      }

      // Check if user is admin
      const isAdmin = user.role === 'admin';

      if (isAdmin) {
        logger.info('Admin user requesting password reset', { userId: user.id, email });
        return {
          success: true,
          isAdmin: true,
          message: 'Please enter your 4-digit recovery PIN to reset your password.'
        };
      } else {
        logger.info('Regular user requesting password reset', { userId: user.id, email });
        return {
          success: true,
          isAdmin: false,
          message: 'Please contact your system administrator to reset your password.'
        };
      }
    } catch (err: any) {
      logger.error('Password reset initiation failed', { email, error: err });
      throw error.serverError('Failed to process password reset request');
    }
  },

  /**
   * Reset password with PIN verification (admin only)
   */
  async resetWithPin(data: {
    email: string;
    pin: string;
    newPassword: string;
  }): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      logger.info('PIN-based password reset', { email: data.email });

      // Validate inputs
      if (!data.email || !data.pin || !data.newPassword) {
        return {
          success: false,
          error: 'Email, PIN, and new password are required'
        };
      }

      if (!/^\d{4}$/.test(data.pin)) {
        return {
          success: false,
          error: 'Recovery PIN must be exactly 4 digits'
        };
      }

      if (data.newPassword.length < 8) {
        return {
          success: false,
          error: 'Password must be at least 8 characters long'
        };
      }

      // Find user
      const user = db.user.findByEmail(data.email.toLowerCase().trim());

      if (!user) {
        logger.warn('Reset attempted for non-existent user', { email: data.email });
        return {
          success: false,
          error: 'Invalid email or recovery PIN'
        };
      }

      // Only admins can use PIN reset
      if (user.role !== 'admin') {
        logger.warn('Non-admin user attempted PIN reset', { userId: user.id, email: data.email });
        return {
          success: false,
          error: 'PIN-based password reset is only available for administrators. Please contact your system administrator.'
        };
      }

      // Verify recovery PIN
      if (!user.recoveryPin) {
        logger.error('Admin user has no recovery PIN', { userId: user.id });
        return {
          success: false,
          error: 'Recovery PIN not found. Please contact support.'
        };
      }

      const isPinValid = await auth.comparePassword(data.pin, user.recoveryPin);

      if (!isPinValid) {
        logger.warn('Invalid recovery PIN attempt', { userId: user.id, email: data.email });
        return {
          success: false,
          error: 'Invalid recovery PIN'
        };
      }

      // Hash new password
      const hashedPassword = await auth.hashPassword(data.newPassword);

      // Update password
      db.user.update(user.id, { password: hashedPassword });

      logger.info('Password reset successful', { userId: user.id, email: data.email });

      return {
        success: true,
        message: 'Password reset successfully'
      };
    } catch (err: any) {
      logger.error('PIN-based password reset failed', { email: data.email, error: err });
      throw error.serverError('Failed to reset password');
    }
  }
};
