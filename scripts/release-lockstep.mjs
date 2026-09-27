#!/usr/bin/env node
/**
 * scripts/release-lockstep.mjs
 *
 * appkit, uikit and bloom release together on one version. This script is the
 * only way a release should happen, so the three can never drift apart again
 * (5.x shipped bloom templates pinning uikit ^4.1.6 while bloom's own docs
 * named three different pins).
 *
 *   node scripts/release-lockstep.mjs <version>             # dry run (default)
 *   node scripts/release-lockstep.mjs <version> --publish   # really publish
 *
 * Steps, per repo, in dependency order (appkit → uikit → bloom):
 *   1. refuse unless every working tree is clean and on the same branch;
 *   2. write <version> into package.json and every version string the
 *      drift checks verify, plus bloom's template pins;
 *   3. build (where there is a build) and run the full test suite;
 *   4. `npm publish` — with `--dry-run` unless --publish is passed — using
 *      the `next` dist-tag for a pre-release and `latest` otherwise;
 *   5. with --publish: commit "release: <version>" and tag v<version>;
 *      without it: restore the working trees.
 *
 * It never pushes. Push main/next and the tags yourself after checking.
 *
 * Sibling repos are found next to this one (../appkit, ../uikit), or under
 * BLOOMNEO_ROOT if set.
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.BLOOMNEO_ROOT ? resolve(process.env.BLOOMNEO_ROOT) : resolve(here, '..', '..');

const version = process.argv[2];
const publish = process.argv.includes('--publish');

if (!version || !/^\d+\.\d+\.\d+(-[0-9A-Za-z]+(\.[0-9A-Za-z]+)*)?$/.test(version)) {
  console.error('Usage: node scripts/release-lockstep.mjs <x.y.z[-pre.n]> [--publish]');
  process.exit(1);
}
const prerelease = version.includes('-');
const distTag = prerelease ? 'next' : 'latest';

/*
 * Every version string a drift check verifies, per repo. [file, regex whose
 * first group is the version]. Keep in step with scripts/check-doc-drift.*.
 */
const V = '(\\d+\\.\\d+\\.\\d+(?:-[0-9A-Za-z]+(?:\\.[0-9A-Za-z]+)*)?)';
const REPOS = [
  {
    name: 'appkit',
    build: 'npm run build',
    strings: [
      ['llms.txt', new RegExp(`^# @bloomneo\\/appkit v${V}`, 'm')],
      ['AGENTS.md', new RegExp(`\\*\\*Current release: ${V}\\.\\*\\*`)],
      ['README.md', new RegExp(`\\*\\*Current release: ${V}\\.\\*\\*`)],
      ['README.md', new RegExp(`"@bloomneo/appkit": "\\^${V}"`)],
    ],
  },
  {
    name: 'uikit',
    build: 'npm run build', // also regenerates llms.txt from package.json
    strings: [
      ['AGENTS.md', new RegExp(`\`@bloomneo\\/uikit\` v${V}`)],
      ['skills/bloomneo-uikit/SKILL.md', new RegExp(`^version: ${V}`, 'm')],
      ['skills/bloomneo-uikit/SKILL.md', new RegExp(`# @bloomneo\\/uikit \\(v${V}\\)`)],
    ],
  },
  {
    name: 'bloom',
    build: 'npm run build', // route contracts (src/ → dist/)
    strings: [
      ['AGENTS.md', new RegExp(`using \`bloom\` \\(v${V}\\)`)],
      ['llms.txt', new RegExp(`^# @bloomneo\\/bloom v${V}`, 'm')],
      ['llms.txt', new RegExp(`Current release: \\*\\*${V}\\*\\*`)],
      // Scaffolded apps pin the framework version they were made with.
      ['templates/app/package.json.template', new RegExp(`"@bloomneo/uikit": "\\^${V}"`)],
      ['templates/app/package.json.template', new RegExp(`"@bloomneo/appkit": "\\^${V}"`)],
      ['templates/app/package.json.template', new RegExp(`"@bloomneo/bloom": "\\^${V}"`)],
    ],
  },
];

const sh = (cmd, cwd, quiet = false) =>
  execSync(cmd, { cwd, stdio: quiet ? 'pipe' : 'inherit', env: process.env })?.toString() ?? '';

function step(msg) {
  console.log(`\n── ${msg}`);
}

// 1. Preconditions ---------------------------------------------------------
step(`${publish ? 'RELEASE' : 'DRY RUN'} ${version} (dist-tag: ${distTag}) from ${ROOT}`);
let branch = null;
for (const repo of REPOS) {
  const dir = join(ROOT, repo.name);
  if (!existsSync(join(dir, 'package.json'))) throw new Error(`${repo.name}: not found at ${dir}`);
  const dirty = sh('git status --porcelain', dir, true).trim();
  if (dirty) throw new Error(`${repo.name}: working tree is not clean:\n${dirty}`);
  const b = sh('git branch --show-current', dir, true).trim();
  if (branch && b !== branch) throw new Error(`${repo.name} is on "${b}", others on "${branch}"`);
  branch = b;
}
console.log(`all three clean, on branch "${branch}"`);

// 2. Write the version ----------------------------------------------------
for (const repo of REPOS) {
  const dir = join(ROOT, repo.name);
  const pkgPath = join(dir, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  pkg.version = version;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

  for (const [file, rx] of repo.strings) {
    const path = join(dir, file);
    const text = readFileSync(path, 'utf8');
    const m = text.match(rx);
    if (!m) throw new Error(`${repo.name}/${file}: version string not found (${rx})`);
    writeFileSync(path, text.replace(m[0], m[0].replace(m[1], version)));
  }
  console.log(`${repo.name}: version strings → ${version}`);
}

// 3–4. Build, test, publish ------------------------------------------------
for (const repo of REPOS) {
  const dir = join(ROOT, repo.name);
  step(`${repo.name}: build and test`);
  if (repo.build) sh(repo.build, dir);
  sh('npm test', dir);

  step(`${repo.name}: npm publish ${publish ? '' : '--dry-run '}--tag ${distTag}`);
  // prepublishOnly already ran what we just ran; skip the repeat.
  sh(`npm publish ${publish ? '' : '--dry-run '}--tag ${distTag} --ignore-scripts`, dir);
}

// 5. Commit and tag --------------------------------------------------------
if (!publish) {
  // The trees were clean when we started, so restoring them loses nothing.
  for (const repo of REPOS) sh('git checkout -- .', join(ROOT, repo.name), true);
  step('dry run finished — every step passed; version strings restored, nothing committed');
  process.exit(0);
}
for (const repo of REPOS) {
  const dir = join(ROOT, repo.name);
  sh(`git commit -qam "release: ${version}"`, dir);
  sh(`git tag v${version}`, dir);
  console.log(`${repo.name}: committed and tagged v${version}`);
}
// Apps' CI runs `uses: bloomneo/bloom@v<major>` (action.yml); a stable
// release moves that tag. Pre-releases never do.
const major = `v${version.split('.')[0]}`;
if (distTag === 'latest') {
  sh(`git tag -f ${major}`, join(ROOT, 'bloom'));
  console.log(`bloom: moved ${major} to v${version} (push it with: git push -f origin ${major})`);
}
step(`published ${version}. Push "${branch}" and the v${version} tags in each repo when ready.`);
