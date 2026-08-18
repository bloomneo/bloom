/**
 * Native platform wiring, called once from main.tsx.
 *
 * Every call is guarded by `isNativePlatform()`, because this same file is
 * bundled into the browser build — the plugins are no-ops there at best and
 * throw at worst. There is one source tree; this is the seam.
 */
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

/**
 * @param isDark whether the app is currently in dark mode. The status bar is
 *   drawn by the OS and knows nothing about the page, so its text colour has
 *   to be set explicitly or it ends up dark-on-dark and invisible.
 */
export async function initNative(isDark: boolean) {
  if (!Capacitor.isNativePlatform()) return;

  /*
   * Style.Dark means DARK TEXT, not dark background — the naming is
   * counter-intuitive and gets this backwards constantly. Dark UI needs
   * Style.Light (light text).
   */
  await StatusBar.setStyle({ style: isDark ? Style.Light : Style.Dark }).catch(() => {});

  // The webview draws under the status bar so the header's own background
  // shows through; styles/mobile.css pads the header to compensate.
  await StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {});

  /*
   * Hidden here rather than on a timer. `launchAutoHide: false` in the config
   * means the splash stays until this runs, so the user never sees a flash of
   * empty webview between the splash disappearing and React painting.
   */
  await SplashScreen.hide().catch(() => {});

  /*
   * Android's hardware back button.
   *
   * Without a handler it closes the app from ANY screen, which is jarring
   * three levels into a flow. Going back through history and only exiting at
   * the root is what users expect.
   */
  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) window.history.back();
    else App.exitApp();
  });
}
