/**
 * Types for the preload bridge.
 *
 * Optional on purpose: the same `src/web` is built for the browser, where
 * `window.electronAPI` is undefined. Typing it as always-present would let
 * `window.electronAPI.invoke(...)` compile and then throw in the browser build.
 * Guard with `if (window.electronAPI)` — the type makes you.
 */
export {};

declare global {
  interface Window {
    electronAPI?: {
      isElectron: true;
      invoke(channel: 'ping', data?: unknown): Promise<unknown>;
    };
  }
}
