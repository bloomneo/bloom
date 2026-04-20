/**
 * App entry point.
 * @file src/web/main.tsx
 *
 * Provider order (matches uikit AGENTS.md):
 *   ThemeProvider > ToastProvider (sibling) > ConfirmProvider (wraps)
 *
 * - ThemeProvider owns the theme / dark-mode state.
 * - ToastProvider mounts the Toaster; it's a self-closing sibling
 *   and does NOT wrap children. Call sites use `toast.success(...)`.
 * - ConfirmProvider wraps children because `useConfirm()` reads
 *   context. Admin pages use `confirm.destructive(...)` for
 *   typed-verify deletes.
 *
 * All three must each be mounted exactly once. Adding a duplicate
 * fires a dev-only warning and produces doubled behavior in prod.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfirmProvider, ThemeProvider, ToastProvider } from '@bloomneo/uikit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './styles/index.css';
import '@bloomneo/uikit/styles';

/**
 * Single QueryClient for the whole app. Defaults tuned for an admin
 * console:
 *   - staleTime: 30s — cached data re-uses for 30s before marking
 *     stale. Keeps dashboard-to-audit navigation instant without
 *     showing outdated numbers for long.
 *   - refetchOnWindowFocus: true — admins flipping between tabs
 *     get fresh data when they return.
 *   - retry: 1 — retry once on network wobble; don't hammer on real
 *     500s (the admin will see the error toast and can retry).
 *
 * TODO: Expose the QueryClient via a hook if you need programmatic
 * cache invalidation from outside React (e.g. after a websocket push).
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: true,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme="base" mode="light" forceConfig={true}>
      <QueryClientProvider client={queryClient}>
        {/* position="top-right" + richColors so stacked toasts don't
            smear. See uikit AGENTS.md for the provider-tree rule. */}
        <ToastProvider position="top-right" richColors />
        <ConfirmProvider>
          <App />
        </ConfirmProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);
