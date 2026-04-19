/**
 * AdminLayoutRoute — layout-route form of AdminShell.
 * @file src/web/features/admin/components/AdminLayoutRoute.tsx
 *
 * Used as a React Router v6 layout route:
 *
 *   <Route element={<AdminLayoutRoute />}>
 *     <Route path="/admin" element={<AdminDashboard />} />
 *     <Route path="/admin/audit" element={<AdminAudit />} />
 *     ...
 *   </Route>
 *
 * Because this layout is mounted by the Router (not by each page),
 * navigating between admin routes keeps the Header + Sidebar MOUNTED —
 * only the <Outlet /> content swaps. No flash, no chrome re-render.
 *
 * The previous `AdminShell` pattern (where every page wrapped itself
 * in <AdminShell>) caused the whole chrome to unmount/remount on every
 * route change, which is what produced the "flashes on navigation"
 * behavior.
 *
 * Page-specific header (title + breadcrumbs) is now handled via the
 * <AdminPageHeader> component rendered INSIDE each page's <Outlet />
 * content. The chrome owns nothing about page-level meta.
 *
 * @llm-rule WHEN: Wiring the admin route tree in page-router or App.tsx
 * @llm-rule PREFER: AdminLayoutRoute as the layout element; AdminPageHeader inside pages
 * @llm-rule AVOID: Re-introducing a per-page chrome wrapper — defeats the whole point
 */

import { Suspense } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Container, type NavigationItem } from '@bloomneo/uikit';
import {
  LayoutDashboard,
  Users,
  ScrollText,
  Settings,
  LogOut,
} from 'lucide-react';
import { AuthGuard } from '../../auth';
import { useAuth } from '../../auth/hooks';
import { Header } from '../../../shared/components/Header';

/** Default moderator+admin role set; narrow with <AuthGuard> inside a
 *  specific page if you want stricter gating. */
const DEFAULT_ADMIN_ROLES = [
  'moderator.review',
  'moderator.approve',
  'moderator.manage',
  'admin.tenant',
  'admin.org',
  'admin.system',
];

/** Top-level admin nav. First 4 become the mobile bottom-tab row; the
 *  rest (including Sign out) fold into the "More" sheet on < md. */
const ADMIN_NAV: NavigationItem[] = [
  { key: 'dashboard', label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { key: 'users', label: 'Users', href: '/user/admin', icon: Users },
  { key: 'audit', label: 'Audit log', href: '/admin/audit', icon: ScrollText },
  { key: 'settings', label: 'Settings', href: '/admin/settings', icon: Settings },
];

/** Simple spinner shown inside the content area while a lazy admin
 *  page chunk is loading. Lives INSIDE the shell, so the Header +
 *  Sidebar don't flicker during the fetch. */
function AdminContentFallback() {
  return (
    <div
      className="flex min-h-[30vh] items-center justify-center"
      aria-label="Loading page"
    >
      <div className="size-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
    </div>
  );
}

export function AdminLayoutRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  // Sign-out is an action, not a route — close over the hook handler.
  const navigation: NavigationItem[] = [
    ...ADMIN_NAV,
    {
      key: 'signout',
      label: 'Sign out',
      icon: LogOut,
      onClick: () => logout(),
    },
  ];

  return (
    <AuthGuard requiredRoles={DEFAULT_ADMIN_ROLES}>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <Container
          sidebar="left"
          navigation={navigation}
          currentPath={location.pathname}
          onNavigate={(href) => navigate(href)}
          size="xl"
          className="flex-1"
        >
          {/* Suspense ONLY wraps the content area. Lazy chunk fetches
              for child routes swap just the Outlet, not the whole page
              — so the Header + Sidebar stay painted while a chunk
              loads. */}
          <Suspense fallback={<AdminContentFallback />}>
            <Outlet />
          </Suspense>
        </Container>
      </div>
    </AuthGuard>
  );
}
