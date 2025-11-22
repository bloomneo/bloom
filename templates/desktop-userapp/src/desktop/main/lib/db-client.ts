/**
 * SQLite Database Client using better-sqlite3
 * @file src/desktop/main/lib/db-client.ts
 *
 * Simple, reliable SQLite database for desktop apps
 */

import Database from 'better-sqlite3';
import { getDatabasePath } from './database-path.js';

let dbInstance: Database.Database | null = null;

/**
 * Database schema - Full user model matching Prisma schema
 */
const SCHEMA = `
CREATE TABLE IF NOT EXISTS User (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  level TEXT NOT NULL DEFAULT 'basic',
  tenantId TEXT,
  isVerified INTEGER NOT NULL DEFAULT 0,
  isActive INTEGER NOT NULL DEFAULT 1,
  lastLogin INTEGER,
  resetToken TEXT,
  resetTokenExpiry INTEGER,
  verificationToken TEXT,
  verificationExpiry INTEGER,
  recoveryPin TEXT,
  createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  updatedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

CREATE INDEX IF NOT EXISTS idx_user_email ON User(email);
CREATE INDEX IF NOT EXISTS idx_user_role ON User(role);
CREATE INDEX IF NOT EXISTS idx_user_tenant ON User(tenantId);

CREATE TABLE IF NOT EXISTS Settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'string',
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  updatedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  updatedBy INTEGER,
  FOREIGN KEY (updatedBy) REFERENCES User(id)
);

CREATE INDEX IF NOT EXISTS idx_settings_key ON Settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON Settings(category);
`;

/**
 * Get database instance (singleton)
 */
export function getDatabase(): Database.Database {
  if (!dbInstance) {
    try {
      console.log('🔧 [Database] Creating better-sqlite3 instance...');
      console.log('🔧 [Database] Environment:', {
        NODE_ENV: process.env.NODE_ENV,
        ELECTRON_USER_DATA_PATH: process.env.ELECTRON_USER_DATA_PATH,
        cwd: process.cwd()
      });

      const dbPath = getDatabasePath();
      console.log('🔧 [Database] Database path:', dbPath);

      dbInstance = new Database(dbPath);
      console.log('✅ [Database] SQLite database opened');

      // Enable WAL mode for better concurrency
      dbInstance.pragma('journal_mode = WAL');
      console.log('✅ [Database] WAL mode enabled');

      // Initialize schema
      dbInstance.exec(SCHEMA);
      console.log('✅ [Database] Schema initialized');

      console.log('✅ [Database] Database initialized successfully');
    } catch (error: any) {
      console.error('❌ [Database] Failed to initialize database:', error);
      console.error('❌ [Database] Error stack:', error.stack);
      throw error;
    }
  }

  return dbInstance;
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    console.log('👋 [Database] Database closed');
  }
}

/**
 * User model interface - matches Prisma schema
 */
export interface User {
  id: number;
  email: string;
  password: string;
  name: string | null;
  phone: string | null;
  role: string;
  level: string;
  tenantId: string | null;
  isVerified: boolean;
  isActive: boolean;
  lastLogin: Date | null;
  resetToken: string | null;
  resetTokenExpiry: Date | null;
  verificationToken: string | null;
  verificationExpiry: Date | null;
  recoveryPin: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Database operations
 */
export const db = {
  user: {
    /**
     * Count users
     */
    count(): number {
      const db = getDatabase();
      const result = db.prepare('SELECT COUNT(*) as count FROM User').get() as { count: number };
      return result.count;
    },

    /**
     * Find user by email
     */
    findByEmail(email: string): User | null {
      const db = getDatabase();
      const row = db.prepare('SELECT * FROM User WHERE email = ?').get(email) as any;
      if (!row) return null;

      return {
        ...row,
        isVerified: Boolean(row.isVerified),
        isActive: Boolean(row.isActive),
        lastLogin: row.lastLogin ? new Date(row.lastLogin) : null,
        resetTokenExpiry: row.resetTokenExpiry ? new Date(row.resetTokenExpiry) : null,
        verificationExpiry: row.verificationExpiry ? new Date(row.verificationExpiry) : null,
        recoveryPin: row.recoveryPin || null,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt)
      };
    },

    /**
     * Find user by ID
     */
    findById(id: number): User | null {
      const db = getDatabase();
      const row = db.prepare('SELECT * FROM User WHERE id = ?').get(id) as any;
      if (!row) return null;

      return {
        ...row,
        isVerified: Boolean(row.isVerified),
        isActive: Boolean(row.isActive),
        lastLogin: row.lastLogin ? new Date(row.lastLogin) : null,
        resetTokenExpiry: row.resetTokenExpiry ? new Date(row.resetTokenExpiry) : null,
        verificationExpiry: row.verificationExpiry ? new Date(row.verificationExpiry) : null,
        recoveryPin: row.recoveryPin || null,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt)
      };
    },

    /**
     * Create user
     */
    create(data: {
      email: string;
      name?: string | null;
      password: string;
      phone?: string | null;
      role?: string;
      level?: string;
      tenantId?: string | null;
      isVerified?: boolean;
      isActive?: boolean;
      recoveryPin?: string | null;
    }): User {
      const db = getDatabase();
      const now = Date.now();

      const stmt = db.prepare(`
        INSERT INTO User (
          email, name, password, phone, role, level, tenantId,
          isVerified, isActive, recoveryPin, createdAt, updatedAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        data.email,
        data.name || null,
        data.password,
        data.phone || null,
        data.role || 'user',
        data.level || 'basic',
        data.tenantId || null,
        data.isVerified ? 1 : 0,
        data.isActive !== false ? 1 : 0,
        data.recoveryPin || null,
        now,
        now
      );

      return {
        id: result.lastInsertRowid as number,
        email: data.email,
        name: data.name || null,
        password: data.password,
        phone: data.phone || null,
        role: data.role || 'user',
        level: data.level || 'basic',
        tenantId: data.tenantId || null,
        isVerified: data.isVerified || false,
        isActive: data.isActive !== false,
        lastLogin: null,
        resetToken: null,
        resetTokenExpiry: null,
        verificationToken: null,
        verificationExpiry: null,
        recoveryPin: data.recoveryPin || null,
        createdAt: new Date(now),
        updatedAt: new Date(now)
      };
    },

    /**
     * Update user
     */
    update(id: number, data: Partial<{
      email: string;
      name: string | null;
      password: string;
      phone: string | null;
      role: string;
      level: string;
      tenantId: string | null;
      isVerified: boolean;
      isActive: boolean;
      lastLogin: Date | null;
      resetToken: string | null;
      resetTokenExpiry: Date | null;
      verificationToken: string | null;
      verificationExpiry: Date | null;
    }>): User | null {
      const db = getDatabase();
      const now = Date.now();

      const fields: string[] = [];
      const values: any[] = [];

      if (data.email !== undefined) {
        fields.push('email = ?');
        values.push(data.email);
      }
      if (data.name !== undefined) {
        fields.push('name = ?');
        values.push(data.name);
      }
      if (data.password !== undefined) {
        fields.push('password = ?');
        values.push(data.password);
      }
      if (data.phone !== undefined) {
        fields.push('phone = ?');
        values.push(data.phone);
      }
      if (data.role !== undefined) {
        fields.push('role = ?');
        values.push(data.role);
      }
      if (data.level !== undefined) {
        fields.push('level = ?');
        values.push(data.level);
      }
      if (data.tenantId !== undefined) {
        fields.push('tenantId = ?');
        values.push(data.tenantId);
      }
      if (data.isVerified !== undefined) {
        fields.push('isVerified = ?');
        values.push(data.isVerified ? 1 : 0);
      }
      if (data.isActive !== undefined) {
        fields.push('isActive = ?');
        values.push(data.isActive ? 1 : 0);
      }
      if (data.lastLogin !== undefined) {
        fields.push('lastLogin = ?');
        values.push(data.lastLogin ? data.lastLogin.getTime() : null);
      }
      if (data.resetToken !== undefined) {
        fields.push('resetToken = ?');
        values.push(data.resetToken);
      }
      if (data.resetTokenExpiry !== undefined) {
        fields.push('resetTokenExpiry = ?');
        values.push(data.resetTokenExpiry ? data.resetTokenExpiry.getTime() : null);
      }
      if (data.verificationToken !== undefined) {
        fields.push('verificationToken = ?');
        values.push(data.verificationToken);
      }
      if (data.verificationExpiry !== undefined) {
        fields.push('verificationExpiry = ?');
        values.push(data.verificationExpiry ? data.verificationExpiry.getTime() : null);
      }

      if (fields.length === 0) {
        return this.findById(id);
      }

      fields.push('updatedAt = ?');
      values.push(now);
      values.push(id);

      const stmt = db.prepare(`UPDATE User SET ${fields.join(', ')} WHERE id = ?`);
      stmt.run(...values);

      return this.findById(id);
    },

    /**
     * Delete user
     */
    delete(id: number): boolean {
      const db = getDatabase();
      const stmt = db.prepare('DELETE FROM User WHERE id = ?');
      const result = stmt.run(id);
      return result.changes > 0;
    },

    /**
     * Find all users
     */
    findAll(): User[] {
      const db = getDatabase();
      const rows = db.prepare('SELECT * FROM User ORDER BY createdAt DESC').all() as any[];

      return rows.map(row => ({
        ...row,
        isVerified: Boolean(row.isVerified),
        isActive: Boolean(row.isActive),
        lastLogin: row.lastLogin ? new Date(row.lastLogin) : null,
        resetTokenExpiry: row.resetTokenExpiry ? new Date(row.resetTokenExpiry) : null,
        verificationExpiry: row.verificationExpiry ? new Date(row.verificationExpiry) : null,
        recoveryPin: row.recoveryPin || null,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt)
      }));
    }
  },

  settings: {
    /**
     * Get setting by key
     */
    get(key: string): { key: string; value: string; type: string } | null {
      const db = getDatabase();
      const row = db.prepare('SELECT key, value, type FROM Settings WHERE key = ?').get(key) as any;
      return row || null;
    },

    /**
     * Set or update setting
     */
    set(key: string, value: string, type: string = 'string', category: string = 'general', description?: string, updatedBy?: number): void {
      const db = getDatabase();
      const now = Date.now();

      const existing = this.get(key);

      if (existing) {
        // Update existing setting
        db.prepare(`
          UPDATE Settings
          SET value = ?, type = ?, category = ?, description = ?, updatedAt = ?, updatedBy = ?
          WHERE key = ?
        `).run(value, type, category, description || null, now, updatedBy || null, key);
      } else {
        // Insert new setting
        db.prepare(`
          INSERT INTO Settings (key, value, type, category, description, updatedAt, updatedBy)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(key, value, type, category, description || null, now, updatedBy || null);
      }
    },

    /**
     * Get all settings by category
     */
    getByCategory(category: string): Array<{ key: string; value: string; type: string; description: string | null }> {
      const db = getDatabase();
      const rows = db.prepare('SELECT key, value, type, description FROM Settings WHERE category = ? ORDER BY key').all(category) as any[];
      return rows;
    },

    /**
     * Get all settings
     */
    getAll(): Array<{ key: string; value: string; type: string; category: string; description: string | null }> {
      const db = getDatabase();
      const rows = db.prepare('SELECT key, value, type, category, description FROM Settings ORDER BY category, key').all() as any[];
      return rows;
    },

    /**
     * Delete setting
     */
    delete(key: string): boolean {
      const db = getDatabase();
      const result = db.prepare('DELETE FROM Settings WHERE key = ?').run(key);
      return result.changes > 0;
    }
  }
};
