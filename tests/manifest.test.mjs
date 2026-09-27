/**
 * tests/manifest.test.mjs — `bloom manifest` against a throwaway app whose
 * node_modules link to this repo's bloom, zod and tsx, and the drift check
 * `bloom check` runs on it.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, symlinkSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { buildManifest, manifestFiles, writeManifest, ManifestError } from '../dist/manifest/index.js';
import { describe as describeSchema } from '../dist/manifest/load.js';
import { checkManifest } from '../dist/check/index.js';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function app(files, { link = true } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'bloom-manifest-'));
  writeFileSync(join(root, 'package.json'), '{"name":"x","type":"module"}');
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), content);
  }
  if (link) {
    mkdirSync(join(root, 'node_modules', '@bloomneo'), { recursive: true });
    symlinkSync(REPO, join(root, 'node_modules', '@bloomneo', 'bloom'), 'dir');
    symlinkSync(join(REPO, 'node_modules', 'zod'), join(root, 'node_modules', 'zod'), 'dir');
    symlinkSync(join(REPO, 'node_modules', 'tsx'), join(root, 'node_modules', 'tsx'), 'dir');
  }
  return root;
}

const invoices = `
import { z } from 'zod';
import { defineRoute } from '@bloomneo/bloom';

const Invoice = z.object({ id: z.string(), total: z.number(), status: z.enum(['draft', 'sent']) });

export const createInvoice = defineRoute({
  method: 'POST',
  path: '/api/invoices',
  auth: 'user',
  body: z.object({ total: z.number().positive(), note: z.string().optional() }),
  response: Invoice,
  summary: 'Create an invoice',
});

export const listAllInvoices = defineRoute({
  method: 'GET',
  path: '/api/admin/invoices',
  auth: { roles: ['admin.system'] },
  tenant: false,
  query: z.object({ page: z.coerce.number().default(1) }),
  response: z.array(Invoice),
});

export const notAContract = { method: 'GET' };
`;

const files = {
  'src/contracts/invoices.contract.ts': invoices,
  'src/api/features/invoices/invoices.route.ts': 'export default await contractRouter([route(createInvoice, h), route(listAllInvoices, h)]);',
  'src/api/features/legacy/legacy.route.ts': "router.get('/', auth.requireLoginToken(), h);",
  'prisma/schema.prisma': 'model Invoice {\n  id String @id\n  tenantId String\n}\n\nmodel Plan {\n  id String @id\n}\n',
  'AGENTS.md': '# My app\n\nHand-written notes.\n',
};

test('describe() renders zod schemas as short TypeScript-like types', () => {
  assert.equal(describeSchema(z.object({ a: z.string(), b: z.number().optional() })), '{ a: string; b?: number }');
  assert.equal(describeSchema(z.array(z.union([z.string(), z.number()]))), '(string | number)[]');
  assert.equal(describeSchema(z.enum(['x', 'y']).nullable()), '"x" | "y" | null');
  assert.equal(describeSchema(z.object({ n: z.coerce.number().default(1) })), '{ n?: number }');
  assert.equal(describeSchema(z.string().transform((s) => s.length)), 'string');
  assert.equal(describeSchema({ '~standard': { vendor: 'valibot' } }), '(valibot schema)');
});

test('the manifest lists contracts (sorted, tenant default applied), features and tenant models', () => {
  const root = app(files);
  const m = buildManifest(root);
  assert.deepEqual(
    m.contracts.map((c) => [c.method, c.path, c.name, c.tenant]),
    [
      ['GET', '/api/admin/invoices', 'listAllInvoices', false],
      ['POST', '/api/invoices', 'createInvoice', true],
    ],
  );
  const create = m.contracts[1];
  assert.equal(create.auth, 'user');
  assert.equal(create.body, '{ total: number; note?: string }');
  assert.equal(create.response, '{ id: string; total: number; status: "draft" | "sent" }');
  assert.deepEqual(m.contracts[0].auth, { roles: ['admin.system'] });
  assert.deepEqual(m.features, [
    { name: 'invoices', file: 'src/api/features/invoices/invoices.route.ts', kind: 'contracts' },
    { name: 'legacy', file: 'src/api/features/legacy/legacy.route.ts', kind: 'router', auth: 'guarded' },
  ]);
  assert.deepEqual(m.tenantModels, ['Invoice']);
});

test('writing keeps hand-written AGENTS.md text, and the section is replaced in place', () => {
  const root = app(files);
  writeManifest(root);
  const agents = readFileSync(join(root, 'AGENTS.md'), 'utf8');
  assert.match(agents, /^# My app\n\nHand-written notes\.\n/);
  assert.match(agents, /`POST \/api\/invoices`<br>Create an invoice \| user \| yes \| body `\{ total: number; note\?: string \}`/);
  assert.match(agents, /`\/api\/legacy` \(guarded\)/);
  // Running again changes nothing.
  assert.deepEqual(manifestFiles(root).stale, []);
  writeManifest(root);
  assert.equal(readFileSync(join(root, 'AGENTS.md'), 'utf8'), agents);
  assert.equal(agents.match(/bloom:manifest:start/g).length, 1);
});

test('bloom check reports stale generated files, and nothing for apps without a manifest', () => {
  const root = app(files);
  assert.deepEqual(checkManifest(root), []);
  writeManifest(root);
  assert.deepEqual(checkManifest(root), []);
  writeFileSync(join(root, 'src/contracts/invoices.contract.ts'), invoices.replace("auth: 'user'", "auth: 'public'"));
  assert.deepEqual(
    checkManifest(root).map((f) => [f.code, f.where]),
    [
      ['MANIFEST_STALE', 'bloom.manifest.json'],
      ['MANIFEST_STALE', 'AGENTS.md'],
    ],
  );
});

test('without tsx the manifest says how to fix it', () => {
  const root = app(files, { link: false });
  assert.throws(() => buildManifest(root), (err) => err instanceof ManifestError && /npm install -D tsx/.test(err.fix));
  writeFileSync(join(root, 'bloom.manifest.json'), '{}');
  assert.deepEqual(checkManifest(root).map((f) => f.code), ['MANIFEST_NOT_BUILT']);
});

test('a contract file that fails to load is named', () => {
  const root = app({ 'src/contracts/bad.contract.ts': "import './missing.js';\nexport const x = 1;" });
  assert.throws(() => buildManifest(root), /bad\.contract\.ts failed to load/);
});
