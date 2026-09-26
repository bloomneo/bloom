# AGENTS.md — @bloomneo/bloom

> Rules for AI coding agents using `bloom` (v5.3.3) to scaffold full-stack
> applications that combine `@bloomneo/appkit` (Express backend, pinned
> `^5.1.2`) and `@bloomneo/uikit` (React frontend, pinned `^4.1.6`) via
> Feature-Based Component Architecture (FBCA).
>
> Read this FIRST. If the project is already scaffolded, also read
> `docs/appkit.md` + `docs/appkit-agents.md` + `docs/uikit.md` + `docs/uikit-agents.md`
> (created automatically by the scaffold's postinstall).

## What bloom IS

A **scaffolding CLI**. Nothing more. It:

1. Copies the `app` base into a new project, then applies the layers the
   preset or flags ask for (`auth`, `admin`, `desktop`, `mobile`)
2. Replaces `{{PROJECT_NAME}}` placeholders and writes `.env` with secrets
   unique to the project
3. Runs `npm install` (unless `--skip-install` is passed)
4. The scaffolded project's postinstall hydrates `docs/` and `.claude/skills/`
   with the currently-installed appkit + uikit agent docs and skills

## What bloom is NOT

- **Not a runtime library.** Nothing ships in `node_modules` for your app
  to import. If you find yourself typing `import { ... } from '@bloomneo/bloom'`
  in scaffolded code, stop — that's wrong.
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
bloom --help | -h | help                 Show usage
bloom --version | -v | version           Print installed bloom version
```

Global flags:

```
--verbose        Debug logging during scaffold
--skip-install   Scaffold files only; skip npm install (for CI / dry-run)
```

## Template picker (decision tree)

Every preset is the `app` base plus layers. Flags add layers to any preset.

| What the user wants | Command | Layers | Database | Notes |
|---|---|---|---|---|
| Plain fullstack web app | `bloom create x` (`basicapp`) | — | — | Default. Runs with `npm run dev`. |
| Web app with auth + users | `bloom create x userapp` | auth | Prisma (SQLite by default) | `npx prisma db push` before first run |
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
   template directories.
2. After scaffold, read `docs/appkit.md` + `docs/uikit.md` before
   generating any feature code — those are the version-matched API
   references copied by postinstall.
3. Place new features under `src/web/features/<feature-name>/pages/`
   (or `src/mobile/features/...`). FBCA's page-router auto-discovers
   them via `import.meta.glob`.
4. For `userapp`, run `npx prisma db push` + edit `.env` before
   `npm run dev`.
5. Keep `@bloomneo/appkit` on `^5.1.2` and `@bloomneo/uikit` on
   `^4.1.6` (what the 5.x templates ship). Don't change them unless
   you're tracking a coordinated major.

## Never do

1. Never import from `@bloomneo/bloom` in application code — bloom is a
   CLI, not a library.
2. Never hand-edit the page-router in a scaffolded project. The router
   auto-discovers features; adding a route means creating
   `features/<name>/pages/index.tsx`, not touching the router.
3. Never overwrite a scaffolded project's `docs/appkit.md` /
   `docs/uikit.md` — they're regenerated from `node_modules` on every
   `npm install`. Edit the packages' actual llms.txt upstream, not the
   copy.
4. Never use `bloom create` on an existing non-empty directory (other
   than `.`). It refuses and exits 1.
5. Never pin appkit or uikit to `latest`. The templates pin to caret
   ranges (`^5.1.2` appkit, `^4.1.6` uikit as of bloom 5.x) for a
   reason — breaking changes in the ecosystem need a coordinated
   bloom release, not silent drift via `latest`.

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

The page-router (`src/web/lib/page-router.tsx` in scaffolded projects)
uses `import.meta.glob('../features/*/pages/**/*.{tsx,jsx}')` to
auto-register routes. You don't manually add routes — you create files.

API routes in FBCA live at `src/api/features/<name>/*.{route,service,types}.ts`
and are registered via the api-router's auto-discovery.

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
    ├── web/features/...         — frontend features
    ├── api/features/...         — backend features
    └── web/lib/page-router.tsx  — auto-discovery router
```

Agents working in the scaffolded project should read `AGENTS.md`
(project-specific), then `docs/*.md` (API refs), then open the relevant
skill in `.claude/skills/`. That's the canonical reading order.

## Where to look next

- **[`llms.txt`](./llms.txt)** — machine-readable command + template
  reference
- **[`README.md`](./README.md)** — human-facing quickstart
- **[`CHANGELOG.md`](./CHANGELOG.md)** — release history
- **appkit + uikit docs** — ship inside the scaffold's `node_modules`
  and are copied into `docs/` on every `npm install`
