/**
 * First Run Detection - Check if app is running for the first time
 * @file src/desktop/main/lib/first-run.ts
 *
 * Detects if the database exists to determine if this is the first run.
 * Used to show setup wizard for initial admin account creation.
 */

import { existsSync } from 'fs';
import { join } from 'path';
import { app } from 'electron';

/**
 * Check if this is the first time the app is running
 * @returns true if database doesn't exist (first run)
 */
export function isFirstRun(): boolean {
  // In development, check database folder
  if (process.env.NODE_ENV === 'development') {
    const devDbPath = join(process.cwd(), 'database', 'dev.db');
    return !existsSync(devDbPath);
  }

  // In production, check app data folder
  const userDataPath = app.getPath('userData');
  const prodDbPath = join(userDataPath, 'database', 'app.db');
  return !existsSync(prodDbPath);
}

/**
 * Get the database path based on environment
 */
export function getDatabasePath(): string {
  if (process.env.NODE_ENV === 'development') {
    return join(process.cwd(), 'database', 'dev.db');
  }

  const userDataPath = app.getPath('userData');
  return join(userDataPath, 'database', 'app.db');
}

/**
 * Get the database URL (file:// format)
 */
export function getDatabaseUrl(): string {
  return `file:${getDatabasePath()}`;
}
