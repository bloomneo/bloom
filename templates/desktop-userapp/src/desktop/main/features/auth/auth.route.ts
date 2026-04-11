/**
 * Auth Feature Routes - Authentication endpoints with AppKit integration
 * @file src/api/features/auth/auth.route.ts
 */

import { Router, Request, Response } from 'express';
import { errorClass } from '@bloomneo/appkit/error';
import { securityClass } from '@bloomneo/appkit/security';
import { authService } from './auth.service.js';
import { authResetService } from './auth-reset.service.js';

// Initialize AppKit modules
const router = Router();
const error = errorClass.get();
const security = securityClass.get();

// Rate limiting for auth endpoints using AppKit security - moderate limits for development
const authRateLimit = security.requests(10, 15 * 60 * 1000, {
  message: 'Too many authentication attempts, please try again later.'
});

/**
 * Register a new user (desktop app - auto-verified, no email confirmation)
 */
router.post('/register', authRateLimit, async (req: Request, res: Response) => {
  try {
    const requestId = (req as any).requestMetadata?.requestId || 'unknown';

    // TODO: Check if registration is enabled in settings
    // For now, always allow registration

    const result = await authService.register(req.body);

    res.status(201).json({
      ...result,
      requestId
    });

  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(err.statusCode || 500).json({
      success: false,
      error: err.message || 'Registration failed',
      requestId: (req as any).requestMetadata?.requestId || 'unknown'
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
 * Forgot password - Check user role and initiate reset
 * Desktop app: PIN-based reset for admins, contact admin for regular users
 */
router.post('/forgot-password', authRateLimit, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw error.badRequest('Email address is required');
    }

    const result = await authResetService.initiateReset(email);

    res.json({
      success: result.success,
      isAdmin: result.isAdmin,
      message: result.message,
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
 * Reset password with PIN (desktop app - admin only)
 */
router.post('/reset-password', authRateLimit, async (req: Request, res: Response) => {
  try {
    const { email, pin, newPassword } = req.body;

    const result = await authResetService.resetWithPin({
      email,
      pin,
      newPassword
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Password reset failed',
      });
    }

    res.json({
      success: true,
      message: result.message || 'Password reset successfully',
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