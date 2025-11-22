/**
 * User Model - User database operations
 * @file src/desktop/main/features/user/user.model.ts
 *
 * Simplified model using better-sqlite3 for desktop app
 */

import { db } from '../../lib/db-client.js';
import { loggerClass } from '@voilajsx/appkit/logger';
import { authClass } from '@voilajsx/appkit/auth';
import type { UserUpdateRequest } from './user.types.js';

const logger = loggerClass.get('user-model');
const auth = authClass.get();

export const model = {
  /**
   * Find user by email (for login)
   */
  async findByEmail(email: string) {
    logger.info('Finding user by email', { email });
    return db.user.findByEmail(email.toLowerCase().trim());
  },

  /**
   * Find user by ID
   */
  async findById(id: number) {
    logger.info('Finding user by ID', { id });
    const user = db.user.findById(id);

    if (!user) return null;

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  /**
   * Get all users
   */
  async findAll() {
    logger.info('Finding all users');
    const users = db.user.findAll();

    // Return users without passwords
    return users.map(user => {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  },

  /**
   * Create new user with hashed password
   */
  async create(data: {
    name?: string | null;
    email: string;
    phone?: string | null;
    password: string;
  }) {
    logger.info('Creating new user', { email: data.email });

    // Hash password using AppKit auth
    const hashedPassword = await auth.hashPassword(data.password);

    const user = db.user.create({
      email: data.email.toLowerCase().trim(),
      password: hashedPassword,
      name: data.name?.trim() || data.email.split('@')[0]
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  /**
   * Update user profile
   */
  async update(id: number, data: UserUpdateRequest) {
    logger.info('Updating user', { id, data });

    const user = db.user.update(id, data);

    if (!user) return null;

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  /**
   * Verify user password (for login)
   */
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await auth.comparePassword(plainPassword, hashedPassword);
  },

  /**
   * Update user password
   */
  async updatePassword(id: number, newPassword: string) {
    logger.info('Updating user password', { id });

    const hashedPassword = await auth.hashPassword(newPassword);

    const user = db.user.update(id, { password: hashedPassword });

    if (!user) return null;

    return { id: user.id, email: user.email };
  },

  /**
   * Delete user
   */
  async delete(id: number) {
    logger.info('Deleting user', { id });
    return db.user.delete(id);
  }
};
