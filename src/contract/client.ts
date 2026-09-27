/**
 * Typed client for route contracts. The contract is the only thing the
 * client needs: the URL, method and types all come from it, so a call that
 * doesn't match the server fails to compile.
 *
 * ```ts
 * const api = createClient({ baseUrl: import.meta.env.VITE_API_URL, getToken });
 * const invoice = await api.call(getInvoice, { params: { id } });   // typed
 * ```
 */
import type { ContractInput, ContractResponse, RequiresInput, RouteContract } from './index.js';
import { buildPath } from './index.js';

export interface ClientOptions {
  /** Origin of the API, e.g. `http://localhost:3000`. Defaults to same-origin. */
  baseUrl?: string;
  /** Returns the bearer token for the signed-in user, if any. */
  getToken?: () => string | null | undefined;
  /** Sent as `X-Frontend-Key` (the Bloom server checks it in production). */
  frontendKey?: string;
  /** Extra headers on every request. */
  headers?: Record<string, string>;
  /** Injected for tests or non-browser runtimes. Defaults to global fetch. */
  fetch?: typeof fetch;
}

/** A non-2xx answer, or a response that is not the JSON the contract promised. */
export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;
  readonly requestId?: string;
  constructor(message: string, status: number, body: unknown, requestId?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
    this.requestId = requestId;
  }
}

export interface ContractClient {
  call<C extends RouteContract>(
    contract: C,
    ...input: RequiresInput<C> extends true ? [input: ContractInput<C>] : [input?: ContractInput<C>]
  ): Promise<ContractResponse<C>>;
  /** The request id of the most recent response — ties a browser error to the server log. */
  lastRequestId(): string | undefined;
}

export function createClient(options: ClientOptions = {}): ContractClient {
  const base = (options.baseUrl ?? '').replace(/\/+$/, '');
  const doFetch = options.fetch ?? globalThis.fetch.bind(globalThis);
  let lastId: string | undefined;

  async function call<C extends RouteContract>(contract: C, input?: Partial<ContractInput<C>>): Promise<ContractResponse<C>> {
    const i = (input ?? {}) as { params?: Record<string, unknown>; query?: Record<string, unknown>; body?: unknown };
    let url = base + buildPath(contract, i.params);
    if (i.query) {
      const qs = new URLSearchParams();
      for (const [k, v] of Object.entries(i.query)) {
        if (v === undefined || v === null || v === '') continue;
        for (const item of Array.isArray(v) ? v : [v]) qs.append(k, String(item));
      }
      const s = qs.toString();
      if (s) url += `?${s}`;
    }

    const token = options.getToken?.();
    const res = await doFetch(url, {
      method: contract.method,
      headers: {
        ...(i.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        Accept: 'application/json',
        ...(options.frontendKey ? { 'X-Frontend-Key': options.frontendKey } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...(i.body !== undefined ? { body: JSON.stringify(i.body) } : {}),
    });

    lastId = res.headers.get('x-request-id') ?? undefined;
    const type = res.headers.get('content-type') ?? '';
    const text = await res.text();

    // A wrong base URL returns the dev server's index.html with a 200. Say so,
    // instead of failing later with "Unexpected token '<'".
    if (!type.includes('application/json') && text.trimStart().startsWith('<')) {
      throw new ApiError(
        `${contract.method} ${url} returned HTML, not JSON — check the API base URL`,
        res.status,
        text.slice(0, 200),
        lastId,
      );
    }

    const body = text ? safeJson(text) : undefined;
    if (!res.ok) {
      const serverMessage =
        body && typeof body === 'object' && 'message' in body ? String((body as { message: unknown }).message) : '';
      const message = serverMessage || `${contract.method} ${contract.path} failed with ${res.status}`;
      throw new ApiError(message, res.status, body, lastId);
    }
    return body as ContractResponse<C>;
  }

  return {
    call: call as ContractClient['call'],
    lastRequestId: () => lastId,
  };
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
