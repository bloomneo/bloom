/**
 * Central site config — brand + title templating.
 * @file src/web/shared/config/site.ts
 *
 * One place to change the app's display name, default description,
 * and title-format pattern. Every <SEO> / useSEO call reads from
 * here, so the browser tab is always consistent:
 *
 *   MyApp                 (home / no page title)
 *   Dashboard — MyApp     (admin pages)
 *   Privacy — MyApp       (legal pages)
 *
 * Override via env (Vite-style) if you want per-deploy branding
 * without editing this file:
 *
 *   VITE_SITE_NAME="Acme Admin"
 *   VITE_SITE_DESCRIPTION="Internal tools for Acme's team"
 *
 * TODO: Once `/api/settings/public` returns `businessName`, swap the
 *       Vite env read for a runtime read so admins can rebrand without
 *       a redeploy. The title template stays identical.
 */

const env = (import.meta as unknown as { env: Record<string, string> }).env;

export const siteConfig = {
  /** Brand name shown after the page-specific title. */
  name: env.VITE_SITE_NAME ?? 'MyApp',

  /** Default <meta name="description"> when a page doesn't set its own. */
  description:
    env.VITE_SITE_DESCRIPTION ??
    'Admin console built with @bloomneo/bloom — users, settings, audit log, and more.',

  /**
   * Compose the <title> for a page. Called from `useSEO`.
   * Pass `undefined` for the homepage — returns the bare site name.
   *
   * @example
   *   formatTitle('Dashboard') // → 'Dashboard — MyApp'
   *   formatTitle()            // → 'MyApp'
   */
  formatTitle(pageTitle?: string): string {
    if (!pageTitle) return this.name;
    return `${pageTitle} — ${this.name}`;
  },
} as const;
