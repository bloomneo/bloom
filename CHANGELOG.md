# Changelog

All notable changes to Bloom Framework will be documented in this file.

## [1.5.1] - 2026-04-11

A focused follow-up to 1.5.0. Three things: migrate every scaffolded
template to canonical flat imports (so generated code matches the AI-agent
guidance in `llms.txt`), pin scaffold-time dependency versions for
predictability, and bump peerDeps to track the new uikit/appkit 1.5.1
trio releases.

### Changed

- **Templates now use canonical flat imports.** Every scaffolded template
  used deep imports like `import { Button } from '@bloomneo/uikit/button'`
  even though the canonical pattern documented in `llms.txt` is the flat
  form `import { Button } from '@bloomneo/uikit'`. Migrated **187 deep
  imports across 60 template files**, merging multi-line imports per file
  into single statements. Scaffolded code now matches the pattern AI
  coding agents will generate. CSS side-effect imports
  (`import '@bloomneo/uikit/styles'`) are unchanged because they target
  the CSS bundle, not a JS module.
- **Template `package.json` deps pinned to `^1.5.1`.** All five templates
  previously used `"@bloomneo/uikit": "latest"` (and one used
  `"^1.3.0"`). `latest` is dangerous in templates — a future incompatible
  major release would break every newly-scaffolded app overnight. Pinned
  to `^1.5.1` for predictability while still picking up patch and minor
  updates within the 1.x line.
- **peerDependencies bumped:**
  - `@bloomneo/uikit`: `^1.5.0` → `^1.5.1`
  - `@bloomneo/appkit`: `^1.2.9` → `^1.5.1`
  This tracks the matched bloomneo trio (`uikit@1.5.1`, `appkit@1.5.1`,
  `bloom@1.5.1`).

### Why this matters for AI coding agents

`@bloomneo/uikit@1.5.1` ships an `llms.txt` file documenting that the
*single canonical import path* is the flat `from '@bloomneo/uikit'`. When
agents read scaffolded source files, they pattern-match the imports they
see and reproduce that style. Before this release, scaffolded source said
"use deep imports" while `llms.txt` said "use flat imports" — agents got
two contradicting signals from the same package. After 1.5.1, both signals
agree.

### Verification

- `grep -r "from '@bloomneo/uikit/" templates/`: 0 matches
- Spot-checked 5 template files across different sub-templates
  (basicapp, userapp, desktop-basicapp, desktop-userapp, mobile-basicapp)
  — all imports collapsed cleanly into single statements
- `node bin/bloom.js`: CLI still loads, prints clean usage block
- `npm pack --dry-run`: tarball name updated to `bloomneo-bloom-1.5.1.tgz`

### Known follow-ups (not blocking)

- The mobile-basicapp template still references an external imgbb logo URL
  (`i.ibb.co/.../helix.png`). When convenient, upload a bloom-branded logo
  and update the two URLs in
  `templates/mobile-basicapp/src/mobile/features/main/pages/index.tsx`
  and `templates/mobile-basicapp/src/mobile/shared/components/Header.tsx`.
- The `docs/` subproject is still untracked and unchanged. Will be
  rebranded in a separate pass.

## [1.5.0] - 2026-04-11

Rebrand from Helix Framework to Bloom Framework. Republish under
`@bloomneo/bloom` (was `@voilajsx/helix`). The CLI command renamed from
`helix create` to `bloom create`. The `@voilajsx` npm account was lost;
this release migrates the entire framework to the new namespace. API
surface, FBCA conventions, template names, and CLI flags are unchanged.
See README scope-change section for migration steps.
