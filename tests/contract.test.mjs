/**
 * tests/contract.test.mjs — route contracts, run against the built dist/.
 *
 * The compile-time guarantees (a route without `auth` doesn't compile, the
 * client is typed from the contract) are in tests/types/; these cover what
 * happens at runtime.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';
import { defineRoute, isContract, isTenantScoped, validate, buildPath, createClient, ApiError } from '../dist/index.js';

const getInvoice = defineRoute({
  method: 'GET',
  path: '/api/invoices/:id',
  params: z.object({ id: z.string() }),
  response: z.object({ id: z.string(), total: z.number() }),
  auth: { roles: ['admin.tenant', 'user.basic'] },
});

test('defineRoute returns a frozen, branded contract', () => {
  assert.equal(isContract(getInvoice), true);
  assert.equal(Object.isFrozen(getInvoice), true);
  assert.equal(isContract({ method: 'GET', path: '/api/x', auth: 'public' }), false);
});

test('an auth decision is required at runtime too (JS callers)', () => {
  assert.throws(() => defineRoute({ method: 'GET', path: '/api/x' }), /auth is required — use auth: 'public'/);
});

test('rejects malformed contracts when the module loads', () => {
  assert.throws(() => defineRoute({ method: 'FETCH', path: '/api/x', auth: 'public' }), /method must be/);
  assert.throws(() => defineRoute({ method: 'GET', path: '/invoices', auth: 'public' }), /must start with \/api/);
  assert.throws(() => defineRoute({ method: 'GET', path: '/api/x', auth: 'admin' }), /auth must be/);
  assert.throws(() => defineRoute({ method: 'GET', path: '/api/x', auth: { roles: ['Admin'] } }), /auth must be/);
  assert.throws(() => defineRoute({ method: 'GET', path: '/api/x/:id', auth: 'public' }), /has :id but the contract has no params/);
  assert.throws(() => defineRoute({ method: 'GET', path: '/api/x', auth: 'public', body: z.object({}) }), /GET route cannot declare a body/);
  assert.throws(() => defineRoute({ method: 'POST', path: '/api/x', auth: 'public', body: { parse() {} } }), /not a Standard Schema/);
});

test('non-public routes are tenant-scoped unless they opt out', () => {
  assert.equal(isTenantScoped(getInvoice), true);
  assert.equal(isTenantScoped({ method: 'GET', path: '/api/x', auth: 'public' }), false);
  assert.equal(isTenantScoped({ method: 'GET', path: '/api/x', auth: 'user', tenant: false }), false);
});

test('validate reports issues with their paths', async () => {
  const body = z.object({ lines: z.array(z.object({ qty: z.number().int().positive() })) });
  const ok = await validate(body, { lines: [{ qty: 2 }] });
  assert.deepEqual(ok, { ok: true, value: { lines: [{ qty: 2 }] } });
  const bad = await validate(body, { lines: [{ qty: -1 }] });
  assert.equal(bad.ok, false);
  assert.equal(bad.issues[0].path, 'lines.0.qty');
});

test('buildPath fills and encodes params, and refuses a missing one', () => {
  assert.equal(buildPath(getInvoice, { id: 'a b/c' }), '/api/invoices/a%20b%2Fc');
  assert.throws(() => buildPath(getInvoice, {}), /missing path param "id"/);
});

function fakeFetch(respond) {
  const calls = [];
  const fn = async (url, init) => {
    calls.push({ url, init });
    const { status = 200, body, type = 'application/json', requestId = 'req-1' } = respond(url, init);
    return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
      status,
      headers: { 'content-type': type, 'x-request-id': requestId },
    });
  };
  fn.calls = calls;
  return fn;
}

test('client calls the contract URL with token and frontend key', async () => {
  const fetch = fakeFetch(() => ({ body: { id: '7', total: 10 } }));
  const api = createClient({ baseUrl: 'http://api.test/', getToken: () => 'tok', frontendKey: 'fk', fetch });
  const invoice = await api.call(getInvoice, { params: { id: '7' } });
  assert.deepEqual(invoice, { id: '7', total: 10 });
  const { url, init } = fetch.calls[0];
  assert.equal(url, 'http://api.test/api/invoices/7');
  assert.equal(init.method, 'GET');
  assert.equal(init.headers.Authorization, 'Bearer tok');
  assert.equal(init.headers['X-Frontend-Key'], 'fk');
  assert.equal(api.lastRequestId(), 'req-1');
});

test('client sends query and JSON body', async () => {
  const create = defineRoute({
    method: 'POST',
    path: '/api/invoices',
    query: z.object({ draft: z.boolean().optional(), tag: z.array(z.string()).optional() }),
    body: z.object({ total: z.number() }),
    auth: 'user',
  });
  const fetch = fakeFetch(() => ({ status: 201, body: { id: '8' } }));
  await createClient({ fetch }).call(create, { query: { draft: true, tag: ['a', 'b'] }, body: { total: 5 } });
  assert.equal(fetch.calls[0].url, '/api/invoices?draft=true&tag=a&tag=b');
  assert.equal(fetch.calls[0].init.body, '{"total":5}');
});

test('client turns an error answer into ApiError with the server message', async () => {
  const fetch = fakeFetch(() => ({ status: 404, body: { error: 'NOT_FOUND', message: 'No such invoice' }, requestId: 'req-9' }));
  await assert.rejects(createClient({ fetch }).call(getInvoice, { params: { id: 'x' } }), (err) => {
    assert.ok(err instanceof ApiError);
    assert.equal(err.status, 404);
    assert.equal(err.message, 'No such invoice');
    assert.equal(err.requestId, 'req-9');
    return true;
  });
});

test('client names an HTML answer as a wrong base URL', async () => {
  const fetch = fakeFetch(() => ({ body: '<!doctype html><html>', type: 'text/html' }));
  await assert.rejects(createClient({ fetch }).call(getInvoice, { params: { id: '1' } }), /returned HTML, not JSON — check the API base URL/);
});
