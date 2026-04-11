/**
 * Test production build locally
 * This runs Electron with the built files to simulate the packaged app
 */

import { spawn } from 'child_process';

// Force production mode
process.env.NODE_ENV = 'production';

console.log('🚀 Testing production build...');
console.log('📦 NODE_ENV:', process.env.NODE_ENV);

// Run electron with production environment
const electron = spawn('npx', ['electron', '.'], {
  env: {
    ...process.env,
    NODE_ENV: 'production',
  },
  stdio: 'inherit',
  shell: true
});

electron.on('error', (err) => {
  console.error('❌ Failed to start Electron:', err);
  process.exit(1);
});

electron.on('exit', (code) => {
  console.log(`Electron exited with code ${code}`);
  process.exit(code);
});
