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
import { AppKitError } from '@bloomneo/appkit';
import { loggerClass } from '@bloomneo/appkit/logger';

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

// Recognize an appkit-originated error.
//
// `instanceof AppKitError` is the correct check on paper, but in practice
// (a) Node's dynamic `import()` can break the prototype chain when a module
// throws at init, and (b) several appkit modules still throw plain `Error`s
// with pre-formatted `[@bloomneo/appkit/<module>] ...` messages instead of
// typed `AppKitError` subclasses. So we treat either as "this is appkit's
// error to explain" and pull the structured fields from whichever side
// provides them.
type AppKitErrorish = {
  message: string;
  module?: string;
  code?: string;
  docsUrl?: string;
};

function asAppKitErrorish(error: unknown): AppKitErrorish | null {
  if (!(error instanceof Error)) return null;
  const anyErr = error as Error & Partial<AppKitErrorish>;

  if (error instanceof AppKitError) {
    return {
      message: error.message,
      module: error.module,
      code: error.code,
      docsUrl: error.docsUrl,
    };
  }

  if (typeof anyErr.module === 'string' && typeof anyErr.code === 'string') {
    return {
      message: error.message,
      module: anyErr.module,
      code: anyErr.code,
      docsUrl: anyErr.docsUrl,
    };
  }

  const prefixMatch = error.message.match(/^\[@bloomneo\/appkit\/([^\]]+)\]/);
  if (prefixMatch) {
    const urlMatch = error.message.match(/See:\s*(\S+)/);
    return {
      message: error.message,
      module: prefixMatch[1],
      code: undefined,
      docsUrl: urlMatch?.[1],
    };
  }

  return null;
}

// Turn a route-load failure into an actionable one-glance message. The rule:
// never swallow the error, never JSON-dump it, always show the developer
// exactly what to change.
function formatRouteLoadError(
  featureName: string,
  routeFile: string,
  error: unknown,
): string {
  const appkit = asAppKitErrorish(error);
  if (appkit) {
    const body = appkit.message.replace(/\s*See:\s*\S+\s*$/, '').trim();
    const lines = [
      `❌ Failed to load "${featureName}" route:`,
      `   ${body}`,
    ];
    if (appkit.docsUrl) lines.push(`   Docs: ${appkit.docsUrl}`);
    lines.push(`   File: ${routeFile}`);
    return lines.join('\n');
  }

  const msg = error instanceof Error ? error.message : String(error);

  const moduleMatch = msg.match(/Cannot find (?:module|package) ['"]([^'"]+)['"]/);
  if (moduleMatch) {
    return [
      `❌ Failed to load "${featureName}" route:`,
      `   Module not found: ${moduleMatch[1]}`,
      `   Fix: run \`npm install ${moduleMatch[1]}\` (or check the import path in ${routeFile})`,
    ].join('\n');
  }

  if ((error instanceof Error && error.name === 'SyntaxError') || /SyntaxError/.test(msg)) {
    return [
      `❌ Failed to load "${featureName}" route:`,
      `   Syntax error in ${routeFile}`,
      `   ${msg}`,
    ].join('\n');
  }

  return [
    `❌ Failed to load "${featureName}" route (${routeFile}):`,
    `   ${msg}`,
  ].join('\n');
}

/**
 * Build structured log metadata for a route-load failure. Pairs with the
 * human-readable string from `formatRouteLoadError` — humans read the
 * formatted message in stdout, log aggregators index these fields.
 */
function routeLoadErrorMeta(
  featureName: string,
  routeFile: string,
  error: unknown,
): Record<string, unknown> {
  const base: Record<string, unknown> = {
    feature: featureName,
    file: routeFile,
    errorName: error instanceof Error ? error.name : typeof error,
  };
  const appkit = asAppKitErrorish(error);
  if (appkit) {
    if (appkit.module) base.appkitModule = appkit.module;
    if (appkit.code) base.appkitCode = appkit.code;
    if (appkit.docsUrl) base.docsUrl = appkit.docsUrl;
  }
  return base;
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
    const featuresPath = getFeaturesPath();
    logger.info('🔍 Features path:', { featuresPath });

    if (!existsSync(featuresPath)) {
      logger.warn('⚠️ No features directory found', { featuresPath });
      return router;
    }

    const features = await readdir(featuresPath, { withFileTypes: true });
    logger.info('🔍 Discovering API routes:', {
      features: features.filter(f => f.isDirectory()).map(f => f.name).join(', '),
    });

    for (const feature of features) {
      if (!feature.isDirectory()) continue;
      const featureName = feature.name;

      // Resolve the real route file before importing, so any error that
      // comes out of `import()` is a *real* load error — not a noisy
      // "Cannot find module" for the extension we weren't using.
      const candidates = [
        join(featuresPath, featureName, `${featureName}.route.ts`),
        join(featuresPath, featureName, `${featureName}.route.js`),
      ];
      const routeFile = candidates.find(f => existsSync(f));

      if (!routeFile) {
        logger.warn(
          `⚠️  Feature "${featureName}" has no route file — expected ` +
            `${featureName}.route.ts or ${featureName}.route.js in ${featureName}/`,
        );
        continue;
      }

      try {
        const fileUrl = pathToFileURL(routeFile).href;
        const { default: featureRouter } = await import(fileUrl);
        router.use(`/${featureName}`, featureRouter);
        discoveredRoutes.push(`/${featureName}`);
        const fileType = routeFile.endsWith('.ts') ? '.ts' : '.js';
        logger.info(`✅ /api/${featureName} registered`, { route: `${featureName}.route${fileType}` });
      } catch (error) {
        logger.error(
          formatRouteLoadError(featureName, routeFile, error),
          routeLoadErrorMeta(featureName, routeFile, error),
        );
      }
    }

    logger.info('✅ API routes discovered');

  } catch (error: any) {
    logger.error('❌ Error discovering features:', error.message);
  }

  return router;
}
