/**
 * User Feature Routes - Profile management endpoints with AppKit integration
 * @file src/api/features/user/user.route.ts
 */

import express from 'express';
import { errorClass } from '@bloomneo/appkit/error';
import { authClass } from '@bloomneo/appkit/auth';
import { userService } from './user.service.js';
import { auditService } from '../audit/audit.service.js';

// Initialize AppKit modules
const router = express.Router();
const error = errorClass.get();
const auth = authClass.get();

/**
 * Get user profile by ID
 */
router.get('/profile',
  auth.requireLoginToken(),
  error.asyncRoute(async (req, res) => {
    const requestId = req.requestMetadata?.requestId || 'unknown';

    try {
      const authenticatedUser = auth.getUser(req as any);

      if (!authenticatedUser) {
        throw error.serverError('Authentication failed - user not found in request');
      }

      const user = await userService.getProfile(authenticatedUser.userId as string);

      res.json({
        message: 'Profile retrieved successfully',
        user,
        authenticatedAs: {
          userId: authenticatedUser.userId,
          role: authenticatedUser.role,
          level: authenticatedUser.level
        },
        requestId
      });

    } catch (err: any) {
      if (err.statusCode) {
        throw err;
      }
      res.status(err.statusCode || 500).json({
        error: err.message || 'Failed to get profile',
        requestId
      });
    }
  })
);

/**
 * Update user profile
 */
router.put('/profile',
  auth.requireLoginToken(),
  error.asyncRoute(async (req, res) => {
    const requestId = req.requestMetadata?.requestId || 'unknown';
    const { name, phone } = req.body;

    try {
      const authenticatedUser = auth.getUser(req as any);

      if (!authenticatedUser) {
        throw error.serverError('Authentication failed - user not found in request');
      }

      const user = await userService.updateProfile(authenticatedUser.userId as string, { name, phone });

      res.json({
        message: 'Profile updated successfully',
        user,
        requestId
      });

    } catch (err: any) {
      if (err.statusCode) {
        throw err;
      }
      res.status(err.statusCode || 500).json({
        error: err.message || 'Failed to update profile',
        requestId
      });
    }
  })
);

/**
 * Change user password
 */
router.post('/change-password',
  auth.requireLoginToken(),
  error.asyncRoute(async (req, res) => {
    const requestId = req.requestMetadata?.requestId || 'unknown';
    const { currentPassword, newPassword } = req.body;

    try {
      const authenticatedUser = auth.getUser(req as any);

      if (!authenticatedUser) {
        throw error.serverError('Authentication failed - user not found in request');
      }

      await userService.changePassword(authenticatedUser.userId as string, currentPassword, newPassword);

      res.json({
        message: 'Password changed successfully',
        requestId
      });

    } catch (err: any) {
      // Handle AppKit errors with proper status codes and messages
      if (err.statusCode) {
        res.status(err.statusCode).json({
          error: err.message || 'Password change failed',
          requestId
        });
      } else {
        res.status(500).json({
          error: err.message || 'Password change failed',
          requestId
        });
      }
    }
  })
);

// =============================================================================
// ADMIN ROUTES - /api/user/admin/*
// =============================================================================

/**
 * Get all users (admin only)
 */
router.get('/admin/users',
  auth.requireLoginToken(),
  auth.requireUserRoles(['admin.system']),
  error.asyncRoute(async (req, res) => {
    const requestId = req.requestMetadata?.requestId || 'unknown';
    const { tenantId } = req.query;

    try {
      const users = await userService.getAllUsers(tenantId as string);

      res.json({
        message: 'Users retrieved successfully',
        users,
        count: users.length,
        requestId
      });

    } catch (err: any) {
      if (err.statusCode) {
        throw err;
      }
      res.status(err.statusCode || 500).json({
        error: err.message || 'Failed to get users',
        requestId
      });
    }
  })
);

/**
 * Get users list (moderator+ access)
 */
router.get('/admin/list',
  auth.requireLoginToken(),
  auth.requireUserRoles(['moderator.manage', 'admin.system']),
  error.asyncRoute(async (req, res) => {
    const requestId = req.requestMetadata?.requestId || 'unknown';
    const { tenantId } = req.query;

    try {
      const users = await userService.getAllUsers(tenantId as string);

      res.json({
        message: 'Users retrieved successfully',
        users,
        count: users.length,
        requestId
      });

    } catch (err: any) {
      if (err.statusCode) {
        throw err;
      }
      res.status(err.statusCode || 500).json({
        error: err.message || 'Failed to get users',
        requestId
      });
    }
  })
);

/**
 * Create new user (admin only)
 */
router.post('/admin/create',
  auth.requireLoginToken(),
  auth.requireUserRoles(['admin.system']),
  error.asyncRoute(async (req, res) => {
    const requestId = req.requestMetadata?.requestId || 'unknown';
    const { name, email, phone, password, role, level, isActive, isVerified } = req.body;

    try {
      if (!email) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Email is required',
          requestId
        });
      }

      const user = await userService.createUser({
        name,
        email,
        phone,
        password,
        role: role || 'user',
        level: level || 'basic',
        isActive: isActive !== undefined ? isActive : true,
        isVerified: isVerified !== undefined ? isVerified : false
      });

      // Audit the creation. Never log the password — just the
      // identity fields the admin actually cares about reviewing.
      auditService.logAudit({
        actorId: String(auth.getUser(req as any)?.userId ?? ''),
        actorType: 'admin',
        action: 'user.create',
        entityType: 'user',
        entityId: user?.id ?? null,
        newValue: {
          email: user?.email,
          role: user?.role,
          level: user?.level,
          isActive: user?.isActive,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent') ?? undefined,
      });

      res.status(201).json({
        message: 'User created successfully',
        user,
        requestId
      });

    } catch (err: any) {
      if (err.statusCode) {
        throw err;
      }
      res.status(err.statusCode || 500).json({
        error: err.message || 'Failed to create user',
        requestId
      });
    }
  })
);

/**
 * Get single user by ID (moderator+ access)
 */
router.get('/admin/users/:id',
  auth.requireLoginToken(),
  auth.requireUserRoles(['moderator.manage', 'admin.system']),
  error.asyncRoute(async (req, res) => {
    const requestId = req.requestMetadata?.requestId || 'unknown';
    const userId = req.params.id;

    try {
      // User.id is a cuid (String) after the 4.1 migration; cuids start
      // with 'c', are 24–25 chars, and never numeric. Only assert it's
      // non-empty; Prisma handles the malformed-id case downstream.
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({
          error: 'Invalid user ID',
          message: 'User ID must be a non-empty string',
          requestId
        });
      }

      const user = await userService.getUserById(userId);

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: `User with ID ${userId} not found`,
          requestId
        });
      }

      res.json({
        message: 'User retrieved successfully',
        user,
        requestId
      });

    } catch (err: any) {
      if (err.statusCode) {
        throw err;
      }
      res.status(err.statusCode || 500).json({
        error: err.message || 'Failed to get user',
        requestId
      });
    }
  })
);

/**
 * Update user by admin (admin only)
 */
router.put('/admin/users/:id',
  auth.requireLoginToken(),
  auth.requireUserRoles(['admin.system']),
  error.asyncRoute(async (req, res) => {
    const requestId = req.requestMetadata?.requestId || 'unknown';
    const userId = req.params.id;

    try {
      // Snapshot the row before mutating so the audit entry has a
      // before/after diff to render in the admin UI.
      const before = await userService.getUserById(userId);
      const user = await userService.updateUser(userId, req.body);

      auditService.logAudit({
        actorId: String(auth.getUser(req as any)?.userId ?? ''),
        actorType: 'admin',
        action: 'user.update',
        entityType: 'user',
        entityId: userId,
        oldValue: before
          ? {
              email: before.email,
              role: before.role,
              level: before.level,
              isActive: before.isActive,
            }
          : null,
        newValue: {
          email: user?.email,
          role: user?.role,
          level: user?.level,
          isActive: user?.isActive,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent') ?? undefined,
      });

      res.json({
        message: 'User updated successfully',
        user,
        requestId
      });

    } catch (err: any) {
      if (err.statusCode) {
        throw err;
      }
      res.status(err.statusCode || 500).json({
        error: err.message || 'Failed to update user',
        requestId
      });
    }
  })
);

/**
 * Delete user (admin only)
 */
router.delete('/admin/users/:id',
  auth.requireLoginToken(),
  auth.requireUserRoles(['admin.system']),
  error.asyncRoute(async (req, res) => {
    const requestId = req.requestMetadata?.requestId || 'unknown';
    const userId = req.params.id;

    try {
      const authenticatedUser = auth.getUser(req as any);

      // Prevent self-deletion
      if (authenticatedUser?.userId === userId) {
        return res.status(400).json({
          error: 'Operation not allowed',
          message: 'Cannot delete your own account',
          requestId
        });
      }

      // Snapshot so the audit log has the deleted user's details for
      // any future "who was this user?" lookup.
      const before = await userService.getUserById(userId);
      await userService.deleteUser(userId);

      auditService.logAudit({
        actorId: String(auth.getUser(req as any)?.userId ?? ''),
        actorType: 'admin',
        action: 'user.delete',
        entityType: 'user',
        entityId: userId,
        oldValue: before
          ? {
              email: before.email,
              role: before.role,
              level: before.level,
            }
          : null,
        ipAddress: req.ip,
        userAgent: req.get('user-agent') ?? undefined,
      });

      res.json({
        message: 'User deleted successfully',
        requestId
      });

    } catch (err: any) {
      if (err.statusCode) {
        throw err;
      }
      res.status(err.statusCode || 500).json({
        error: err.message || 'Failed to delete user',
        requestId
      });
    }
  })
);

/**
 * Admin change user password (admin only)
 */
router.put('/admin/users/:id/password',
  auth.requireLoginToken(),
  auth.requireUserRoles(['admin.system']),
  error.asyncRoute(async (req, res) => {
    const requestId = req.requestMetadata?.requestId || 'unknown';
    const userId = req.params.id;
    const { newPassword } = req.body;

    try {
      await userService.adminChangePassword(userId, newPassword);

      // Log the fact but never the new password. `description` is a
      // human-readable summary for the admin activity feed.
      auditService.logAudit({
        actorId: String(auth.getUser(req as any)?.userId ?? ''),
        actorType: 'admin',
        action: 'user.password.reset',
        entityType: 'user',
        entityId: userId,
        description: 'Admin reset the user password',
        ipAddress: req.ip,
        userAgent: req.get('user-agent') ?? undefined,
      });

      res.json({
        message: 'Password updated successfully',
        requestId
      });

    } catch (err: any) {
      if (err.statusCode) {
        throw err;
      }
      res.status(err.statusCode || 500).json({
        error: err.message || 'Failed to update password',
        requestId
      });
    }
  })
);

/**
 * Test route to verify discovery and functionality
 */
router.get('/test', (_req, res) => {
  res.json({
    message: 'User routes are working!',
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

export default router;