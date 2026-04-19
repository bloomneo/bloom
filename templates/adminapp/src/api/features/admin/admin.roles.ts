/**
 * Parse the `ADMIN_USER_ROLES` env var into a typed allow-list.
 * @file src/api/features/admin/admin.roles.ts
 *
 * Format (from .env):
 *   ADMIN_USER_ROLES="admin:system,moderator:manage,viewer:basic"
 *
 * This defines which `role:level` pairs a User row is allowed to have.
 * The admin user-CRUD page reads this at render time to populate the
 * role dropdown; the auth middleware reads it at login time to reject
 * tokens claiming unknown roles.
 *
 * Keeping the allow-list in the env (rather than the DB) has two wins:
 *   1. Rebooting the server is the single source of truth — no "did I
 *      update the seed?" confusion when promoting a user.
 *   2. Per-deploy role tiers (a staging env with extra test roles)
 *      are trivial.
 *
 * @llm-rule WHEN: Validating a role:level combo or populating a role picker
 * @llm-rule AVOID: Hardcoding role strings in route handlers — read from here
 */

import { loggerClass } from '@bloomneo/appkit/logger';

const logger = loggerClass.get('admin-roles');

export interface RolePair {
  role: string;
  level: string;
}

/**
 * Safe default — used when ADMIN_USER_ROLES is unset or malformed. Keeps
 * the server bootable even if the operator forgets to set the var. The
 * three tiers map to: full admin / content moderator / read-only viewer.
 */
const DEFAULT_PAIRS: RolePair[] = [
  { role: 'admin', level: 'system' },
  { role: 'moderator', level: 'manage' },
  { role: 'viewer', level: 'basic' },
];

/**
 * Parse once at module load; cache the result. Env var changes require a
 * server restart (standard 12-factor behaviour — env is static per run).
 */
const PAIRS: RolePair[] = (() => {
  const raw = process.env.ADMIN_USER_ROLES;
  if (!raw || raw.trim() === '') {
    return DEFAULT_PAIRS;
  }

  const out: RolePair[] = [];
  const seen = new Set<string>();

  for (const rawPair of raw.split(',')) {
    const pair = rawPair.trim();
    if (!pair) continue;
    const [role, level] = pair.split(':').map((s) => s?.trim());
    if (!role || !level) {
      logger.warn('ADMIN_USER_ROLES entry skipped — expected "role:level"', {
        entry: pair,
      });
      continue;
    }
    const key = `${role}:${level}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ role, level });
  }

  if (out.length === 0) {
    logger.warn('ADMIN_USER_ROLES parsed to zero pairs — falling back to defaults');
    return DEFAULT_PAIRS;
  }
  return out;
})();

/**
 * Every allowed role:level pair, in declaration order (so the first
 * entry can be treated as the "highest" role if callers care).
 */
export function getAllowedRoles(): RolePair[] {
  return PAIRS;
}

/**
 * True if the given role+level is in the allow-list. Use at login time
 * and at every CRUD write to prevent drift.
 */
export function isAllowedRole(role: string, level: string): boolean {
  return PAIRS.some((p) => p.role === role && p.level === level);
}
