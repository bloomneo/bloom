> **Historical.** Planning notes for the 4.1 `adminapp` template (April 2026),
> kept for the record. They describe the frozen per-template directories and
> uikit 2.x `PageLayout`, which are gone in 6.0; nothing here describes the
> current code. See README.md, AGENTS.md and MIGRATION-6.md.

# Adminapp Scaffold — Plan

**Started:** 2026-04-18
**Goal:** Ship a new Bloom scaffold template (`adminapp`) modelled on the
reusable primitives of the older `rrdplanners` project, with a mobile-friendly
sidebar-becomes-bottom-nav pattern lifted into uikit so every Bloom app
benefits.

---

## Phase 1 — uikit 2.1.0 (sidebar → bottom-nav on mobile) ✅ SHIPPED

**Repo:** `/Users/krishnateja/vc/production/uikit`
**Release:** minor, additive. Public API unchanged — consumers of
`<PageLayout.Content sidebar="left" navigation={...}>` gain the mobile
fix for free (today the sidebar is `max-md:hidden` — literally broken on
mobile).
**Shipped:** 2026-04-19 — commit `6786e992`, `@bloomneo/uikit@2.1.0`
published to npm, pushed to `origin/main`.

### Todo

- [x] Refactor `src/components/sections/container.tsx` — remove the
      `max-md:hidden` on the sidebar block. Final impl went pure-CSS
      (`hidden md:block` + `md:hidden`) instead of `useBreakpoint('md')`
      at render time — avoids SSR/hydration races entirely.
- [x] Added internal `<BottomTabSheet>` — fixed bottom bar with first 4
      nav items + "More" button that opens a slide-up `Sheet` with overflow.
      Desktop sidebar unchanged above `md`.
- [x] `env(safe-area-inset-bottom)` padding applied on the bar + matching
      spacer so page content clears the home-indicator.
- [x] Reused existing `Sheet` primitive — no new animation code.
- [x] 8 SSR-rendered structural tests (`tests/container-mobile-nav.test.tsx`)
      covering sidebar-vs-bottom CSS swap, first-4-in-bar, "More" overflow,
      `aria-current` active tab, safe-area inset. No jsdom needed.
- [x] `npm test` + drift-check + anchor-check all green (82/82 tests).
- [x] Bumped `package.json` → `2.1.0`.
- [x] Bumped version strings in `AGENTS.md`, `llms.txt`, `skills/bloomneo-uikit/SKILL.md`,
      and 4 bin/templates SKILL.md files.
- [x] CHANGELOG entry.
- [x] `npm publish` — live as `@bloomneo/uikit@2.1.0`.
- [x] Bonus: `examples/page-layout-sidebar-mobile.tsx` + dev demo
      (`src/demo-sidebar.tsx` + `demo-sidebar.html`) with a left/right/none
      mode switcher to verify all three sidebar modes.

### Resolved

- **Breakpoint:** `md` (768px) — matches rrdplanners + uikit's
  `useBreakpoint('md')` + Tailwind's `md:` utility class.

---

## Phase 2 — bloom adminapp template

**Repo:** `/Users/krishnateja/vc/production/bloom`
**Release:** minor (`4.1.0`). Adds a new template + bumps uikit pin.

### 2A. Backend scaffolding — `templates/adminapp/src/api/`

- [ ] `prisma/schema.prisma` — `User` (dual `role` + `level`), `AuditLog`,
      `AppSetting`. Copy rrdplanners' shape, strip domain fields.
- [ ] `features/auth/` — login, register, session, JWT; role-check
      middleware reading `ADMIN_USER_ROLES`
- [ ] `features/user/` — admin-scoped CRUD; list filtered by role+level
- [ ] `features/audit/` — fire-and-forget `logAudit()` service
      (never throws); admin list endpoint with moderator-scoped filtering
- [ ] `features/settings/` — key-value CRUD; `getPublicSettings()` for
      unauthenticated reads (business_name, support contact, etc.)
- [ ] `features/admin/` — dashboard summary endpoint aggregating
      user count, signups-last-30d, recent audit activity

### 2B. Frontend scaffolding — `templates/adminapp/src/web/`

- [ ] `features/main/pages/` — marketing homepage (hero + features + CTA),
      `about`, `contact`, `terms`, `privacy`, `refund`, `cancellation`
      (placeholder lorem + comments pointing to what to customize)
- [ ] `features/main/shared/Footer.tsx` — links to all legal pages
- [ ] `features/auth/pages/` — `login`, `register`
- [ ] `features/account/pages/` — user `dashboard` + `profile`
- [ ] `features/admin/pages/` — `dashboard`, `users`, `audit`, `settings`
- [ ] Admin shell — uses `PageLayout scheme="sidebar"` from Phase 1,
      so nav auto-becomes bottom-tab on mobile (no template-side mobile code)

### 2C. Env config

- [ ] `ADMIN_USER_ROLES="admin:system,moderator:manage,viewer:basic"`
- [ ] `ADMIN_ENABLE_AUDIT_LOG=true`
- [ ] `ADMIN_DASHBOARD_WIDGETS=users,signups,activity`
- [ ] Standard `BLOOM_AUTH_SECRET`, `DATABASE_URL`, `BLOOM_FRONTEND_KEY`
      (matches userapp convention)
- [ ] Document every env var in `.env.example.template` with
      inline comments

### 2D. Scaffolder wiring — `bin/bloom.js`

- [ ] Add `adminapp` to valid templates list
- [ ] `--help` output — add one-line description
- [ ] Secret generation at scaffold time (BLOOM_AUTH_SECRET,
      BLOOM_FRONTEND_KEY) — mirror userapp path
- [ ] Success message with "Next steps" (Postgres prereq → `db:push` →
      `db:seed` → `dev`; default admin login surfaced from `.env`)
- [ ] Update `README.md` template inventory
- [ ] Update `AGENTS.md` template inventory
- [ ] Update `llms.txt` template inventory
- [ ] Update `templates/package.json` if it tracks per-template deps

### 2E. Tests + drift

- [ ] Add a scaffold test mirroring userapp's test — `adminapp scaffolds
      with appkit + uikit + Prisma + auth + admin shell`
- [ ] Run full `npm test` (11/11 after addition)
- [ ] Run `npm run drift:check` — must stay clean
- [ ] Scaffold a throwaway adminapp, run `npm install`, `npm run dev`,
      confirm login works, confirm mobile bottom-nav shows up

### 2F. Code style for AI-agent pickup

Every generated file opens with:
- One-paragraph header comment explaining the file's role
- `// TODO:` blocks listing natural extension points
- Links to the relevant `docs/appkit.md` / `docs/uikit.md` section

Inspired by the overall "framework for AI-assisted development" angle —
the scaffolded code itself should teach.

---

## Phase 3 — ship

- [ ] Publish uikit `2.1.0`
- [ ] Bump bloom's uikit pin: `^2.0.1` → `^2.1.0` in all template
      `package.json.template` files + top-level `templates/package.json`
- [ ] Bump bloom `package.json` → `4.1.0`
- [ ] Bump bloom `AGENTS.md` + `llms.txt` version strings
- [ ] Fold the pending `4.0.1` bug-fix CHANGELOG entries into `4.1.0`
      (see "Pending from 4.0.1" below)
- [ ] Run full test pipeline + drift check
- [ ] `npm publish` bloom

### Pending from 4.0.1 (not yet published — to fold into 4.1.0)

- [x] `copy-agent-docs.js` JSDoc `*/` syntax bug (across 5 templates)
- [x] VOILA_ / voila_ → BLOOM_ / bloom_ unification + drift-check bans
- [x] Prisma version alignment in userapp template (→ `^6.16.2`)
- [x] Silent `import()` catches in 3 api-router.ts variants → structured,
      actionable, logger-metadata-tagged errors ("Never Fail Silently")
- [x] Post-scaffold Postgres prereq in "Next steps"; `prisma generate`
      auto-runs via userapp `postinstall` chain
- [x] CHANGELOG entry drafted — pending fold into 4.1.0

---

## Open questions (blocking Phase 2 start)

1. **Bloom 4.0.1 as a standalone release, or fold into 4.1.0?**
   Recommendation: **fold**. No reason to double-release.
2. **Adminapp homepage content** — generic skeleton with lorem, or port
   rrdplanners' fuller homepage as starting content?
3. **Default admin credentials** — `admin@example.com / admin123`
   (matches userapp), or first-run setup wizard?
4. **Mobile-nav breakpoint** — `md` (768) or `lg` (1024)?
5. **Start Phase 1 now?** Or refinements first.

---

## What we're explicitly NOT doing

- Bloom 4.0.1 as its own npm release (folded into 4.1.0)
- Credit/invoice/Razorpay code from rrdplanners (domain-specific, stays behind)
- `mobileSidebar="drawer" | "hidden"` escape-hatch prop — YAGNI, add on demand
- Touching `AdminLayout` — stays as-is for users who want the classic
  desktop-primary admin shell
- New top-level layout component — Phase 1 puts the behavior where it
  already lives (PageLayout → Container → sidebar block)
