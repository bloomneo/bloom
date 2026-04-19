/**
 * MarketingLayout — wrapper for every public-facing page.
 * @file src/web/features/main/components/MarketingLayout.tsx
 *
 * Pages under `features/main/pages/*.tsx` are auto-discovered by the
 * PageRouter and rendered without any implicit layout. This component
 * adds the consistent header + footer frame so every public page
 * (homepage, about, contact, legal) looks identical.
 *
 * Uses the shared `<Header>` and `<Footer>` components directly rather
 * than `<PageLayout>`. PageLayout's compound API expects its own
 * header/nav configuration — the shared Header already renders its own
 * nav, theme switcher, and auth affordances, so wrapping it in
 * PageLayout.Header would fight that. Plain flex layout is simpler +
 * keeps the marketing shell distinct from the admin shell (which DOES
 * use PageLayout.Sidebar for the mobile bottom-nav behavior).
 *
 * @llm-rule WHEN: Creating a new public-facing page
 * @llm-rule AVOID: Wrapping admin pages in this — use AdminShell instead
 */

import React from 'react';
import { Header } from '../../../shared/components/Header';
import { Footer } from '../../../shared/components/Footer';

interface MarketingLayoutProps {
  children: React.ReactNode;
  /** Optional page title rendered above content. */
  title?: string;
  /** Optional breadcrumb trail shown below the header. */
  breadcrumbs?: { label: string; href?: string }[];
}

export const MarketingLayout: React.FC<MarketingLayoutProps> = ({
  children,
  title,
  breadcrumbs,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {(title || (breadcrumbs && breadcrumbs.length > 0)) && (
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
                <h1 className="text-3xl sm:text-4xl font-bold">{title}</h1>
              )}
            </div>
          )}
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};
