/**
 * Page Router
 * Auto-discovers routes using Vite glob imports and file-based conventions
 */

import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// Auto-discover all page files using Vite glob import (including nested) - eager loading
const pageFiles = import.meta.glob('../features/*/pages/**/*.{tsx,jsx}', { eager: true });

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

  console.log('🚀 Auto-discovered routes:');
  routes.forEach(route => console.log(`  ${route.path}`));

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
  const routes = generateRoutes();

  return (
    <>
      <ScrollToTop />
      <Routes>
        {routes.map(({ path, component: Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
        {/* Fallback for 404 */}
        <Route path="*" element={
          <div className="text-center py-12 text-muted-foreground">
            <h1 className="text-4xl font-bold mb-4">404</h1>
            <p>Page not found - Route not discovered</p>
            <div className="mt-4 text-sm">
              Available routes: {routes.map(r => r.path).join(', ')}
            </div>
          </div>
        } />
      </Routes>
    </>
  );
};