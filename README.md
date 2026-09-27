# Bloom Framework

**Bloomneo makes business apps safe, consistent and maintainable, however much of the code AI writes.**

- **Safe** — trust code you didn't write. The rules are enforced by the compiler (a route contract without an auth decision does not compile), the database (row-level security per tenant) and `bloom check`.
- **Consistent** — one way to do each thing: one API router, one page router, one app shell, one way to declare a route.
- **Maintainable** — stays simple as it grows. The routers and the shell live in `@bloomneo/appkit` and `@bloomneo/uikit`, so fixes reach apps through package updates, not copied templates.

Bloom combines **@bloomneo/uikit** (React frontend) and **@bloomneo/appkit** (Express backend) with Feature-Based Component Architecture (FBCA). One CLI scaffolds web, desktop (Electron) and mobile (Capacitor) apps from the same project, and `@bloomneo/bloom` itself provides the route contracts both halves share.

[![npm version](https://img.shields.io/npm/v/@bloomneo/bloom.svg)](https://www.npmjs.com/package/@bloomneo/bloom)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

```bash
npm install -g @bloomneo/bloom
bloom create my-app                  # basicapp: web + API
bloom create my-app userapp          # + sign-in, users, dashboard
bloom create my-app adminapp         # + admin console
bloom create my-app mobile-basicapp  # iOS + Android via Capacitor
bloom create my-app desktop-basicapp # desktop via Electron
```

appkit, uikit and bloom are released together on one version (6.x). A new app
pins all three to the same caret range.

## Commands

```
bloom create <project-name> [template]   Scaffold a new project (flags: --auth --admin --desktop --mobile --skip-install --verbose)
bloom create . [template]                Scaffold into the current directory
bloom start                              Run the production server (after npm run build)
bloom check [--json] [--strict] [--no-db] [--probe <url>] [--destructive]
                                         Verify the app (run in the app root)
bloom manifest [--check]                 Write bloom.manifest.json + the generated AGENTS.md API section
bloom upgrade [--write] [--to <ver>] [--json]
                                         Move a Bloom 5 app to 6 (dry run unless --write)
bloom --help | --version
```

## Features

- **File-based pages** — `features/<name>/pages/**` become URLs through `@bloomneo/uikit/router`; the app keeps one glob.
- **Feature-discovered API** — `features/<name>/<name>.route.ts` is mounted at `/api/<name>` by `@bloomneo/appkit/server`.
- **Route contracts** — declare a route once (method, path, zod schemas, `auth`); the server enforces it and the client is typed from it.
- **`bloom check`** — every route has an auth decision, every contract is served, tenant tables have row-level security, framework versions are in step; `--probe` tries cross-tenant reads on the running app. Ships as a GitHub Action.
- **`bloom manifest`** — the app's API (contracts, features, tenant models) in `bloom.manifest.json` and AGENTS.md, kept in step by `bloom check`.
- **`bloom upgrade`** — moves a Bloom 5 app to 6 with codemods and a list of what is left to decide.
- **App shell** — the signed-in area is uikit's `AppShell` (sidebar, icon-rail collapse, mobile sheet, header).
- **One log** — every request logged on completion with a request id; browser crashes reported to the same log.
- **Desktop and mobile** — Electron and Capacitor wrap the same web build.

## Templates

Every template is the `app` base plus layers. Flags add layers to any
template: `bloom create my-app --auth --mobile`.

| Template | Layers | What you get |
|---|---|---|
| `basicapp` (default) | — | Web app + API, pages, layouts, the welcome contract |
| `userapp` | auth | Sign-in, registration, password reset, users, dashboard (Prisma) |
| `adminapp` | auth, admin | userapp + admin console: users, audit log, settings |
| `desktop-basicapp` | desktop | basicapp wrapped as an Electron app |
| `desktop-userapp` | auth, desktop | userapp wrapped as an Electron app |
| `mobile-basicapp` | mobile | basicapp wrapped for iOS and Android with Capacitor |

The frozen pre-5.1 template directories and `--legacy` were removed in 6.0.
For the exact old tree: `npx @bloomneo/bloom@5 create ...`.

## Quick start

```bash
bloom create my-app userapp
cd my-app
npx prisma db push      # create the database (SQLite by default)
npm run db:seed         # one user per role
npm run dev             # API on :3000, web on :5173
```

`bloom create` prints the next steps for the layers it applied.

### Databases

SQLite is the zero-setup default (`DATABASE_URL=file:./dev.db`), so a new app
runs with nothing installed. For production — and for any multi-tenant app —
use Postgres with `BLOOM_DB_TENANT=rls`: appkit then scopes every query to the
caller's tenant with row-level security, and `bloom check` verifies that every
table with a tenant column has RLS enabled, forced and a policy.

## Project structure

```
my-app/
├── src/
│   ├── contracts/
│   │   └── welcome.contract.ts      # routes declared once, shared by web and API
│   ├── api/                         # Express + @bloomneo/appkit
│   │   ├── features/
│   │   │   ├── welcome/
│   │   │   │   ├── welcome.route.ts     # contractRouter([route(getWelcome, …)])
│   │   │   │   └── welcome.service.ts
│   │   │   └── client-error/            # browser crash reports → server log
│   │   └── server.ts                # createApiRouter, frontend key, request ids
│   └── web/                         # React + @bloomneo/uikit
│       ├── features/main/pages/     # index.tsx → /, about.tsx → /about …
│       ├── pages.ts                 # the page glob <PageRouter> routes from
│       ├── shared/
│       │   ├── client.ts            # typed contract client
│       │   ├── api.ts               # path-based client for plain routers
│       │   └── layouts.tsx          # layout registry (layout.*.tsx)
│       └── main.tsx
├── AGENTS.md                        # rules for coding agents + the generated API section
├── bloom.manifest.json              # contracts, features, tenant models (bloom manifest)
├── docs/                            # framework docs, copied on npm install
├── .github/workflows/bloom-check.yml  # bloom check on every push and PR
└── .env                             # generated, with secrets unique to the app
```

## Pages

```
src/web/features/main/pages/index.tsx     → /
src/web/features/blog/pages/index.tsx     → /blog
src/web/features/blog/pages/[slug].tsx    → /blog/:slug
src/web/features/docs/pages/[...path].tsx → /docs/*
src/web/features/blog/pages/_card.tsx     → not a route (co-located helper)
```

Creating the file creates the route — the dev server picks it up without a
restart. Every page is lazy-loaded inside a Suspense and an error boundary,
and unknown paths get a 404. Layouts (`shared/layout.*.tsx`) wrap groups of
pages: the auth layer's `/dashboard` shell is uikit's `AppShell` inside an
`AuthGuard`.

## API routes and contracts

Declare the route:

```ts
// src/contracts/products.contract.ts
import { z } from 'zod';
import { defineRoute } from '@bloomneo/bloom';

export const Product = z.object({ id: z.string(), name: z.string() });

export const listProducts = defineRoute({
  method: 'GET',
  path: '/api/products',
  query: z.object({ page: z.coerce.number().default(1) }),
  response: z.array(Product),
  auth: 'user',            // required: 'public' | 'user' | 'apiToken' | { roles: [...] }
});
```

Serve it:

```ts
// src/api/features/products/products.route.ts
import { route, contractRouter } from '@bloomneo/appkit/server';
import { listProducts } from '../../../contracts/products.contract.js';
import { productService } from './products.service.js';

export default await contractRouter([
  route(listProducts, ({ query, user }) => productService.list(user, query.page)),
]);
```

`route()` applies the auth decision, the tenant context and validation from the
contract; the handler returns the body. Call it from the web:

```ts
import { client } from '@/shared/client';
import { listProducts } from '@contracts/products.contract';

const products = await client.call(listProducts, { query: { page: 2 } }); // typed
```

Plain Express routers (`export default router`) keep working next to
contracts; guard them with `auth.requireLoginToken()` or declare them public
with `export const isPublic = true`.

## bloom check

```bash
npx bloom check            # human-readable
npx bloom check --json     # for CI and agents
npx bloom check --strict   # warnings fail too
npx bloom check --no-db    # skip the row-level security check
BLOOM_CHECK_IDENTITIES='[{"label":"a","email":"a@x.test","password":"…"},{"label":"b","email":"b@x.test","password":"…"}]' \
  npx bloom check --probe http://localhost:3000   # try to read tenant A's rows as tenant B
# add --destructive to also try DELETE (use a disposable database)
```

It reports routes without an auth decision, contracts no route serves, tenant
tables without row-level security (with `BLOOM_DB_TENANT=rls`), framework
versions out of step, and a stale manifest. Every finding has a code
(listed in [AGENTS.md](./AGENTS.md#bloom-check)), the file, the rule and the
fix; exit code 1 means something must change.

## bloom manifest

`npx bloom manifest` writes `bloom.manifest.json` and an "API" section in
your AGENTS.md (and llms.txt, if present) from your contracts, so agents read
the API from one place. `bloom create` writes it; after changing a contract,
run it again. `bloom check` fails when they drift from the code, and
`bloom manifest --check` exits 1 without writing.

## In CI

In GitHub Actions (new apps ship this as `.github/workflows/bloom-check.yml`):

```yaml
- uses: actions/checkout@v4
- uses: bloomneo/bloom@v6
  with:
    strict: true
```

Inputs: `strict`, `database` (run the RLS check; needs `DATABASE_URL`),
`working-directory`, `install`, `node-version`. Findings become PR annotations
and a job summary.

## Upgrading from 5

```bash
npx @bloomneo/bloom@6 upgrade           # dry run
npx @bloomneo/bloom@6 upgrade --write   # apply (clean git tree)
```

Pins the three packages to one 6.x version, moves `server.ts` onto appkit's
`createApiRouter`, adds the check workflow, and lists what is left to you with
the file and the fix. See [MIGRATION-6.md](./MIGRATION-6.md).

## Scripts

```bash
npm run dev          # API (3000) + web (5173)
npm run dev:api      # API only
npm run dev:web      # web only
npm run typecheck    # web and API
npm run build        # web + API into dist/
npm start            # production server (serves the web build too)
```

Layers add their own: `db:push`, `db:seed`, `db:studio` (auth),
`db:seed:admin` (admin), `dev:desktop`, `build:desktop` (desktop),
`mobile:add:ios`, `mobile:ios`, `mobile:android` (mobile).

## Environment

`bloom create` writes `.env` with values unique to the app:

```env
VITE_API_URL=http://localhost:3000
BLOOM_SERVICE_NAME=my-app
BLOOM_FRONTEND_KEY=bloom_…      # production rejects /api calls without it
VITE_FRONTEND_KEY=bloom_…       # the web client sends it; keep the two equal
BLOOM_AUTH_SECRET=auth_…        # auth layer: signs every JWT
DATABASE_URL=file:./dev.db      # auth layer
BLOOM_SECURITY_ENCRYPTION_KEY=… # admin layer: encrypts stored email credentials
```

## Links

- [UIKit](https://github.com/bloomneo/uikit)
- [AppKit](https://github.com/bloomneo/appkit)
- [Migrating to 6](./MIGRATION-6.md)
- [Changelog](./CHANGELOG.md)

## License

MIT — see [LICENSE](LICENSE).
