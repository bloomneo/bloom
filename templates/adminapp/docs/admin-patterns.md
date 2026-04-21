# Admin app patterns

> Reference for AI coding agents and humans working in this scaffold.
> Every source file points back here instead of duplicating the
> explanations. Online version: <https://dev.bloomneo.com/adminapp>.

This document is organized by **question you're trying to answer**.
Jump to the relevant section; file paths are given for each rule.

---

## 1. How is the app laid out?

```
src/
├── api/
│   ├── features/
│   │   ├── admin/           Dashboard summary + role allow-list
│   │   ├── audit/           Fire-and-forget audit log + listing
│   │   ├── auth/            Login / register / reset / verify
│   │   ├── contact-message/ Public contact form intake
│   │   ├── settings/        AppSetting CRUD + email env editor
│   │   ├── user/            Profile + admin user CRUD
│   │   └── welcome/         Hello-world route (safe to delete)
│   └── lib/
│       ├── api-router.ts    FBCA auto-discovery router
│       └── env-file.ts      .env read/merge/write for email config
└── web/
    ├── App.tsx              Router + layout-group config
    ├── main.tsx             Provider tree (Theme > Toast > Confirm > Query)
    ├── features/
    │   ├── admin/
    │   │   ├── components/
    │   │   │   ├── AdminLayoutRoute.tsx  Chrome owned by the router
    │   │   │   ├── AdminPageHeader.tsx   Per-page title + breadcrumbs
    │   │   │   └── PageLoading.tsx       200ms-delayed spinner
    │   │   ├── lib/
    │   │   │   ├── admin-api.ts          Fetch helper (URL + headers)
    │   │   │   └── dashboard-widgets.ts  LocalStorage widget prefs
    │   │   └── pages/
    │   │       ├── index.tsx             /admin (dashboard)
    │   │       ├── audit.tsx             /admin/audit
    │   │       └── settings.tsx          /admin/settings
    │   ├── auth/                         Inherited from userapp
    │   ├── main/
    │   │   ├── components/
    │   │   │   ├── MarketingLayoutRoute.tsx
    │   │   │   └── MarketingPageHeader.tsx
    │   │   └── pages/                    /, /about, /contact, /terms, /privacy,
    │   │                                 /refund, /cancellation
    │   └── user/
    │       └── pages/admin/              /user/admin, /user/admin/{create,edit,show}
    └── shared/
        ├── config/site.ts                Brand + title templating
        └── components/{Header,Footer,SEO}
```

---

## 2. Where do new routes go?

**Short answer:** drop a file in `features/<feature>/pages/` and the
PageRouter auto-discovers it. No manual route registration.

**File-to-URL rules:**
- `features/main/pages/about.tsx` → `/about`
- `features/main/pages/index.tsx` → `/` (the `main` feature is special-cased)
- `features/user/pages/admin/edit.tsx` → `/user/admin/edit`
- `features/user/pages/admin/index.tsx` → `/user/admin`
- `features/admin/pages/audit.tsx` → `/admin/audit`
- `features/foo/pages/[id].tsx` → `/foo/:id`
- `features/foo/pages/[...path].tsx` → `/foo/*`

**API routes** follow the same pattern in `src/api/features/<name>/<name>.route.ts`.

See `src/web/lib/page-router.tsx` for the discovery source.
See <https://dev.bloomneo.com/bloom/fbca> for the full FBCA spec.

---

## 3. How does chrome (Header / Sidebar / Footer) stay mounted?

**The problem:** if every page wraps itself in a shell component, the
chrome remounts on every navigation → flash on every click.

**The fix:** layout routes. `App.tsx` groups pages by URL prefix and
wraps each group in a single layout component that renders `<Outlet />`
for the content slot. React Router keeps the layout mounted; only the
Outlet swaps.

```tsx
// App.tsx
const layouts: RouteLayout[] = [
  { match: (p) => p.startsWith('/admin') || p.startsWith('/user/admin'), Layout: AdminLayoutRoute },
  { match: (p) => ['/','/about',/*...*/].includes(p),                     Layout: MarketingLayoutRoute },
];
<PageRouter layouts={layouts} />;
```

Pages return content only — **never** wrap themselves in chrome:

```tsx
// ✅ GOOD — page returns content + a per-page header
export default function AuditPage() {
  return (
    <>
      <SEO title="Audit log" />
      <AdminPageHeader title="Audit log" breadcrumbs={[...]} />
      <Card>…</Card>
    </>
  );
}

// ❌ BAD — remounts the sidebar on every navigation
export default function AuditPage() {
  return (
    <AdminShell title="Audit log">
      <Card>…</Card>
    </AdminShell>
  );
}
```

Suspense lives **inside** the layout's Outlet wrapper, so lazy-route
chunk loads replace only the content area — the Header and Sidebar
stay painted.

See <https://dev.bloomneo.com/adminapp/layout-routes>.

---

## 4. How do I call the admin API from a page?

Use `adminFetch` / `adminFetchJson` from `features/admin/lib/admin-api.ts`.

It does three things every admin call needs:
1. Prepends `VITE_API_URL` so the call crosses to the API port.
2. Attaches `X-Frontend-Key` (required by the appkit security gate).
3. Attaches `Authorization: Bearer <token>` from localStorage.

```ts
const data = await adminFetchJson<AdminSummary>('/api/admin/summary');
// throws on non-2xx, returns parsed JSON
```

For mutations, use `method: 'PUT'` / `'POST'` + `body: JSON.stringify(...)`.
Never hand-roll fetch calls with manual header construction — the helper
exists so a missing header doesn't silently 401.

See <https://dev.bloomneo.com/adminapp/admin-api>.

---

## 5. Loading states

**Don't use `<Skeleton>` for fast admin fetches.** Local dev completes
in 50ms — a skeleton that flashes for that long reads as broken.

**Do use `<PageLoading>`** from `features/admin/components/PageLoading.tsx`.
It shows nothing for the first 200ms; only if the fetch is still
running does the spinner appear. Fast loads look instant; slow loads
get a clear signal.

```tsx
if (!data) return <PageLoading label="Loading audit events" />;
```

See <https://dev.bloomneo.com/adminapp/page-loading>.

---

## 6. Auditing mutations

Every admin mutation writes an audit row. The service is
**fire-and-forget** — it never throws, never blocks the caller:

```ts
import { auditService } from '../audit/audit.service.js';

auditService.logAudit({
  actorId: String(req.user?.userId ?? ''),
  actorType: 'admin',
  action: 'user.update',
  entityType: 'user',
  entityId: userId,
  oldValue: { /* snapshot before */ },
  newValue: { /* result */ },
  ipAddress: req.ip,
  userAgent: req.get('user-agent') ?? undefined,
});
```

Rules:
- **Never await** — audit is observability, not a transaction participant.
- **Never log secrets** (passwords, API keys, tokens). Redact at the
  call site — the service does no sanitization.
- **Action naming**: `<feature>.<verb>` — e.g. `user.create`,
  `settings.update`, `auth.login.failure`. Keep dots consistent for
  the audit page's filter.
- **`ADMIN_ENABLE_AUDIT_LOG=false`** turns logAudit into a no-op for
  dev/test. Never-false in prod.

See `api/features/audit/audit.service.ts` and
<https://dev.bloomneo.com/adminapp/audit>.

---

## 7. Role gating

**UI level:** `<AuthGuard requiredRoles={[...]}>`. Shows a 403 screen
if the user's `role.level` isn't in the allow-list.

**Server level:** `auth.requireLoginToken()` + `auth.requireUserRoles([...])`
on the route. Always combine both — the first verifies the JWT, the
second enforces the role.

Role strings are `"role.level"`, e.g. `'admin.system'`, `'moderator.manage'`.
Defined by the `ADMIN_USER_ROLES` env var (see
`api/features/admin/admin.roles.ts`).

Server is always the source of truth. UI gating is defense-in-depth —
never rely on it alone.

See <https://dev.bloomneo.com/adminapp/roles>.

---

## 8. Settings

Two storage layers — pick the right one for each setting:

| Kind | Where | Example |
|---|---|---|
| App-level runtime config | `AppSetting` DB table | business_name, support_email, contact_form_enabled |
| Secrets + per-deploy config | `.env` | DATABASE_URL, BLOOM_AUTH_SECRET, RESEND_API_KEY |

**Public AppSetting rows** (`isPublic=true`) flow through
`GET /api/settings/public` → the marketing site reads them without
auth. Keep that surface minimal; secrets belong in env, never in
AppSetting.

**Email config** is env-only (`BLOOM_EMAIL_STRATEGY`, `RESEND_API_KEY`,
`SMTP_*`, etc.). The Settings UI writes to `.env` via the server;
persistence depends on the host (see
`api/lib/env-file.ts::envPersistenceHint`).

See <https://dev.bloomneo.com/adminapp/settings>.

---

## 9. Adding a feature — recipe

To add feature `widgets` exposing CRUD under `/widgets`:

1. **API** — create `src/api/features/widgets/`:
   - `widgets.types.ts` — input + row types
   - `widgets.service.ts` — business logic, returns data or throws `AppError`
   - `widgets.route.ts` — `express.Router()` with CRUD, `auth.requireLoginToken()`,
     `auditService.logAudit` on mutations
2. **Schema** — add a Prisma model if you need one. Primary key is
   cuid (`String @id @default(cuid())`) by Bloom-4.1 convention.
3. **Web** — create `src/web/features/widgets/pages/`:
   - `index.tsx` — list (use `<DataTable>`)
   - `[id]/edit.tsx` — dynamic route for edit form
4. **Admin chrome** — if the pages live under `/admin/widgets`,
   register them in AdminLayoutRoute's nav in
   `AdminLayoutRoute.tsx::ADMIN_NAV`.
5. **Audit actions** — action strings are `widgets.create`,
   `widgets.update`, `widgets.delete`. They'll appear in
   `/admin/audit` automatically.

See <https://dev.bloomneo.com/adminapp/adding-a-feature>.

---

## 10. Common traps

- **`fetch('/api/…')` from a page** — always prepend `VITE_API_URL`. Use
  `adminFetch` / `adminFetchJson` to avoid forgetting.
- **`<a href>`** for internal navigation — full page reload.
  Use `<Link>` or `navigate()`.
- **`isNaN(req.params.id)`** — legacy from int-id era. Users are cuids
  now; cuids never pass `isNaN`. Use `typeof userId === 'string'`.
- **`<Skeleton>` on fast admin pages** — use `<PageLoading>` instead.
- **Mounting `<ToastProvider>` or `<ConfirmProvider>` more than once** —
  duplicates fire `warnInDev`. Mount exactly once in `main.tsx`.
- **Inline object/array props** in `<DataTable data={...}` —
  `[]` must not be fresh-per-render; memoize or use a stable empty.
- **Forgetting `auth.requireUserRoles([...])`** on admin mutations —
  `requireLoginToken` only checks that a user is signed in, not their
  role.
- **Writing email config to AppSetting** — it lives in `.env`
  because appkit reads env directly; the UI writes env via server.
- **Returning `contact_form_to_email` to the public** — recipient
  belongs in non-public AppSetting rows; /api/settings/public only
  exposes whether the form is enabled.

---

## 11. Security posture

What the template ships with, and what it doesn't:

**Shipped:**
- Auth rate-limit (`authRateLimit` — 10/15min/IP) on `/register`,
  `/login`, `/forgot-password`, `/reset-password`.
- Admin-mutation rate-limit (`adminWriteLimit` — 60/5min/IP) on every
  `/api/settings/admin/*` write and every `/api/user/admin/*` mutation.
- Contact-form rate-limit (`5/10min/IP`) on `/api/contact-message`.
- Heavier limit on `/api/settings/admin/email-test` (10/10min) because
  real email sends cost money.
- Server-side signup gate via `feature_signup_open` AppSetting.
- Server-side last-admin protection in `userService.updateUser` and
  `deleteUser` — can't lock yourself out by demoting the only admin.
- Frontend-key gate on every `/api/*` route via appkit/security.
- JWT bearer auth — `Authorization: Bearer <token>`, NOT cookies.
  This closes the classic CSRF vector; browsers don't auto-attach
  bearer tokens.
- `isVerified` check on login (opt-out via `AUTH_REQUIRE_VERIFIED_EMAIL=false`
  for dev).
- Audit is fire-and-forget — never blocks a user's request path.

**Intentionally NOT shipped:**
- **CSRF middleware.** See above — bearer tokens don't ride on CSRF.
  If you add cookie-based sessions, wire csurf + `SameSite=Lax`.
- **Global request-rate middleware.** Per-route limits are more useful
  and don't throttle the dashboard while an admin types in the filter.
- **Refresh tokens / session rotation.** Tokens expire after
  `JWT_EXPIRES_IN` (default 7 days); admins revoke by deactivating the
  user. If you need per-session revocation, add a `Session` table with
  a `tokenId` claim.

**Gaps you'll hit eventually:**
- npm audit flags the `bcrypt → @mapbox/node-pre-gyp → tar` chain.
  Swap to `bcryptjs` if your hosting requires clean audit output.
- Audit log never throws. For compliance apps that need "failed
  writes must be visible", add an `AUDIT_STRICT_MODE` that raises
  when the DB write errors.

## 12. Performance notes

- **Pages are lazy-loaded** by the PageRouter; don't import page
  components into other modules or you defeat code-splitting.
- **Charts (recharts)** are ~40 KB. Only imported on the dashboard;
  other pages don't pay the cost.
- **`<DataTable>`** does client-side search/sort/pagination. Fine up
  to ~1000 rows; above that, move to server-side pagination via the
  `totalRows` prop and `onPageChange` handler.
- **TanStack Query** (`@tanstack/react-query`) is available and set up
  in `main.tsx`. Use `useQuery` for GETs instead of `useEffect + fetch`
  — dedupes requests across components, caches between navigations,
  auto-invalidates after mutations.
- **Memoize** `columns` and `actions` passed to `<DataTable>` with
  `useMemo`. They're deep-compared internally; new references on every
  render cause full re-sorts.

---

## 13. File header convention

Every source file should open with a JSDoc block answering four
questions:

```ts
/**
 * <One-line what-this-is>
 * @file <path>
 *
 * <Why it exists — the design tension it resolves.>
 *
 * @see ../../docs/admin-patterns.md for the patterns it implements
 * @see https://dev.bloomneo.com/adminapp/<topic>
 *
 * @llm-rule WHEN: <which task pulls an agent to this file>
 * @llm-rule AVOID: <the mistake readers commonly make>
 * @llm-rule NOTE: <any non-obvious constraint>
 */
```

Not every file has every line, but the format is consistent. LLMs that
pattern-match file headers pick up the architecture without needing
to read every line of code.
