/**
 * Settings Service - App configuration management
 * @file src/desktop/main/features/settings/settings.service.ts
 */

import { db } from '../../lib/db-client.js';
import { loggerClass } from '@bloomneo/appkit/logger';

const logger = loggerClass.get('settings-service');

// Default settings
const DEFAULT_SETTINGS = {
  'app.name': { value: 'UserApp', type: 'string', category: 'general', description: 'Application name' },
  'app.theme': { value: 'default', type: 'string', category: 'appearance', description: 'Default theme' },
  'auth.registration_enabled': { value: 'true', type: 'boolean', category: 'auth', description: 'Allow user registration' },
  'auth.require_email_verification': { value: 'false', type: 'boolean', category: 'auth', description: 'Require email verification (not available in desktop app)' },
};

export const settingsService = {
  /**
   * Initialize default settings
   */
  async initializeDefaults(): Promise<void> {
    logger.info('Initializing default settings');

    for (const [key, config] of Object.entries(DEFAULT_SETTINGS)) {
      const existing = db.settings.get(key);
      if (!existing) {
        db.settings.set(key, config.value, config.type, config.category, config.description);
        logger.info(`Created default setting: ${key}`, { value: config.value });
      }
    }
  },

  /**
   * Get single setting by key
   */
  getSetting(key: string): { key: string; value: any; type: string } | null {
    const setting = db.settings.get(key);
    if (!setting) return null;

    // Parse value based on type
    let parsedValue: any = setting.value;
    if (setting.type === 'boolean') {
      parsedValue = setting.value === 'true';
    } else if (setting.type === 'number') {
      parsedValue = parseFloat(setting.value);
    } else if (setting.type === 'json') {
      try {
        parsedValue = JSON.parse(setting.value);
      } catch {
        parsedValue = setting.value;
      }
    }

    return {
      key: setting.key,
      value: parsedValue,
      type: setting.type
    };
  },

  /**
   * Get all settings
   */
  getAllSettings(): Record<string, any> {
    const settings = db.settings.getAll();
    const result: Record<string, any> = {};

    for (const setting of settings) {
      let parsedValue: any = setting.value;
      if (setting.type === 'boolean') {
        parsedValue = setting.value === 'true';
      } else if (setting.type === 'number') {
        parsedValue = parseFloat(setting.value);
      } else if (setting.type === 'json') {
        try {
          parsedValue = JSON.parse(setting.value);
        } catch {
          parsedValue = setting.value;
        }
      }

      result[setting.key] = {
        value: parsedValue,
        type: setting.type,
        category: setting.category,
        description: setting.description
      };
    }

    return result;
  },

  /**
   * Get settings by category
   */
  getByCategory(category: string): Record<string, any> {
    const settings = db.settings.getByCategory(category);
    const result: Record<string, any> = {};

    for (const setting of settings) {
      let parsedValue: any = setting.value;
      if (setting.type === 'boolean') {
        parsedValue = setting.value === 'true';
      } else if (setting.type === 'number') {
        parsedValue = parseFloat(setting.value);
      } else if (setting.type === 'json') {
        try {
          parsedValue = JSON.parse(setting.value);
        } catch {
          parsedValue = setting.value;
        }
      }

      result[setting.key] = {
        value: parsedValue,
        type: setting.type,
        description: setting.description
      };
    }

    return result;
  },

  /**
   * Update setting
   */
  updateSetting(key: string, value: any, updatedBy?: number): void {
    const existing = db.settings.get(key);
    if (!existing) {
      throw new Error(`Setting '${key}' does not exist`);
    }

    // Convert value to string based on type
    let stringValue: string;
    if (existing.type === 'boolean') {
      stringValue = value ? 'true' : 'false';
    } else if (existing.type === 'number') {
      stringValue = String(value);
    } else if (existing.type === 'json') {
      stringValue = JSON.stringify(value);
    } else {
      stringValue = String(value);
    }

    const settingInfo = db.settings.getAll().find(s => s.key === key);
    db.settings.set(
      key,
      stringValue,
      existing.type,
      settingInfo?.category || 'general',
      settingInfo?.description || undefined,
      updatedBy
    );

    logger.info(`Updated setting: ${key}`, { value, updatedBy });
  },

  /**
   * Bulk update settings
   */
  bulkUpdate(settings: Record<string, any>, updatedBy?: number): void {
    for (const [key, value] of Object.entries(settings)) {
      try {
        this.updateSetting(key, value, updatedBy);
      } catch (error: any) {
        logger.warn(`Failed to update setting '${key}':`, error.message);
      }
    }
  }
};
