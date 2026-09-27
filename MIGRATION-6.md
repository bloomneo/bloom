# Migrating to @bloomneo/bloom 6

> Work in progress on the `next` branch (6.0.0-alpha). Filled in as each change lands.
> The plan: `~/vc/production/BLOOMNEO-6-CHECKLIST.md` (Phases 6–8).

Apps created by bloom 5 do not depend on bloom at runtime, so nothing breaks
when bloom 6 ships. `bloom upgrade` (coming in 6.0) applies the 5 → 6 changes
to an existing app.

## Versioning

appkit, uikit and bloom now release together on one version number.

## Removed

_None yet._

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
