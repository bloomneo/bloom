/**
 * tests/check.test.mjs — `bloom check` against a throwaway app on disk.
 * The database (row-level security) check needs an app with a Prisma client
 * and is exercised against real apps; this covers routes, versions, output
 * and exit codes.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { runCheck } from '../dist/check/index.js';

const BLOOM = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'bin', 'bloom.js');

function app(files) {
  const root = mkdtempSync(join(tmpdir(), 'bloom-check-'));
  writeFileSync(join(root, 'package.json'), '{"name":"x","type":"module"}');
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), content);
  }
  return root;
}

const guarded = `router.get('/', auth.requireLoginToken(), auth.requireUserRoles(['admin.tenant']), h);`;
const customGuard = `router.use(requireLoginOrApiToken()); router.get('/', h);`;
const publicRoute = `export const isPublic = true;\nrouter.post('/login', h);`;
const open = `router.get('/', h);`;

test('flags a route file with no auth decision, and only that one', async () => {
  const root = app({
    'src/api/features/users/users.route.ts': guarded,
    'src/api/features/servers/servers.route.ts': customGuard,
    'src/api/features/auth/auth.route.ts': publicRoute,
    'src/api/features/reports/reports.route.ts': open,
  });
  const report = await runCheck({ root });
  const errors = report.findings.filter((f) => f.severity === 'error');
  assert.equal(errors.length, 1);
  assert.equal(errors[0].code, 'ROUTE_NO_AUTH_DECISION');
  assert.equal(errors[0].where, 'src/api/features/reports/reports.route.ts');
  assert.match(errors[0].fix, /isPublic = true|defineRoute/);
  assert.equal(report.summary.guardedRouteFiles, 3);
  assert.equal(report.ok, false);
});

test('counts contracts and reports none as info, not failure', async () => {
  const none = await runCheck({ root: app({ 'src/api/features/a/a.route.ts': guarded }) });
  assert.equal(none.ok, true);
  assert.ok(none.findings.some((f) => f.code === 'CONTRACTS_NONE' && f.severity === 'info'));

  const some = await runCheck({
    root: app({
      'src/api/features/a/a.route.ts': guarded,
      'src/api/features/a/a.contract.ts': `export const x = defineRoute({}); export const y = defineRoute({});`,
    }),
  });
  assert.equal(some.summary.contracts, 2);
  assert.ok(!some.findings.some((f) => f.code === 'CONTRACTS_NONE'));
});

test('versions out of step warn, and fail only under --strict', async () => {
  const root = app({
    'src/api/features/a/a.route.ts': guarded,
    'node_modules/@bloomneo/appkit/package.json': '{"version":"6.0.0"}',
    'node_modules/@bloomneo/uikit/package.json': '{"version":"4.1.8"}',
  });
  const loose = await runCheck({ root });
  // Pre-6 pairings were never lockstep and are not flagged.
  const legacy = app({
    'src/api/features/a/a.route.ts': guarded,
    'node_modules/@bloomneo/appkit/package.json': '{"version":"5.1.4"}',
    'node_modules/@bloomneo/uikit/package.json': '{"version":"4.1.8"}',
  });
  assert.ok(!(await runCheck({ root: legacy })).findings.some((f) => f.code === 'VERSIONS_OUT_OF_STEP'));
  assert.ok(loose.findings.some((f) => f.code === 'VERSIONS_OUT_OF_STEP' && f.severity === 'warning'));
  assert.equal(loose.ok, true);
  assert.equal((await runCheck({ root, strict: true })).ok, false);
});

test('CLI: exit code follows the result; --json is machine-readable', () => {
  const bad = app({ 'src/api/features/r/r.route.ts': open });
  assert.throws(() => execFileSync('node', [BLOOM, 'check', '--no-db'], { cwd: bad, stdio: 'pipe' }), (e) => e.status === 1);

  const good = app({ 'src/api/features/r/r.route.ts': guarded });
  const out = execFileSync('node', [BLOOM, 'check', '--json', '--no-db'], { cwd: good, stdio: 'pipe' }).toString();
  const report = JSON.parse(out);
  assert.equal(report.ok, true);
  assert.equal(report.summary.routeFiles, 1);
});
