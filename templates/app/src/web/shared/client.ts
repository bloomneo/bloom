/**
 * The typed client for route contracts.
 *
 * ```ts
 * import { client } from '@/shared/client';
 * import { getWelcomeByName } from '@contracts/welcome.contract';
 *
 * const hello = await client.call(getWelcomeByName, { params: { name: 'Ada' } });
 * //    ^? { message: string; name: string; timestamp: string }
 * ```
 *
 * The URL, method, input and response type all come from the contract, so a
 * call that does not match the server fails to compile. Failures throw
 * `ApiError` from @bloomneo/bloom, carrying the status, the body and the
 * server's x-request-id.
 *
 * Configured the same way as shared/api.ts: the API origin from VITE_API_URL,
 * the signed-in user's token, and the frontend key production requires.
 */
import { createClient } from '@bloomneo/bloom';
import { getToken } from './api';

export const client = createClient({
  // Dev-only fallback: the API and the Vite dev server are different origins.
  baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  getToken,
  frontendKey: import.meta.env.VITE_FRONTEND_KEY as string | undefined,
});
