/**
 * App settings routes.
 * @file src/api/features/settings/settings.route.ts
 *
 * Two mount points:
 *   - `GET /api/settings/public`      (unauthenticated) → typed PublicSettings
 *   - `GET /api/settings/admin/list`  (admin only)      → every row
 *   - `PUT /api/settings/admin/:key`  (admin only)      → upsert + audit
 *
 * @llm-rule WHEN: Wiring marketing-site reads or the admin settings editor
 * @llm-rule AVOID: Returning isPublic=false rows from /public — defeats the flag
 */

import express from 'express';
import { errorClass } from '@bloomneo/appkit/error';
import { authClass } from '@bloomneo/appkit/auth';
import { loggerClass } from '@bloomneo/appkit/logger';
import { settingsService } from './settings.service.js';
import type { UpdateSettingInput } from './settings.types.js';

const router = express.Router();
const error = errorClass.get();
const auth = authClass.get();
const logger = loggerClass.get('settings-routes');

/**
 * GET /api/settings/public
 * Unauthenticated. Returns typed PublicSettings (camelCase, parsed types).
 */
router.get(
  '/public',
  error.asyncRoute(async (_req, res) => {
    const settings = await settingsService.getPublicSettings();
    res.json(settings);
  }),
);

/**
 * GET /api/settings/admin/list
 * Admin only. Returns every row (public and non-public).
 */
router.get(
  '/admin/list',
  auth.requireLoginToken(),
  auth.requireUserRoles(['admin.system']),
  error.asyncRoute(async (req, res) => {
    logger.info('GET /api/settings/admin/list', { actor: req.user?.userId });
    const rows = await settingsService.getAllSettings();
    res.json({ items: rows });
  }),
);

/**
 * PUT /api/settings/admin/:key
 * Admin only. Upserts the row + fires an audit event.
 */
router.put(
  '/admin/:key',
  auth.requireLoginToken(),
  auth.requireUserRoles(['admin.system']),
  error.asyncRoute(async (req, res) => {
    const key = req.params.key;
    const body = req.body as Partial<UpdateSettingInput>;
    if (!body?.value || typeof body.value !== 'string') {
      throw error.badRequest('`value` (string) is required');
    }
    if (!req.user?.userId) {
      throw error.unauthorized('login required');
    }

    logger.info('PUT /api/settings/admin/:key', {
      key,
      actor: req.user.userId,
    });

    const row = await settingsService.updateSetting(
      key,
      { value: body.value },
      {
        userId: String(req.user.userId),
        ipAddress: req.ip,
        userAgent: req.get('user-agent') ?? undefined,
      },
    );
    res.json(row);
  }),
);

export default router;
