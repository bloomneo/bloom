/**
 * Database Path Utility
 * @file src/desktop/main/lib/database-path.ts
 *
 * Determines the correct database path based on environment:
 * - Development: Project root ./database/dev.db
 * - Production: User data directory (writable location)
 *
 * Note: This runs in the backend server context (spawned Node.js process),
 * so it doesn't have access to Electron APIs. We use environment variables instead.
 */

import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

/**
 * Get the database directory path based on environment
 */
export function getDatabasePath(): string {
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    // Development: Use project root
    const projectRoot = process.cwd();
    const dbDir = join(projectRoot, 'database');

    // Ensure database directory exists
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true });
    }

    const dbPath = join(dbDir, 'dev.db');
    console.log('📁 [Database Path] Development mode');
    console.log(`📁 [Database Path] Location: ${dbPath}`);

    return dbPath;
  } else {
    // Production: Use environment variable set by Electron main process
    // The Electron main process should set ELECTRON_USER_DATA_PATH
    const userDataPath = process.env.ELECTRON_USER_DATA_PATH || process.cwd();
    const dbDir = join(userDataPath, 'database');

    // Ensure database directory exists
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true });
      console.log(`📁 [Database Path] Created database directory: ${dbDir}`);
    }

    const dbPath = join(dbDir, 'app.db');
    console.log('📁 [Database Path] Production mode');
    console.log(`📁 [Database Path] Location: ${dbPath}`);
    console.log(`📁 [Database Path] User data path: ${userDataPath}`);

    return dbPath;
  }
}
