/**
 * Database Setup - Initialize database and create admin user
 * @file src/desktop/main/lib/setup-database.ts
 *
 * Handles first-run database initialization with user-provided admin credentials.
 */

import { authClass } from '@voilajsx/appkit/auth';
import { db } from './db-client.js';

export interface AdminAccountData {
  email: string;
  password: string;
  name: string;
  recoveryPin: string;
}

/**
 * Initialize database and create admin account
 * @param adminData Admin account information from setup wizard
 */
export async function setupDatabase(adminData: AdminAccountData): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🔧 [setupDatabase] Starting admin user creation...');
    console.log(`ℹ️  [setupDatabase] Admin email: ${adminData.email}, Name: ${adminData.name}`);

    // Validate admin data
    console.log('🔧 [setupDatabase] Step 1: Validating admin data...');
    if (!adminData.email || !adminData.password || !adminData.name || !adminData.recoveryPin) {
      console.log('⚠️  [setupDatabase] Validation failed: Missing required fields');
      return {
        success: false,
        error: 'Email, password, name, and recovery PIN are required'
      };
    }

    if (adminData.password.length < 8) {
      console.log('⚠️  [setupDatabase] Validation failed: Password too short');
      return {
        success: false,
        error: 'Password must be at least 8 characters'
      };
    }

    if (!/^\d{4}$/.test(adminData.recoveryPin)) {
      console.log('⚠️  [setupDatabase] Validation failed: Invalid PIN format');
      return {
        success: false,
        error: 'Recovery PIN must be exactly 4 digits'
      };
    }

    console.log('✅ [setupDatabase] Admin data validated');

    // Get Auth instance
    console.log('🔧 [setupDatabase] Step 2: Getting auth instance...');
    const auth = authClass.get();
    console.log('✅ [setupDatabase] Auth instance obtained');

    // Check if database already has users
    console.log('🔧 [setupDatabase] Step 3: Checking for existing users...');
    try {
      const existingUsers = db.user.count();
      console.log(`ℹ️  [setupDatabase] Found ${existingUsers} existing users`);

      if (existingUsers > 0) {
        console.log('⚠️  [setupDatabase] Database already has users - aborting');
        return {
          success: false,
          error: 'Database already initialized with users'
        };
      }
    } catch (countError: any) {
      console.error('❌ [setupDatabase] Error checking user count:', countError);
      return {
        success: false,
        error: 'Failed to access database. Please ensure the database file exists and is accessible.'
      };
    }

    // Hash password and PIN
    console.log('🔧 [setupDatabase] Step 4: Hashing password and recovery PIN...');
    const hashedPassword = await auth.hashPassword(adminData.password);
    const hashedPin = await auth.hashPassword(adminData.recoveryPin);
    console.log('✅ [setupDatabase] Password and PIN hashed');

    // Create admin user with admin.system role
    console.log('🔧 [setupDatabase] Step 5: Creating admin.system user in database...');
    const adminUser = db.user.create({
      email: adminData.email,
      password: hashedPassword,
      name: adminData.name,
      role: 'admin',
      level: 'system',
      isVerified: true,
      isActive: true,
      recoveryPin: hashedPin
    });

    console.log('✅ [setupDatabase] Admin user created successfully:', adminUser.email);
    console.log('✅ [setupDatabase] Role: admin.system (full access)');
    console.log('✅ [setupDatabase] Setup complete!');

    return { success: true };

  } catch (error: any) {
    console.error('❌ Database setup failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to setup database'
    };
  }
}

/**
 * Create test users for development/testing
 * Only call this in development mode or if user explicitly requests it
 */
export async function createTestUsers(): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const auth = authClass.get();

    const testPassword = 'user123';
    const hashedPassword = await auth.hashPassword(testPassword);

    const testUsers = [
      { email: 'user1@example.com', name: 'Test User 1', password: hashedPassword },
      { email: 'user2@example.com', name: 'Test User 2', password: hashedPassword },
      { email: 'user3@example.com', name: 'Test User 3', password: hashedPassword },
    ];

    for (const userData of testUsers) {
      db.user.create(userData);
    }

    console.log(`✅ Created ${testUsers.length} test users`);

    return { success: true, count: testUsers.length };

  } catch (error: any) {
    console.error('❌ Failed to create test users:', error);
    return {
      success: false,
      error: error.message || 'Failed to create test users'
    };
  }
}
