/**
 * Welcome Feature Routes - Express endpoints with AppKit integration
 * @file src/api/features/welcome/welcome.route.ts
 *
 * @llm-rule WHEN: Need HTTP endpoints for welcome feature with error handling
 * @llm-rule AVOID: Adding routes without asyncRoute wrapper - breaks error handling
 * @llm-rule NOTE: Auto-discovered by api-router.ts using FBCA pattern, exports default Express router
 */

import express from 'express';
import { errorClass } from '@bloomneo/appkit/error';
import { loggerClass } from '@bloomneo/appkit/logger';
import { welcomeService } from './welcome.service.js';

const router = express.Router();
const error = errorClass.get();
const logger = loggerClass.get('welcome-routes');

// GET /api/welcome - replies "hello"
router.get('/', error.asyncRoute(async (_req, res) => {
  logger.info('GET /api/welcome request received');
  const result = await welcomeService.getHello();
  res.json(result);
}));

// GET /api/welcome/:name - replies "hello :name"
router.get('/:name', error.asyncRoute(async (req, res) => {
  const name = req.params.name;
  logger.info('GET /api/welcome/:name request received', { name });

  const result = await welcomeService.getHelloWithName(name);
  res.json(result);
}));

export default router;