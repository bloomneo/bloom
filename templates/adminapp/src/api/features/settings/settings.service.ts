/**
 * App settings service — read + write the AppSetting key-value table.
 * @file src/api/features/settings/settings.service.ts
 *
 * Two classes of consumer:
 *
 * 1. Unauthenticated marketing site — hits `/api/settings/public`. Only
 *    settings with `isPublic = true` are returned, and they're shaped
 *    into a typed `PublicSettings` object so the client doesn't have to
 *    parse key strings.
 *
 * 2. Admin console — hits `/api/settings/admin/*`. Returns the raw rows
 *    (including non-public ones) and accepts updates. Every update fires
 *    an audit event.
 */

import { databaseClass } from '@bloomneo/appkit/database';
import { auditService } from '../audit/audit.service.js';
import type {
  PublicSettings,
  SettingRow,
  UpdateSettingInput,
} from './settings.types.js';

/**
 * Map a raw string value to its typed shape for `PublicSettings`. Right
 * now only `feature_signup_open` needs parsing (string → boolean); add
 * more parsers here as you add setting keys.
 */
function parsePublicValue(key: string, value: string): unknown {
  if (key === 'feature_signup_open') {
    return value.toLowerCase() === 'true';
  }
  return value;
}

/**
 * Convert the snake_case DB key to the camelCase field in PublicSettings.
 * Centralized so every public-facing read uses the same shape.
 */
const PUBLIC_KEY_MAP: Record<string, keyof PublicSettings> = {
  business_name: 'businessName',
  support_email: 'supportEmail',
  support_phone: 'supportPhone',
  support_whatsapp_url: 'supportWhatsappUrl',
  feature_signup_open: 'featureSignupOpen',
};

export const settingsService = {
  /**
   * Returns every public setting, shaped into `PublicSettings`. Missing
   * keys are simply omitted — callers should treat every field as
   * optional and fall back to hard-coded defaults in the marketing page.
   */
  async getPublicSettings(): Promise<PublicSettings> {
    const db = await databaseClass.get();
    const rows = await db.appSetting.findMany({
      where: { isPublic: true },
    });

    const out: PublicSettings = {};
    for (const row of rows) {
      const mapped = PUBLIC_KEY_MAP[row.key];
      if (!mapped) continue; // unknown public key — skip rather than throw
      (out as Record<string, unknown>)[mapped] = parsePublicValue(
        row.key,
        row.value,
      );
    }
    return out;
  },

  /**
   * Returns every setting row, including `isPublic = false`. Admin only.
   */
  async getAllSettings(): Promise<SettingRow[]> {
    const db = await databaseClass.get();
    const rows = await db.appSetting.findMany({
      orderBy: { key: 'asc' },
    });
    return rows as SettingRow[];
  },

  /**
   * Upsert a single setting by key. If the row doesn't exist it's
   * created with `isPublic = false` — mark it public via the admin UI
   * if it should show up in `/api/settings/public`.
   *
   * Fires an audit event with before/after value. `updatedBy` is stored
   * so the admin audit page can attribute the change.
   */
  async updateSetting(
    key: string,
    input: UpdateSettingInput,
    actor: { userId: string; ipAddress?: string; userAgent?: string },
  ): Promise<SettingRow> {
    const db = await databaseClass.get();

    const previous = await db.appSetting.findUnique({ where: { key } });

    const row = await db.appSetting.upsert({
      where: { key },
      update: {
        value: input.value,
        updatedBy: actor.userId,
      },
      create: {
        key,
        value: input.value,
        isPublic: false,
        updatedBy: actor.userId,
      },
    });

    auditService.logAudit({
      actorId: actor.userId,
      actorType: 'admin',
      action: 'settings.update',
      entityType: 'setting',
      entityId: key,
      oldValue: previous ? { value: previous.value } : null,
      newValue: { value: input.value },
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return row as SettingRow;
  },
};
