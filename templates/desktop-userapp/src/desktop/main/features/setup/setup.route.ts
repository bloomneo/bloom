/**
 * Setup API Route - First-run initialization endpoint
 * @file src/desktop/main/features/setup/setup.route.ts
 *
 * Handles database initialization during first-run setup.
 * This route is only accessible when the database doesn't exist yet.
 */

import { Router, Request, Response } from 'express';
import { setupDatabase, AdminAccountData } from '../../lib/setup-database.js';
import { db } from '../../lib/db-client.js';
import { needsSetup, markSetupComplete } from '../../lib/setup-marker.js';

const router = Router();

/**
 * POST /api/setup/initialize
 * Initialize database with admin account
 *
 * Body: { email, password, name }
 */
router.post('/initialize', async (req: Request, res: Response) => {
  try {
    console.log('🔧 [Setup] POST /initialize - Starting database initialization...');

    // Check if setup is already complete using file marker (fast check)
    console.log('🔧 [Setup] Step 1: Checking setup marker...');
    if (!needsSetup()) {
      console.log('⚠️  [Setup] Setup already complete - rejecting re-initialization');
      return res.status(400).json({
        success: false,
        error: 'Setup already completed. Setup can only be run once.'
      });
    }

    // Additional safety check: verify database doesn't have users
    console.log('🔧 [Setup] Step 2: Double-checking for existing users...');
    try {
      const existingUsers = db.user.count();
      console.log(`ℹ️  [Setup] Found ${existingUsers} existing users`);

      if (existingUsers > 0) {
        // List the existing users for debugging
        const users = db.user.findAll();
        console.log('⚠️  [Setup] Existing users in database:', users.map(u => ({ id: u.id, email: u.email, role: u.role, level: u.level })));
        console.log('⚠️  [Setup] Database already has users - rejecting initialization');
        return res.status(400).json({
          success: false,
          error: 'Database already initialized. Setup can only be run once.'
        });
      }
    } catch (countError: any) {
      console.log('ℹ️  [Setup] Database tables not found - will create during setup');
      // This is fine - tables will be created when we call getDatabase() in setupDatabase
    }

    // Validate request body
    console.log('🔧 [Setup] Step 3: Validating request body...');
    const { email, password, name, recoveryPin } = req.body;

    if (!email || !password || !name || !recoveryPin) {
      console.log('⚠️  [Setup] Validation failed: Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Email, password, name, and recovery PIN are required'
      });
    }

    if (password.length < 8) {
      console.log('⚠️  [Setup] Validation failed: Password too short');
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters'
      });
    }

    // Validate recovery PIN (4 digits)
    if (!/^\d{4}$/.test(recoveryPin)) {
      console.log('⚠️  [Setup] Validation failed: Invalid recovery PIN');
      return res.status(400).json({
        success: false,
        error: 'Recovery PIN must be exactly 4 digits'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('⚠️  [Setup] Validation failed: Invalid email format');
      return res.status(400).json({
        success: false,
        error: 'Invalid email address'
      });
    }

    console.log('✅ [Setup] Request body validated successfully');
    console.log(`ℹ️  [Setup] Admin email: ${email}, Name: ${name}`);

    // Initialize database with admin account
    console.log('🔧 [Setup] Step 4: Calling setupDatabase()...');
    const adminData: AdminAccountData = {
      email,
      password,
      name,
      recoveryPin
    };

    const result = await setupDatabase(adminData);

    if (!result.success) {
      console.error('❌ [Setup] setupDatabase() failed:', result.error);
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to initialize database'
      });
    }

    console.log('✅ [Setup] Database initialized successfully via setup wizard');

    // Mark setup as complete using file marker
    markSetupComplete();
    console.log('✅ [Setup] Setup marked as complete (marker file created)');

    return res.status(200).json({
      success: true,
      message: 'Database initialized successfully'
    });

  } catch (error: any) {
    console.error('❌ Setup initialization failed:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error during setup'
    });
  }
});

/**
 * GET /api/setup/status
 * Check if setup is needed using file marker (efficient, no DB calls)
 */
router.get('/status', async (_req: Request, res: Response) => {
  try {
    // Check file marker first (fast, no DB query needed)
    const setupNeeded = needsSetup();

    // Optionally get user count for debugging (only if setup is complete)
    let userCount = 0;
    if (!setupNeeded) {
      try {
        userCount = db.user.count();
      } catch (dbError) {
        // Ignore DB errors when checking count
        console.log('ℹ️  [Setup] Could not get user count:', (dbError as any).message);
      }
    }

    return res.status(200).json({
      success: true,
      needsSetup: setupNeeded,
      userCount
    });
  } catch (error: any) {
    console.log('ℹ️  [Setup] Error checking setup status:', error.message);
    // If there's any error, assume setup is needed
    return res.status(200).json({
      success: true,
      needsSetup: true,
      userCount: 0
    });
  }
});

export default router;
