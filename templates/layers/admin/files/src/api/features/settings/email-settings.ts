/**
 * Email provider settings edited in the admin console.
 *
 * Stored in app_settings under `email.*` keys (hidden from the general
 * settings list), with the API key and SMTP password encrypted using
 * BLOOM_SECURITY_ENCRYPTION_KEY, and applied immediately with
 * emailClass.reset(config) — no .env rewriting, so it works on read-only
 * hosts and takes effect without a restart. Saved settings are re-applied at
 * boot (applySavedEmailSettings, called from settings.route.ts).
 *
 * With nothing saved, appkit's email module reads the environment as usual.
 */
import { databaseClass } from '@bloomneo/appkit/database';
import { emailClass } from '@bloomneo/appkit/email';
import { securityClass } from '@bloomneo/appkit/security';
import { loggerClass } from '@bloomneo/appkit/logger';

const logger = loggerClass.get('email-settings');

/** The fields the admin form edits (names kept from the env vars they replace). */
export const EMAIL_KEYS = [
  'BLOOM_EMAIL_STRATEGY',
  'BLOOM_EMAIL_FROM_NAME',
  'BLOOM_EMAIL_FROM_EMAIL',
  'RESEND_API_KEY',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
] as const;
export type EmailKey = (typeof EMAIL_KEYS)[number];
export const EMAIL_SECRET_KEYS = new Set<string>(['RESEND_API_KEY', 'SMTP_PASS']);

/** Rows live under this prefix; settingsService.getAllSettings() skips them. */
export const EMAIL_PREFIX = 'email.';

function encryptionReady(): boolean {
  return /^[0-9a-f]{64}$/i.test(process.env.BLOOM_SECURITY_ENCRYPTION_KEY ?? '');
}

/** Saved values (secrets decrypted), falling back to the environment per field. */
export async function loadEmailSettings(): Promise<Record<EmailKey, string>> {
  const db = await databaseClass.get();
  const rows: Array<{ key: string; value: string }> = await db.appSetting.findMany({
    where: { key: { startsWith: EMAIL_PREFIX } },
  });
  const saved = new Map(rows.map((r) => [r.key.slice(EMAIL_PREFIX.length), r.value]));
  const security = securityClass.get();
  const out = {} as Record<EmailKey, string>;
  for (const key of EMAIL_KEYS) {
    let value = saved.get(key);
    if (value && EMAIL_SECRET_KEYS.has(key)) {
      try {
        value = security.decrypt(value);
      } catch {
        logger.warn(`Stored ${key} could not be decrypted (encryption key changed?) — re-enter it.`);
        value = '';
      }
    }
    out[key] = value ?? process.env[key] ?? '';
  }
  return out;
}

/** Save the given fields and apply the result. Secrets need an encryption key. */
export async function saveEmailSettings(updates: Partial<Record<EmailKey, string>>, actorId: string): Promise<void> {
  const secrets = Object.keys(updates).filter((k) => EMAIL_SECRET_KEYS.has(k) && updates[k as EmailKey]);
  if (secrets.length && !encryptionReady()) {
    throw Object.assign(
      new Error(
        'Set BLOOM_SECURITY_ENCRYPTION_KEY (64 hex characters) before storing email credentials — ' +
          'they are encrypted at rest.',
      ),
      { statusCode: 400, type: 'ENCRYPTION_KEY_MISSING' },
    );
  }
  const db = await databaseClass.get();
  const security = securityClass.get();
  for (const [key, raw] of Object.entries(updates)) {
    const value = EMAIL_SECRET_KEYS.has(key) && raw ? security.encrypt(raw) : (raw ?? '');
    await db.appSetting.upsert({
      where: { key: EMAIL_PREFIX + key },
      create: { key: EMAIL_PREFIX + key, value, isPublic: false, updatedBy: actorId },
      update: { value, updatedBy: actorId },
    });
  }
  await applyEmailSettings(await loadEmailSettings());
}

/** Rebuild appkit's email client from these values (or from the environment when unset). */
export async function applyEmailSettings(values: Record<EmailKey, string>): Promise<void> {
  const strategy = values.BLOOM_EMAIL_STRATEGY as 'resend' | 'smtp' | 'console' | '';
  if (!strategy) {
    await emailClass.reset();
    return;
  }
  const from = { name: values.BLOOM_EMAIL_FROM_NAME || 'App', email: values.BLOOM_EMAIL_FROM_EMAIL || 'noreply@example.com' };
  if (strategy === 'smtp') {
    const port = Number(values.SMTP_PORT || 587);
    await emailClass.reset({
      strategy,
      from,
      smtp: {
        host: values.SMTP_HOST,
        port,
        secure: port === 465,
        auth: { user: values.SMTP_USER, pass: values.SMTP_PASS },
        timeout: 30000,
        pool: false,
      },
    } as any);
  } else if (strategy === 'resend') {
    await emailClass.reset({
      strategy,
      from,
      resend: { apiKey: values.RESEND_API_KEY, baseURL: 'https://api.resend.com', timeout: 30000 },
    } as any);
  } else {
    await emailClass.reset({ strategy: 'console', from } as any);
  }
  logger.info(`email provider set to ${strategy} from saved settings`);
}

/** At boot: apply saved settings if any. Never blocks startup. */
export async function applySavedEmailSettings(): Promise<void> {
  try {
    const db = await databaseClass.get();
    const count = await db.appSetting.count({ where: { key: { startsWith: EMAIL_PREFIX } } });
    if (count > 0) await applyEmailSettings(await loadEmailSettings());
  } catch (err) {
    logger.warn(`Saved email settings were not applied: ${(err as Error).message}`);
  }
}
