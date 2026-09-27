#!/usr/bin/env node
/**
 * tests/scaffold-build.test.mjs
 *
 * The smoke tests scaffold with --skip-install and inspect files. That is how
 * 5.3.2 shipped a server.ts that did not parse: nothing ever compiled what
 * `bloom create` wrote. This file installs each preset for real, typechecks
 * it, and for the web presets builds the API, boots it and probes it.
 *
 * Slow (one npm install per preset), so it only runs when asked:
 *   BLOOM_SMOKE_BUILD=1 npm run test:build
 *   BLOOM_SMOKE_BUILD=1 BLOOM_SMOKE_PRESETS=adminapp npm run test:build
 *
 * Unreleased framework: BLOOM_LOCAL_PACKS=<dir> installs @bloomneo/*
 * tarballs from <dir> (made with `npm pack` in appkit, uikit and bloom)
 * instead of the npm registry, so a template can be tested against
 * framework changes before they are published.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync, spawn } from 'node:child_process';
import { mkdtempSync, existsSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BLOOM_CLI = resolve(__dirname, '..', 'bin', 'bloom.js');

const ENABLED = process.env.BLOOM_SMOKE_BUILD === '1';

// boot: the preset has an API we can start and probe.
const PRESETS = [
  { name: 'basicapp', boot: true },
  { name: 'userapp', boot: true },
  { name: 'adminapp', boot: true },
  { name: 'desktop-basicapp', boot: false },
  { name: 'mobile-basicapp', boot: false },
];

const only = process.env.BLOOM_SMOKE_PRESETS?.split(',').map((s) => s.trim());
const selected = only ? PRESETS.filter((p) => only.includes(p.name)) : PRESETS;

const run = (cmd, cwd, env = {}) =>
  execSync(cmd, {
    cwd,
    stdio: 'pipe',
    env: { ...process.env, ELECTRON_SKIP_BINARY_DOWNLOAD: '1', ...env },
    timeout: 10 * 60 * 1000,
  }).toString();

async function probe(url) {
  const res = await fetch(url);
  return { status: res.status, type: res.headers.get('content-type') ?? '', body: await res.text() };
}

async function waitForHealth(port, ms = 20000) {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    try {
      if ((await probe(`http://127.0.0.1:${port}/health`)).status === 200) return true;
    } catch {
      // not listening yet
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

let port = 3950;

/** Minimal .env reader: KEY=value lines, comments and blanks skipped. */
function readEnv(file) {
  const env = {};
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

function boot(root, myPort, env) {
  const child = spawn('node', ['dist/api/server.js'], {
    cwd: root,
    env: { ...process.env, ...env, PORT: String(myPort) },
    stdio: 'pipe',
  });
  child.output = '';
  child.stdout.on('data', (d) => (child.output += d));
  child.stderr.on('data', (d) => (child.output += d));
  return child;
}

for (const preset of selected) {
  test(`${preset.name}: installs, typechecks${preset.boot ? ', builds and boots' : ''}`, { skip: !ENABLED && 'set BLOOM_SMOKE_BUILD=1', timeout: 15 * 60 * 1000 }, async () => {
    const tmp = mkdtempSync(join(tmpdir(), `bloom-build-${preset.name}-`));
    const project = `build-${preset.name}`;
    const localPacks = process.env.BLOOM_LOCAL_PACKS;
    run(`node "${BLOOM_CLI}" create ${project} ${preset.name}${localPacks ? ' --skip-install' : ''}`, tmp);
    const root = join(tmp, project);
    if (localPacks) {
      // Point @bloomneo/* at local tarballs, then install.
      const packs = readdirSync(localPacks).filter((f) => /^bloomneo-(appkit|uikit|bloom)-.*\.tgz$/.test(f));
      const pkgPath = join(root, 'package.json');
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
      for (const file of packs) {
        const name = `@bloomneo/${file.split('-')[1]}`;
        for (const field of ['dependencies', 'devDependencies']) {
          if (pkg[field]?.[name]) pkg[field][name] = `file:${join(resolve(localPacks), file)}`;
        }
      }
      writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
      run('npm install --no-audit --no-fund', root);
    }

    run('npm run typecheck', root);

    if (!preset.boot) return;

    if (existsSync(join(root, 'prisma', 'schema.prisma'))) {
      run('npx prisma db push --skip-generate', root);
    }
    run('npm run build:api', root);

    const dotenv = readEnv(join(root, '.env'));

    // Development: the template's own .env, as `npm run dev` would see it.
    const devPort = port++;
    const dev = boot(root, devPort, { ...dotenv, NODE_ENV: 'development' });
    try {
      assert.ok(await waitForHealth(devPort), `server did not become healthy:\n${dev.output}`);

      const missing = await probe(`http://127.0.0.1:${devPort}/api/does-not-exist`);
      assert.equal(missing.status, 404, 'unknown /api path is a 404');
      assert.match(missing.type, /application\/json/, 'unknown /api path answers JSON, not the SPA');

      const index = await probe(`http://127.0.0.1:${devPort}/api`);
      assert.equal(index.status, 200, '/api index answers');
    } finally {
      dev.kill();
    }

    // Production: the same .env must be enough to start, and the frontend
    // key must be enforced with the value bloom generated.
    const prodPort = port++;
    const prod = boot(root, prodPort, { ...dotenv, NODE_ENV: 'production' });
    try {
      assert.ok(await waitForHealth(prodPort), `server did not start in production:\n${prod.output}`);
      const bare = await fetch(`http://127.0.0.1:${prodPort}/api/welcome`);
      assert.equal(bare.status, 403, 'production rejects /api/welcome without the frontend key');
      const keyed = await fetch(`http://127.0.0.1:${prodPort}/api/welcome`, {
        headers: { 'X-Frontend-Key': dotenv.BLOOM_FRONTEND_KEY },
      });
      assert.equal(keyed.status, 200, 'production accepts the generated frontend key');
    } finally {
      prod.kill();
    }

    // bloom check: every route file has an auth decision (a guard or
    // isPublic), contracts are counted, and the framework versions agree.
    // --no-db: the RLS check needs Postgres with BLOOM_DB_TENANT=rls.
    let checkOut;
    try {
      checkOut = run(`node "${BLOOM_CLI}" check --no-db --json`, root);
    } catch (err) {
      checkOut = err.stdout?.toString() ?? '';
    }
    const report = JSON.parse(checkOut);
    assert.equal(
      report.ok,
      true,
      `bloom check fails on a fresh ${preset.name}:\n${JSON.stringify(report.findings, null, 2)}`,
    );
    assert.ok(report.summary.contracts > 0, 'the starter declares its welcome routes as contracts');
  });
}
