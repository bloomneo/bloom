/**
 * Welcome routes — declared ONCE, used by both halves of the app.
 *
 * A contract is the single description of a route: method, path, what goes in,
 * what comes out, and who may call it. From this one file:
 *
 *   the API     `route(getWelcome, handler)` in features/welcome/welcome.route.ts
 *               applies the auth decision and validates params/query/body —
 *               the handler just returns the body;
 *   the web     `client.call(getWelcome)` is typed from it — a wrong path or a
 *               missing param is a compile error, not a 404;
 *   bloom check counts it, and flags any route that has no auth decision.
 *
 * `auth` is required. There is no default: a route that forgets it does not
 * compile. Write `auth: 'public'` when a route is public on purpose, 'user'
 * for any signed-in user, or `{ roles: ['admin.system'] }`.
 *
 * This file is imported by the web build (Vite) and the API build (tsc,
 * Node16), so it may import only packages both sides have — zod and
 * @bloomneo/bloom — never anything from src/api or src/web.
 */
import { z } from 'zod';
import { defineRoute } from '@bloomneo/bloom';

export const Welcome = z.object({
  message: z.string(),
  timestamp: z.string(),
});

export const PersonalizedWelcome = Welcome.extend({
  name: z.string(),
});

/** GET /api/welcome — replies "hello". */
export const getWelcome = defineRoute({
  method: 'GET',
  path: '/api/welcome',
  auth: 'public',
  response: Welcome,
  summary: 'Say hello',
});

/** GET /api/welcome/:name — replies "hello <name>". */
export const getWelcomeByName = defineRoute({
  method: 'GET',
  path: '/api/welcome/:name',
  auth: 'public',
  // Invalid input never reaches the handler: it is answered with a 400
  // VALIDATION_ERROR that names the failing field.
  params: z.object({ name: z.string().trim().min(1).max(100) }),
  response: PersonalizedWelcome,
  summary: 'Say hello to someone',
});
