# Changelog

All notable changes to Bloom Framework will be documented in this file.

## [4.2.0] - 2026-04-20

`adminapp` polish release — consolidates a week of iteration into a
template that boots to a working admin console with zero hand-edits.
Tightens the role model to three tiers, wires the marketing /contact
page to live settings, adds ship-blocker guards (signup gate, last-
admin protection), and does a performance + documentation sweep on
the admin feature.

### Added — `adminapp`

- **`settings.seed.js`** — first-boot seed for `AppSetting` rows so
  `/contact` renders real values immediately. Idempotent — rows
  already present are left alone. Wired into `npm run db:seed`.
- **`.env.example.template`** — checked-in env reference grouped by
  concern (DB / Auth / Server / Email / Vite / Seeding / Admin).
- **Single-save settings UI** — Contact card and grouped AppSetting
  cards now batch edits behind one "Save changes" + "Reset" pair
  per card. Dirty-detection disables the buttons when nothing changed.
- **`ContactCard` component** — form toggle, recipient (hidden unless
  enabled), and the support details shown on `/contact`. Replaces the
  previous split across Business / Feature-flags / Other cards.
- **Live `/contact` page** — fetches `/api/settings/public` on mount
  and renders saved support details with fallback defaults. Includes
  a form that posts to `/api/contact-message` when the admin has
  flipped `contact_form_enabled=true`; recipient lookup happens
  server-side, never sent to the client.
- **`docs/admin-patterns.md`** — canonical reference doc (layout
  routes, admin-api helper, PageLoading, audit, role gating, settings,
  adding a feature, common traps, perf notes, file-header convention).
  Every admin source file points here via `@see`.

### Changed — simplified role model (three tiers)

The adminapp now ships three role.level pairs instead of nine:

- `admin.system` — full admin
- `moderator.manage` — user support
- `user.basic` — end user

Previously we shipped `user.{basic,pro,max}`, `moderator.{review,approve,
manage}`, `admin.{tenant,org,system}` — rarely differentiated in
practice. The simpler model reduces dropdowns, server-side gate
variants, and seed noise; extend if your app earns it.

Files touched:

- `admin.roles.ts` default and parsing
- `user.route.ts` role gates (now `['admin.system']` for admin,
  `['moderator.manage','admin.system']` for moderator read)
- `user.types.ts` `RoleLevel` union
- `user.seed.js` — three accounts (`admin@`, `moderator@`, `user@`)
- Web: `AdminLayoutRoute` allow-list, `USER_ROLES` helper, user admin
  create/edit/show/index pages (one-level-per-role dropdowns)
- `bloom.js` generated `.env`: `ADMIN_USER_ROLES="admin:system,moderator:manage,user:basic"`

### Fixed — `adminapp`

- **`/register` respects `feature_signup_open`** — client renders a
  "Signups currently closed" panel when the admin has disabled new
  accounts; server's `POST /api/auth/register` returns 403
  `SIGNUPS_CLOSED` regardless of what the client sends. Defense in
  depth.
- **Last-admin protection** — `userService.updateUser` /
  `deleteUser` now count active `admin.system` users and refuse any
  mutation that would leave zero admins. Lock-out-by-demotion no
  longer possible via the admin UI.
- **Public-setting self-heal** — `settings.service.updateSetting`
  creates new known-public rows with `isPublic=true`, and promotes
  existing private rows on next edit. Previously the first save of
  `support_hours` created a private row that never surfaced on
  `/contact`.
- **Missing `ContactCard` component** — settings page referenced it
  but the definition was never written; typecheck passed, render
  crashed on first open.
- **Template `AGENTS.md.template`** — docs table was missing
  `uikit-agents.md` and `admin-patterns.md` rows; agents couldn't
  find the uikit rules or this release's patterns doc.

### Performance — `adminapp`

Targeted memoization on the admin feature:

- Dashboard chart widgets (`SignupsAreaChart`, `RolesDonut`,
  `ActivityTable`, `StatCard`, `StatUsers`, `StatSignups`,
  `StatActivity`) wrapped in `React.memo`; `stats` object and
  `peakLabel` derived via `useMemo` once per summary.
- Audit page: `load` memoized via `useCallback`; `AuditDetail` drawer
  memoized so filter typing doesn't re-render its JSON pretty-print.
- Settings page: `saveValue` + `saveWithToast` stabilized via
  `useCallback` so child cards don't see a fresh handler every keystroke.
- `AdminLayoutRoute`: `navigation` array memoized — stops the sidebar
  from re-processing nav items on every route change.

### Documentation — `adminapp`

Per-file `@see` links + `@llm-rule` hints added to the eight
highest-leverage admin files (dashboard, audit, settings, layout
route, admin-api, PageLoading, audit service, settings service).
Future agents reading these files get pointed at `docs/admin-patterns.md`
and the online docs without having to re-derive patterns from code.

### Cross-template

- `userapp/user.route.ts` — replace `isNaN(userId)` with
  `typeof userId === 'string'` (cuids never pass isNaN; every admin
  lookup was 400'ing). Same fix as adminapp.
- `userapp/main.tsx` — `ToastProvider` now mounts with
  `position="top-right"` and `richColors` to match adminapp defaults.
- All templates: `@bloomneo/uikit` pin bumped from `^2.1.2` to `^2.1.3`.

## [4.1.0] - 2026-04-19

Adds the `adminapp` template, adopts CUID as the default User primary
key across every Prisma-backed template, and repins `@bloomneo/uikit`
to `^2.1.1` so scaffolded apps pick up the mobile sidebar → bottom-nav
swap + soft-gray default borders. Also folds the unreleased 4.0.1
bug fixes into this release — 4.0.1 was never published, its fixes
ship here.

### Added — `adminapp` template

New template positioned between `userapp` and a fully custom admin
console. Ships with everything needed to open a real admin UI on day
one — no feature additions required:

**Backend** (`src/api/features/`)
- `audit/` — fire-and-forget audit log service + admin list endpoint
  (`GET /api/audit/list`). Writes never throw and never block the main
  request; `ADMIN_ENABLE_AUDIT_LOG=false` turns logAudit() into a
  no-op for local development.
- `settings/` — key-value `AppSetting` store with two surfaces:
  `GET /api/settings/public` (typed, camelCase, unauthenticated) for
  the marketing site and `/api/settings/admin/*` (list + PUT) for the
  admin editor. Every write fires an audit event.
- `admin/` — single-shot dashboard summary aggregate
  (`GET /api/admin/summary`) + role allow-list endpoint
  (`GET /api/admin/roles`) driven by the `ADMIN_USER_ROLES` env var.
  Includes `admin.roles.ts` parser with safe defaults and
  malformed-entry handling.

**Frontend** (`src/web/features/`)
- `admin/components/AdminShell.tsx` — `PageLayout scheme="sidebar"`
  wrapper with `AuthGuard` (admin.system + moderator.manage). Desktop
  renders a left sidebar; mobile renders a bottom tab bar + "More"
  sheet via uikit 2.1.1.
- `admin/pages/index.tsx` — dashboard with widget grid (users count,
  30-day signups with daily series, recent activity). Widget set is
  driven by `VITE_ADMIN_DASHBOARD_WIDGETS` so ops can turn widgets
  on/off per deploy without a code change.
- `admin/pages/audit.tsx` — filter + table, 300 ms debounce, skeleton
  + empty states.
- `admin/pages/settings.tsx` — inline edit with optimistic save and
  toast feedback; groups rows by key prefix.
- `main/components/MarketingLayout.tsx` — public-page shell (Header +
  main + Footer). Distinct from AdminShell; no PageLayout — the
  shared Header handles its own nav.
- `main/pages/` — `index` (marketing homepage with hero + 3-feature
  grid + CTA, placeholder copy), `about`, `contact` (no form by
  default; TODO points to how to add one), `privacy`, `terms`,
  `refund`, `cancellation`. Legal pages open with a PLACEHOLDER
  warning and TODO markers for jurisdiction review.
- `shared/components/Footer.tsx` updated with all six legal links.

**Prisma models added to `prisma/schema.prisma`**
- `AuditLog` — actorId + actorType + action + entityType/entityId +
  oldValue/newValue JSON + ipAddress/userAgent. Indexed on actorId,
  action, (entityType, entityId), createdAt.
- `AppSetting` — key (PK), value, isPublic flag, description,
  updatedBy, updatedAt.

**Env vars (seeded into `.env` at scaffold time)**
- `ADMIN_USER_ROLES="admin:system,moderator:manage,viewer:basic"` —
  parsed allow-list for role:level combos
- `ADMIN_ENABLE_AUDIT_LOG=true` — master switch
- `ADMIN_DASHBOARD_WIDGETS="users,signups,activity"` — widget list

**Scaffolder wiring** (`bin/bloom.js`)
- `adminapp` added to the validTemplates list + `--help` output
- Secret generation shared with `userapp` (BLOOM_AUTH_SECRET,
  BLOOM_FRONTEND_KEY); `.env` gains the ADMIN_* block
- Post-scaffold "Next steps" block calls out PostgreSQL prereq,
  default admin login (`admin@example.com / admin123`), feature
  flags, and the mobile bottom-nav behavior
- New scaffold test asserts the three Prisma models and
  `@default(cuid())` on User

### Added — CUID primary key across every User-bearing template

`User.id` is now `String @id @default(cuid())` in adminapp and userapp
(the two Prisma-backed templates). ~75 type signatures updated across
auth + user features (`userId: number` → `string`). User IDs no
longer leak insertion order to the network. desktop-userapp keeps its
SQLite `INTEGER` primary key for now — its User IDs never leave the
device, so the risk profile is different.

Appkit was already flexible (`LoginTokenPayload.userId: string |
number`), so JWT generation + verification work with CUID strings
without any appkit change.

### Changed — `@bloomneo/uikit` pin bumped to `^2.1.1`

Every `package.json.template` across all six templates now pins
`^2.1.1` (was `^2.0.1`). This picks up:
- sidebar → bottom-nav on mobile for `<PageLayout.Content sidebar="…">`
- soft-gray default borders (Tailwind v4 had regressed this to near-black)

New scaffolds get both automatically. Existing scaffolds stay on
whatever pin they already locked — nothing auto-upgrades.

### Fixed — folded from the unreleased 4.0.1

Seven scaffolding issues reported against `bloom create <name> userapp`
that were waiting in the tree:

- **`copy-agent-docs.js` JSDoc block closing prematurely.** The header
  comment contained the literal sequence `*/` inside a path example
  (`.claude/skills/appkit-*/`), closing the `/**` block early and
  making `npm install` fail with a `SyntaxError` in every freshly
  scaffolded project. Fix synced across all five template copies.
- **`.env` secrets still used the pre-1.5 `voila_` prefix.** Scaffold
  produced `VOILA_AUTH_SECRET` + `voila_...` values while
  `appkit@4.x` and every `.env.example.template` now expect
  `BLOOM_AUTH_SECRET` + `bloom_...`. Unified the prefix, added the
  missing `BLOOM_FRONTEND_KEY` line that `server.ts` reads but was
  never written. `check-doc-drift.mjs` now bans `VOILA_<NAME>` and
  `{{VOILA_<NAME>}}` patterns so this cannot regress silently.
- **Prisma version mismatch in `userapp` template.** `prisma@^5.22.0`
  was paired with `@prisma/client@^6.16.2`, producing a runtime
  warning. Aligned both to `^6.16.2`.
- **Silent `import()` failures in `api-router.ts` variants.** All
  three routers (userapp, desktop-basicapp, desktop-userapp)
  swallowed route-import errors. Every catch now renders an
  actionable one-glance message: `AppKitError` instances surface
  module + docs URL; Node's `Cannot find module` turns into a
  `npm install <pkg>` suggestion; `SyntaxError`s name the file.
  Structured metadata attached to every `logger.error` call for
  log-aggregator indexing.
- **Post-scaffold next-steps missing Postgres prereq + `prisma
  generate`.** `npm install` used to finish without generating the
  Prisma client, so the first `npm run dev` crashed on the
  `@prisma/client` import. `userapp`'s `postinstall` now chains
  `prisma generate` after doc hydration (falls back gracefully if
  the Prisma CLI is unavailable); scaffolder output calls out the
  PostgreSQL requirement and canonical `db:push` → `db:seed` → `dev`
  sequence.

## [4.0.0] - 2026-04-17

Maps bloom templates to `@bloomneo/appkit@4.0.0` now that appkit 4.0
is on npm `latest`. Fourth major in a day — each ecosystem publish
triggers a coordinated bloom major because peer-dependency major
bumps are breaking per semver.

### Breaking — scaffolded apps now require appkit 4.x

Every template's `package.json.template` + the shared
`templates/package.json` + bloom's own `peerDependencies` now pin
`@bloomneo/appkit: "^4.0.0"` (was `^2.0.0`). New scaffolds install
appkit 4.x.

### Why appkit 4.x matters

Appkit 4.0 unified the teardown verb across every stateful module —
`shutdown`, class-level `clear`, `flushAll`, and `databaseClass.disconnect`
are all gone; every module exposes `disconnectAll()`. It also added
typed error subclasses (`CacheError`, `TokenError`, `AppError`,
`SecurityError`, `DatabaseError`, `EmailError`, `EventError`,
`QueueError`, `LoggerError`, `StorageError`) all extending a new
`AppKitError` base.

### Templates audited — zero code churn needed

The pin bump is **zero-churn on template source**. Audit confirmed
templates use none of the appkit 4.0-renamed methods:

- No `cacheClass.flushAll` / `shutdown` / `clearAll`
- No `queueClass.clear` / `disconnectAll`
- No `emailClass.clear` / `shutdown` / `disconnectAll`
- No `eventClass.clear` / `shutdown` / `disconnectAll`
- No `storageClass.clear` / `shutdown` / `disconnectAll`
- No `loggerClass.clear`
- No `databaseClass.disconnect` / `disconnectAll`
- No `StorageClass` default-import (changed to `storageClass` singleton in 4.0)
- No typed error subclass usage (consumers catch plain errors)

The only templates-to-appkit touchpoints are the primary API methods
(`auth.getUser`, `auth.hashPassword`, `auth.generateLoginToken`,
`auth.requireLoginToken`, `error.asyncRoute`, etc.) — all unchanged
between appkit 2.0 and 4.0.

### Ecosystem status after this release

| | npm `latest` | bloom pin |
|---|---|---|
| appkit | **4.0.0** | `^4.0.0` ✓ aligned |
| uikit | **2.0.1** | `^2.0.1` ✓ aligned |

Both pins now match `latest` on npm. Agents reading the
postinstall-copied `docs/appkit-agents.md` see appkit 4.0's modern
teardown verb + typed error hierarchy.

### Migration for bloom consumers

New project → use bloom 4.0.0, nothing to do.

Existing bloom-3.x-scaffolded project upgrading to appkit 4.x:

```bash
npm install @bloomneo/appkit@^4.0.0

# If your code uses any appkit teardown method, rename:
#   cacheClass.flushAll()     → cacheClass.clearAll()
#   cacheClass.shutdown()     → cacheClass.disconnectAll()
#   queueClass.clear()        → queueClass.disconnectAll()
#   emailClass.shutdown()     → emailClass.disconnectAll()
#   emailClass.clear()        → emailClass.disconnectAll()
#   eventClass.shutdown()     → eventClass.disconnectAll()
#   eventClass.clear()        → eventClass.disconnectAll()
#   storageClass.shutdown()   → storageClass.disconnectAll()
#   storageClass.clear()      → storageClass.disconnectAll()
#   loggerClass.clear()       → loggerClass.disconnectAll()
#   databaseClass.disconnect( → databaseClass.disconnectAll(

# If you caught typed errors:
#   catch (err instanceof CacheError) still works (subclass)
#   BUT prefer: catch (err instanceof AppKitError) for all appkit errors

# Re-run postinstall to refresh docs/ + .claude/skills/:
npm run postinstall
```

Templates don't use any of these, so template code upgrades are
automatic via caret semver.

### Fixed — AGENTS.md restored

A sed-chain bug in the 3.0.2 commit had accidentally zeroed `AGENTS.md`
(the commit landed with an empty file). Restored from the previous
known-good commit (`c8ba806` at 1.6.0) and re-applied the 3.x / 4.x
doc updates. The drift-check's new version-string alignment rule would
catch this in future if CI runs on every commit.

## [3.0.2] - 2026-04-17

Doc-alignment sweep. Reviewer caught that `AGENTS.md` and `llms.txt`
still carried `v1.6.0` headers and referenced `^1.5.1` pins despite
the package being at 3.0.1 and templates pinning `^2.0.0 / ^2.0.1`.
No code changes.

### Fixed — version-string drift

- `AGENTS.md:3` header — `v1.6.0` → `v3.0.2`. Inline references to
  `@bloomneo/appkit` / `@bloomneo/uikit` pins updated to what
  templates actually ship (`^2.0.0` and `^2.0.1`).
- `llms.txt:1` H1 header aligned with `package.json.version`.
- `llms.txt` "What scaffold produces" section — pin references
  updated from `^1.5.1` to the current `^2.0.0 / ^2.0.1`.
- `llms.txt` "Migration" section rewritten. Was a 1.5.1 → 1.6.0
  note; now covers the full 1.5.x → 3.x path with the appkit 2.0
  (`auth.user → auth.getUser`, `security.csrf → security.forms`,
  `handleErrors includeStack → showStack`) and uikit 2.0 (`<Combobox
  onChange> → onValueChange>`) breaking renames, why there were three
  majors in one day, and the pending appkit 4.0 story.

### Added — drift-check gains version-string alignment

`scripts/check-doc-drift.mjs` now verifies that `AGENTS.md` and
`llms.txt` version strings match `package.json.version` on every CI
run. Closes the regression class the review caught — silent version
drift across AGENTS.md / llms.txt / package.json can't recur.

### Reviewer findings explicitly NOT acted on

- **"Bump appkit pin from `^2.0.0` to `^4.0.0`."** appkit 4.0 is on
  appkit's main branch but NOT on npm. npm `latest` for appkit is
  2.0.0. Bumping the pin would break `npm install` for every new
  scaffolded app (caret can't resolve a version that doesn't exist).
  The reviewer's corollary — "postinstall copies the 4.0 AGENTS.md
  so the scaffolded doc teaches `disconnectAll()` but the installed
  2.x doesn't have it" — is factually wrong. The postinstall copies
  from `node_modules/@bloomneo/appkit/AGENTS.md`, which is whatever
  version was installed (2.0.0). The 2.0.0 AGENTS.md teaches 2.0.0
  patterns. No contradiction. When appkit 4.0.0 actually publishes,
  bloom will cut a coordinated major to bump the pin.
- **"Add `bloom update` / `bloom diff` / migration helper."** Kept
  deliberately out of scope (see bloom's "What bloom is NOT" rule in
  AGENTS.md). The postinstall already re-hydrates `docs/` and
  `.claude/skills/` on every `npm install`, so existing scaffolded
  apps pick up agent-doc improvements when they upgrade the
  ecosystem packages.
- **"CLI thinness vs framework ambition."** Design choice. `bloom
  dev` / `bloom build` wrappers would couple bloom to the scaffolded
  app's package.json shape and multiply maintenance surface.
- **"FBCA has no validator / linter."** Deferred. File-based routing
  is enforced at runtime by `import.meta.glob`; a missed
  `pages/index.tsx` produces a visible route-not-found. Worth
  adding if users report silent misses.
- **"Docs site landing page (bloomneo.github.io/bloom) is 3 majors
  behind."** Separate repo / external site; not fixable from inside
  this repo.

## [3.0.1] - 2026-04-17

Deep pre-publish audit. Deletes stale template docs that taught
pre-2.0 uikit patterns (deep imports, hallucinated `ValidatedInput`,
the never-existing "UIKit CLI"). No code behavior changes, no API
changes — the templates' source code was already correct.

### Fixed — stale template docs deleted

Every template shipped a `docs/UIKIT_*.md` folder with content
inherited from the `@voilajsx/uikit` era. Deleted across all 5
templates (11 files):

- `UIKIT_THEME_GUIDE.md` — superseded by uikit 2.0.1's own llms.txt
  (copied in by postinstall as `docs/uikit.md`) + the themeing
  sub-rule that ships inside `skills/bloomneo-uikit/rules/theming.md`
  (also copied in).
- `UIKIT_COMPOSITE_UI_SYSTEM.md` — taught `@bloomneo/uikit/button`,
  `@bloomneo/uikit/card` deep imports (non-canonical per uikit
  AGENTS.md "Never deep-import as primary") and referenced
  `ValidatedInput` which isn't exported from uikit 2.0.1.
- `UIKIT_CLI_GUIDE.md` (mobile-basicapp only) — documented a "UIKit
  CLI" that doesn't exist. Uikit has never shipped a CLI.

### Fixed — flattened remaining deep-import examples

Surviving doc files (`QUICKSTART_FBCA.md`, `DESKTOP_APP_GETTING_STARTED.md`)
had `from '@bloomneo/uikit/page' / /card / /button / /form / /header /
/footer / /container`. All rewritten to the canonical flat import
`from '@bloomneo/uikit'`.

### Fixed — flat-import violations in root README

`bloom`'s own README had `from '@bloomneo/uikit/hooks'`,
`from '@bloomneo/uikit/page'`, `from '@bloomneo/uikit/theme-provider'`.
All now use `from '@bloomneo/uikit'`.

### Added — drift-check gains uikit-specific bans

`scripts/check-doc-drift.mjs` now catches:

- Any deep import into `@bloomneo/uikit/*` except the two legit ones
  (`/styles` for CSS, `/fouc` for the FOUC script helper)
- `ValidatedInput` references (not in uikit 2.0.1)
- `<Combobox onChange=` and `<Select onChange=` — value-not-event
  pickers must use `onValueChange` in uikit 2.0+

So future drift from these patterns fails CI.

### Audited and verified correct

- appkit method usage across templates: every call site
  (`auth.hashPassword`, `auth.comparePassword`, `auth.generateLoginToken`,
  `auth.getUser`, `auth.requireLoginToken`, `auth.requireUserRoles`,
  `config.get`, `error.asyncRoute` / `.badRequest` / `.forbidden` /
  `.notFound` / `.serverError` / `.handleErrors`, `logger.info/warn/error`,
  `security.requests`, `util.isEmpty`) verified against appkit 2.0.0's
  installed API.
- uikit imports across templates: only `Alert`, `AlertDescription`,
  `AlertTitle`, `AuthLayout`, `Badge`, `Button`, `Card`, `CardContent`,
  `CardDescription`, `CardFooter`, `CardHeader`, `CardTitle`,
  `Container`, `Dialog*`, `Footer`, `Header*`, `Input`, `Label`,
  `PageLayout`, `Select*`, `Switch`, `Table*`, `useApi`,
  `useBackendStatus`, `useTheme` — all exported from uikit 2.0.1's
  flat index.
- Postinstall source paths verified against what
  `@bloomneo/appkit@2.0.0` and `@bloomneo/uikit@2.0.1` actually ship
  on npm: appkit ships `AGENTS.md` + `llms.txt` (no `.claude/skills`
  yet — that's in the unpublished 4.0); uikit ships `AGENTS.md` +
  `llms.txt` + `skills/bloomneo-uikit/`. Postinstall handles the
  missing `.claude/skills` gracefully (logs a skip).

## [3.0.0] - 2026-04-17

Maps bloom templates to `@bloomneo/uikit@2.0.1` now that uikit 2.x is on
npm. Second back-to-back major because peer-dependency major bumps are
breaking per semver — bloom consumers who relied on the `^1.5.1` uikit
range can't use bloom 3 with uikit 1.x.

Bloom 2.0.0 (just shipped minutes earlier) bumped appkit to `^2.0.0`.
3.0.0 does the uikit half. After this, both ecosystem pins match what's
actually `latest` on npm.

### Breaking — scaffolded apps now require uikit 2.x

Every template's `package.json.template` + the shared
`templates/package.json` + bloom's own `peerDependencies` now pin
`@bloomneo/uikit: "^2.0.1"` (was `^1.5.1`). New scaffolds install
uikit 2.x.

### Why uikit 2.x

Uikit 2.0 renamed `<Combobox onChange>` to `<Combobox onValueChange>`
for consistency with every other value-not-event picker (Select,
Slider, Tabs, Accordion). It also added 6 typed error subclasses
(`DataTableError`, `FormFieldError`, etc.) and `'use client';` on all
44 components for Next.js 13+ App Router compatibility.

Bloom templates don't use Combobox in any scaffolded code, so the
Combobox rename produces zero template churn. The audit confirmed
this with a grep across all 5 templates — no `<Combobox>` references
anywhere.

### Not changed (audited clean)

- **No `<Combobox>` in any template** — the uikit 2.0 Combobox rename
  (`onChange` → `onValueChange`) has no template-level impact. If
  consumers add Combobox to their scaffolded app, they get the 2.x
  API with `onValueChange`; the postinstall-copied uikit AGENTS.md +
  llms.txt teach the correct name.
- **No pre-2.0 uikit patterns detected** — templates already use
  `onValueChange` for Select (correct in both 1.x and 2.x) and
  `onChange(e)` for Input/Textarea (unchanged).
- **`'use client';` directive on uikit components** — not a template
  concern; the consumer-project code just imports components. Next.js
  App Router handling is automatic now in uikit 2.x.

### Added — drift-check extended with uikit 2.0 rename bans

`scripts/check-doc-drift.mjs` gains one new pattern:

- `<Combobox … onChange=` → use `<Combobox … onValueChange=`

Plus the Select ban that was already there stays correct:
`<Select … onChange=` → use `<Select … onValueChange=`.

### Added — smoke test uikit-pin assertion

`tests/scaffold-smoke.test.mjs` already asserted uikit is pinned to a
caret range. That assertion now matches `^2.0.1` instead of `^1.5.1` —
no test rewrite needed (the pattern check is range-agnostic).

### Ecosystem status after this release

|  | npm `latest` | bloom pin |
|---|---|---|
| appkit | 2.0.0 | `^2.0.0` ✓ aligned |
| uikit | 2.0.1 | `^2.0.1` ✓ aligned |

Both pins now match what npm actually serves. Agents reading the
postinstall-copied `docs/appkit-agents.md` and `docs/uikit-agents.md`
will see the same patterns the scaffolded code uses.

### Migration for bloom consumers

If you're scaffolding a new project: use bloom 3.0.0 — nothing to do.

If you have an existing bloom-2.0.0-scaffolded project (which already
had appkit 2.x) and want to pick up uikit 2.x:

```bash
npm install @bloomneo/uikit@^2.0.1

# If your code uses Combobox, update the callback prop:
#   <Combobox onChange={setX}>   →   <Combobox onValueChange={setX}>
# Drift-check in your scaffolded project (if you wired one) catches this.

# Re-run postinstall to refresh docs/ + .claude/skills/ from the new version:
npm run postinstall
```

If you skipped bloom 2.0.0 and are jumping from bloom 1.x directly to
3.0.0, apply BOTH the appkit and uikit migrations — see the 2.0.0
entry below for `auth.user() → auth.getUser()`.

## [2.0.0] - 2026-04-17

Aligns bloom templates with the appkit API shape on npm `latest` (2.0.0).
Pre-2.0 `auth.user()` calls in template source now use the canonical
`auth.getUser()`, and the appkit pin moves from `^1.5.1` to `^2.0.0` so
scaffolded apps install a version that actually has the methods the
templates + agent docs teach.

### Breaking — scaffolded apps now require appkit 2.x

Every template's `package.json.template` + the shared
`templates/package.json` + bloom's own `peerDependencies` now pin
`@bloomneo/appkit: "^2.0.0"` (was `^1.5.1`).

Why this is breaking for bloom consumers: an app scaffolded with
bloom 2.0.0 cannot run against appkit 1.5.x. Existing scaffolded
projects already on 1.5.x keep working — nothing auto-upgrades them.
But anyone using bloom 2.0.0 to create a new project, or running
`npm update @bloomneo/appkit` in a bloom-1.x-scaffolded app, now
needs appkit 2.0.0+.

### Breaking — template source uses appkit 2.0 auth API

`auth.user(req)` was renamed to `auth.getUser(req)` in appkit 2.0.0
(no alias kept). Previously bloom templates taught the pre-2.0 name
in 5 files while the AGENTS.md.template taught the modern names —
internal contradiction that confused agents. Fixed:

```
auth.user(req)   →   auth.getUser(req)
```

Files updated:

- `templates/userapp/src/api/features/user/user.route.ts`
- `templates/userapp/src/api/features/user/user.api.readme.md`
- `templates/desktop-userapp/src/desktop/main/features/settings/settings.route.ts`
- `templates/desktop-userapp/src/desktop/main/features/user/user.route.ts`
- `templates/desktop-userapp/src/desktop/main/features/user/user.api.readme.md`

### Added — drift-check extended with appkit-2.0 rename bans

`scripts/check-doc-drift.mjs` now also bans these pre-2.0 patterns so
they can't be reintroduced into any template, README, AGENTS.md, or
llms.txt:

- `auth.user(` → use `auth.getUser(req)`
- `auth.can(` → use `auth.hasPermission(user, permission)`
- `security.csrf(` → use `security.forms()`
- `handleErrors({ includeStack ... })` → use `handleErrors({ showStack, logErrors })`
- `auth.requireLogin(` / `auth.requireRole(` — these never existed in real
  appkit; docs that reference them are hallucinated. Use
  `requireLoginToken()` / `requireUserRoles([...])`.

### Not changed (audited and clean)

The comprehensive audit confirmed every OTHER appkit + uikit rename
is absent from templates:

- No `cacheClass.flushAll`, `shutdown`, `queueClass.clear`, class-level
  `clear` on email/event/storage/logger, `databaseClass.disconnect` (all
  renamed in appkit 4.0.0, but bloom pins appkit 2.0.0 where these
  names still work — and templates don't use any of them regardless)
- No `<Combobox onChange>` (uikit 2.0 rename). Templates don't use
  Combobox yet.
- No `@voilajsx/*` refs. Purged in 1.5.0.

### Uikit pin unchanged

`@bloomneo/uikit: "^1.5.1"` — uikit 2.x is on the uikit main branch
but not yet on npm, so the pin stays at the latest published version.
When uikit 2.x publishes, bloom will cut another coordinated major
that bumps the uikit pin + updates any templates that use renamed
uikit APIs (principally `<Combobox onValueChange>`).

### Migration for bloom consumers

If you're scaffolding a new project, nothing to do — use bloom 2.0.0
as normal.

If you have an existing bloom-1.x-scaffolded project that you want to
upgrade:

```bash
# 1. Bump appkit pin in your project's package.json
npm install @bloomneo/appkit@^2.0.0

# 2. Rename any auth.user() calls in your codebase:
#    sed -i 's/auth\.user(/auth.getUser(/g' src/**/*.ts

# 3. Re-run the postinstall to refresh docs/ and .claude/skills/
npm run postinstall
```

That's it — no other code changes unless you used the other renamed
appkit 2.0 APIs (auth.can, security.csrf, handleErrors' includeStack
option).

## [1.6.0] - 2026-04-17

Governance pass mirroring the shape applied to `@bloomneo/appkit@4.0.0`
and `@bloomneo/uikit@2.0.1`. Pure additive — no breaking changes, no
migration needed.

Also reconciles the phantom 1.5.3 release: `package.json` carried `1.5.3`
but `CHANGELOG.md` had no entry for it. No code actually shipped under
1.5.3 beyond the already-documented 1.5.2 fixes, so 1.5.3 is rolled into
1.6.0 rather than inventing retroactive release notes.

### Added — CLI ergonomics

- **`bloom --help` / `-h` / `help`** now prints the usage screen and exits 0.
  Pre-1.6.0, `bloom --help` fell through to the "Unknown command" branch
  and exited 1 — confusing for agents that expected a standard help flag.
- **`bloom --version` / `-v` / `version`** prints the installed bloom
  version and exits 0.
- **`--skip-install` / `--no-install`** flag on `bloom create` scaffolds
  files only, skipping `npm install`. Useful for CI / dry-run testing
  and for the new scaffold-smoke tests.

### Added — agent artifacts at the repo root

- **`AGENTS.md`** — prescriptive rules for agents using the bloom CLI:
  what bloom IS (scaffolding CLI), what it is NOT (runtime library,
  generator framework), canonical commands, template decision tree,
  always/never rules, FBCA architecture, expected scaffold shape.
- **`llms.txt`** — machine-readable CLI reference (commands, templates,
  flags, exit codes, FBCA conventions). Matches the appkit / uikit
  pattern.
- `files:` manifest now includes `AGENTS.md`, `llms.txt`, and
  `CHANGELOG.md` so agents installing `@bloomneo/bloom` find them
  under `node_modules`.

### Added — drift gates + CI

- **`scripts/check-doc-drift.mjs`** scans `README.md`, `AGENTS.md`,
  `llms.txt`, every `templates/**/*`, and `bin/bloom.js` for stale
  scope refs (`@voilajsx/helix`, `@voilajsx/uikit`, `@voilajsx/appkit`),
  `"latest"` pins on ecosystem deps, hallucinated template names
  (webapp/fullstack/admin/blog/shop/…), and any
  `import … from '@bloomneo/bloom'` attempts (bloom is a CLI, not a
  library). Honors migration-arrow and ❌-pair teaching conventions
  to avoid self-failing on legitimate contexts.
- **`tests/scaffold-smoke.test.mjs`** uses Node's built-in `node:test`
  runner (no vitest dep). Shells `bloom create <name> <tpl> --skip-install`
  into a tmp dir for each of the 5 templates and asserts:
  `package.json.name === project-name` (via `{{PROJECT_NAME}}` replacement),
  appkit + uikit pins are caret ranges (not `"latest"`), `postinstall`
  runs `copy-agent-docs`, `AGENTS.md` is placeholder-free, and the
  template-specific directory structure exists (`src/web`, `src/api`,
  `prisma/`, `electron/`, `src/mobile`). Plus CLI surface checks:
  `--help` exits 0, `--version` prints semver, no-args / unknown-command
  / invalid-template exit 1. 10 tests, ~550 ms total.
- **`.github/workflows/ci.yml`** runs `node --check bin/bloom.js` +
  `check:docs` + `test:smoke` on Node 18/20/22 for every push and PR.
- `npm test` now runs `check:docs` then `test:smoke`.
- `prepublishOnly` now runs `npm test`.

### Added — postinstall hydration

`scripts/copy-agent-docs.js` is now unified across all 5 templates (one
canonical version, synced). It copies:

- `node_modules/@bloomneo/appkit/llms.txt` → `docs/appkit.md`
- `node_modules/@bloomneo/appkit/AGENTS.md` → `docs/appkit-agents.md`
- `node_modules/@bloomneo/uikit/llms.txt` → `docs/uikit.md`
- `node_modules/@bloomneo/uikit/AGENTS.md` → `docs/uikit-agents.md` (new)
- `node_modules/@bloomneo/appkit/.claude/skills/*` → `.claude/skills/` (new)
- `node_modules/@bloomneo/uikit/skills/*` → `.claude/skills/` (new)

It also now fills remaining `{{PROJECT_NAME}}` placeholders in the
scaffolded `AGENTS.md` with the real package name — belt-and-braces for
any placeholder bloom's scaffold-time processor missed.

Survives gracefully when a package isn't installed (mobile-basicapp
template has no appkit, for example).

### Changed

- Every template's `package.json.template` now uses `"name": "{{PROJECT_NAME}}"`
  instead of the hard-coded `"bloom-<template>"`. Scaffolded projects
  now get the user-provided name.
- Every template's `AGENTS.md` is now `AGENTS.md.template` so bloom's
  scaffold-time placeholder processor replaces `{{PROJECT_NAME}}` at
  create time.
- `templates/package.json` — `@bloomneo/uikit` and `@bloomneo/appkit`
  pinned to `^1.5.1` instead of `"latest"`. This was the legacy shared
  template config; not on the scaffold path but a drift waiting to
  happen.
- `package.json` description rewritten to be honest about what bloom is
  (a scaffolding CLI) rather than what it stitches together.

### Fixed

- **Hallucinated doc references in CLI output.** `bin/bloom.js` told
  users *"See docs/MOBILE_DEVELOPMENT.md"* and *"See docs/DEVELOPMENT.md"*
  — files that don't exist in any template. Replaced with references
  to the real docs the postinstall copies in (`docs/appkit.md`,
  `docs/uikit.md`) and a direct Capacitor link.
- **Dead code** in `bin/bloom.js` — `mergeBloomPackageJson()` was
  declared `async` at line 282 but never called. Removed.

### Removed

- **`docs/` nested vite subproject.** 274MB of local-only docs-site
  code that still referenced `@voilajsx/uikit` (the old scope) and was
  never shipped in the npm tarball. Same situation uikit had with its
  old `pages/` directory.

### Not done (explicitly)

Three observations from the review that are real but NOT actionable in
this release:

- **No `bloom add feature <name>` generator.** Kept deliberately out of
  scope. FBCA is already self-serving — `import.meta.glob` auto-discovers
  new feature files without tooling help. A generator would multiply
  the maintenance surface every time appkit or uikit adds a primitive.
- **No per-component behavior tests for templates.** Consumer-level
  tests belong in scaffolded apps. Bloom's test surface is the
  scaffold-smoke assertion that every template produces a valid
  project; behavioral correctness is appkit/uikit's responsibility.
- **Version-pin strategy for the eventual appkit 4.x / uikit 2.x
  on-npm landing.** When appkit cuts its real 4.0.0 publish (currently
  on main at 4.0.0 but npm `latest` is 2.0.0) and uikit cuts 2.1.0
  (main at 2.0.1 but npm `latest` is 1.5.1), bloom will need a
  coordinated major that bumps every template's `^1.5.1` pins. That
  work waits until those packages actually publish.

### Migration from 1.5.x

None. Existing scaffolded apps keep working — their `^1.5.1` pins
still resolve. To pick up the 1.6.0 postinstall improvements (unified
skill copying + `{{PROJECT_NAME}}` replacement), scaffold a fresh
project with `bloom@1.6.0` or manually run the upgraded
`scripts/copy-agent-docs.js` in an existing project.

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
