/**
 * App settings types — typed shapes for the key-value store.
 * @file src/api/features/settings/settings.types.ts
 *
 * The `AppSetting` Prisma model is untyped key-value — value is always a
 * string. That's fine for storage, but the public endpoint wants a typed
 * object (`{ businessName, supportEmail, supportPhone }`) so the
 * marketing site can read it without re-parsing on every request.
 * This file defines that typed shape and the list of keys that surface
 * publicly.
 *
 * TODO: If you add a setting, update:
 *   1. Add the key to KNOWN_SETTING_KEYS below
 *   2. Add a field to PublicSettings if it should be readable without auth
 *   3. Update settings.service.ts::getPublicSettings to map it
 *   4. Consider adding a seed default in prisma/seeding/ so the key exists
 */

/**
 * Every setting key the adminapp template ships with. Add more here as
 * you grow — agents should lean on this list rather than writing free-form
 * strings, because the settings page renders groups based on prefixes
 * (`business_*`, `support_*`, etc.).
 */
export const KNOWN_SETTING_KEYS = [
  'business_name',
  'support_email',
  'support_phone',
  'support_whatsapp_url',
  'feature_signup_open',
] as const;

export type SettingKey = (typeof KNOWN_SETTING_KEYS)[number];

/**
 * One row as stored.
 */
export interface SettingRow {
  key: string;
  value: string;
  isPublic: boolean;
  description: string | null;
  updatedAt: Date;
  updatedBy: string | null;
}

/**
 * Typed public-settings projection returned by `GET /api/settings/public`.
 * Every field is optional because a setting row may not exist yet (first
 * boot, before seed). The marketing page falls back to sane defaults if
 * any field is missing.
 */
export interface PublicSettings {
  businessName?: string;
  supportEmail?: string;
  supportPhone?: string;
  supportWhatsappUrl?: string;
  featureSignupOpen?: boolean;
}

/**
 * Input for `PUT /api/settings/:key` (admin-only).
 */
export interface UpdateSettingInput {
  value: string;
}
