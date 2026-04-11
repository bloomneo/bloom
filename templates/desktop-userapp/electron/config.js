/**
 * Production Configuration for Electron App
 * @file electron/config.js
 *
 * This file contains default environment variables for production builds.
 * Users can override these by setting environment variables before launching.
 */

export const productionConfig = {
  // AppKit service name
  BLOOM_SERVICE_NAME: 'desktop-userapp',

  // Disable AppKit app discovery (use direct database access)
  BLOOM_DISABLE_APP_DISCOVERY: 'true',

  // JWT configuration
  JWT_SECRET: 'your-super-secret-jwt-key-change-in-production',
  JWT_EXPIRES_IN: '7d',

  // AppKit auth secret
  BLOOM_AUTH_SECRET: 'auth_k8s9m2n4p7q1w3e5r8t0y2u4i6o9a1s5d7f9g2h4j6l8',

  // Server port
  PORT: '3000'
};

/**
 * Load configuration from environment or use defaults
 */
export function loadProductionConfig() {
  const config = {};

  for (const [key, defaultValue] of Object.entries(productionConfig)) {
    config[key] = process.env[key] || defaultValue;
  }

  return config;
}
