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

import React, { Component, Suspense, useEffect, useMemo, type ErrorInfo, type ReactNode } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

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

export interface PageRouterProps {
  /** Custom 404 element. Defaults to a branded theme-aware 404 page. */
  notFound?: ReactNode;
  /** Custom error boundary fallback element. */
  errorBoundary?: ReactNode;
  /** Called when any page throws. Useful for Sentry / observability. */
  onError?: (error: Error, info: ErrorInfo) => void;
  /** Loading fallback shown while a lazy route chunk is fetched. */
  fallback?: ReactNode;
  /** Disable code splitting and load every page eagerly. Default: false. */
  eager?: boolean;
}

export const PageRouter: React.FC<PageRouterProps> = ({
  notFound,
  errorBoundary,
  onError,
  fallback,
  eager = false,
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

  return (
    <RouteErrorBoundary fallback={errorElement} onError={onError}>
      <ScrollToTop />
      <Suspense fallback={lazyFallback}>
        <Routes>
          {routes.map(({ path, component: Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
          <Route path="*" element={notFoundElement} />
        </Routes>
      </Suspense>
    </RouteErrorBoundary>
  );
};
