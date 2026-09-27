/**
 * Every page in the app — the one line of routing the app keeps.
 *
 * The router itself is `<PageRouter>` from @bloomneo/uikit/router (mounted in
 * main.tsx). It cannot run this glob for you: Vite resolves `import.meta.glob`
 * relative to the file that calls it, so the glob has to live in the app.
 *
 * File → URL:
 *   features/users/pages/index.tsx      → /users
 *   features/users/pages/[id].tsx       → /users/:id
 *   features/docs/pages/[...path].tsx   → /docs/*
 *   features/main/pages/about.tsx       → /about   (`main` maps to '/')
 *
 * `_`-prefixed files and folders are private co-located components, never
 * routes. Excluding them here also keeps them out of the route-split bundle —
 * their consumers import them statically.
 *
 * The dev server re-evaluates this file whenever a page is added or removed
 * (the `bloom:page-router-hmr` plugin in vite.config.ts), so a new page is
 * routable without a restart.
 */
export const pages = import.meta.glob([
  './features/*/pages/**/*.{tsx,jsx}',
  '!**/_*.{tsx,jsx}',
  '!**/_*/**',
]);

/**
 * Per-feature URL prefixes. By default a feature's folder name IS its prefix
 * (and `main` is '/'), which pushes every top-level page into `main/`. Give a
 * feature any prefix instead:
 *
 *   billing: '/account'   // features/billing/pages/plan.tsx → /account/plan
 */
export const routeBase: Record<string, string> = {};
