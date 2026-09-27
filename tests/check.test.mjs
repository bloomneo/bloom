/**
 * tests/check.test.mjs — `bloom check` against a throwaway app on disk.
 * The database (row-level security) check needs an app with a Prisma client
 * and is exercised against real apps; this covers routes, versions, output
 * and exit codes.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, symlinkSync } from 'node:fs';
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

test('a declared contract that no route() serves is an error', async () => {
  const root = app({
    'src/contracts/plans.contract.ts': `export const listPlans = defineRoute({});\nexport const getPlan = defineRoute({});`,
    'src/api/features/plans/plans.route.ts': `export default await contractRouter([route(listPlans, h)]);`,
  });
  const report = await runCheck({ root });
  const unserved = report.findings.filter((f) => f.code === 'CONTRACT_NOT_SERVED');
  assert.equal(unserved.length, 1);
  assert.match(unserved[0].fix, /route\(getPlan, handler\)/);
});

// Needs the sibling appkit checkout (verifyClass). Skipped where it isn't there.
const APPKIT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', 'appkit');
const haveAppkit = existsSync(join(APPKIT, 'dist', 'verify', 'index.js'));

test('--probe with no appkit installed says the probe did not run', async () => {
  const { probeTenants } = await import('../dist/check/index.js');
  const findings = await probeTenants(app({}), { baseUrl: 'http://127.0.0.1:1', identities: [] });
  assert.deepEqual(findings.map((f) => f.code), ['PROBE_NOT_RUN']);
});

test('--probe reports cross-tenant reads from a running app', { skip: !haveAppkit && 'no sibling appkit build' }, async () => {
  const { createServer } = await import('node:http');
  const rows = { 'a@x.test': '11111111-1111-4111-8111-111111111111', 'b@x.test': '22222222-2222-4222-8222-222222222222' };
  // A deliberately leaky app: every tenant can read every row.
  const server = createServer((req, res) => {
    const token = (req.headers.authorization ?? '').replace('Bearer ', '');
    const send = (status, body) => {
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(body === undefined ? '' : JSON.stringify(body));
    };
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      if (req.method === 'POST' && req.url === '/api/auth/login') return send(200, { token: JSON.parse(raw).email });
      if (!token) return send(401, { error: 'no token' });
      if (req.method === 'GET' && req.url === '/api/notes') return send(200, [{ id: rows[token] }]);
      return send(200, { ok: true });
    });
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  try {
    const root = app({});
    mkdirSync(join(root, 'node_modules', '@bloomneo'), { recursive: true });
    symlinkSync(APPKIT, join(root, 'node_modules', '@bloomneo', 'appkit'), 'dir');
    const { probeTenants } = await import('../dist/check/index.js');
    const findings = await probeTenants(root, {
      baseUrl: `http://127.0.0.1:${server.address().port}`,
      identities: [
        { label: 'firm-a', email: 'a@x.test', password: 'p' },
        { label: 'firm-b', email: 'b@x.test', password: 'p' },
      ],
      paths: ['/api/notes'],
    });
    assert.ok(findings.some((f) => f.code === 'TENANT_CROSS_TENANT_READ' && f.severity === 'error'), JSON.stringify(findings));
  } finally {
    server.closeAllConnections?.();
    server.close();
  }
});

test('tenantChildren follows foreign keys from tenant tables, through grandchildren, minus exemptions', async () => {
  const { tenantChildren } = await import('../dist/check/index.js');
  const edges = [
    { child: 'deployments', parent: 'deploy_targets', fk: 'deployTargetId' },
    { child: 'deploy_logs', parent: 'deployments', fk: 'deploymentId' },
    { child: 'deploy_targets', parent: 'customers', fk: 'customerId' }, // tenant → tenant: not a child
    { child: 'customers', parent: 'service_plans', fk: 'planId' },     // tenant points at a shared table
    { child: 'audit_logs', parent: 'users', fk: 'userId' },
    { child: 'users', parent: 'users', fk: 'invitedBy' },               // self-reference
  ];
  const found = tenantChildren(['customers', 'deploy_targets', 'users'], edges, ['audit_logs']);
  assert.deepEqual([...found.keys()].sort(), ['deploy_logs', 'deployments']);
  assert.deepEqual(found.get('deployments'), { parent: 'deploy_targets', fk: 'deployTargetId', parentIsTenant: true });
  assert.deepEqual(found.get('deploy_logs'), { parent: 'deployments', fk: 'deploymentId', parentIsTenant: false });
});
