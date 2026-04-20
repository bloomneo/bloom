/**
 * adminFetch — thin fetch helper for `/api/admin/*`, `/api/audit/*`,
 * `/api/settings/admin/*` calls. Exists because three admin pages
 * would otherwise duplicate the same boilerplate:
 *
 *   1. Prepend `VITE_API_URL` so the request crosses from the vite
 *      dev server (e.g. :5174) to the API (:3100). Relative URLs hit
 *      vite, which returns HTML — the failure mode is
 *      "JSON.parse: unexpected character" rather than a useful error.
 *   2. Attach `X-Frontend-Key` — server.ts rejects /api/* requests
 *      that don't carry this header.
 *   3. Attach `Authorization: Bearer <token>` when the user is
 *      logged in (all /admin/* pages require an admin role).
 *
 * Returns the raw Response so callers can branch on `res.ok` or
 * extract error bodies however they want. Most callers will just
 * `.then(r => r.json())`.
 *
 * @file src/web/features/admin/lib/admin-api.ts
 *
 * @see ../../../../../docs/admin-patterns.md §4 admin-api, §10 common traps
 * @see https://dev.bloomneo.com/adminapp/admin-api
 *
 * @llm-rule WHEN: Any admin page needs to read or write server state
 * @llm-rule AVOID: Hand-rolling fetch('/api/...') — missing X-Frontend-Key returns an opaque 403 and relative URLs hit Vite (HTML response → "JSON.parse: unexpected character")
 * @llm-rule PREFER: adminFetchJson for GETs/PUTs/POSTs that want parsed-or-throw; adminFetch when the caller needs the raw Response
 */

const baseUrl =
  (import.meta as unknown as { env: Record<string, string> }).env
    .VITE_API_URL ?? 'http://localhost:3000';

const frontendKey =
  (import.meta as unknown as { env: Record<string, string> }).env
    .VITE_FRONTEND_KEY ?? '';

/** Same storage key the auth feature uses (config.auth.storage.token). */
const AUTH_TOKEN_KEY = 'auth_token';

export interface AdminFetchInit extends RequestInit {
  /** Append a query-string object. Values get URI-encoded. */
  query?: Record<string, string | number | undefined>;
}

export async function adminFetch(
  path: string,
  init: AdminFetchInit = {},
): Promise<Response> {
  const { query, headers, ...rest } = init;

  // Compose URL with optional query string. Undefined values skipped.
  let url = `${baseUrl}${path}`;
  if (query) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== '') params.set(k, String(v));
    }
    const qs = params.toString();
    if (qs) url += (url.includes('?') ? '&' : '?') + qs;
  }

  // Compose headers: start with caller-provided, then layer our
  // required ones. Caller can override by passing them too, but it's
  // rare and usually wrong.
  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };
  if (frontendKey) finalHeaders['X-Frontend-Key'] = frontendKey;

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem(AUTH_TOKEN_KEY)
      : null;
  if (token) finalHeaders['Authorization'] = `Bearer ${token}`;

  return fetch(url, {
    credentials: 'include',
    ...rest,
    headers: finalHeaders,
  });
}

/**
 * Convenience wrapper that does the JSON parse + throws on non-OK
 * responses. Most admin pages want this shape.
 */
export async function adminFetchJson<T = unknown>(
  path: string,
  init?: AdminFetchInit,
): Promise<T> {
  const res = await adminFetch(path, init);
  if (!res.ok) {
    // Try to pull an error message out of the JSON body; fall back
    // to status text. The route handlers in appkit/error throw
    // AppError which serializes as { error, message } — we surface
    // message preferentially.
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body?.message ?? body?.error ?? detail;
    } catch {
      // not JSON — keep statusText
    }
    throw new Error(`${res.status} ${detail}`);
  }
  return (await res.json()) as T;
}
