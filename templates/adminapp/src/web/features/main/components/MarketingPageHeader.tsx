/**
 * MarketingPageHeader — title + breadcrumbs block for marketing pages.
 * @file src/web/features/main/components/MarketingPageHeader.tsx
 *
 * Structurally identical to AdminPageHeader, kept in its own file so
 * you can style marketing pages differently if you want (e.g. larger
 * title, subtitle support, hero image) without touching the admin
 * variant.
 */

import { Link } from 'react-router-dom';

export interface MarketingPageHeaderProps {
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export function MarketingPageHeader({
  title,
  breadcrumbs,
}: MarketingPageHeaderProps) {
  if (!title && !(breadcrumbs && breadcrumbs.length > 0)) return null;
  return (
    <div className="mb-8 space-y-3">
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
        <h1 className="text-3xl sm:text-4xl font-bold">{title}</h1>
      )}
    </div>
  );
}
