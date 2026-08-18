/**
 * Auth Feature Routes - Authentication endpoints with AppKit integration
 * @file src/api/features/auth/auth.route.ts
 */

import { Router, Request, Response } from 'express';
import { errorClass } from '@bloomneo/appkit/error';
import { securityClass } from '@bloomneo/appkit/security';
import { authService } from './auth.service.js';

// Initialize AppKit modules
const router = Router();
const error = errorClass.get();
const security = securityClass.get();

// Rate limiting for auth endpoints using AppKit security - moderate limits for development
const authRateLimit = security.requests(10, 15 * 60 * 1000, {
  message: 'Too many authentication attempts, please try again later.'
});

/**
 * Register a new user
 */
router.post('/register', authRateLimit, async (req: Request, res: Response) => {
  try {
    const requestId = (req as any).requestMetadata?.requestId || 'unknown';
    const result = await authService.register(req.body);

    res.status(201).json({
      ...result,
      requestId
    });

  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(err.statusCode || 500).json({
      error: 'REGISTRATION_FAILED',
      message: err.message || 'Registration failed',
    });
  }
});

/**
 * Login user and generate JWT token
 */
router.post('/login', authRateLimit, async (req: Request, res: Response) => {
  try {
    const requestId = (req as any).requestMetadata?.requestId || 'unknown';
    const result = await authService.login(req.body);

    res.json({
      ...result,
      requestId
    });

  } catch (err: any) {
    console.error('Login error:', err);
    res.status(err.statusCode || 500).json({
      error: 'LOGIN_FAILED',
      message: err.message || 'Login failed',
    });
  }
});

/**
 * Test route to verify discovery and functionality
 */
router.get('/test', (_req: Request, res: Response) => {
  res.json({
    message: 'Auth routes are working',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Verify email with token
 */
router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      throw error.badRequest('Verification token is required');
    }

    const result = await authService.verifyEmailToken(token);

    if (!result.success) {
      return res.status(400).json({
        error: 'VERIFICATION_FAILED',
        message: result.error,
      });
    }

    res.json({
      message: 'Email verified successfully',
      user: result.user,
    });
  } catch (err: any) {
    console.error('Email verification error:', err);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: err.message || 'Email verification failed',
    });
  }
});

/**
 * Resend verification email
 */
router.post('/resend-verification', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw error.badRequest('Email address is required');
    }

    const result = await authService.resendVerificationEmail(email);

    if (!result.success) {
      return res.status(400).json({
        error: 'RESEND_FAILED',
        message: result.error,
      });
    }

    res.json({
      message: 'Verification email sent successfully',
    });
  } catch (err: any) {
    console.error('Resend verification error:', err);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: err.message || 'Failed to resend verification email',
    });
  }
});

/**
 * Forgot password - send reset email
 */
router.post('/forgot-password', authRateLimit, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw error.badRequest('Email address is required');
    }

    const result = await authService.sendPasswordResetEmail(email);

    if (!result.success) {
      return res.status(400).json({
        error: 'RESET_FAILED',
        message: result.error,
      });
    }

    res.json({
      message: 'If an account exists with this email, a password reset link has been sent',
    });
  } catch (err: any) {
    console.error('Forgot password error:', err);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: err.message || 'Failed to process forgot password request',
    });
  }
});

/**
 * Reset password with token
 */
router.post('/reset-password', authRateLimit, async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token) {
      throw error.badRequest('Reset token is required');
    }

    if (!password) {
      throw error.badRequest('New password is required');
    }

    if (password.length < 8) {
      throw error.badRequest('Password must be at least 8 characters long');
    }

    const result = await authService.resetPassword(token, password);

    if (!result.success) {
      return res.status(400).json({
        error: 'RESET_FAILED',
        message: result.error,
      });
    }

    res.json({
      message: 'Password reset successfully',
    });
  } catch (err: any) {
    console.error('Reset password error:', err);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: err.message || 'Failed to reset password',
    });
  }
});

export default router;