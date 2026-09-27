/**
 * `bloom check` — verifies a Bloom app against the rules the framework
 * promises, and says exactly what to fix.
 *
 * Each finding has a code, a location, the rule and the fix, so a person or
 * an agent can act on it without reading the checker. Errors fail the run;
 * warnings fail it only with --strict.
 *
 * v0 checks:
 *   routes    every API route file has an auth guard or declares isPublic
 *   contracts how many routes are declared as contracts (coverage report)
 *   rls       with BLOOM_DB_TENANT=rls, every table with the tenant column
 *             has row-level security enabled, forced, and a policy
 *   versions  @bloomneo/appkit, uikit and bloom are on one version
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createRequire } from 'node:module';

export type Severity = 'error' | 'warning' | 'info';

export interface Finding {
  code: string;
  severity: Severity;
  /** File (relative to the app) or database object the finding is about. */
  where: string;
  rule: string;
  fix: string;
}

export interface CheckReport {
  ok: boolean;
  strict: boolean;
  findings: Finding[];
  summary: {
    routeFiles: number;
    guardedRouteFiles: number;
    contracts: number;
    tenantTables: number | null;
    versions: Record<string, string | null>;
  };
}

export interface CheckOptions {
  /** The app root. Default: process.cwd(). */
  root?: string;
  /** Warnings fail the run too. */
  strict?: boolean;
  /** Skip the database check even when BLOOM_DB_TENANT=rls. */
  skipDb?: boolean;
}

function walk(dir: string, match: (file: string) => boolean, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, match, out);
    else if (match(full)) out.push(full);
  }
  return out;
}

/*
 * A guard is any appkit auth middleware call. The template's api-router
 * looked only for `auth.require…(`, so apps with their own wrappers
 * (bloomneo-cloud's requireLoginOrApiToken) got a false warning per route on
 * every boot — noise that trains everyone to ignore the real one.
 */
const GUARD = /\b(?:auth\s*\.\s*)?require(?:LoginToken|UserRoles|ApiToken|Roles|LoginOrApiToken|Tier|Scope)\s*\(/;
const PUBLIC = /export\s+const\s+isPublic\s*=\s*true/;
const ROUTER_CALL = /\b(?:router|app)\s*\.\s*(?:get|post|put|patch|delete)\s*\(/;

export function checkRoutes(root: string): { findings: Finding[]; routeFiles: number; guarded: number; contracts: number } {
  const findings: Finding[] = [];
  const featureRoot = join(root, 'src', 'api', 'features');
  const routeFiles = walk(featureRoot, (f) => /\.route\.[jt]s$/.test(f));
  const contractFiles = walk(join(root, 'src'), (f) => /\.contract\.[jt]s$/.test(f));
  let guarded = 0;

  for (const file of routeFiles) {
    const src = readFileSync(file, 'utf8');
    if (!ROUTER_CALL.test(src)) continue;
    if (GUARD.test(src) || PUBLIC.test(src)) {
      guarded++;
      continue;
    }
    findings.push({
      code: 'ROUTE_NO_AUTH_DECISION',
      severity: 'error',
      where: relative(root, file),
      rule: 'Every API route has an auth decision.',
      fix: 'Guard it with auth.requireLoginToken() (+ requireUserRoles), or add `export const isPublic = true` if it is public on purpose. Better: declare it with defineRoute({ ..., auth }).',
    });
  }

  let contracts = 0;
  for (const file of contractFiles) {
    contracts += (readFileSync(file, 'utf8').match(/\bdefineRoute\s*\(/g) ?? []).length;
  }
  if (routeFiles.length && contracts === 0) {
    findings.push({
      code: 'CONTRACTS_NONE',
      severity: 'info',
      where: 'src/',
      rule: 'Routes are declared as contracts (6.0).',
      fix: 'Adopt contracts one feature at a time: features/<name>/<name>.contract.ts with defineRoute().',
    });
  }
  return { findings, routeFiles: routeFiles.length, guarded, contracts };
}

export function checkVersions(root: string): { findings: Finding[]; versions: Record<string, string | null> } {
  const versions: Record<string, string | null> = {};
  for (const name of ['appkit', 'uikit', 'bloom']) {
    const pkg = join(root, 'node_modules', '@bloomneo', name, 'package.json');
    versions[name] = existsSync(pkg) ? JSON.parse(readFileSync(pkg, 'utf8')).version : null;
  }
  const present = Object.entries(versions).filter(([, v]) => v) as Array<[string, string]>;
  const lines = new Set(present.map(([, v]) => v.split('.').slice(0, 2).join('.')));
  const findings: Finding[] = [];
  // Lockstep starts at 6.0: before that the three had independent versions
  // (appkit 5.x with uikit 4.x was the supported pairing).
  const lockstep = present.some(([, v]) => Number(v.split('.')[0]) >= 6);
  if (lockstep && lines.size > 1) {
    findings.push({
      code: 'VERSIONS_OUT_OF_STEP',
      severity: 'warning',
      where: 'package.json',
      rule: 'appkit, uikit and bloom are released together; use one version of each.',
      fix: `Installed: ${present.map(([n, v]) => `${n} ${v}`).join(', ')}. Align them to the same version.`,
    });
  }
  return { findings, versions };
}

/** Load the app's own Prisma client, so bloom needs no database driver. */
function loadAppPrisma(root: string): any | null {
  try {
    const req = createRequire(join(root, 'package.json'));
    const explicit = process.env.BLOOM_PRISMA_CLIENT;
    const mod = explicit ? req(explicit.startsWith('.') ? join(root, explicit) : explicit) : req('@prisma/client');
    return mod.PrismaClient ?? null;
  } catch {
    return null;
  }
}

export async function checkRls(root: string): Promise<{ findings: Finding[]; tenantTables: number | null }> {
  const findings: Finding[] = [];
  if (process.env.BLOOM_DB_TENANT !== 'rls') return { findings, tenantTables: null };
  const url = process.env.DATABASE_URL;
  const column = process.env.BLOOM_DB_TENANT_COLUMN || 'tenant_id';
  const PrismaClient = loadAppPrisma(root);
  if (!url || !PrismaClient) {
    findings.push({
      code: 'RLS_NOT_CHECKED',
      severity: 'warning',
      where: 'DATABASE_URL',
      rule: 'Row-level security coverage is verified against the database.',
      fix: !url ? 'Set DATABASE_URL (a disposable or staging database is fine).' : 'Run `npx prisma generate` so the app has a Prisma client.',
    });
    return { findings, tenantTables: null };
  }
  const db = new PrismaClient({ datasources: { db: { url } } });
  try {
    const rows: Array<{ table: string; rls: boolean; forced: boolean; policies: number }> = await db.$queryRaw`
      SELECT c.relname AS "table",
             c.relrowsecurity AS "rls",
             c.relforcerowsecurity AS "forced",
             (SELECT count(*)::int FROM pg_policies p WHERE p.schemaname = n.nspname AND p.tablename = c.relname) AS "policies"
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      JOIN information_schema.columns col
        ON col.table_schema = n.nspname AND col.table_name = c.relname AND col.column_name = ${column}
      WHERE c.relkind = 'r' AND n.nspname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY c.relname`;
    for (const row of rows) {
      const missing = [!row.rls && 'enabled', !row.forced && 'forced', row.policies === 0 && 'a policy'].filter(Boolean);
      if (!missing.length) continue;
      findings.push({
        code: 'RLS_TABLE_UNPROTECTED',
        severity: 'error',
        where: `table ${row.table}`,
        rule: `Every table with a ${column} column has row-level security enabled, forced, and a policy.`,
        fix: `Missing: ${missing.join(', ')}. Apply database.rlsPolicyStatements({ table: '${row.table}' }) in a migration.`,
      });
    }
    return { findings, tenantTables: rows.length };
  } finally {
    await db.$disconnect();
  }
}

export async function runCheck(options: CheckOptions = {}): Promise<CheckReport> {
  const root = options.root ?? process.cwd();
  const strict = options.strict ?? false;
  const routes = checkRoutes(root);
  const versions = checkVersions(root);
  const rls = options.skipDb ? { findings: [], tenantTables: null } : await checkRls(root);
  const findings = [...routes.findings, ...rls.findings, ...versions.findings];
  const failing = findings.filter((f) => f.severity === 'error' || (strict && f.severity === 'warning'));
  return {
    ok: failing.length === 0,
    strict,
    findings,
    summary: {
      routeFiles: routes.routeFiles,
      guardedRouteFiles: routes.guarded,
      contracts: routes.contracts,
      tenantTables: rls.tenantTables,
      versions: versions.versions,
    },
  };
}

export function formatReport(report: CheckReport): string {
  const lines: string[] = [];
  const icon = { error: '✗', warning: '!', info: '·' } as const;
  for (const f of report.findings) {
    lines.push(`${icon[f.severity]} ${f.code}  ${f.where}`);
    lines.push(`    rule: ${f.rule}`);
    lines.push(`    fix:  ${f.fix}`);
  }
  const s = report.summary;
  lines.push('');
  lines.push(
    `routes: ${s.guardedRouteFiles}/${s.routeFiles} route files guarded · contracts: ${s.contracts}` +
      ` · rls tables: ${s.tenantTables ?? 'not checked'}` +
      ` · versions: ${Object.entries(s.versions).map(([k, v]) => `${k} ${v ?? '—'}`).join(', ')}`,
  );
  lines.push(report.ok ? 'bloom check: passed' : `bloom check: failed${report.strict ? ' (strict)' : ''}`);
  return lines.join('\n');
}
