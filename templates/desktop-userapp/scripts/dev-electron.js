#!/usr/bin/env node

import { spawn } from 'child_process';
import { existsSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';

const PORT_FILE = '.vite-port';
const MAX_WAIT = 30000; // 30 seconds
const CHECK_INTERVAL = 100; // Check every 100ms

// Clean up old port file
if (existsSync(PORT_FILE)) {
  unlinkSync(PORT_FILE);
}

async function waitForPortFile() {
  const startTime = Date.now();
  console.log('⏳ Waiting for Vite to start...');

  while (Date.now() - startTime < MAX_WAIT) {
    if (existsSync(PORT_FILE)) {
      const port = readFileSync(PORT_FILE, 'utf-8').trim();
      console.log(`✅ Vite ready on port ${port}`);
      return port;
    }
    await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
  }

  throw new Error('Timeout: Vite did not start within 30 seconds');
}

async function main() {
  try {
    const port = await waitForPortFile();

    console.log(`🚀 Starting Electron...`);

    const electron = spawn('electron', ['.'], {
      stdio: 'inherit',
      env: { ...process.env, VITE_PORT: port }
    });

    electron.on('exit', (code) => {
      if (existsSync(PORT_FILE)) unlinkSync(PORT_FILE);
      process.exit(code || 0);
    });

  } catch (err) {
    console.error('❌', err.message);
    process.exit(1);
  }
}

main();
