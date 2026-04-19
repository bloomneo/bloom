/**
 * Main App Component — FBCA architecture with shared layouts.
 * @file src/web/App.tsx
 *
 * PageRouter auto-discovers every `features/*\/pages/**\/*.tsx` file
 * and mounts it at the matching URL. The `layouts` array here groups
 * those discovered pages by URL prefix so they share a React Router
 * layout route — which is what keeps chrome (Header, Sidebar, Footer)
 * MOUNTED across navigations inside the same group. Without this,
 * each page would remount its own chrome on every navigation and
 * flash.
 *
 * Layout group ordering matters: first match wins. Keep specific
 * prefixes (`/admin`, `/user/admin`) BEFORE broader ones.
 *
 * Adding a new group:
 *   1. Create a LayoutRoute component that renders <Outlet /> inside
 *      its chrome (see AdminLayoutRoute for the reference pattern).
 *   2. Add an entry to the `layouts` array below with a matcher.
 *   3. Remove any per-page chrome wrapping from pages the matcher
 *      covers — they now return content only.
 *
 * Pages that match NO layout render bare (kept inside a shared
 * Suspense boundary by the router). That's fine for single-page
 * things like `/unsubscribe` where a full chrome would be wrong.
 */

import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './features/auth';
import { UserProvider } from './features/user';
import { PageRouter, type RouteLayout } from './lib/page-router';
import { AdminLayoutRoute } from './features/admin/components/AdminLayoutRoute';
import { MarketingLayoutRoute } from './features/main/components/MarketingLayoutRoute';

const layouts: RouteLayout[] = [
  // Admin console. Catches the top-level admin pages plus the
  // user-CRUD pages inherited from userapp (which live under /user/admin).
  {
    match: (path) => path === '/admin' || path.startsWith('/admin/') || path === '/user/admin' || path.startsWith('/user/admin/'),
    Layout: AdminLayoutRoute,
  },
  // Public marketing pages: homepage + about/contact/legal + anything
  // else under `features/main/pages/`. Kept last because the admin
  // matchers are more specific.
  //
  // TODO: If you add authenticated user pages (profile, account
  // settings) that want a different layout than marketing, create a
  // third LayoutRoute and insert it above this one.
  {
    match: (path) =>
      path === '/' ||
      ['/about', '/contact', '/terms', '/privacy', '/refund', '/cancellation'].includes(path),
    Layout: MarketingLayoutRoute,
  },
];

function App() {
  return (
    <Router basename="/">
      <AuthProvider>
        <UserProvider>
          <PageRouter layouts={layouts} />
        </UserProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
