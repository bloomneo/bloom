/**
 * Auth Feature Routes - Authentication endpoints with AppKit integration
 * @file src/api/features/auth/auth.route.ts
 */

import { Router, Request, Response } from 'express';
import { errorClass } from '@bloomneo/appkit/error';
import { securityClass } from '@bloomneo/appkit/security';
import { databaseClass } from '@bloomneo/appkit/database';
import { loggerClass } from '@bloomneo/appkit/logger';
import { authService } from './auth.service.js';
import { auditService } from '../audit/audit.service.js';

const logger = loggerClass.get('auth-routes');

/**
 * Normalize any thrown value into something with `statusCode` + `message`.
 * `catch (err)` is unknown by default in strict TS; this pulls the
 * fields we care about without leaking internals to the client.
 */
function normalizeError(err: unknown): { statusCode?: number; message: string } {
  if (err instanceof Error) {
    const anyErr = err as Error & { statusCode?: number };
    return { statusCode: anyErr.statusCode, message: err.message };
  }
  return { message: typeof err === 'string' ? err : 'Unknown error' };
}

/**
 * Server-side enforcement of the admin's `feature_signup_open` flag.
 * The client hides the form when false, but never trust the client —
 * a direct POST to /api/auth/register still has to be gated here.
 * Returns true when the flag is missing (default-open) so a brand-new
 * install without a settings row still accepts signups.
 */
async function isSignupOpen(): Promise<boolean> {
  const db = await databaseClass.get();
  const row = await db.appSetting.findUnique({
    where: { key: 'feature_signup_open' },
  });
  if (!row) return true;
  return (row.value ?? 'true').toLowerCase() !== 'false';
}

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

    // Gate on the admin-controlled flag. Defense in depth — the /register
    // page hides the form when this is false, but the endpoint must own
    // final enforcement for direct API callers.
    if (!(await isSignupOpen())) {
      auditService.logAudit({
        actorType: 'system',
        action: 'auth.register.blocked',
        description: 'Registration attempted while signups are closed',
        newValue: { email: req.body?.email },
        ipAddress: req.ip,
        userAgent: req.get('user-agent') ?? undefined,
      });
      return res.status(403).json({
        error: 'SIGNUPS_CLOSED',
        message: 'New signups are currently disabled by the administrator.',
        requestId,
      });
    }

    const result = await authService.register(req.body);

    // Fire-and-forget audit entry. Never await; if the DB is down the
    // user still gets their account. `newValue` deliberately omits the
    // hashed password — never log secrets even incidentally.
    auditService.logAudit({
      actorId: result.user?.id ?? null,
      actorType: 'user',
      action: 'auth.register',
      entityType: 'user',
      entityId: result.user?.id ?? null,
      newValue: { email: result.user?.email, role: result.user?.role },
      ipAddress: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });

    res.status(201).json({
      ...result,
      requestId
    });

  } catch (err) {
    const { statusCode, message } = normalizeError(err);
    logger.warn('register failed', { email: req.body?.email, error: message });
    auditService.logAudit({
      actorType: 'system',
      action: 'auth.register.failure',
      description: message,
      newValue: { email: req.body?.email },
      ipAddress: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });
    res.status(statusCode ?? 500).json({
      error: 'REGISTRATION_FAILED',
      message,
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

    // Audit successful logins so the admin activity feed shows who's
    // coming in. Failed logins are audited in the catch below.
    auditService.logAudit({
      actorId: result.user?.id ?? null,
      actorType: 'user',
      action: 'auth.login.success',
      entityType: 'user',
      entityId: result.user?.id ?? null,
      ipAddress: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });

    res.json({
      ...result,
      requestId
    });

  } catch (err) {
    const { statusCode, message } = normalizeError(err);
    logger.warn('login failed', { email: req.body?.email, error: message });
    // Surface bad-credential attempts in the audit log. We don't know
    // the user id here (the service threw before returning), so we log
    // the attempted email in `newValue` so the admin can spot brute-force
    // patterns from a single address.
    auditService.logAudit({
      actorType: 'system',
      action: 'auth.login.failure',
      description: message,
      newValue: { email: req.body?.email },
      ipAddress: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });
    res.status(statusCode ?? 500).json({
      error: 'LOGIN_FAILED',
      message,
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
  } catch (err) {
    const { message } = normalizeError(err);
    logger.warn('email verification failed', { error: message });
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message,
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
  } catch (err) {
    const { message } = normalizeError(err);
    logger.warn('resend verification failed', { email: req.body?.email, error: message });
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message,
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
  } catch (err) {
    const { message } = normalizeError(err);
    logger.warn('forgot-password failed', { email: req.body?.email, error: message });
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message,
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
  } catch (err) {
    const { message } = normalizeError(err);
    logger.warn('reset-password failed', { error: message });
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message,
    });
  }
});

export default router;