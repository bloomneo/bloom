/**
 * Settings Route - App configuration API endpoints
 * @file src/desktop/main/features/settings/settings.route.ts
 */

import express from 'express';
import { errorClass } from '@bloomneo/appkit/error';
import { authClass } from '@bloomneo/appkit/auth';
import { settingsService } from './settings.service.js';

const router = express.Router();
const error = errorClass.get();
const auth = authClass.get();

/**
 * GET /api/settings
 * Get all settings (public - some settings needed before auth)
 */
router.get('/', error.asyncRoute(async (req, res) => {
  const requestId = (req as any).requestMetadata?.requestId || 'unknown';

  try {
    const settings = settingsService.getAllSettings();

    // Filter out sensitive settings for non-authenticated users
    const authenticatedUser = auth.user(req as any);
    if (!authenticatedUser) {
      // Public settings only
      const publicSettings = {
        'app.name': settings['app.name'],
        'app.theme': settings['app.theme'],
        'auth.registration_enabled': settings['auth.registration_enabled']
      };

      return res.json({
        success: true,
        settings: publicSettings,
        requestId
      });
    }

    // Authenticated users get all settings
    res.json({
      success: true,
      settings,
      requestId
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to get settings',
      requestId
    });
  }
}));

/**
 * GET /api/settings/:category
 * Get settings by category (admin only for sensitive categories)
 */
router.get('/:category',
  auth.requireLoginToken(),
  error.asyncRoute(async (req, res) => {
    const requestId = (req as any).requestMetadata?.requestId || 'unknown';
    const { category } = req.params;

    try {
      const settings = settingsService.getByCategory(category);

      res.json({
        success: true,
        category,
        settings,
        requestId
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to get settings',
        requestId
      });
    }
  })
);

/**
 * PUT /api/settings
 * Update settings (admin only)
 */
router.put('/',
  auth.requireLoginToken(),
  auth.requireUserRoles(['admin.tenant', 'admin.org', 'admin.system']),
  error.asyncRoute(async (req, res) => {
    const requestId = (req as any).requestMetadata?.requestId || 'unknown';
    const { settings } = req.body;

    try {
      const authenticatedUser = auth.user(req as any);

      if (!settings || typeof settings !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'Settings object is required',
          requestId
        });
      }

      settingsService.bulkUpdate(settings, authenticatedUser?.userId as number);

      res.json({
        success: true,
        message: 'Settings updated successfully',
        requestId
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to update settings',
        requestId
      });
    }
  })
);

/**
 * PUT /api/settings/:key
 * Update single setting (admin only)
 */
router.put('/:key',
  auth.requireLoginToken(),
  auth.requireUserRoles(['admin.tenant', 'admin.org', 'admin.system']),
  error.asyncRoute(async (req, res) => {
    const requestId = (req as any).requestMetadata?.requestId || 'unknown';
    const { key } = req.params;
    const { value } = req.body;

    try {
      const authenticatedUser = auth.user(req as any);

      if (value === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Value is required',
          requestId
        });
      }

      settingsService.updateSetting(key, value, authenticatedUser?.userId as number);

      res.json({
        success: true,
        message: `Setting '${key}' updated successfully`,
        requestId
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to update setting',
        requestId
      });
    }
  })
);

export default router;
