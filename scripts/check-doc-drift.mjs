#!/usr/bin/env node
/**
 * scripts/check-doc-drift.mjs
 *
 * Fails if any stale scope reference, unpinned ecosystem dep, or
 * hallucinated template name appears in docs, templates, or the CLI
 * itself.
 *
 * Run: npm run check:docs
 * CI:  .github/workflows/ci.yml runs this on every PR.
 *
 * Extending: when a rename lands, add the OLD name here so no future
 * contributor can reintroduce it. Each entry is a regex + the
 * correct replacement for the error message.
 *
 * Skip rules:
 *   - Lines containing `→` / `->` — migration arrows (left side is
 *     supposed to mention the banned name)
 *   - Lines immediately after `❌` — negative-example teaching pairs
 *   - Lines starting with `-` when the next starts with `+` — diff
 *     blocks in migration docs
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const BANNED = [
  // Old scope — bloom was previously `@voilajsx/helix`. No aliases kept.
  { pattern: /@voilajsx\/helix/, now: '@bloomneo/bloom' },

  // Cross-package old scopes — should not appear as CURRENT in any
  // bloom-owned text (historical mentions in CHANGELOG.md are OK because
  // CHANGELOG.md is not scanned).
  { pattern: /@voilajsx\/uikit/, now: '@bloomneo/uikit' },
  { pattern: /@voilajsx\/appkit/, now: '@bloomneo/appkit' },

  // Template version drift — any template package.json that pins
  // appkit or uikit to "latest" (instead of a caret range) is a drift.
  // Agents reading this file need predictable versions.
  { pattern: /"@bloomneo\/uikit":\s*"latest"/, now: '"@bloomneo/uikit": "^1.5.1"' },
  { pattern: /"@bloomneo\/appkit":\s*"latest"/, now: '"@bloomneo/appkit": "^1.5.1"' },

  // Hallucinated template names — the valid set is exactly these 6 presets.
  // Catches typos and aspirational template names in docs.
  {
    pattern: /bloom\s+create\s+\S+\s+(webapp|fullstack|fullapp|admin|blog|shop|ecommerce|saas|portal)\b/,
    now: 'one of: basicapp, userapp, adminapp, desktop-basicapp, desktop-userapp, mobile-basicapp',
  },

  // Bloom is a CLI, not a library. Anyone documenting
  // `import { X } from '@bloomneo/bloom'` is confused.
  {
    pattern: /import\s+[^;]*from\s+['"]@bloomneo\/bloom['"]/,
    now: 'Bloom is a CLI. Use `bloom create <name>` in a terminal, not an import.',
  },

  // appkit 2.0.0 renames — pre-2.0 names are gone, no alias kept. Templates
  // must teach the modern names so scaffolded apps work against the appkit
  // version pinned on npm latest (^2.0.0 as of bloom 2.0.0).
  { pattern: /\bauth\.user\s*\(/,       now: 'auth.getUser(req)' },
  { pattern: /\bauth\.can\s*\(/,        now: 'auth.hasPermission(user, permission)' },
  { pattern: /\bsecurity\.csrf\s*\(/,   now: 'security.forms()' },
  { pattern: /handleErrors\s*\(\s*\{[^}]*\bincludeStack\b/, now: 'handleErrors({ showStack, logErrors })' },

  // Hallucinated appkit names — these NEVER existed in any published
  // appkit. Pre-2.0 docs sometimes referenced them.
  { pattern: /\bauth\.requireLogin\s*\(/,  now: 'auth.requireLoginToken()' },
  { pattern: /\bauth\.requireRole\s*\(/,   now: 'auth.requireUserRoles([...])' },

  // VOILA_ env var prefix — the @voilajsx scope renamed to @bloomneo in
  // 1.5. Every env var the ecosystem reads is BLOOM_*. VOILA_AUTH_SECRET
  // in a scaffolded .env is dead config — appkit won't find it and auth
  // breaks at runtime. Caught this bug post-4.0.0 publish.
  { pattern: /\bVOILA_[A-Z_]+/,            now: 'BLOOM_<NAME> (appkit + uikit read BLOOM_* env vars)' },
  // `{{VOILA_...}}` placeholders — same issue, template-processing side.
  { pattern: /\{\{VOILA_[A-Z_]+\}\}/,      now: '{{BLOOM_<NAME>}}' },

  // uikit 2.0 breaking rename — Combobox unified with Select et al.
  { pattern: /<Combobox[^>]*\bonChange\b/, now: '<Combobox onValueChange={setValue} ...>' },
  { pattern: /<Select[^>]*\bonChange\b/,   now: '<Select onValueChange={setValue} ...>' },

  // uikit pre-2.0 / hallucinated surfaces — these never made it into
  // uikit 2.0.1's public API. If a doc or template mentions them, it's
  // inherited stale content from the @voilajsx/uikit era.
  { pattern: /\bValidatedInput\b/, now: 'Input wrapped in FormField (see uikit 2.0.1 llms.txt)' },

  // Deep imports are non-canonical per uikit AGENTS.md "Never deep-import
  // as primary." The flat `from '@bloomneo/uikit'` is the teaching
  // default. Allow /styles and /fouc — those are legitimate side-effect
  // imports for CSS + the FOUC helper.
  {
    pattern: /from\s+['"]@bloomneo\/uikit\/(?!styles|fouc)/,
    now: "from '@bloomneo/uikit' (flat imports are canonical)",
  },
];

const SCAN = ['README.md', 'AGENTS.md', 'llms.txt'];

// ─── Version-string alignment ───────────────────────────────────────────
// AGENTS.md + llms.txt should reference the CURRENT bloom version in
// their headers / prose, not a stale one from a previous release. Run
// this as a side-check before the pattern scan so drift between docs and
// package.json can't slip through.
const pkgVersion = JSON.parse(
  readFileSync(join(ROOT, 'package.json'), 'utf8'),
).version;

const versionChecks = [
  {
    file: 'AGENTS.md',
    rx: /using `bloom` \(v([\d.]+(?:-[0-9A-Za-z]+(?:\.[0-9A-Za-z]+)*)?)\)/,
    label: 'AGENTS.md header bloom version',
  },
  {
    file: 'llms.txt',
    rx: /^# @bloomneo\/bloom v([\d.]+(?:-[0-9A-Za-z]+(?:\.[0-9A-Za-z]+)*)?)/m,
    label: 'llms.txt H1 bloom version',
  },
];

let versionViolations = 0;
for (const { file, rx, label } of versionChecks) {
  try {
    const content = readFileSync(join(ROOT, file), 'utf8');
    const m = content.match(rx);
    if (m && m[1] !== pkgVersion) {
      console.error(
        `  ${file}\n    ${label}: ${m[1]}\n    → should match package.json version: ${pkgVersion}\n`,
      );
      versionViolations++;
    }
  } catch {
    // File missing — pattern scan below will surface it separately
  }
}

// Templates — every .template + AGENTS.md + package.json template deep-inside
function addDir(rel, extRx) {
  const abs = join(ROOT, rel);
  let entries;
  try { entries = readdirSync(abs); } catch { return; }
  for (const f of entries) {
    if (f === 'node_modules') continue;
    const full = join(rel, f);
    const fullAbs = join(ROOT, full);
    if (statSync(fullAbs).isDirectory()) {
      addDir(full, extRx);
    } else if (extRx.test(f)) {
      SCAN.push(full);
    }
  }
}
addDir('templates', /\.(template|md|json|mjs|js)$/);
addDir('bin', /\.(js|mjs|md)$/);

let violations = 0;
for (const file of SCAN) {
  const content = readFileSync(join(ROOT, file), 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    // Strip inline code spans.
    let clean = line.replace(/`[^`]*`/g, '');

    // Migration-arrow lines — only scan right-hand side.
    const arrow = clean.match(/^(.*?)(?:→|->)(.*)$/);
    if (arrow) clean = arrow[2];

    // Negative-example teaching pairs.
    const prev = lines[i - 1] ?? '';
    if (prev.includes('❌')) return;

    // Diff-block removals.
    const next = lines[i + 1] ?? '';
    if (/^-\s/.test(line) && /^\+\s/.test(next)) return;

    for (const { pattern, now } of BANNED) {
      if (pattern.test(clean)) {
        console.error(
          `  ${file}:${i + 1}\n    ${line.trim()}\n    → use: ${now}\n`,
        );
        violations++;
      }
    }
  });
}

if (versionViolations > 0 || violations > 0) {
  const total = versionViolations + violations;
  console.error(
    `FAIL: ${total} issue(s) — ${versionViolations} version-string drift, ` +
      `${violations} stale/hallucinated reference(s).\n`,
  );
  process.exit(1);
}
console.log(
  `OK: scanned ${SCAN.length} files + version strings against package.json@${pkgVersion}, no drift.`,
);
