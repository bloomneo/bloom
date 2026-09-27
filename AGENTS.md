# AGENTS.md — @bloomneo/bloom

> Rules for AI coding agents using `bloom` (v6.0.0-rc.0) to scaffold full-stack
> applications that combine `@bloomneo/appkit` (Express backend) and
> `@bloomneo/uikit` (React frontend) via Feature-Based Component Architecture
> (FBCA). All three packages release together: a new app pins appkit, uikit
> and bloom to the same `^6.0.0-alpha.0`.
>
> Read this FIRST. If the project is already scaffolded, also read
> `docs/appkit.md` + `docs/appkit-agents.md` + `docs/uikit.md` + `docs/uikit-agents.md`
> (created automatically by the scaffold's postinstall).

## What bloom IS

A **scaffolding CLI**, the **route-contract API** apps import, and the
commands that keep an app honest afterwards (`bloom check`, `bloom manifest`,
`bloom upgrade`). `bloom create`:

1. Copies the `app` base into a new project, then applies the layers the
   preset or flags ask for (`auth`, `admin`, `desktop`, `mobile`)
2. Replaces `{{PROJECT_NAME}}` placeholders and writes `.env` with secrets
   unique to the project
3. Runs `npm install` (unless `--skip-install` is passed)
4. The scaffolded project's postinstall hydrates `docs/` and `.claude/skills/`
   with the currently-installed appkit + uikit agent docs and skills
5. Writes `bloom.manifest.json` and the generated API section of the app's
   AGENTS.md (skipped with `--skip-install`)

## The starter (6.0)

What `bloom create` writes, and where each piece comes from:

| Piece | In the app | From |
|---|---|---|
| API feature discovery, `GET /api` index, JSON 404, boot warnings | `server.ts`: `app.use('/api', await createApiRouter({ featuresDir }))` | `@bloomneo/appkit/server` |
| Contract routes (auth, tenant context, validation applied) | `features/<name>/<name>.route.ts`: `export default await contractRouter([route(contract, handler)])` | `@bloomneo/appkit/server` |
| Route contracts | `src/contracts/*.contract.ts` (`defineRoute`), shared by web and API | `@bloomneo/bloom` |
| Typed client | `src/web/shared/client.ts` (`createClient`) | `@bloomneo/bloom` |
| File-based pages, lazy loading, 404, error boundary | `main.tsx`: `<PageRouter pages={pages} layouts={layouts} onError={…} />`; the glob in `src/web/pages.ts` | `@bloomneo/uikit/router` |
| Signed-in shell (auth layer) | `shared/DashboardLayoutRoute.tsx`: `<AuthGuard><AppShell …/></AuthGuard>`, nav from `shared/nav.*.ts` | `AppShell` from `@bloomneo/uikit` |
| Request ids on every log line | `server.ts`: `app.use(requestId())` | `@bloomneo/appkit/server` |
| Verification | `npx bloom check`; `.github/workflows/bloom-check.yml` runs it on every push and PR | `@bloomneo/bloom` (the `bloomneo/bloom@v6` action) |
| The app's API for agents | `bloom.manifest.json` + the generated section in AGENTS.md (`npx bloom manifest`) | `@bloomneo/bloom` |

The app no longer carries its own api-router or page-router; don't add one
back.

**Database.** SQLite is the zero-setup default (`DATABASE_URL=file:./dev.db`).
Production — and every multi-tenant app — uses Postgres with
`BLOOM_DB_TENANT=rls`, so appkit scopes every query to the caller's tenant with
row-level security and `bloom check` verifies each tenant table's policies.

## Route contracts (6.0)

bloom is also imported, for one thing: route contracts. A contract declares
an API route once — method, path, input and output schemas, and who may call
it — and both the server (appkit) and the client are typed from it.

```ts
import { z } from 'zod';
import { defineRoute, createClient } from '@bloomneo/bloom';

export const getInvoice = defineRoute({
  method: 'GET',
  path: '/api/invoices/:id',
  params: z.object({ id: z.string() }),
  response: Invoice,
  auth: { roles: ['admin.tenant', 'user.basic'] },   // required: 'public' | 'user' | 'apiToken' | { roles }
});

const api = createClient({ baseUrl: import.meta.env.VITE_API_URL, getToken });
const invoice = await api.call(getInvoice, { params: { id } });   // typed
```

- **`auth` is required.** A route without an auth decision does not compile;
  write `auth: 'public'` for a public one.
- Non-public routes run inside the caller's tenant unless `tenant: false`.
- Schemas are any Standard Schema: Zod 3.24+, Valibot, ArkType.
- Exports: `defineRoute`, `createClient`, `ApiError`, `validate`,
  `buildPath`, `isContract`, `isTenantScoped`, and the contract types.
- In a scaffolded app: contracts live in `src/contracts/<name>.contract.ts`
  (imported by the web as `@contracts/<name>.contract`, by the API with a
  relative `.js` path), the API serves them with `route()` from
  `@bloomneo/appkit/server`, and the web calls them with
  `client.call(contract, input)` from `@/shared/client`. A contract file may
  import only zod and `@bloomneo/bloom` — it is compiled by both builds.

## `bloom check`

Run it in an app's root after every change. Each finding has a code, a
location, the rule and the fix; exit code 1 means something must change.

| Code | Severity | Meaning |
|---|---|---|
| `ROUTE_NO_AUTH_DECISION` | error | A route file has no auth guard and doesn't declare `export const isPublic = true` |
| `CONTRACT_NOT_SERVED` | error | A contract in `src/**/*.contract.ts` has no `route(contract, handler)` in `src/api` |
| `CONTRACTS_NONE` | info | No routes are declared as contracts yet |
| `RLS_TABLE_UNPROTECTED` | error | With `BLOOM_DB_TENANT=rls`: a table with the tenant column lacks enabled + forced row-level security and a policy |
| `RLS_CHILD_UNPROTECTED` | error | With `BLOOM_DB_TENANT=rls`: a table reaching a tenant table through a foreign key (child, grandchild) has no policy. Fix: `rlsPolicyStatements({ table, via: { parent, foreignKey } })`; exempt deliberately shared tables with `BLOOM_DB_RLS_EXEMPT=a,b` |
| `RLS_NOT_CHECKED` | warning | The database check couldn't run (no `DATABASE_URL` or no Prisma client) |
| `VERSIONS_OUT_OF_STEP` | warning | appkit, uikit and bloom (6.x) aren't on one version |
| `MANIFEST_STALE` | error | `bloom.manifest.json` or the generated AGENTS.md / llms.txt section no longer matches the code |
| `MANIFEST_NOT_BUILT` | warning | The app has a manifest but it couldn't be rebuilt (e.g. no `tsx`) |
| `TENANT_CROSS_TENANT_READ` | error | With `--probe`: one tenant read another tenant's row on the running app |
| `TENANT_CROSS_TENANT_WRITE` | error | With `--probe`: one tenant changed another tenant's row (PATCH) |
| `TENANT_CROSS_TENANT_DELETE` | error | With `--probe --destructive`: one tenant deleted another tenant's row |
| `PROBE_INCONCLUSIVE` | error | With `--probe`: the probe couldn't log in or found nothing to probe. Not a pass |
| `PROBE_NOT_RUN` | warning | With `--probe`: `@bloomneo/appkit` isn't installed in the app |

`--strict` makes warnings fail too. `--no-db` skips the database check.

`--probe <url>` logs in as each identity in `BLOOM_CHECK_IDENTITIES` (JSON:
`[{"label","email","password"}]`, two users in different tenants) against the
app running locally at `<url>`, and replays every id one tenant sees as the
other (appkit's `verifyClass`): GET, plus a PATCH carrying only `{ "__appkitVerify": true }`.
`--destructive` also replays DELETE. Use a disposable database.

## `bloom upgrade`

Moves a Bloom 5 app to 6. Dry run by default; `--write` applies (clean git
tree required, `--force` overrides); `--to <version>` picks the version
(default: this bloom's); `--json` for agents. Edits: version pins (+ `zod`,
`tsx`, `@types/express`), `server.ts` onto `createApiRouter` from
`@bloomneo/appkit/server`, a `bloom check` workflow. Everything else is
listed by code with file, count and fix: `UPGRADE_*` for the app's own code
and skipped majors, `REMOVED_*` for removed appkit / uikit APIs and env vars.
Every code is in the table in [`MIGRATION-6.md`](./MIGRATION-6.md#what-bloom-upgrade-reports).
Rerunning after `--write` plans no edits.

## `bloom manifest`

Writes `bloom.manifest.json` — every contract (method, path, auth, tenant
scope, input and response types), every feature and how it decides auth, and
the Prisma models with a tenant column — and a generated "This app's API"
section in the app's AGENTS.md (and llms.txt, if present), between
`<!-- bloom:manifest:start -->` / `end` markers. Text outside the markers is
kept. Output is sorted with no timestamps, so it only changes when the API
does. `bloom create` writes it after install; from then on `bloom check`
fails when it is stale. `--check` exits 1 without writing. Contract files are
loaded with the app's `tsx`.

In CI: new apps ship `.github/workflows/bloom-check.yml`, which runs the
`bloomneo/bloom@v6` action (`action.yml` in this repo). Inputs: `strict`,
`database` (run the RLS check; needs `DATABASE_URL`), `working-directory`,
`install`, `node-version`. Findings become PR annotations and a job summary.

## What bloom is NOT
- **Not a generator framework.** There is no `bloom add feature`, no
  `bloom add page`, no `bloom add component`. FBCA (see below) auto-discovers
  new files — you create them by hand.
- **Not a dev server / build tool.** Scripts like `npm run dev` / `npm run build`
  live in the scaffolded project's `package.json`. bloom never wraps them.

## Commands

```
bloom create <project-name> [template]   Scaffold a new project
bloom create . [template]                Scaffold into the current directory
bloom start                              Run a scaffolded project's prod server (requires prior build)
bloom check [--json] [--strict] [--no-db] [--probe <url>] [--destructive]
                                         Verify the app (run in the app root; CI and agents: --json)
bloom manifest [--check]                 Write bloom.manifest.json + the generated AGENTS.md API section
bloom upgrade [--write] [--to <ver>] [--json]
                                         Move a Bloom 5 app to 6 (dry run unless --write)
bloom --help | -h | help                 Show usage
bloom --version | -v | version           Print installed bloom version
```

`bloom create` flags:

```
--auth           Add the auth layer (users, sign-in, Prisma)
--admin          Add the admin layer (implies --auth)
--desktop        Add the Electron wrapper
--mobile         Add the Capacitor wrapper
--verbose        Debug logging during scaffold
--skip-install   Scaffold files only; skip npm install (for CI / dry-run; alias --no-install)
```

## Template picker (decision tree)

Every preset is the `app` base plus layers. Flags add layers to any preset.

| What the user wants | Command | Layers | Database | Notes |
|---|---|---|---|---|
| Plain fullstack web app | `bloom create x` (`basicapp`) | — | — | Default. Runs with `npm run dev`. |
| Web app with auth + users | `bloom create x userapp` | auth | Prisma (SQLite by default; Postgres + `BLOOM_DB_TENANT=rls` in production) | `npx prisma db push` before first run |
| Admin console | `bloom create x adminapp` | auth, admin | Prisma | Users, audit log, settings |
| Desktop app | `bloom create x desktop-basicapp` | desktop | — | Electron wraps the same web build and API |
| Desktop app with auth | `bloom create x desktop-userapp` | auth, desktop | Prisma | |
| iOS + Android app | `bloom create x mobile-basicapp` | mobile | — | Capacitor wraps the same web build; the API runs on a server |
| Any combination | `bloom create x --auth --mobile` | as flagged | | `--admin` implies `--auth` |

Picking notes:
- **For "fullstack with auth," prefer `userapp` (or `adminapp`) over `basicapp`.**
- **Mobile builds call the API over HTTP.** Deploy the API somewhere the
  phone can reach and point `VITE_API_URL` at it.

## Always do

1. Use the canonical `bloom create <name>` command. Don't hand-clone the
   templates. (`--legacy` and the frozen pre-5.1 directories were removed in
   6.0; `npx @bloomneo/bloom@5 create` reproduces an old tree exactly.)
2. After scaffold, read `docs/appkit.md` + `docs/uikit.md` before
   generating any feature code — those are the version-matched API
   references copied by postinstall.
3. Place new pages under `src/web/features/<feature-name>/pages/`.
   uikit's `<PageRouter>` routes them from the glob in `src/web/pages.ts`.
   Declare new API routes as contracts in `src/contracts/`, serve them from
   `src/api/features/<name>/<name>.route.ts`, and run `npx bloom check`.
4. For `userapp`, run `npx prisma db push` + edit `.env` before
   `npm run dev`.
5. Keep `@bloomneo/appkit`, `@bloomneo/uikit` and `@bloomneo/bloom` on
   the same version (`^6.0.0-alpha.0` today). `bloom check` reports
   `VERSIONS_OUT_OF_STEP` when they drift.

## Never do

1. Never import anything from `@bloomneo/bloom` except the contract API
   listed above.
2. Never copy a page router or an API router into a scaffolded project.
   Adding a page means creating `features/<name>/pages/index.tsx`; adding an
   API feature means creating `src/api/features/<name>/<name>.route.ts`.
3. Never overwrite a scaffolded project's `docs/appkit.md` /
   `docs/uikit.md` — they're regenerated from `node_modules` on every
   `npm install`. Edit the packages' actual llms.txt upstream, not the
   copy.
4. Never use `bloom create` on an existing non-empty directory (other
   than `.`). It refuses and exits 1.
5. Never pin appkit, uikit or bloom to `latest`. The templates pin one
   caret range for all three — breaking changes in the ecosystem need a
   coordinated release, not silent drift via `latest`.
6. Never write an API route without an auth decision: a contract's `auth`,
   an `auth.require…()` guard, or `export const isPublic = true`.

## FBCA (Feature-Based Component Architecture)

Each feature lives in its own folder under `src/web/features/<name>/`
with a canonical shape:

```
src/web/features/
├── welcome/
│   ├── pages/
│   │   ├── index.tsx           → /welcome
│   │   ├── about.tsx           → /welcome/about
│   │   └── [id].tsx            → /welcome/:id (dynamic)
│   ├── components/             (local to this feature)
│   └── services/               (API calls; uses uikit's useApi)
└── admin/
    ├── pages/
    │   └── [...path].tsx       → /admin/* (catch-all)
    └── ...
```

`<PageRouter>` from `@bloomneo/uikit/router` routes the glob in
`src/web/pages.ts` (`./features/*/pages/**/*.{tsx,jsx}`, minus `_`-prefixed
files and folders). You don't manually add routes — you create files.

API routes in FBCA live at `src/api/features/<name>/*.{route,service,types}.ts`
and are mounted by `createApiRouter` from `@bloomneo/appkit/server`: a plain
router at `/api/<name>`, a `contractRouter` at its contracts' own paths.

## What the scaffolded project contains for agents

After `bloom create my-app userapp && cd my-app && npm install`:

```
my-app/
├── AGENTS.md                    — project-level rules (replaced placeholders, ready to read)
├── docs/
│   ├── appkit.md                — @bloomneo/appkit llms.txt (API ref)
│   ├── appkit-agents.md         — @bloomneo/appkit AGENTS.md (rules)
│   ├── uikit.md                 — @bloomneo/uikit llms.txt (API ref)
│   └── uikit-agents.md          — @bloomneo/uikit AGENTS.md (rules)
├── .claude/skills/
│   ├── appkit/                  — overview skill
│   ├── appkit-auth/             — per-module skills
│   ├── ... (12 appkit skills)
│   └── bloomneo-uikit/          — uikit skill
└── src/
    ├── contracts/*.contract.ts  — route contracts (web + API)
    ├── web/features/...         — frontend features
    ├── web/pages.ts             — the page glob <PageRouter> routes from
    └── api/features/...         — backend features
```

Agents working in the scaffolded project should read `AGENTS.md`
(project-specific), then `docs/*.md` (API refs), then open the relevant
skill in `.claude/skills/`. That's the canonical reading order.

## Where to look next

- **[`llms.txt`](./llms.txt)** — machine-readable command + template
  reference
- **[`README.md`](./README.md)** — human-facing quickstart
- **[`MIGRATION-6.md`](./MIGRATION-6.md)** — 5 → 6: removals, replacements,
  `bloom upgrade` codes
- **[`CHANGELOG.md`](./CHANGELOG.md)** — release history
- **appkit + uikit docs** — ship inside the scaffold's `node_modules`
  and are copied into `docs/` on every `npm install`
