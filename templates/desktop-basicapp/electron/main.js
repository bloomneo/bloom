import 'dotenv/config';
import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Suppress Electron security warnings in development
// The CSP warning about unsafe-eval is expected because Vite HMR requires it
// This warning does not appear in production builds
if (process.env.NODE_ENV === 'development') {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
}

let mainWindow = null;
let backendProcess = null;

// Wait for backend to be healthy
async function waitForBackend(maxRetries = 10) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1000);

      const response = await fetch('http://localhost:3000/health', {
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (response.ok) {
        console.log('✅ Backend health check passed');
        return true;
      }
    } catch (err) {
      // Retry
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error('Backend failed to start - health check timeout');
}

// Start Express backend server
async function startBackend(logToRenderer) {
  return new Promise((resolve, reject) => {
    const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

    if (isDev) {
      // Development: Use tsx to run TypeScript directly
      const serverPath = join(__dirname, '../src/desktop/main/server.ts');
      logToRenderer('Starting backend in development mode: ' + serverPath);

      backendProcess = spawn('npx', ['tsx', serverPath], {
        env: { ...process.env, NODE_ENV: 'development' },
        stdio: ['ignore', 'pipe', 'pipe'], // Capture stdout and stderr
        shell: true
      });

      // Log backend output
      backendProcess.stdout.on('data', (data) => {
        const message = data.toString().trim();
        console.log('[Backend]', message);
        logToRenderer('[Backend] ' + message);
      });

      backendProcess.stderr.on('data', (data) => {
        const message = data.toString().trim();
        console.error('[Backend Error]', message);
        logToRenderer('[Backend Error] ' + message);
      });

      backendProcess.on('error', (err) => {
        logToRenderer('❌ Failed to start backend process: ' + err.message);
        reject(err);
      });

      backendProcess.on('exit', (code, signal) => {
        if (code !== 0 && code !== null) {
          logToRenderer(`⚠️ Backend process exited with code ${code}`);
        }
      });

      // Wait a bit for the process to start, then check health
      setTimeout(() => {
        waitForBackend()
          .then(() => resolve())
          .catch(reject);
      }, 2000); // Give it 2 seconds to start
    } else {
      // Production: Import and run backend directly in main process
      const resourcesPath = process.resourcesPath || join(__dirname, '..');
      // Load from app directory (asar disabled)
      const serverPath = join(resourcesPath, 'app', 'dist', 'main', 'server.js');

      logToRenderer('🔍 Starting backend in production mode');
      logToRenderer('Server path: ' + serverPath);
      logToRenderer('Resources path: ' + resourcesPath);
      logToRenderer('🚀 Importing backend server directly (no subprocess)');

      try {
        // Import the server module directly
        import(serverPath)
          .then(() => {
            logToRenderer('✅ Backend server imported and started');
            // Wait for backend to be healthy
            waitForBackend()
              .then(() => resolve())
              .catch(reject);
          })
          .catch((err) => {
            logToRenderer('❌ Failed to import backend: ' + err.message);
            logToRenderer('Error stack: ' + (err.stack || 'No stack trace'));
            reject(err);
          });
      } catch (err) {
        logToRenderer('❌ Failed to start backend: ' + err.message);
        reject(err);
      }
    }
  });
}

function createApplicationMenu() {
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  const template = [
    {
      label: '{{PROJECT_NAME}}',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: isDev ? [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ] : [
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    icon: join(__dirname, '../public/app-512.png'), // App icon (high-res for Retina displays)
    webPreferences: {
      preload: join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      // Security: Enable web security features
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });

  // Set Content Security Policy for security
  // Note: Vite HMR requires 'unsafe-eval' in dev, which triggers a warning
  // This is expected and the warning disappears in production builds
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const csp = isDev
      ? // Development: Allow unsafe-eval for Vite HMR
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "font-src 'self' data:; " +
        "connect-src 'self' http://localhost:* ws://localhost:*; " +
        "frame-src 'none';"
      : // Production: Allow file:// protocol and localhost backend
        "default-src 'self' file:; " +
        "script-src 'self' 'unsafe-inline'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https: file:; " +
        "font-src 'self' data: file:; " +
        "connect-src 'self' http://localhost:3000; " +
        "frame-src 'none';";

    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp]
      }
    });
  });

  // Load the Vite dev server in development or built files in production
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    const vitePort = process.env.VITE_PORT || '5183';
    mainWindow.loadURL(`http://localhost:${vitePort}`);
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    // Load from app directory (asar disabled)
    const resourcesPath = process.resourcesPath || join(__dirname, '..');
    const htmlPath = join(resourcesPath, 'app', 'dist', 'index.html');
    console.log('Loading frontend from:', htmlPath);

    // Use loadURL with file protocol
    const fileUrl = `file://${htmlPath}`;
    console.log('File URL:', fileUrl);
    mainWindow.loadURL(fileUrl);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Basic IPC Handlers
ipcMain.handle('ping', async () => {
  return 'pong';
});

app.whenReady().then(async () => {
  // Set up application menu (hides DevTools in production)
  createApplicationMenu();

  try {
    // Start backend FIRST before creating window
    console.log('🚀 Starting backend server...');

    // Simple logger that logs to console (window doesn't exist yet)
    const consoleLogger = (message) => {
      console.log(message);
    };

    await startBackend(consoleLogger);
    console.log('✅ Backend server started and healthy');

    // NOW create the window after backend is ready
    createWindow();

    // Log success to renderer after window is created
    if (mainWindow && mainWindow.webContents) {
      // Wait for the page to load before logging
      mainWindow.webContents.once('did-finish-load', () => {
        mainWindow.webContents.executeJavaScript(`console.log(${JSON.stringify('✅ Backend already running and healthy')});`);
      });
    }
  } catch (err) {
    console.error('❌ Failed to start backend:', err);
    console.error('Error details:', err.message);

    // Even if backend fails, create the window
    createWindow();

    // Show error in renderer console after window loads
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.once('did-finish-load', () => {
        const errorMessage = err.message || 'Unknown error';
        mainWindow.webContents.executeJavaScript(`
          console.error('❌ Backend failed to start:', ${JSON.stringify(errorMessage)});
          alert('Backend failed to start: ' + ${JSON.stringify(errorMessage)} + '\\n\\nThe app will run in frontend-only mode.');
        `);
      });
    }
  }
});

app.on('window-all-closed', () => {
  // Kill backend process when app closes
  if (backendProcess) {
    backendProcess.kill();
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('quit', () => {
  // Ensure backend is killed on quit
  if (backendProcess) {
    backendProcess.kill();
  }
});
