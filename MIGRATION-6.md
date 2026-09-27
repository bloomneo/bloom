# Migrating to @bloomneo/bloom 6

> Work in progress on the `next` branch (6.0.0-alpha). Filled in as each change lands.
> The plan: `~/vc/production/BLOOMNEO-6-CHECKLIST.md` (Phases 6–8).

Apps created by bloom 5 do not depend on bloom at runtime, so nothing breaks
when bloom 6 ships. `bloom upgrade` (coming in 6.0) applies the 5 → 6 changes
to an existing app.

## Versioning

appkit, uikit and bloom now release together on one version number.

## Removed

- **`--legacy` and the frozen template directories** (`templates/basicapp`,
  `userapp`, `adminapp`, `desktop-basicapp`, `desktop-userapp`,
  `mobile-basicapp`). Every preset has composed layers onto the `app` base
  since 5.1; `bloom create --legacy` now exits 1. For the exact pre-6.0 tree,
  use `npx @bloomneo/bloom@5 create ...`.
- **The app's own routers.** New apps no longer carry
  `src/api/lib/api-router.ts` or `src/web/lib/page-router.tsx`; both live in
  the framework (see below). An existing app's copies keep working.
- **Unused dependencies in new apps**: `bcrypt`, `jsonwebtoken`, `helmet`,
  `morgan` and their `@types` (appkit brings what it needs), the base's
  prisma 5 entries (the auth layer declares prisma 6), the auth layer's unused
  `bcryptjs`, and the `build:lib` script (there was no `tsconfig.lib.json`).

## Added

- **Route contracts** — `import { defineRoute, createClient } from '@bloomneo/bloom'`.
  Declare a route's method, path, schemas and `auth` once; the client is typed
  from it. A contract without `auth` does not compile. Existing `*.route.ts`
  files keep working; adopt contracts one feature at a time.
- **`bloom check`** — run in an app root; reports routes without an auth
  decision, tenant tables without row-level security, and version drift.
  `--json` for CI and agents.
- Apps add `@bloomneo/bloom` as a dependency to use contracts (the CLI is
  still the `bloom` binary).

## The new starter

`bloom create` now scaffolds on the 6.0 framework pieces:

| Was (in the app) | Now |
|---|---|
| `src/api/lib/api-router.ts` | `createApiRouter({ featuresDir })` from `@bloomneo/appkit/server` |
| `src/web/lib/page-router.tsx` | `<PageRouter pages={pages} />` from `@bloomneo/uikit/router`; the glob moves to `src/web/pages.ts` |
| The auth layer's hand-built sidebar | uikit's `AppShell` (nav still from `shared/nav.*.ts`) |
| `features/welcome/welcome.route.ts` as an Express router | a `contractRouter` over `src/contracts/welcome.contract.ts` |
| — | `src/web/shared/client.ts`: `createClient` from `@bloomneo/bloom` |

To move an existing app to the same shape (all optional; the old files keep
working):

1. Pin `@bloomneo/appkit`, `@bloomneo/uikit` and `@bloomneo/bloom` to the same
   6.x version and add `zod` (`^3.24.0`).
2. `server.ts`: replace `import { createApiRouter } from './lib/api-router.js'`
   and `await createApiRouter()` with
   `import { createApiRouter } from '@bloomneo/appkit/server'` and
   `await createApiRouter({ featuresDir: path.join(__dirname, 'features') })`.
   It serves the JSON 404 for unmatched `/api/*` itself. Delete
   `lib/api-router.ts`.
3. Web: move the `import.meta.glob([...])` from `lib/page-router.tsx` into
   `src/web/pages.ts` (paths relative to `src/web`: `./features/*/pages/**`),
   render `<PageRouter pages={pages} layouts={layouts} onError={…} />` from
   `@bloomneo/uikit/router`, point vite.config's `bloom:page-router-hmr`
   plugin at `src/web/pages.ts`, and delete `lib/page-router.tsx`.
4. Dashboard shell: render `AppShell` with your nav, a react-router `Link`
   adapter, `headerActions` and `sidebarFooter`; keep the `AuthGuard` around it.
5. Contracts: add `src/contracts/`, include it in `tsconfig.api.json`, add an
   `@contracts/*` path (tsconfig.json) and alias (vite.config.ts).
6. `.env`: every app needs `BLOOM_AUTH_SECRET` (32+ characters) once it serves
   a contract — `route()` initialises appkit auth when it mounts, public
   routes included.
7. Run `npx bloom check`.

## Databases

SQLite stays the zero-setup default for new apps (`DATABASE_URL=file:./dev.db`).
Postgres with `BLOOM_DB_TENANT=rls` is the production path for multi-tenant
apps: appkit scopes every query to the caller's tenant with row-level security,
and `bloom check` fails when a table with the tenant column lacks it.
