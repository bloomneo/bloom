/**
 * AdminPageHeader — title + breadcrumbs block for admin pages.
 * @file src/web/features/admin/components/AdminPageHeader.tsx
 *
 * Rendered INSIDE each admin page's content (not in the chrome). When
 * the user navigates between admin pages, only this component changes;
 * the surrounding AdminLayoutRoute (Header + Sidebar) stays mounted.
 *
 * Replaces the `title` + `breadcrumbs` props that AdminShell used to
 * own. Migrating a page is mechanical:
 *   - <AdminShell title="Audit" breadcrumbs=[...]>CONTENT</AdminShell>
 *   becomes
 *   - <><AdminPageHeader title="Audit" breadcrumbs=[...]/>CONTENT</>
 *
 * @llm-rule WHEN: Every admin page should open with this header block
 * @llm-rule AVOID: Reintroducing a chrome wrapper — let the layout route own chrome
 */

import { Link } from 'react-router-dom';

export interface AdminPageHeaderProps {
  /** Page title, rendered as <h1>. */
  title?: string;
  /** Optional breadcrumb trail. Links with `href` are clickable. */
  breadcrumbs?: { label: string; href?: string }[];
}

export function AdminPageHeader({
  title,
  breadcrumbs,
}: AdminPageHeaderProps) {
  if (!title && !(breadcrumbs && breadcrumbs.length > 0)) return null;
  return (
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
                  <Link
                    to={crumb.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
                {i < breadcrumbs.length - 1 && <span aria-hidden>/</span>}
              </li>
            ))}
          </ol>
        </nav>
      )}
      {title && (
        <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
      )}
    </div>
  );
}
