/**
 * @bloomneo/bloom — route contracts.
 *
 * A contract declares one API route once: its method and path, the shape of
 * what goes in and out, who may call it, and whether it runs inside a
 * tenant. The server (appkit) enforces it, the client (this module, and
 * uikit's data hooks) is typed from it, and `bloom check` verifies against it.
 *
 * @llm-rule WHEN: Declaring any API route in a Bloom app
 * @llm-rule AVOID: Omitting `auth` — it is required on purpose; write auth: 'public' when a route is public
 * @llm-rule NOTE: Schemas are any Standard Schema (Zod 3.24+, Valibot, ArkType)
 *
 * ```ts
 * import { z } from 'zod';
 * import { defineRoute } from '@bloomneo/bloom';
 *
 * export const getInvoice = defineRoute({
 *   method: 'GET',
 *   path: '/api/invoices/:id',
 *   params: z.object({ id: z.string() }),
 *   response: Invoice,
 *   auth: { roles: ['admin.tenant', 'user.basic'] },
 * });
 * ```
 */
import type { StandardSchemaV1 } from './standard-schema.js';

export type { StandardSchemaV1 } from './standard-schema.js';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Who may call the route. There is no default: a route without an `auth`
 * decision does not compile.
 *
 * - `'public'`   — anyone, no token.
 * - `'user'`     — any signed-in user.
 * - `{ roles }`  — signed-in users holding one of these `role.level` roles
 *                  (higher levels inherit, as in appkit's role ladder).
 * - `'apiToken'` — service-to-service callers with an API token.
 */
export type RouteAuth = 'public' | 'user' | 'apiToken' | { readonly roles: readonly [string, ...string[]] };

export interface RouteContract {
  readonly method: HttpMethod;
  /** Express-style path under /api, e.g. `/api/invoices/:id`. */
  readonly path: `/api/${string}` | '/api';
  /** REQUIRED: who may call this route. */
  readonly auth: RouteAuth;
  /**
   * Runs the handler inside the caller's tenant (database access is scoped
   * to their `tenantId`). Defaults to true for every non-public route; set
   * false only for routes that are deliberately cross-tenant.
   */
  readonly tenant?: boolean;
  readonly params?: StandardSchemaV1;
  readonly query?: StandardSchemaV1;
  readonly body?: StandardSchemaV1;
  readonly response?: StandardSchemaV1;
  /** One line for docs, the manifest and generated AGENTS.md. */
  readonly summary?: string;
}

/** The value a schema produces, or `undefined` when the contract has none. */
type Out<S> = S extends StandardSchemaV1 ? StandardSchemaV1.InferOutput<S> : undefined;
/** The value a caller passes, or `undefined` when the contract has none. */
type In<S> = S extends StandardSchemaV1 ? StandardSchemaV1.InferInput<S> : undefined;

export type ContractParams<C extends RouteContract> = Out<C['params']>;
export type ContractQuery<C extends RouteContract> = Out<C['query']>;
export type ContractBody<C extends RouteContract> = Out<C['body']>;
export type ContractResponse<C extends RouteContract> = C['response'] extends StandardSchemaV1
  ? StandardSchemaV1.InferOutput<C['response']>
  : unknown;

/**
 * What a client passes to call the route: only the parts the contract
 * declares. `params` and `body` are required when declared; `query` is
 * always optional (query strings are optional by nature).
 */
export type ContractInput<C extends RouteContract> = (C['params'] extends StandardSchemaV1
  ? { params: In<C['params']> }
  : { params?: never }) &
  (C['query'] extends StandardSchemaV1 ? { query?: In<C['query']> } : { query?: never }) &
  (C['body'] extends StandardSchemaV1 ? { body: In<C['body']> } : { body?: never });

/** True when calling the route needs an input argument (it declares params or a body). */
export type RequiresInput<C extends RouteContract> = C['params'] extends StandardSchemaV1
  ? true
  : C['body'] extends StandardSchemaV1
    ? true
    : false;

/** Brand so tooling can tell a contract from any object with a `path`. */
export const CONTRACT = Symbol.for('bloomneo.contract');

export type Contract<C extends RouteContract = RouteContract> = C & { readonly [CONTRACT]: true };

const METHODS: readonly HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

/**
 * Declare a route. Returns the same object, frozen and branded.
 *
 * Checks at definition time what the type system cannot, so a malformed
 * contract fails when the module loads, not on the first request.
 */
export function defineRoute<const C extends RouteContract>(contract: C): Contract<C> {
  const where = `defineRoute(${contract?.method} ${contract?.path})`;
  if (!contract || typeof contract !== 'object') throw new TypeError('defineRoute() needs a contract object');
  if (!METHODS.includes(contract.method)) {
    throw new TypeError(`${where}: method must be one of ${METHODS.join(', ')}`);
  }
  if (typeof contract.path !== 'string' || !/^\/api(\/|$)/.test(contract.path)) {
    throw new TypeError(`${where}: path must start with /api`);
  }
  if (contract.auth === undefined) {
    throw new TypeError(`${where}: auth is required — use auth: 'public' for a public route`);
  }
  const auth = contract.auth as unknown;
  const validAuth =
    auth === 'public' ||
    auth === 'user' ||
    auth === 'apiToken' ||
    (typeof auth === 'object' && auth !== null && Array.isArray((auth as { roles?: unknown }).roles) &&
      (auth as { roles: unknown[] }).roles.length > 0 &&
      (auth as { roles: unknown[] }).roles.every((r) => typeof r === 'string' && /^[a-z]+\.[a-z]+$/.test(r)));
  if (!validAuth) {
    throw new TypeError(`${where}: auth must be 'public', 'user', 'apiToken' or { roles: ['role.level', ...] }`);
  }
  const pathParams = [...contract.path.matchAll(/:([A-Za-z0-9_]+)/g)].map((m) => m[1]);
  if (pathParams.length && !contract.params) {
    throw new TypeError(`${where}: the path has :${pathParams.join(', :')} but the contract has no params schema`);
  }
  for (const key of ['params', 'query', 'body', 'response'] as const) {
    const schema = contract[key];
    if (schema !== undefined && !(schema as StandardSchemaV1)?.['~standard']) {
      throw new TypeError(`${where}: ${key} is not a Standard Schema (use Zod 3.24+, Valibot or ArkType)`);
    }
  }
  if (contract.body && contract.method === 'GET') {
    throw new TypeError(`${where}: a GET route cannot declare a body`);
  }
  return Object.freeze({ ...contract, [CONTRACT]: true as const });
}

export function isContract(value: unknown): value is Contract {
  return typeof value === 'object' && value !== null && (value as Record<symbol, unknown>)[CONTRACT] === true;
}

/** Whether the route runs inside the caller's tenant (the `tenant` default applied). */
export function isTenantScoped(contract: RouteContract): boolean {
  return contract.tenant ?? contract.auth !== 'public';
}

export interface ValidationIssue {
  path: string;
  message: string;
}

export type Validated<T> = { ok: true; value: T } | { ok: false; issues: ValidationIssue[] };

/** Validate a value against one of a contract's schemas. Absent schema = pass-through. */
export async function validate<T = unknown>(schema: StandardSchemaV1 | undefined, value: unknown): Promise<Validated<T>> {
  if (!schema) return { ok: true, value: value as T };
  const result = await schema['~standard'].validate(value);
  if (!result.issues) return { ok: true, value: result.value as T };
  return {
    ok: false,
    issues: result.issues.map((issue) => ({
      path: (issue.path ?? [])
        .map((p) => (typeof p === 'object' && p !== null && 'key' in p ? String(p.key) : String(p)))
        .join('.'),
      message: issue.message,
    })),
  };
}

/** Fill `:params` into a contract path. Throws when one is missing. */
export function buildPath(contract: RouteContract, params: Record<string, unknown> | undefined): string {
  return contract.path.replace(/:([A-Za-z0-9_]+)/g, (_, name: string) => {
    const value = params?.[name];
    if (value === undefined || value === null || value === '') {
      throw new TypeError(`${contract.method} ${contract.path}: missing path param "${name}"`);
    }
    return encodeURIComponent(String(value));
  });
}

export { createClient, ApiError } from './client.js';
export type { ClientOptions, ContractClient } from './client.js';
