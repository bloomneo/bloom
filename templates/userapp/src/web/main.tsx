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
 *   context.
 *
 * All three must each be mounted exactly once.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfirmProvider, ThemeProvider, ToastProvider } from '@bloomneo/uikit';
import App from './App';
import './styles/index.css';
import '@bloomneo/uikit/styles';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme="base" mode="light" forceConfig={true}>
      <ToastProvider />
      <ConfirmProvider>
        <App />
      </ConfirmProvider>
    </ThemeProvider>
  </React.StrictMode>
);
