/**
 * FBCA Auto-Discovery Router
 * @module aitestengine/api-router
 * @file aitestengine/src/api/lib/api-router.ts
 *
 * @llm-rule WHEN: Need automatic API route discovery based on feature directories
 * @llm-rule AVOID: Manual route registration - defeats FBCA auto-discovery purpose
 * @llm-rule NOTE: Follows {featureName}/{featureName}.route.ts naming convention for TypeScript or .js for JavaScript
 */

import express from 'express';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { loggerClass } from '@voilajsx/appkit/logger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Get the correct features path for both development and production
 */
function getFeaturesPath(): string {
  // In development: src/desktop/main/lib/../features
  // In production (npm start): dist/main/lib/../features
  // In packaged Electron app: app/dist/main/lib/../features or resources/app/dist/main/lib/../features

  const devPath = join(__dirname, '../features');
  if (existsSync(devPath)) {
    return devPath;
  }

  // Try from process.cwd() for packaged apps
  const cwdPath = join(process.cwd(), 'dist', 'main', 'features');
  if (existsSync(cwdPath)) {
    return cwdPath;
  }

  // Try from app resources
  const resourcesPath = process.resourcesPath
    ? join(process.resourcesPath, 'app', 'dist', 'main', 'features')
    : devPath;

  return resourcesPath;
}

export async function createApiRouter() {
  const router = express.Router();
  const discoveredRoutes: string[] = [];
  const logger = loggerClass.get('api-router');

  // API root route - list available endpoints
  router.get('/', (_req, res) => {
    res.json({
      message: 'API Server - Feature-Based Component Architecture',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        api: '/api',
        features: discoveredRoutes.map(route => `/api${route}`)
      },
      timestamp: new Date().toISOString()
    });
  });

  try {
    // Auto-discover feature routes
    const featuresPath = getFeaturesPath();
    logger.info('🔍 Features path:', { featuresPath });
    logger.info('🔍 __dirname:', { __dirname });
    logger.info('🔍 process.cwd():', { cwd: process.cwd() });
    logger.info('🔍 process.resourcesPath:', { resourcesPath: process.resourcesPath });
    logger.info('🔍 Features path exists:', { exists: existsSync(featuresPath) });

    const features = await readdir(featuresPath, { withFileTypes: true });

    logger.info('🔍 Discovering API routes:');
    logger.info('🔍 Found features:', { features: features.map(f => f.name).join(', ') });

    for (const feature of features) {
      if (feature.isDirectory()) {
        const featureName = feature.name;
        // Try .ts first, then .js
        const routeFiles = [
          join(featuresPath, featureName, `${featureName}.route.ts`),
          join(featuresPath, featureName, `${featureName}.route.js`)
        ];

        let loaded = false;
        for (const routeFile of routeFiles) {
          try {
            logger.info('🔍 Trying to load route:', { routeFile });
            const fileUrl = pathToFileURL(routeFile).href;
            logger.info('🔍 File URL:', { fileUrl });
            const { default: featureRouter } = await import(fileUrl);
            router.use(`/${featureName}`, featureRouter);
            discoveredRoutes.push(`/${featureName}`);
            const fileType = routeFile.endsWith('.ts') ? '.ts' : '.js';
            logger.info(`✅ /api/${featureName} registered`, { route: `${featureName}.route${fileType}` });
            loaded = true;
            break;
          } catch (error: any) {
            logger.info('⚠️  Failed to load route:', { routeFile, error: error.message, stack: error.stack });
            // Continue to next file type
          }
        }

        if (!loaded) {
          logger.warn(`⚠️  Could not load route for feature "${featureName}"`);
        }
      }
    }

    logger.info('✅ API routes discovered');

  } catch (error: any) {
    logger.error('❌ Error discovering features:', error.message);
    logger.warn('⚠️ No features directory found or error reading it');
  }

  return router;
}