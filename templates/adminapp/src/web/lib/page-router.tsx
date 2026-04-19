/**
 * Page Router
 *
 * Auto-discovers routes using Vite glob imports and file-based conventions.
 *
 * v1.5.2 production-reliability fixes (originally drafted in 1.5.1 but
 * accidentally landed in @bloomneo/uikit's template instead of bloom's,
 * see CHANGELOG):
 *   • Code-splitting per route via React.lazy + Suspense (was eager).
 *     Pass <PageRouter eager /> to opt back into the eager behavior.
 *   • Default branded 404 page that uses theme tokens. The old debug
 *     message LEAKED THE FULL ROUTE MAP to end users — gone.
 *   • Default error boundary so a single page throwing no longer
 *     white-screens the whole app. Override with errorBoundary prop.
 *
 * Override props:
 *   <PageRouter
 *     notFound={<Custom404 />}             // override default 404
 *     errorBoundary={<CustomError />}      // override default error UI
 *     onError={(err, info) => report(err)} // hook into errors
 *     fallback={<MySpinner />}             // override lazy loading fallback
 *     eager                                // disable code splitting
 *   />
 */

import React, { Component, Suspense, useEffect, useMemo, type ComponentType, type ErrorInfo, type ReactNode } from 'react';
import { Outlet, Routes, Route, useLocation } from 'react-router-dom';

/* -------------------------------------------------------------------------- */
/* Route discovery                                                            */
/* -------------------------------------------------------------------------- */

// Eager glob — used when <PageRouter eager />
const eagerPageFiles = import.meta.glob('../features/*/pages/**/*.{tsx,jsx}', { eager: true });

// Lazy glob — default. Each match returns a `() => import(...)` factory.
const lazyPageFiles = import.meta.glob('../features/*/pages/**/*.{tsx,jsx}');

type LoadedModule = { default: React.ComponentType<unknown> };

interface DiscoveredRoute {
  path: string;
  component: React.ComponentType<unknown>;
}

function pathFromFile(filePath: string): string | null {
  const match = filePath.match(/\.\.\/features\/([^/]+)\/pages\/(.+)\.tsx?$/);
  if (!match) return null;

  const [, feature, nestedPath] = match;
  const pathSegments = nestedPath.split('/');

  const segmentToRoute = (segment: string) => {
    if (segment.startsWith('[...') && segment.endsWith(']')) return '*';
    if (segment.startsWith('[') && segment.endsWith(']')) return ':' + segment.slice(1, -1);
    return segment;
  };

  if (feature === 'main') {
    if (pathSegments.length === 1 && pathSegments[0] === 'index') return '/';
    return '/' + pathSegments
      .map(s => s === 'index' ? '' : s.toLowerCase())
      .filter(Boolean)
      .map(segmentToRoute)
      .join('/');
  }

  const nestedRoute = pathSegments
    .map(s => s === 'index' ? '' : s.toLowerCase())
    .filter(Boolean)
    .map(segmentToRoute)
    .join('/');

  if (pathSegments.length === 1 && pathSegments[0] === 'index') return `/${feature}`;
  return `/${feature}${nestedRoute ? '/' + nestedRoute : ''}`;
}

function sortRoutes(routes: DiscoveredRoute[]): DiscoveredRoute[] {
  return routes.sort((a, b) => {
    if (a.path === '/') return 1;
    if (b.path === '/') return -1;
    return b.path.length - a.path.length;
  });
}

function generateEagerRoutes(): DiscoveredRoute[] {
  const routes: DiscoveredRoute[] = [];
  Object.entries(eagerPageFiles).forEach(([filePath, mod]) => {
    const path = pathFromFile(filePath);
    if (!path) return;
    routes.push({ path, component: (mod as LoadedModule).default });
  });
  return sortRoutes(routes);
}

function generateLazyRoutes(): DiscoveredRoute[] {
  const routes: DiscoveredRoute[] = [];
  Object.entries(lazyPageFiles).forEach(([filePath, importer]) => {
    const path = pathFromFile(filePath);
    if (!path) return;
    routes.push({
      path,
      component: React.lazy(importer as () => Promise<LoadedModule>),
    });
  });
  return sortRoutes(routes);
}

/* -------------------------------------------------------------------------- */
/* Default 404                                                                */
/* -------------------------------------------------------------------------- */

const DefaultNotFound: React.FC = () => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
    <p className="text-sm font-medium text-muted-foreground">404</p>
    <h1 className="text-3xl font-semibold tracking-tight text-foreground">Page not found</h1>
    <p className="max-w-md text-sm text-muted-foreground">
      The page you're looking for doesn't exist or has moved.
    </p>
    <a
      href="/"
      className="mt-2 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      Back to home
    </a>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Default error boundary                                                     */
/* -------------------------------------------------------------------------- */

interface ErrorBoundaryProps {
  fallback: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class RouteErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[PageRouter] Page threw:', error, info);
    }
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

const DefaultErrorElement: React.FC = () => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
    <p className="text-sm font-medium text-destructive">Something went wrong</p>
    <h1 className="text-3xl font-semibold tracking-tight text-foreground">An error occurred</h1>
    <p className="max-w-md text-sm text-muted-foreground">
      Please refresh the page. If the problem persists, contact support.
    </p>
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="mt-2 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      Reload page
    </button>
  </div>
);

const DefaultLazyFallback: React.FC = () => (
  <div className="flex min-h-[30vh] items-center justify-center" aria-label="Loading">
    <div className="size-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
  </div>
);

/* -------------------------------------------------------------------------- */
/* ScrollToTop                                                                */
/* -------------------------------------------------------------------------- */

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

/* -------------------------------------------------------------------------- */
/* PageRouter                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * A layout group — pages whose path matches `match` render inside
 * `Layout`. The layout is mounted once and stays mounted as the user
 * navigates between matching routes; only the `<Outlet />` inside the
 * layout swaps. This eliminates the "header flashes on every navigation"
 * problem that comes from each page wrapping itself in a shell.
 *
 * Layouts are evaluated in array order; the FIRST match wins. Keep
 * more-specific matchers (e.g. `/admin`) before broader ones (e.g. `/`).
 *
 * The layout itself MUST render <Outlet /> somewhere inside its chrome
 * (commonly wrapped in a local <Suspense> so lazy chunk loads only
 * swap the content area, not the whole page).
 */
export interface RouteLayout {
  /** Which discovered paths belong to this layout. */
  match: (path: string) => boolean;
  /** Component that renders <Outlet /> for matching child routes. */
  Layout: ComponentType;
}

export interface PageRouterProps {
  /** Custom 404 element. Defaults to a branded theme-aware 404 page. */
  notFound?: ReactNode;
  /** Custom error boundary fallback element. */
  errorBoundary?: ReactNode;
  /** Called when any page throws. Useful for Sentry / observability. */
  onError?: (error: Error, info: ErrorInfo) => void;
  /** Loading fallback shown while a lazy route chunk is fetched.
   *  Only used for routes that don't belong to a layout group — a layout
   *  is expected to manage its own Suspense boundary around <Outlet />. */
  fallback?: ReactNode;
  /** Disable code splitting and load every page eagerly. Default: false. */
  eager?: boolean;
  /** Layout groups. Pages whose path matches a layout's `match` render
   *  as nested routes inside that layout, sharing its chrome across
   *  navigations. Non-matching pages render bare. */
  layouts?: RouteLayout[];
}

export const PageRouter: React.FC<PageRouterProps> = ({
  notFound,
  errorBoundary,
  onError,
  fallback,
  eager = false,
  layouts = [],
}) => {
  // Memoize so routes aren't regenerated on every render. The discovered set
  // is static (it's resolved at build time by Vite's glob), so empty deps are safe.
  const routes = useMemo(
    () => (eager ? generateEagerRoutes() : generateLazyRoutes()),
    [eager]
  );

  // Dev-only one-shot log so devs can see what got discovered, without
  // re-logging on every render.
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('🚀 Auto-discovered routes:', routes.map((r) => r.path));
    }
  }, [routes]);

  const errorElement = errorBoundary ?? <DefaultErrorElement />;
  const notFoundElement = notFound ?? <DefaultNotFound />;
  const lazyFallback = fallback ?? <DefaultLazyFallback />;

  // Bucket each discovered route by its layout (or "bare" for pages with
  // no matching layout). First-match wins so callers can put the most
  // specific matcher first.
  const { grouped, bare } = useMemo(() => {
    const bucketed = new Map<RouteLayout, DiscoveredRoute[]>();
    const unlayered: DiscoveredRoute[] = [];
    for (const route of routes) {
      const layout = layouts.find((l) => l.match(route.path));
      if (layout) {
        const list = bucketed.get(layout) ?? [];
        list.push(route);
        bucketed.set(layout, list);
      } else {
        unlayered.push(route);
      }
    }
    return { grouped: bucketed, bare: unlayered };
  }, [routes, layouts]);

  return (
    <RouteErrorBoundary fallback={errorElement} onError={onError}>
      <ScrollToTop />
      <Routes>
        {/* Grouped routes — each layout renders <Outlet /> for its
            children; the layout is expected to own its own Suspense
            boundary (see e.g. AdminShell + MarketingLayout). The
            layout stays mounted while child routes swap. */}
        {Array.from(grouped.entries()).map(([layout, layoutRoutes], i) => (
          <Route key={`layout-${i}`} element={<layout.Layout />}>
            {layoutRoutes.map(({ path, component: Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
          </Route>
        ))}
        {/* Bare routes — no shared layout. Kept inside one Suspense
            so lazy loads work. */}
        {bare.length > 0 && (
          <Route
            element={
              <Suspense fallback={lazyFallback}>
                <BareOutlet />
              </Suspense>
            }
          >
            {bare.map(({ path, component: Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
          </Route>
        )}
        <Route path="*" element={notFoundElement} />
      </Routes>
    </RouteErrorBoundary>
  );
};

// Tiny wrapper so the bare-routes Suspense boundary can render
// <Outlet /> declaratively in the Routes tree above.
function BareOutlet() {
  return <Outlet />;
}
