# Changelog

All notable changes to Bloom Framework will be documented in this file.

## [1.5.2] - 2026-04-11

A patch release that ships the page-router production-reliability fixes that
were **claimed** in @bloomneo/uikit's 1.5.1 CHANGELOG but **never actually
landed in bloom's templates**. Caught by user smoke testing immediately
after the 1.5.1 release. Three bugs across all five scaffolded apps,
fixed in one go.

### What went wrong in 1.5.1

When 1.5.1 of the trio shipped, the page-router fixes (default branded 404,
default error boundary, code splitting per route) were applied to
`@bloomneo/uikit/bin/templates/fbca/.../page-router.tsx.template` —
which is the template scaffolded by `uikit create app --fbca`. That's a
real, live scaffolder, so the fix was correct *for uikit*.

But **bloom has its own copy of page-router** in every template
(`templates/basicapp/`, `templates/userapp/`, `templates/mobile-basicapp/`,
`templates/desktop-basicapp/`, `templates/desktop-userapp/`) — five
separate files, none of which got touched in 1.5.1. So apps scaffolded
via `bloom create my-app <template>` still shipped the broken router.

The bloom CLI and the uikit CLI are two independent scaffolders that
happen to share the same architectural patterns. The fix needed to land
in both.

### Fixed (in all 5 bloom templates)

- **Default branded 404 page.** The 1.5.0 fallback rendered a debug
  message that **leaked the full route map to end users** (a security
  smell on every scaffolded site). Replaced with a theme-aware 404 page
  that shows a "Page not found" headline and a "Back to home" CTA. Uses
  CSS variables so it follows the active theme. Override with
  `<PageRouter notFound={<Custom404 />} />`.
- **Default error boundary around the router.** A single page throwing
  used to white-screen the entire SPA. The router now wraps every route
  in an error boundary that shows a branded "Something went wrong /
  Reload page" element. Override with `errorBoundary={<MyError />}` and
  hook into observability with `onError={(err, info) => sendToSentry(err)}`.
- **Code splitting per route by default.** `import.meta.glob` now uses
  lazy mode + `React.lazy()` + `Suspense` + a default loading fallback.
  Tiny apps that prefer the old eager behavior can opt out with
  `<PageRouter eager />`.
- **Bonus: route generation memoized.** The original code re-ran
  `generateRoutes()` on every render of `<PageRouter>`. Now wrapped in
  `useMemo` so the discovered set is computed once at mount. The
  desktop-basicapp variant already had this memoization; this release
  generalizes it to all 5 templates.
- **Dev console leak fixed.** The "🚀 Auto-discovered routes:" log used
  to print on every render. Now wired to a one-shot `useEffect` so it
  prints exactly once when the route set changes (which in practice is
  also exactly once).

### desktop-userapp template — preserved its custom 404

The `desktop-userapp` template ships its own custom `NotFoundPage` at
`features/main/pages/not-found.tsx` (with an app-specific back-to-home
button). The original page-router excluded that file from auto-discovery
and lazy-imported it as the catch-all. **This pattern is preserved
verbatim** — the canonical fix was applied around it, not on top of it,
so users of `bloom create my-app desktop-userapp` keep their custom 404.

### Verified

- All 5 page-router files contain: `React.lazy` (4×), `Suspense` (4×),
  `ErrorBoundary` references (7×), zero "Available routes" debug-leak
  references, and the `eager = false` opt-in path
- 4 of the 5 page-router files are byte-identical (canonical version)
- 1 file (desktop-userapp) is a deliberate variant that preserves the
  custom NotFoundPage import + glob exclusion

### Migration

- **Existing scaffolded apps** (created with bloom 1.5.1 or earlier)
  need to either re-scaffold or copy the new `page-router.tsx` from this
  template by hand.
- **New scaffolded apps** (`bloom create my-app <template>` from 1.5.2
  onward) get the fix automatically.
- **No API changes** for end users of `<PageRouter>` — every existing
  call site keeps working. The new override props (`notFound`,
  `errorBoundary`, `onError`, `fallback`, `eager`) are all optional.

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
