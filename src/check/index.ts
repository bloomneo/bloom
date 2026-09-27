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
 *   served    every exported contract is served by a route() in src/api
 *   manifest  bloom.manifest.json and the generated AGENTS.md section are
 *             up to date (when the app has a manifest)
 *   probe     (--probe) cross-tenant attack run against the running app,
 *             via appkit's verifyClass
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { manifestFiles, ManifestError, MANIFEST_FILE } from '../manifest/index.js';

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
  /** Run the cross-tenant probe against a running local server. */
  probe?: ProbeOptions;
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
  const declared: Array<{ name: string; file: string }> = [];
  for (const file of contractFiles) {
    const src = readFileSync(file, 'utf8');
    contracts += (src.match(/\bdefineRoute\s*\(/g) ?? []).length;
    for (const m of src.matchAll(/export\s+const\s+([A-Za-z_$][\w$]*)\s*=\s*defineRoute\s*\(/g)) {
      declared.push({ name: m[1], file });
    }
  }
  // A contract nothing serves is a client call that will 404 — the one
  // mismatch the type system can't see, because the server side is wired
  // at runtime.
  const apiSources = walk(join(root, 'src', 'api'), (f) => /\.[jt]s$/.test(f) && !/\.d\.ts$/.test(f))
    .map((f) => readFileSync(f, 'utf8'))
    .join('\n');
  for (const { name, file } of declared) {
    if (!new RegExp(`\\broute\\s*\\(\\s*(?:[\\w$]+\\.)?${name}\\b`).test(apiSources)) {
      findings.push({
        code: 'CONTRACT_NOT_SERVED',
        severity: 'error',
        where: relative(root, file),
        rule: 'Every declared contract is served by the API.',
        fix: `Serve it: route(${name}, handler) in a feature's contractRouter([...]) — or delete the contract.`,
      });
    }
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

/**
 * Tables that reach a tenant table through foreign keys (children,
 * grandchildren, …) and so hold tenant data without a tenant column of their
 * own. Each maps to the edge that reaches it: its parent and its foreign key.
 */
export function tenantChildren(
  tenantTables: Iterable<string>,
  edges: Array<{ child: string; parent: string; fk: string }>,
  exempt: Iterable<string> = [],
): Map<string, { parent: string; fk: string; parentIsTenant: boolean }> {
  const tenant = new Set(tenantTables);
  const skip = new Set(exempt);
  const found = new Map<string, { parent: string; fk: string; parentIsTenant: boolean }>();
  let grew = true;
  while (grew) {
    grew = false;
    for (const e of edges) {
      if (e.child === e.parent || tenant.has(e.child) || skip.has(e.child) || found.has(e.child)) continue;
      if (tenant.has(e.parent) || found.has(e.parent)) {
        found.set(e.child, { parent: e.parent, fk: e.fk, parentIsTenant: tenant.has(e.parent) });
        grew = true;
      }
    }
  }
  return found;
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
    // Children of tenant tables hold tenant data too, reached through a
    // foreign key instead of a column. A child left without a policy is a
    // cross-tenant read that the column check above can't see.
    const edges: Array<{ child: string; parent: string; fk: string }> = await db.$queryRaw`
      SELECT child.relname AS "child", parent.relname AS "parent", a.attname AS "fk"
      FROM pg_constraint k
      JOIN pg_class child ON child.oid = k.conrelid
      JOIN pg_class parent ON parent.oid = k.confrelid
      JOIN pg_namespace n ON n.oid = child.relnamespace
      JOIN pg_attribute a ON a.attrelid = k.conrelid AND a.attnum = k.conkey[1]
      WHERE k.contype = 'f' AND n.nspname NOT IN ('pg_catalog', 'information_schema')`;
    const status: Array<{ table: string; rls: boolean; forced: boolean; policies: number }> = await db.$queryRaw`
      SELECT c.relname AS "table", c.relrowsecurity AS "rls", c.relforcerowsecurity AS "forced",
             (SELECT count(*)::int FROM pg_policies p WHERE p.schemaname = n.nspname AND p.tablename = c.relname) AS "policies"
      FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relkind = 'r' AND n.nspname NOT IN ('pg_catalog', 'information_schema')`;
    const exempt = (process.env.BLOOM_DB_RLS_EXEMPT ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    // The tenant table itself (cloud's `customers`: its tenant is its own id)
    // has no tenant column and is nobody's child — name it to have it checked.
    const roots = (process.env.BLOOM_DB_TENANT_ROOT ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    const byName = new Map(status.map((s) => [s.table, s]));
    for (const root of roots) {
      const s = byName.get(root);
      if (!s) {
        findings.push({
          code: 'RLS_TABLE_UNPROTECTED',
          severity: 'error',
          where: `table ${root}`,
          rule: 'BLOOM_DB_TENANT_ROOT names a table that exists.',
          fix: `No table "${root}" — fix BLOOM_DB_TENANT_ROOT.`,
        });
        continue;
      }
      const missing = [!s.rls && 'enabled', !s.forced && 'forced', !s.policies && 'a policy'].filter(Boolean);
      if (missing.length) {
        findings.push({
          code: 'RLS_TABLE_UNPROTECTED',
          severity: 'error',
          where: `table ${root}`,
          rule: 'The tenant table itself has row-level security: each tenant sees only its own row.',
          fix: `Missing: ${missing.join(', ')}. Apply database.rlsPolicyStatements({ table: '${root}', column: 'id' }) in a migration.`,
        });
      }
    }
    const children = tenantChildren([...rows.map((r) => r.table), ...roots], edges, exempt);
    for (const [table, via] of [...children].sort(([a], [b]) => a.localeCompare(b))) {
      const s = byName.get(table);
      const missing = [!s?.rls && 'enabled', !s?.forced && 'forced', !s?.policies && 'a policy'].filter(Boolean);
      if (!missing.length) continue;
      const viaArg = `{ parent: '${via.parent}', foreignKey: '${via.fk}'${via.parentIsTenant ? '' : ', column: false'} }`;
      findings.push({
        code: 'RLS_CHILD_UNPROTECTED',
        severity: 'error',
        where: `table ${table}`,
        rule: `Tables that reach a ${column} table through a foreign key hold tenant data and need row-level security too.`,
        fix:
          `Missing: ${missing.join(', ')}. Scope it through ${via.parent}: database.rlsPolicyStatements({ table: '${table}', via: ${viaArg} }) ` +
          `in a migration. If it is shared on purpose, add it to BLOOM_DB_RLS_EXEMPT.`,
      });
    }

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

export interface ProbeOptions {
  /** Base URL of the app, running locally. */
  baseUrl: string;
  /** At least two same-role users in different tenants: [{ label, email, password }]. */
  identities: Array<{ label: string; email: string; password: string; crossTenant?: boolean }>;
  loginPath?: string;
  /** Paths to probe. Default: the endpoints the app's GET /api index lists. */
  paths?: string[];
  /** Sent with every request, e.g. the app's X-Frontend-Key. */
  headers?: Record<string, string>;
  /** Feature names never to probe (endpoints that can't answer in a test environment). */
  exclude?: string[];
  allowDestructive?: boolean;
}

/**
 * Log in as each identity against the running app and replay every id one
 * tenant can see as every other tenant — appkit's verifyClass, loaded from
 * the app's own node_modules. Probes local servers only.
 */
export async function probeTenants(root: string, options: ProbeOptions): Promise<Finding[]> {
  let verifyClass: any;
  try {
    const req = createRequire(join(root, 'package.json'));
    const path = req.resolve('@bloomneo/appkit/verify');
    verifyClass = (await import(pathToFileURL(path).href)).verifyClass;
  } catch {
    return [{
      code: 'PROBE_NOT_RUN',
      severity: 'warning',
      where: 'node_modules/@bloomneo/appkit',
      rule: 'The tenant probe uses appkit\'s verifyClass.',
      fix: 'Install @bloomneo/appkit in the app.',
    }];
  }
  const report = await verifyClass.get().run({
    baseUrl: options.baseUrl,
    identities: options.identities,
    loginPath: options.loginPath,
    paths: options.paths,
    headers: options.headers,
    exclude: options.exclude,
    allowDestructive: options.allowDestructive ?? false,
  });
  const findings: Finding[] = report.findings.map((f: any) => ({
    code: `TENANT_${String(f.kind).toUpperCase().replace(/-/g, '_')}`,
    severity: 'error' as const,
    where: `${f.method} ${f.path}`,
    rule: 'One tenant can never read or change another tenant\'s data.',
    fix: `${f.detail} Scope the route: contract tenant: true / database.context(), or BLOOM_DB_TENANT=rls with policies.`,
  }));
  if (!report.ok && findings.length === 0) {
    findings.push({
      code: 'PROBE_INCONCLUSIVE',
      severity: 'error',
      where: options.baseUrl,
      rule: 'A probe that could not run is not a pass.',
      fix: `Skipped: ${report.skipped.join('; ') || 'no checks ran'}.`,
    });
  }
  return findings;
}

/**
 * Generated files match the code. Only for apps that have a manifest — an
 * app opts in by running `bloom manifest` once.
 */
export function checkManifest(root: string): Finding[] {
  if (!existsSync(join(root, MANIFEST_FILE))) return [];
  try {
    return manifestFiles(root).stale.map((file) => ({
      code: 'MANIFEST_STALE',
      severity: 'error' as const,
      where: file,
      rule: 'Generated files describe the code as it is.',
      fix: 'Run `npx bloom manifest` and commit the result.',
    }));
  } catch (err) {
    if (!(err instanceof ManifestError)) throw err;
    return [{ code: 'MANIFEST_NOT_BUILT', severity: 'warning', where: MANIFEST_FILE, rule: err.message, fix: err.fix }];
  }
}

export async function runCheck(options: CheckOptions = {}): Promise<CheckReport> {
  const root = options.root ?? process.cwd();
  const strict = options.strict ?? false;
  const routes = checkRoutes(root);
  const versions = checkVersions(root);
  const manifest = checkManifest(root);
  const rls = options.skipDb ? { findings: [], tenantTables: null } : await checkRls(root);
  const probe = options.probe ? await probeTenants(root, options.probe) : [];
  const findings = [...routes.findings, ...rls.findings, ...versions.findings, ...manifest, ...probe];
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
