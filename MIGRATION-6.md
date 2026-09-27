# Migrating to @bloomneo/bloom 6

Apps created by bloom 5 do not depend on bloom at runtime, so nothing breaks
when bloom 6 ships. In the app root:

```bash
npx @bloomneo/bloom@6 upgrade           # dry run: what it would change, what is left to you
npx @bloomneo/bloom@6 upgrade --write   # apply (needs a clean git tree; --force overrides)
npx @bloomneo/bloom@6 upgrade --json    # the same plan as JSON, for agents
```

It pins appkit, uikit and bloom to one 6.x version (adding `zod`, `tsx` and
`@types/express`), swaps `server.ts` onto `createApiRouter` from
`@bloomneo/appkit/server`, and adds a `bloom check` workflow. Everything it
can't decide is listed with the file, the count and the fix (see
[What `bloom upgrade` reports](#what-bloom-upgrade-reports)). `--to <version>`
picks the target version (default: the running bloom's). Rerunning after
`--write` plans no edits.

## Versioning

appkit, uikit and bloom now release together on one version number. A new
app pins all three to the same caret range; `bloom check` reports
`VERSIONS_OUT_OF_STEP` when they drift.

## Removed

| Removed | Instead |
|---|---|
| `bloom create --legacy` and the frozen template directories (`templates/basicapp`, `userapp`, `adminapp`, `desktop-basicapp`, `desktop-userapp`, `mobile-basicapp`) | The same preset names, composed from the `app` base plus layers (the default since 5.1). `--legacy` now exits 1. For the exact pre-6.0 tree: `npx @bloomneo/bloom@5 create ...` |
| `src/api/lib/api-router.ts` in new apps | `createApiRouter({ featuresDir })` from `@bloomneo/appkit/server` |
| The `/api` 404 handler in `server.ts` | `createApiRouter` answers unmatched `/api/*` with a JSON 404 itself |
| The hand-written request-id middleware in `server.ts` | `requestId()` from `@bloomneo/appkit/server` (sets `req.requestId`, echoes `x-request-id`, tags every log line in the request) |
| `src/web/lib/page-router.tsx` in new apps | `<PageRouter pages={pages} />` from `@bloomneo/uikit/router`; the glob moves to `src/web/pages.ts` |
| The auth layer's hand-built sidebar in `shared/DashboardLayoutRoute.tsx` | uikit's `AppShell` inside `AuthGuard` (nav still from `shared/nav.*.ts`) |
| The admin layer's `src/api/lib/env-file.ts` (email settings written to `.env`) | Settings in `app_settings`, see [Email settings](#email-settings-admin-layer) |
| `bcrypt`, `jsonwebtoken`, `helmet`, `morgan` and their `@types` in new apps | Nothing: appkit brings what it needs |
| The base's prisma 5 entries, the auth layer's `bcryptjs` / `@types/bcryptjs` | The auth layer's prisma 6; appkit hashes passwords |
| The `build:lib` script (there was no `tsconfig.lib.json`) | Nothing |
| Welcome routes in `ApiRoute` (`shared/api-routes.ts`) | Contract routes are typed by their contract and called with `client.call`; `ApiRoute` lists plain routers only |
| The package's `main` field (it pointed at `bin/bloom.js`, so importing bloom ran the CLI) | `import … from '@bloomneo/bloom'` gives the contract API; the CLI is the `bloom` binary |

An existing app's own `api-router.ts` and `page-router.tsx` copies keep
working; moving off them is optional (below).

## Added

- **Route contracts** — `import { defineRoute, createClient } from '@bloomneo/bloom'`
  (also `@bloomneo/bloom/contract`). Declare a route's method, path, schemas
  and `auth` once; appkit's `route()` serves it and the client is typed from
  it. A contract without `auth` does not compile. Exports: `defineRoute`,
  `createClient`, `ApiError`, `validate`, `buildPath`, `isContract`,
  `isTenantScoped` and the contract types. Existing `*.route.ts` files keep
  working; adopt contracts one feature at a time. Apps add `@bloomneo/bloom`
  and `zod` as dependencies to use them.
- **`bloom check [--json] [--strict] [--no-db] [--probe <url>] [--destructive]`**
  — run in an app root. Reports routes without an auth decision, contracts no
  route serves, tenant tables without row-level security, version drift and a
  stale manifest; `--probe` tries to read one tenant's rows as another on the
  running app. Exit 1 when something must change. The codes are listed in
  [AGENTS.md](./AGENTS.md#bloom-check).
- **`bloom manifest [--check]`** — writes `bloom.manifest.json` and a
  generated API section in the app's AGENTS.md (and llms.txt, if present).
  `bloom create` writes it after install; `bloom check` fails when it is stale.
- **`bloom upgrade [--write] [--to <version>] [--json]`** — the 5 → 6
  codemods described above.
- **GitHub Action** — `uses: bloomneo/bloom@v6` runs the app's `bloom check
  --json` and turns findings into PR annotations and a job summary. Inputs:
  `strict`, `database`, `working-directory`, `install`, `node-version`. New
  apps ship `.github/workflows/bloom-check.yml` (strict); `bloom upgrade` adds
  one (not strict).
- **Admin layer**: `BLOOM_SECURITY_ENCRYPTION_KEY` (64 hex characters) is
  generated into `.env`.

## The new starter

`bloom create` now scaffolds on the 6.0 framework pieces:

| Was (in the app) | Now |
|---|---|
| `src/api/lib/api-router.ts` | `createApiRouter({ featuresDir })` from `@bloomneo/appkit/server` |
| `src/web/lib/page-router.tsx` | `<PageRouter pages={pages} />` from `@bloomneo/uikit/router`; the glob moves to `src/web/pages.ts` |
| The auth layer's hand-built sidebar | uikit's `AppShell` (nav still from `shared/nav.*.ts`) |
| `features/welcome/welcome.route.ts` as an Express router | a `contractRouter` over `src/contracts/welcome.contract.ts` |
| — | `src/web/shared/client.ts`: `createClient` from `@bloomneo/bloom` |
| — | `bloom.manifest.json` and a generated API section in AGENTS.md |
| — | `.github/workflows/bloom-check.yml` |

To move an existing app to the same shape (all optional; the old files keep
working):

1. Pin `@bloomneo/appkit`, `@bloomneo/uikit` and `@bloomneo/bloom` to the same
   6.x version and add `zod` (`^3.24.0`). `bloom upgrade --write` does this.
2. `server.ts`: replace `import { createApiRouter } from './lib/api-router.js'`
   and `await createApiRouter()` with
   `import { createApiRouter } from '@bloomneo/appkit/server'` and
   `await createApiRouter({ featuresDir: path.join(__dirname, 'features') })`.
   It serves the JSON 404 for unmatched `/api/*` itself. `bloom upgrade
   --write` does this too; then delete `lib/api-router.ts`
   (`UPGRADE_OLD_API_ROUTER`). Optionally swap the request-id middleware for
   `app.use(requestId())` from the same module.
3. Web: move the `import.meta.glob([...])` from `lib/page-router.tsx` into
   `src/web/pages.ts` (paths relative to `src/web`: `./features/*/pages/**`),
   render `<PageRouter pages={pages} layouts={layouts} onError={…} />` from
   `@bloomneo/uikit/router`, point vite.config's `bloom:page-router-hmr`
   plugin at `src/web/pages.ts`, and delete `lib/page-router.tsx`.
4. Dashboard shell: render `AppShell` with your nav, a react-router `Link`
   adapter, `headerActions` and `sidebarFooter`; keep the `AuthGuard` around it.
5. Contracts: add `src/contracts/`, include it in `tsconfig.api.json`, add an
   `@contracts/*` path (tsconfig.json) and alias (vite.config.ts).
6. `.env`: an app that serves any non-public contract needs
   `BLOOM_AUTH_SECRET` (32+ characters); apps from the auth layer already
   have it. Public contracts never touch auth.
7. Run `npx bloom manifest` once (it needs `tsx`), then `npx bloom check`.

## What `bloom upgrade` reports

Edits (applied with `--write`): version pins plus `zod`, `tsx` and
`@types/express`; `server.ts` onto `createApiRouter`; a `bloom check`
workflow. Everything else is listed by code:

| Code | Found | Fix |
|---|---|---|
| `UPGRADE_FROM_APPKIT_4` | The app pins appkit below 5 | appkit 5.0 made tenant mode fail closed: scope reads with `database.tenant(req, fn)` or contracts; name cross-tenant reads with `database.bypass(reason, fn)` |
| `UPGRADE_FROM_UIKIT_2` | The app pins uikit below 4 | uikit 4.0 removed app chrome, 14 primitives and 4 theme presets; imports of them are listed as `REMOVED_UIKIT_EXPORT` |
| `UPGRADE_API_ROUTER` | `server.ts` imports the old router but not in the one shape the codemod rewrites | Switch to `createApiRouter({ featuresDir })` by hand |
| `UPGRADE_OLD_API_ROUTER` | `src/api/lib/api-router.ts` after the swap | Move any app-specific logic into `server.ts`, then delete it |
| `UPGRADE_PAGE_ROUTER` | `src/web/lib/page-router.tsx` | Optional: step 3 above |
| `UPGRADE_REQ_ANY` | `(req as any).user` | `req.user` is typed in 6.0; handle `undefined`, add custom claims to `Express.User` |
| `UPGRADE_MIDDLEWARE_CAST` | `requireLoginToken(…) as any` and similar | appkit 6 middleware is an Express `RequestHandler`; delete the cast |
| `UPGRADE_ERROR_DUCK_TYPING` | `message.startsWith('[@bloomneo/appkit/…')` | `instanceof AppKitError`, or let `error.handleErrors()` handle it |
| `REMOVED_EVENT` | `@bloomneo/appkit/event`, `eventClass` | `queueClass` jobs for async work; Redis pub/sub for fan-out |
| `REMOVED_UTIL` | `@bloomneo/appkit/util`, `utilClass` | Node built-ins or a small local helper |
| `REMOVED_PERMISSIONS` | `hasPermission`, `requireUserPermissions`, `getPermissions` | `auth.requireUserRoles([...])` / `auth.hasRole()` |
| `REMOVED_AUTH_MATRIX` | `requireScope`, `requireTier`, `roleParts` | The linear role ladder: `auth.requireUserRoles([...])` |
| `REMOVED_PII_HELPERS` | `canSeePII`, `maskPII` | Decide and mask fields in the app's own serializer |
| `REMOVED_CSRF` | `security.forms()` | Bearer-token APIs need none; cookie forms: SameSite cookies or a maintained CSRF middleware |
| `REMOVED_SANITIZERS` | `security.input()` / `html()` / `escape()` | Validate with a schema; let React escape; DOMPurify if you must accept HTML |
| `REMOVED_SEND_TEMPLATE` | `email.sendTemplate()` | Render html/text in the app and call `email.send()` |
| `REMOVED_ORG_DATABASES` | `database.org()` | One `DATABASE_URL` per app; tenants are rows |
| `REMOVED_UIKIT_EXPORT` | An import uikit 6 no longer exports (`Form*`, `HoverCard*`, `Command*`, platform helpers, `useLocalStorage`, `useBackendStatus`, `usePagination`, and the uikit 4.0 removals: `PageLayout`, `Header`, `HeaderNav`, `Footer`, …) | The replacement named in the finding (`FormField`, `Tooltip`/`Popover`, `Combobox`, `AppShell`, …) |
| `REMOVED_ENV` | In `.env.example`: `BLOOM_QUEUE_TRANSPORT=redis`, R2 storage, logger database/HTTP/webhook transports, permission/scope/tier auth vars, CSRF and sanitizer vars | Database queue transport; S3 with `S3_ENDPOINT` for R2; console/file logging; delete the rest |

`.env` itself is never read.

## Databases

SQLite stays the zero-setup default for new apps (`DATABASE_URL=file:./dev.db`).
Postgres with `BLOOM_DB_TENANT=rls` is the production path for multi-tenant
apps: appkit scopes every query to the caller's tenant with row-level security,
and `bloom check` fails when a table with the tenant column lacks it.

## Email settings (admin layer)

Apps created from the admin layer stored email provider settings by
rewriting `.env` (`src/api/lib/env-file.ts`), which failed on read-only hosts
and needed a restart. In 6.0 they live in `app_settings` (`email.*`), with the
API key and SMTP password encrypted with `BLOOM_SECURITY_ENCRYPTION_KEY`, and
apply live via `emailClass.reset()` (and again at boot). The endpoints and
response shape are unchanged. To move an existing app: copy
`features/settings/email-settings.ts` from a new scaffold, point the two
`/admin/email-env` handlers at it, add `BLOOM_SECURITY_ENCRYPTION_KEY`
(64 hex chars) to the environment, and delete `lib/env-file.ts`.
