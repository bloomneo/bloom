#!/usr/bin/env node

import { createServer } from 'vite';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Port range for desktop apps to avoid conflicts
const START_PORT = 5183;
const END_PORT = 5190;

async function startVite() {
  for (let port = START_PORT; port <= END_PORT; port++) {
    try {
      const { createServer } = await import('vite');
      const config = await import('../vite.config.ts');

      const server = await createServer({
        ...config.default,
        server: {
          ...config.default.server,
          port,
          strictPort: false, // Try next port if this one fails
        }
      });

      await server.listen();

      const actualPort = server.config.server.port;
      console.log(`✅ Vite started on port ${actualPort}`);

      // Write port to file for Electron to read
      const portFile = join(__dirname, '../.vite-port');
      writeFileSync(portFile, actualPort.toString());

      server.printUrls();

      // Handle graceful shutdown
      process.on('SIGTERM', async () => {
        await server.close();
        process.exit(0);
      });

      return;
    } catch (err) {
      if (port === END_PORT) {
        console.error(`❌ All ports ${START_PORT}-${END_PORT} are busy. Please free up a port.`);
        process.exit(1);
      }
      // Try next port
      continue;
    }
  }
}

startVite().catch(err => {
  console.error('Failed to start Vite:', err);
  process.exit(1);
});
