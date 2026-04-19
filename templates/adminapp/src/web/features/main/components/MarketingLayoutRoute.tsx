/**
 * MarketingLayoutRoute — layout-route form of MarketingLayout.
 * @file src/web/features/main/components/MarketingLayoutRoute.tsx
 *
 * Same story as AdminLayoutRoute but for the public/marketing pages.
 * Mounted by the Router (not per page), so navigation between
 * `/about`, `/contact`, `/terms`, etc. keeps the Header and Footer
 * painted — no flash.
 *
 * Pages render their own title/breadcrumbs inside their content (via
 * <MarketingPageHeader>, analogous to <AdminPageHeader>).
 */

import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../../../shared/components/Header';
import { Footer } from '../../../shared/components/Footer';

function MarketingContentFallback() {
  return (
    <div
      className="flex min-h-[30vh] items-center justify-center"
      aria-label="Loading page"
    >
      <div className="size-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
    </div>
  );
}

export function MarketingLayoutRoute() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <Suspense fallback={<MarketingContentFallback />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
