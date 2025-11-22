/**
 * FBCA Backend API Server with AppKit integration
 * @module aitestengine/server
 * @file aitestengine/src/api/server.ts
 *
 * @llm-rule WHEN: Creating backend APIs with Feature-Based Component Architecture
 * @llm-rule AVOID: Using without AppKit modules - breaks structured logging and error handling
 * @llm-rule NOTE: Auto-discovers features in features/ directory using naming convention
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { loggerClass } from '@voilajsx/appkit/logger';
import { errorClass } from '@voilajsx/appkit/error';
import { configClass } from '@voilajsx/appkit/config';
import { createApiRouter } from './lib/api-router.js';
import { settingsService } from './features/settings/settings.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize AppKit modules following the pattern
const logger = loggerClass.get('server');
const error = errorClass.get();
const config = configClass.get();

/**
 * Check if frontend build exists
 */
function checkFrontendExists(distPath: string): boolean {
  try {
    const indexPath = path.join(distPath, 'index.html');
    return fs.existsSync(indexPath);
  } catch {
    return false;
  }
}

const app = express();
const PORT = config.get('server.port', process.env.PORT || 3000);

// Middleware (following AppKit recommended order)
app.use(cors());

// Security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: false, // Managed by Electron's CSP
  crossOriginEmbedderPolicy: false, // Not needed for desktop app
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, _res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });
  next();
});

// Health check with AppKit integration
app.get('/health', error.asyncRoute(async (_req, res) => {
  logger.info('Health check requested');

  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.get('app.environment', 'development')
  };

  res.json(healthData);
}));

// Initialize server with async setup
async function startServer() {
  try {
    logger.info('Initializing server...');

    // Initialize default settings
    try {
      await settingsService.initializeDefaults();
      logger.info('✅ Default settings initialized');
    } catch (err: any) {
      logger.warn('Failed to initialize default settings', { error: err.message });
    }

    // API routes with auto-discovery
    app.use('/api', await createApiRouter());

    // Check if frontend build exists and we're not in API-only dev mode
    const distPath = path.join(__dirname, '../../dist');
    const frontendExists = checkFrontendExists(distPath);
    const isApiOnlyMode = process.env.NODE_ENV !== 'production' && process.env.API_ONLY === 'true';

    logger.info('Frontend check:', { distPath, frontendExists, isApiOnlyMode });

    if (frontendExists && !isApiOnlyMode) {
      // Serve static files from dist directory (production frontend)
      logger.info('🌐 Serving frontend from dist directory');
      app.use(express.static(distPath));

      // SPA fallback - serve index.html for all non-API routes (MUST be after API routes)
      app.get('*', (req, res, next) => {
        // Don't intercept API routes or health check
        if (req.path.startsWith('/api') || req.path === '/health') {
          return next();
        }

        const indexPath = path.join(distPath, 'index.html');
        logger.info('Serving SPA route', { path: req.path });
        res.sendFile(indexPath, (err) => {
          if (err) {
            logger.error('Failed to serve index.html', { error: err });
            res.status(404).json({
              error: 'Frontend not found',
              message: 'Frontend files exist but failed to serve'
            });
          }
        });
      });
    } else {
      // Fallback to /api route when no frontend
      logger.info('🔧 No frontend found, redirecting root to /api');
      app.get('/', (_req, res) => {
        logger.info('Root route requested, redirecting to /api');
        res.redirect('/api');
      });
    }

    // AppKit error handling middleware (ALWAYS LAST)
    app.use(error.handleErrors());

    app.listen(PORT, () => {
      if (frontendExists) {
        logger.info(`🚀 Full-stack server running on http://localhost:${PORT}`);
        logger.info(`🌐 Frontend: http://localhost:${PORT}`);
      } else {
        logger.info(`🔧 API-only server running on http://localhost:${PORT}`);
        logger.info(`🌐 Root: http://localhost:${PORT} → redirects to /api`);
      }
      logger.info(`📚 API routes: http://localhost:${PORT}/api`);
      logger.info(`💊 Health check: http://localhost:${PORT}/health`);
      logger.info('Server initialization completed successfully');
    });

  } catch (err: any) {
    logger.error('Failed to start server', { error: err });
    logger.error('❌ Server startup failed:', { error: err.message });
    process.exit(1);
  }
}

startServer();