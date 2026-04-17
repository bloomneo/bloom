#!/usr/bin/env node
/**
 * tests/scaffold-smoke.test.mjs
 *
 * Shell out to `node bin/bloom.js create <name> <template> --skip-install`
 * in a fresh tmp dir for each of the 5 templates and assert the scaffold
 * produces a valid project. Uses the built-in `node:test` runner so no
 * test framework dependency.
 *
 * Run:
 *   npm run test
 *   npm run test:smoke          # just this file
 *   node --test tests/scaffold-smoke.test.mjs
 *
 * What each template's assertion covers:
 *   - package.json exists + parses + has correct name + correct appkit/uikit pins
 *   - AGENTS.md exists + is placeholder-free (bloom's template processing
 *     replaces {{PROJECT_NAME}} at scaffold-time)
 *   - scripts/copy-agent-docs.js exists
 *   - The src/ tree shape matches what the template claims (web / mobile / desktop)
 *
 * --skip-install avoids the ~30–120 s per-template npm install while still
 * exercising every file-copy / template-processing / placeholder path.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { readFileSync, existsSync, mkdtempSync, rmSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BLOOM_CLI = resolve(__dirname, '..', 'bin', 'bloom.js');

/** Spawn bloom create in a fresh tmp dir; return the project root path. */
function scaffold(template, projectName = `smoke-${template}`) {
  const tmp = mkdtempSync(join(tmpdir(), `bloom-smoke-${template}-`));
  execSync(
    `node "${BLOOM_CLI}" create ${projectName} ${template} --skip-install`,
    { cwd: tmp, stdio: 'pipe' },
  );
  return { tmp, projectRoot: join(tmp, projectName) };
}

/** Read + parse JSON (small wrapper). */
function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

/** Common assertions every scaffolded project should pass. */
function assertCommonShape(projectRoot, projectName, { expectAppkit }) {
  assert.ok(existsSync(projectRoot), `project dir exists: ${projectRoot}`);

  // package.json — correct name, correct pins, has postinstall
  const pkg = readJson(join(projectRoot, 'package.json'));
  assert.equal(pkg.name, projectName, 'package.json name matches project');

  if (expectAppkit) {
    assert.match(
      pkg.dependencies?.['@bloomneo/appkit'] ?? '',
      /^\^\d+\.\d+\.\d+$/,
      'appkit pinned to caret range, not "latest"',
    );
  } else {
    assert.ok(
      !pkg.dependencies?.['@bloomneo/appkit'],
      'mobile-only templates should not depend on appkit',
    );
  }

  assert.match(
    pkg.dependencies?.['@bloomneo/uikit'] ?? '',
    /^\^\d+\.\d+\.\d+$/,
    'uikit pinned to caret range, not "latest"',
  );

  assert.match(
    pkg.scripts?.postinstall ?? '',
    /copy-agent-docs/,
    'postinstall runs copy-agent-docs',
  );

  // AGENTS.md exists + placeholder is replaced (bloom's .template
  // processing strips {{PROJECT_NAME}} at scaffold time)
  const agentsPath = join(projectRoot, 'AGENTS.md');
  assert.ok(existsSync(agentsPath), 'AGENTS.md exists');
  const agents = readFileSync(agentsPath, 'utf8');
  assert.ok(
    !agents.includes('{{PROJECT_NAME}}'),
    'AGENTS.md has no unreplaced {{PROJECT_NAME}} placeholder',
  );
  assert.ok(
    agents.includes(projectName),
    'AGENTS.md mentions the actual project name',
  );

  // Postinstall script exists
  assert.ok(
    existsSync(join(projectRoot, 'scripts', 'copy-agent-docs.js')),
    'scripts/copy-agent-docs.js exists',
  );
}

// ─── Per-template tests ───────────────────────────────────────────────────

test('basicapp scaffolds with appkit + uikit + src/web + src/api', () => {
  const { tmp, projectRoot } = scaffold('basicapp');
  try {
    assertCommonShape(projectRoot, 'smoke-basicapp', { expectAppkit: true });
    assert.ok(existsSync(join(projectRoot, 'src', 'web')), 'src/web exists');
    assert.ok(existsSync(join(projectRoot, 'src', 'api')), 'src/api exists');
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('userapp scaffolds with appkit + uikit + Prisma + auth', () => {
  const { tmp, projectRoot } = scaffold('userapp');
  try {
    assertCommonShape(projectRoot, 'smoke-userapp', { expectAppkit: true });
    assert.ok(existsSync(join(projectRoot, 'src', 'web')), 'src/web exists');
    assert.ok(existsSync(join(projectRoot, 'src', 'api')), 'src/api exists');
    // userapp ships a prisma dir
    assert.ok(
      existsSync(join(projectRoot, 'prisma')),
      'prisma/ dir exists for userapp',
    );
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('desktop-basicapp scaffolds with Electron + embedded backend', () => {
  const { tmp, projectRoot } = scaffold('desktop-basicapp');
  try {
    assertCommonShape(projectRoot, 'smoke-desktop-basicapp', { expectAppkit: true });
    assert.ok(
      existsSync(join(projectRoot, 'electron')),
      'electron/ main-process dir exists',
    );
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('desktop-userapp scaffolds with Electron + SQLite + auth', () => {
  const { tmp, projectRoot } = scaffold('desktop-userapp');
  try {
    assertCommonShape(projectRoot, 'smoke-desktop-userapp', { expectAppkit: true });
    assert.ok(
      existsSync(join(projectRoot, 'electron')),
      'electron/ main-process dir exists',
    );
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('mobile-basicapp scaffolds WITHOUT appkit (UI-only)', () => {
  const { tmp, projectRoot } = scaffold('mobile-basicapp');
  try {
    assertCommonShape(projectRoot, 'smoke-mobile-basicapp', { expectAppkit: false });
    assert.ok(
      existsSync(join(projectRoot, 'src', 'mobile')) ||
        existsSync(join(projectRoot, 'src', 'web')),
      'mobile template has src/mobile or src/web',
    );
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

// ─── CLI surface checks ──────────────────────────────────────────────────

test('bloom --help exits 0', () => {
  const result = execSync(`node "${BLOOM_CLI}" --help`, { stdio: 'pipe' });
  assert.match(result.toString(), /Bloom Framework/, 'help shows banner');
});

test('bloom --version prints a semver', () => {
  const out = execSync(`node "${BLOOM_CLI}" --version`, { stdio: 'pipe' })
    .toString()
    .trim();
  assert.match(out, /^\d+\.\d+\.\d+/, 'version is semver');
});

test('bloom with no args exits 1', () => {
  let exitCode = 0;
  try {
    execSync(`node "${BLOOM_CLI}"`, { stdio: 'pipe' });
  } catch (err) {
    exitCode = err.status ?? 0;
  }
  assert.equal(exitCode, 1, 'no-args exits 1');
});

test('bloom with unknown command exits 1', () => {
  let exitCode = 0;
  try {
    execSync(`node "${BLOOM_CLI}" bogus`, { stdio: 'pipe' });
  } catch (err) {
    exitCode = err.status ?? 0;
  }
  assert.equal(exitCode, 1, 'unknown command exits 1');
});

test('bloom create with invalid template exits 1', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'bloom-invalid-'));
  let exitCode = 0;
  try {
    execSync(
      `node "${BLOOM_CLI}" create test nothing-like-this --skip-install`,
      { cwd: tmp, stdio: 'pipe' },
    );
  } catch (err) {
    exitCode = err.status ?? 0;
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  assert.equal(exitCode, 1, 'invalid template exits 1');
});
