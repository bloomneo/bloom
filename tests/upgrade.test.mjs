/**
 * tests/upgrade.test.mjs — `bloom upgrade` on a throwaway Bloom 5 app.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { planUpgrade, applyUpgrade } from '../dist/upgrade/index.js';

const BLOOM = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'bin', 'bloom.js');

const server5 = `import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createApiRouter } from './lib/api-router.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use('/api', await createApiRouter());
`;

function app5(extra = {}) {
  const root = mkdtempSync(join(tmpdir(), 'bloom-upgrade-'));
  const files = {
    'package.json': JSON.stringify({
      name: 'x',
      type: 'module',
      dependencies: { '@bloomneo/appkit': '^4.0.0', '@bloomneo/uikit': '^2.1.5', express: '^4.21.0' },
      devDependencies: { typescript: '^5.5.4' },
    }, null, 2) + '\n',
    'tsconfig.json': '{}',
    'src/api/server.ts': server5,
    'src/api/lib/api-router.ts': '// the app copy',
    'src/web/lib/page-router.tsx': '// the app copy',
    'src/api/features/notes/notes.route.ts':
      "router.get('/', auth.requireLoginToken() as any, (req, res) => res.json((req as any).user.userId));\n" +
      "if (auth.hasPermission(user, 'x')) {}\n",
    'src/web/pages/home.tsx': "import { PageLayout, Button } from '@bloomneo/uikit';\nconst detectPlatform = () => 'web';\n",
    '.env.example': 'BLOOM_QUEUE_TRANSPORT=redis\n',
    ...extra,
  };
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), content);
  }
  return root;
}

const codes = (plan) => [...new Set(plan.manual.map((m) => m.code))].sort();

test('plans the mechanical edits and lists the rest with fixes', () => {
  const root = app5();
  const plan = planUpgrade(root, '6.0.0');
  assert.deepEqual(plan.edits.map((e) => e.file), ['package.json', 'src/api/server.ts', '.github/workflows/bloom-check.yml']);

  const pkg = JSON.parse(plan.edits[0].after);
  assert.equal(pkg.dependencies['@bloomneo/appkit'], '6.0.0');
  assert.equal(pkg.dependencies['@bloomneo/uikit'], '6.0.0');
  assert.equal(pkg.dependencies['@bloomneo/bloom'], '6.0.0');
  assert.equal(pkg.dependencies.zod, '^3.24.0');
  assert.ok(pkg.devDependencies.tsx && pkg.devDependencies['@types/express']);

  const server = plan.edits[1].after;
  assert.match(server, /import \{ createApiRouter \} from '@bloomneo\/appkit\/server';/);
  assert.match(server, /createApiRouter\(\{ featuresDir: path\.join\(__dirname, 'features'\) \}\)/);
  assert.doesNotMatch(server, /lib\/api-router/);

  assert.deepEqual(codes(plan), [
    'REMOVED_ENV',
    'REMOVED_PERMISSIONS',
    'REMOVED_UIKIT_EXPORT',
    'UPGRADE_FROM_APPKIT_4',
    'UPGRADE_FROM_UIKIT_2',
    'UPGRADE_MIDDLEWARE_CAST',
    'UPGRADE_OLD_API_ROUTER',
    'UPGRADE_PAGE_ROUTER',
    'UPGRADE_REQ_ANY',
  ]);
  // Imports are matched by name from uikit only: Button stays, a local detectPlatform is not flagged.
  const uikit = plan.manual.filter((m) => m.code === 'REMOVED_UIKIT_EXPORT');
  assert.equal(uikit.length, 1);
  assert.match(uikit[0].fix, /^PageLayout /);
});

test('a server without __dirname gets a fileURLToPath featuresDir', () => {
  const root = app5({
    'src/api/server.ts': "import express from 'express';\nimport { createApiRouter } from './lib/api-router.js';\nconst app = express();\napp.use('/api', await createApiRouter());\n",
  });
  const server = planUpgrade(root, '6.0.0').edits.find((e) => e.file === 'src/api/server.ts').after;
  assert.match(server, /^import \{ fileURLToPath \} from 'node:url';\nimport \{ createApiRouter \} from '@bloomneo\/appkit\/server';/m);
  assert.match(server, /featuresDir: fileURLToPath\(new URL\('\.\/features', import\.meta\.url\)\)/);
});

test('applying is idempotent: a second plan has no edits', () => {
  const root = app5();
  applyUpgrade(root, planUpgrade(root, '6.0.0'));
  assert.ok(existsSync(join(root, '.github/workflows/bloom-check.yml')));
  assert.deepEqual(planUpgrade(root, '6.0.0').edits, []);
});

test('CLI: dry run writes nothing; --write needs a clean git tree', () => {
  const root = app5();
  const before = readFileSync(join(root, 'src/api/server.ts'), 'utf8');
  const dry = spawnSync(process.execPath, [BLOOM, 'upgrade', '--to', '6.0.0'], { cwd: root, encoding: 'utf8' });
  assert.equal(dry.status, 0);
  assert.match(dry.stdout, /dry run/);
  assert.equal(readFileSync(join(root, 'src/api/server.ts'), 'utf8'), before);

  const noGit = spawnSync(process.execPath, [BLOOM, 'upgrade', '--to', '6.0.0', '--write'], { cwd: root, encoding: 'utf8' });
  assert.equal(noGit.status, 1);
  assert.match(noGit.stderr, /Not a git repository/);

  const git = (...args) => execFileSync('git', args, { cwd: root, stdio: 'pipe' });
  git('init', '-q');
  git('add', '-A');
  git('-c', 'user.email=t@x.test', '-c', 'user.name=t', 'commit', '-qm', 'base');
  writeFileSync(join(root, 'scratch.txt'), 'dirty');
  const dirty = spawnSync(process.execPath, [BLOOM, 'upgrade', '--to', '6.0.0', '--write'], { cwd: root, encoding: 'utf8' });
  assert.equal(dirty.status, 1);
  assert.match(dirty.stderr, /Uncommitted changes/);

  git('add', '-A');
  git('-c', 'user.email=t@x.test', '-c', 'user.name=t', 'commit', '-qm', 'scratch');
  const ok = spawnSync(process.execPath, [BLOOM, 'upgrade', '--to', '6.0.0', '--write', '--json'], { cwd: root, encoding: 'utf8' });
  assert.equal(ok.status, 0, ok.stderr);
  const report = JSON.parse(ok.stdout);
  assert.equal(report.written, true);
  assert.equal(report.edits.length, 3);
  assert.match(readFileSync(join(root, 'src/api/server.ts'), 'utf8'), /@bloomneo\/appkit\/server/);
});
