/**
 * AdminShell — the layout wrapper every admin page opts into.
 * @file src/web/features/admin/components/AdminShell.tsx
 *
 * Wraps children in `<PageLayout scheme="sidebar">` with a fixed nav
 * list. On desktop (≥ 768 px) the nav renders as a left sidebar; on
 * mobile the uikit's Container swaps it for a bottom tab bar with a
 * "More" sheet — no extra work needed here.
 *
 * Role gating is handled by `<AuthGuard>` inside this shell, so every
 * admin page is protected by default; remove the AuthGuard in a page
 * that needs to be readable by moderators but not restricted further.
 *
 * TODO: As you add new admin sections (billing, feature flags, etc.),
 * add them to the `navigation` array below and drop a page file in
 * `features/admin/pages/<name>.tsx`. The PageRouter auto-discovers
 * the route from the file path.
 *
 * @llm-rule WHEN: Every new admin page should wrap its content with this shell
 * @llm-rule AVOID: Manually building a sidebar per-page — defeats consistency
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  type NavigationItem,
} from '@bloomneo/uikit';
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

interface AdminShellProps {
  /** Tells the sidebar/bottom-nav which tab is active. */
  currentPath: string;
  /** Optional heading rendered above the page content. */
  title?: string;
  /** Optional breadcrumb trail rendered between header and content. */
  breadcrumbs?: { label: string; href?: string }[];
  /**
   * Role allow-list for the inner AuthGuard. Defaults to every
   * moderator + admin level so both read pages (dashboard, audit,
   * users list) and write pages (settings, user-edit) accept it.
   * Write endpoints are already gated server-side with
   * `requireUserRoles(['admin.system'])` — this is defense-in-depth,
   * not the primary enforcement point.
   *
   * @llm-rule WHEN: A page needs stricter gating than default
   * @llm-rule NOTE: Server already enforces per-endpoint — UI-only override
   */
  requiredRoles?: string[];
  /** Page body. */
  children: React.ReactNode;
}

/**
 * Broad admin chrome access. Narrow per-page if you want — but note
 * the server is the source of truth for authorization, so a moderator
 * seeing a page they can't mutate is a UX hint, not a security issue.
 */
const DEFAULT_ADMIN_ROLES = [
  'moderator.review',
  'moderator.approve',
  'moderator.manage',
  'admin.tenant',
  'admin.org',
  'admin.system',
];

/**
 * Admin navigation. Items 5+ overflow into the mobile "More" sheet — the
 * first 4 become the bottom tab bar. Keep the most-used destinations
 * first. The "Sign out" item at the end always lands in "More" because
 * we have 5+ items.
 */
const ADMIN_NAV: NavigationItem[] = [
  { key: 'dashboard', label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { key: 'users', label: 'Users', href: '/user/admin', icon: Users },
  { key: 'audit', label: 'Audit log', href: '/admin/audit', icon: ScrollText },
  { key: 'settings', label: 'Settings', href: '/admin/settings', icon: Settings },
];

export const AdminShell: React.FC<AdminShellProps> = ({
  currentPath,
  title,
  breadcrumbs,
  requiredRoles = DEFAULT_ADMIN_ROLES,
  children,
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // The sign-out tab isn't a route — it invokes the auth hook. Adding it
  // inside the render so it can close over the logout handler without
  // needing a module-level dependency on the hook.
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
    <AuthGuard requiredRoles={requiredRoles}>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        {/* Shared Header — same brand bar + theme switcher + sign-out menu
            the public and dashboard pages use. Consistent chrome across
            the whole app. The admin-specific nav lives in the sidebar
            below, not in this header. */}
        <Header />
        {/* Container handles the sidebar → bottom-tab swap on mobile. */}
        <Container
          sidebar="left"
          navigation={navigation}
          currentPath={currentPath}
          onNavigate={(href) => navigate(href)}
          size="xl"
          className="flex-1"
        >
          {(title || (breadcrumbs && breadcrumbs.length > 0)) && (
            <div className="mb-6 space-y-2">
              {breadcrumbs && breadcrumbs.length > 0 && (
                <nav
                  aria-label="Breadcrumb"
                  className="text-sm text-muted-foreground"
                >
                  <ol className="flex flex-wrap items-center gap-1.5">
                    {breadcrumbs.map((crumb, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        {crumb.href ? (
                          <a
                            href={crumb.href}
                            className="hover:text-foreground transition-colors"
                          >
                            {crumb.label}
                          </a>
                        ) : (
                          <span>{crumb.label}</span>
                        )}
                        {i < breadcrumbs.length - 1 && (
                          <span aria-hidden>/</span>
                        )}
                      </li>
                    ))}
                  </ol>
                </nav>
              )}
              {title && (
                <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
              )}
            </div>
          )}
          {children}
        </Container>
      </div>
    </AuthGuard>
  );
};
