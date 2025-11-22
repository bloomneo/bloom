/**
 * Page Router
 * Auto-discovers routes using Vite glob imports and file-based conventions
 */

import React, { useEffect, useMemo, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// Auto-discover all page files using Vite glob import (including nested) - eager loading
// Exclude not-found page since it's imported separately as lazy component
const pageFiles = import.meta.glob(
  ['../features/*/pages/**/*.{tsx,jsx}', '!../features/*/pages/**/not-found.{tsx,jsx}'],
  { eager: true }
);

// Import 404 page
const NotFoundPage = lazy(() => import('../features/main/pages/not-found'));

function generateRoutes() {
  const routes: Array<{ path: string; component: React.ComponentType<any> }> = [];

  // Process each discovered page file
  Object.entries(pageFiles).forEach(([filePath, module]) => {
    // Extract feature and nested path from file path
    // Examples:
    // ../features/main/pages/index.tsx -> feature: main, nested: ['index']
    // ../features/gallery/pages/new/cat.tsx -> feature: gallery, nested: ['new', 'cat']
    // ../features/gallery/pages/[animal].tsx -> feature: gallery, nested: ['[animal]']
    // ../features/blog/pages/[...slug].tsx -> feature: blog, nested: ['[...slug]']
    const match = filePath.match(/\.\.\/features\/([^/]+)\/pages\/(.+)\.tsx?$/);

    if (!match) return;

    const [, feature, nestedPath] = match;
    const pathSegments = nestedPath.split('/');

    // Convention-based routing logic
    let routePath: string;

    if (feature === 'main') {
      // Main feature gets priority routes
      if (pathSegments.length === 1 && pathSegments[0] === 'index') {
        routePath = '/';
      } else {
        // Convert nested path: about/details -> /about/details
        routePath = '/' + pathSegments
          .map(segment => segment === 'index' ? '' : segment.toLowerCase())
          .filter(Boolean)
          .map(segment => {
            // Handle catch-all routes: [...slug] -> *
            if (segment.startsWith('[...') && segment.endsWith(']')) {
              return '*';
            }
            // Handle dynamic params: [animal] -> :animal
            if (segment.startsWith('[') && segment.endsWith(']')) {
              return ':' + segment.slice(1, -1);
            }
            return segment;
          })
          .join('/');
      }
    } else {
      // Other features: /feature/nested/path
      const nestedRoute = pathSegments
        .map(segment => segment === 'index' ? '' : segment.toLowerCase())
        .filter(Boolean)
        .map(segment => {
          // Handle catch-all routes: [...slug] -> *
          if (segment.startsWith('[...') && segment.endsWith(']')) {
            return '*';
          }
          // Handle dynamic params: [animal] -> :animal
          if (segment.startsWith('[') && segment.endsWith(']')) {
            return ':' + segment.slice(1, -1);
          }
          return segment;
        })
        .join('/');

      if (pathSegments.length === 1 && pathSegments[0] === 'index') {
        routePath = `/${feature}`;
      } else {
        routePath = `/${feature}${nestedRoute ? '/' + nestedRoute : ''}`;
      }
    }

    routes.push({
      path: routePath,
      component: (module as any).default
    });
  });

  // Sort routes so more specific ones come first
  routes.sort((a, b) => {
    // Root route should be last for proper matching
    if (a.path === '/') return 1;
    if (b.path === '/') return -1;
    return b.path.length - a.path.length;
  });

  return routes;
}

// Component to handle scroll to top on route change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export const PageRouter: React.FC = () => {
  // Memoize routes to prevent regeneration on every render
  const routes = useMemo(() => {
    const discoveredRoutes = generateRoutes();

    // Only log in development and on initial mount
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Auto-discovered routes:', discoveredRoutes.map(r => r.path));
    }

    return discoveredRoutes;
  }, []); // Empty deps - routes are static

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <Routes>
          {routes.map(({ path, component: Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
          {/* Fallback for 404 - Custom NotFound page with back button */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
};