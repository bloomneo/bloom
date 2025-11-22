/**
 * Setup Marker Utility
 * @file src/desktop/main/lib/setup-marker.ts
 *
 * File-based marker to track if first-run setup has been completed.
 * Much more efficient than checking the database for user count.
 */

import { join, dirname } from 'path';
import { existsSync, writeFileSync } from 'fs';
import { getDatabasePath } from './database-path.js';

const SETUP_MARKER_FILE = '.setup-complete';

/**
 * Get the path to the setup marker file
 * Located in the same directory as the database
 */
function getSetupMarkerPath(): string {
  const dbPath = getDatabasePath();
  const dbDir = dirname(dbPath);
  return join(dbDir, SETUP_MARKER_FILE);
}

/**
 * Check if setup has been completed
 * @returns true if setup is complete, false if setup is needed
 */
export function isSetupComplete(): boolean {
  const markerPath = getSetupMarkerPath();
  const exists = existsSync(markerPath);

  if (exists) {
    console.log('✅ [Setup Marker] Setup already complete (marker file exists)');
  } else {
    console.log('⚠️  [Setup Marker] Setup needed (no marker file found)');
  }

  return exists;
}

/**
 * Mark setup as complete by creating the marker file
 */
export function markSetupComplete(): void {
  const markerPath = getSetupMarkerPath();

  try {
    const timestamp = new Date().toISOString();
    const content = `Setup completed at: ${timestamp}\n`;

    writeFileSync(markerPath, content, 'utf-8');
    console.log('✅ [Setup Marker] Created setup marker file:', markerPath);
  } catch (error: any) {
    console.error('❌ [Setup Marker] Failed to create marker file:', error.message);
    throw error;
  }
}

/**
 * Check if setup is needed (inverse of isSetupComplete)
 * @returns true if setup is needed, false if already complete
 */
export function needsSetup(): boolean {
  return !isSetupComplete();
}
