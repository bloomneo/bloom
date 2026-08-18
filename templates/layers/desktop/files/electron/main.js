/**
 * Electron main process.
 *
 * ── What this layer is, and is not ────────────────────────────────────────
 * It is a WRAPPER. It does not bring its own copy of the app: it serves the
 * same `src/web` in development and the same `dist/` in production, and it
 * spawns the same `src/api/server.ts`. That is what makes `--admin --desktop`
 * meaningful — the desktop build gets the admin console because there is one
 * source tree, not two kept in step by hand.
 */
import { app, BrowserWindow, ipcMain, shell, protocol } from 'electron';
import { readFile } from 'fs/promises';
import { extname } from 'path';
import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const isDev = !app.isPackaged;
const VITE_PORT = Number(process.env.VITE_PORT ?? 5173);

// Must be declared before `whenReady`, or the scheme is registered without
// privileges and the page is treated as untrusted.
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

let mainWindow = null;
let apiProcess = null;

/**
 * Start the bundled API.
 *
 * In development this runs the TypeScript entry through tsx; packaged, it runs
 * the compiled output that `npm run build:api` produced. Both are the SAME
 * server the web build talks to.
 */
function startApi() {
  /*
   * Packaged, the API is read from app.asar.UNPACKED.
   *
   * child_process cannot execute a file inside an asar — the archive is a
   * single file that only Electron's fs shims see through, and `spawn` uses
   * the real one. electron-builder.yml lists dist/api under `asarUnpack` so a
   * genuine file exists on disk here. Without that the app launches, the
   * window paints, and every request fails with ECONNREFUSED.
   */
  const entry = isDev
    ? join(__dirname, '..', 'src', 'api', 'server.ts')
    : join(app.getAppPath().replace('app.asar', 'app.asar.unpacked'), 'dist', 'api', 'server.js');

  const [cmd, args] = isDev ? ['npx', ['tsx', entry]] : [process.execPath, [entry]];

  apiProcess = spawn(cmd, args, {
    // ELECTRON_RUN_AS_NODE makes the packaged Electron binary behave as plain
    // Node for this child. Without it the API would boot a second Electron.
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  apiProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) console.error(`[desktop] API exited with code ${code}`);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    // Chrome is drawn by the OS, but the background must be set here: an
    // unset window paints white for a frame before the app mounts, which
    // flashes hard against a dark UI.
    backgroundColor: '#0b0b0f',
    show: false,
    webPreferences: {
      preload: join(__dirname, 'preload.cjs'),
      // Both required. contextIsolation off would give the page access to
      // Node; nodeIntegration on would do the same from the other direction.
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Painting only once the renderer is ready avoids a visible empty frame.
  mainWindow.once('ready-to-show', () => mainWindow.show());

  // External links belong in the user's browser, not in an app window with
  // no address bar — a window the user cannot verify the origin of.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev) {
    mainWindow.loadURL(`http://localhost:${VITE_PORT}`);
  } else {
    // Served over the custom `app://` scheme, NOT file://.
    //
    // Vite emits absolute asset paths (`/assets/index-abc.js`) because the same
    // build is deployed to a web server. Under file:// those resolve against
    // the filesystem root and 404, so the window opens blank with no error in
    // the app — only in devtools nobody has open.
    //
    // The alternative is `base: './'` in vite.config, but that would change
    // the WEB build for every project just because this layer might be
    // installed. A scheme handler keeps the change inside this layer.
    mainWindow.loadURL('app://index.html');
  }

  mainWindow.on('closed', () => { mainWindow = null; });
}

/*
 * `app://` maps onto the packaged dist/ directory.
 *
 * Registered as standard+secure so the page gets a normal web origin: fetch,
 * localStorage and history.pushState all behave, none of which they do on a
 * file:// page.
 */
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon',
};

function registerAppScheme() {
  // getAppPath() resolves to app.asar; readFile from fs/promises reads THROUGH
  // it, which is why this does not use net.fetch — that would need a real path.
  const root = join(app.getAppPath(), 'dist');

  protocol.handle('app', async (request) => {
    const path = decodeURIComponent(new URL(request.url).pathname);
    // Anything without an extension is a client-side route, not a file —
    // hand back the shell and let React Router resolve it.
    const rel = /\.[a-z0-9]+$/i.test(path) ? path : '/index.html';
    try {
      const body = await readFile(join(root, rel));
      return new Response(body, {
        headers: { 'content-type': MIME[extname(rel).toLowerCase()] ?? 'application/octet-stream' },
      });
    } catch {
      return new Response('Not found', { status: 404 });
    }
  });
}

app.whenReady().then(() => {
  if (!isDev) registerAppScheme();
  startApi();
  createWindow();

  // macOS keeps the process alive after the last window closes; clicking the
  // dock icon is expected to bring one back.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Kill the API with the app. Without this the port stays bound and the next
// launch fails with EADDRINUSE.
app.on('before-quit', () => {
  if (apiProcess && !apiProcess.killed) apiProcess.kill();
});

ipcMain.handle('ping', () => 'pong');
