/**
 * @file src/web/features/admin/index.ts
 *
 * Barrel export for the admin web feature. Pages under `./pages/` are
 * auto-discovered by the PageRouter (no explicit routes needed); the
 * shell component is the only thing other features consume directly.
 */

export { AdminShell } from './components/AdminShell';
