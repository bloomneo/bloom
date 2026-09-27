/**
 * `bloom upgrade` — move a Bloom 5 app onto 6.
 *
 * Two kinds of result:
 *   edits   mechanical changes that keep the app's behaviour: version pins,
 *           the api-router import swap, the bloom check workflow. Applied
 *           with --write.
 *   manual  things only a person (or agent) can decide, each with the file,
 *           the count and the fix: removed APIs, the page router, casts that
 *           6.0's Express types make unnecessary, the app's old router copy.
 *
 * Dry run by default. --write refuses to run on a dirty git tree, so the
 * result is always reviewable as one diff.
 */
import { existsSync, readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';

export interface Edit {
  file: string;
  description: string;
  /** Content after the edit (whole file). */
  after: string;
  /** True when the file doesn't exist yet. */
  create?: boolean;
}

export interface ManualItem {
  code: string;
  where: string;
  count?: number;
  fix: string;
}

export interface UpgradePlan {
  version: string;
  edits: Edit[];
  manual: ManualItem[];
}

const FRAMEWORK = ['@bloomneo/appkit', '@bloomneo/uikit', '@bloomneo/bloom'] as const;

function walk(dir: string, match: (file: string) => boolean, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir).sort()) {
    if (name === 'node_modules' || name.startsWith('.') || name === 'dist') continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, match, out);
    else if (match(full)) out.push(full);
  }
  return out;
}

// --- package.json -----------------------------------------------------------

function planPackageJson(root: string, version: string, plan: UpgradePlan): void {
  const file = join(root, 'package.json');
  if (!existsSync(file)) return;
  const text = readFileSync(file, 'utf8');
  const pkg = JSON.parse(text);
  const indent = text.match(/^\{\n(\s+)"/)?.[1] ?? '  ';
  const changed: string[] = [];
  pkg.dependencies ??= {};
  pkg.devDependencies ??= {};

  const major = (spec: unknown) => Number(String(spec ?? '').match(/(\d+)\./)?.[1] ?? NaN);
  const appkitFrom = major(pkg.dependencies['@bloomneo/appkit'] ?? pkg.devDependencies['@bloomneo/appkit']);
  const uikitFrom = major(pkg.dependencies['@bloomneo/uikit'] ?? pkg.devDependencies['@bloomneo/uikit']);
  if (appkitFrom < 5) {
    plan.manual.push({
      code: 'UPGRADE_FROM_APPKIT_4',
      where: 'package.json',
      fix: 'appkit 5.0 made tenant mode fail closed: with BLOOM_DB_TENANT on, databaseClass.get() throws when no tenant is resolved. Scope reads with database.tenant(req, fn) / route contracts, and name cross-tenant reads with database.bypass(reason, fn). See appkit CHANGELOG 5.0.0.',
    });
  }
  if (uikitFrom < 4) {
    plan.manual.push({
      code: 'UPGRADE_FROM_UIKIT_2',
      where: 'package.json',
      fix: 'uikit 4.0 removed app chrome (layouts, Header, Footer), 14 primitives and 4 theme presets; imports of them are listed below as REMOVED_UIKIT_EXPORT. Only the base theme remains. See uikit CHANGELOG 4.0.0.',
    });
  }

  for (const name of FRAMEWORK) {
    const section = pkg.devDependencies[name] && !pkg.dependencies[name] ? pkg.devDependencies : pkg.dependencies;
    if (section[name] !== version) {
      changed.push(`${name} ${section[name] ?? '(new)'} → ${version}`);
      section[name] = version;
    }
  }
  if (!pkg.dependencies.zod && !pkg.devDependencies.zod) {
    pkg.dependencies.zod = '^3.24.0';
    changed.push('zod ^3.24.0 (contracts)');
  }
  const isTs = existsSync(join(root, 'tsconfig.json'));
  if (isTs && !pkg.devDependencies.tsx && !pkg.dependencies.tsx) {
    pkg.devDependencies.tsx = '^4.19.0';
    changed.push('tsx (bloom manifest loads contracts with it)');
  }
  if (isTs && !pkg.devDependencies['@types/express'] && !pkg.dependencies['@types/express']) {
    pkg.devDependencies['@types/express'] = '^4.17.21';
    changed.push('@types/express (appkit 6 middleware uses Express types)');
  }
  if (!changed.length) return;
  for (const key of ['dependencies', 'devDependencies'] as const) {
    if (Object.keys(pkg[key]).length === 0) delete pkg[key];
    else pkg[key] = Object.fromEntries(Object.entries(pkg[key]).sort(([a], [b]) => a.localeCompare(b)));
  }
  plan.edits.push({
    file: 'package.json',
    description: `pin ${changed.join('; ')}`,
    after: JSON.stringify(pkg, null, indent) + '\n',
  });
}

// --- server.ts: the app's api-router copy → @bloomneo/appkit/server ---------

const OLD_ROUTER_IMPORT = /^import\s*\{\s*createApiRouter\s*\}\s*from\s*['"]\.\/lib\/api-router(?:\.js)?['"];?[ \t]*$/m;

function planServer(root: string, plan: UpgradePlan): void {
  const file = ['src/api/server.ts', 'src/api/server.js'].map((f) => join(root, f)).find(existsSync);
  if (!file) return;
  let text = readFileSync(file, 'utf8');
  if (!OLD_ROUTER_IMPORT.test(text)) return;
  const calls = text.match(/\bcreateApiRouter\(\s*\)/g)?.length ?? 0;
  if (calls !== 1) {
    plan.manual.push({
      code: 'UPGRADE_API_ROUTER',
      where: relative(root, file),
      fix: `Replace ./lib/api-router with createApiRouter({ featuresDir }) from @bloomneo/appkit/server by hand (found ${calls} createApiRouter() calls, expected 1).`,
    });
    return;
  }
  // ESM has no __dirname unless the file defines it (every Bloom 5 server.ts does).
  const hasDirname = /\bconst\s+__dirname\b/.test(text);
  const hasPath = /^import\s+path\s+from\s+['"](node:)?path['"]/m.test(text);
  let featuresDir: string;
  if (hasDirname && hasPath) {
    featuresDir = "path.join(__dirname, 'features')";
  } else {
    featuresDir = "fileURLToPath(new URL('./features', import.meta.url))";
    if (!/\bfileURLToPath\b/.test(text)) {
      text = text.replace(OLD_ROUTER_IMPORT, (m) => `import { fileURLToPath } from 'node:url';\n${m}`);
    }
  }
  text = text
    .replace(OLD_ROUTER_IMPORT, "import { createApiRouter } from '@bloomneo/appkit/server';")
    .replace(/\bcreateApiRouter\(\s*\)/, `createApiRouter({ featuresDir: ${featuresDir} })`);
  plan.edits.push({
    file: relative(root, file),
    description: 'use createApiRouter from @bloomneo/appkit/server (feature discovery, auth warnings, JSON 404)',
    after: text,
  });
  const copy = ['src/api/lib/api-router.ts', 'src/api/lib/api-router.js'].find((f) => existsSync(join(root, f)));
  if (copy) {
    plan.manual.push({
      code: 'UPGRADE_OLD_API_ROUTER',
      where: copy,
      fix: 'No longer imported by server.ts. Check it for app-specific logic (appkit\'s router already covers the guard warning, unmounted route files, load errors and the JSON 404), move anything else into server.ts, then delete it.',
    });
  }
}

// --- things to decide by hand -----------------------------------------------

interface Pattern {
  code: string;
  regex: RegExp;
  fix: string;
}

const REMOVED: Pattern[] = [
  { code: 'REMOVED_EVENT', regex: /from\s+['"]@bloomneo\/appkit\/event['"]|\beventClass\b/g, fix: 'queueClass jobs for async work; Redis pub/sub directly for fan-out.' },
  { code: 'REMOVED_UTIL', regex: /from\s+['"]@bloomneo\/appkit\/util['"]|\butilClass\b/g, fix: 'Node built-ins (crypto.randomUUID(), structuredClone) or a small local helper.' },
  { code: 'REMOVED_PERMISSIONS', regex: /\.\s*(?:hasPermission|requireUserPermissions|getPermissions)\s*\(/g, fix: 'auth.requireUserRoles([...]) / auth.hasRole() on the role ladder.' },
  { code: 'REMOVED_AUTH_MATRIX', regex: /\.\s*(?:requireScope|requireTier|roleParts)\s*\(/g, fix: 'The linear role ladder: auth.requireUserRoles([...]).' },
  { code: 'REMOVED_PII_HELPERS', regex: /\bauth\w*\s*\.\s*(?:canSeePII|maskPII)\s*\(/g, fix: 'Decide and mask fields in the app\'s own serializer.' },
  { code: 'REMOVED_CSRF', regex: /\bsecurity\w*\s*\.\s*forms\s*\(/g, fix: 'Bearer-token APIs need no CSRF; cookie forms: SameSite session cookies or a maintained CSRF middleware.' },
  { code: 'REMOVED_SANITIZERS', regex: /\bsecurity\w*\s*\.\s*(?:input|html|escape)\s*\(/g, fix: 'Validate with a schema; let React/the template engine escape; DOMPurify if you must accept HTML.' },
  { code: 'REMOVED_SEND_TEMPLATE', regex: /\.\s*sendTemplate\s*\(/g, fix: 'Render html/text in the app and call email.send().' },
  { code: 'REMOVED_ORG_DATABASES', regex: /\bdatabase\w*\s*\.\s*org\s*\(/g, fix: 'One DATABASE_URL per app; tenants are rows (tenant_id).' },
];

const UIKIT_REMOVED: Record<string, string> = {
  Form: 'FormField', FormController: 'FormField', FormItem: 'FormField', FormLabel: 'FormField', FormMessage: 'FormField',
  FormControl: 'FormField', FormDescription: 'FormField',
  HoverCard: 'Tooltip or Popover', HoverCardContent: 'Tooltip or Popover', HoverCardTrigger: 'Tooltip or Popover',
  Command: 'Combobox', CommandInput: 'Combobox', CommandList: 'Combobox', CommandItem: 'Combobox', CommandGroup: 'Combobox', CommandEmpty: 'Combobox',
  detectPlatform: 'useBreakpoint / Capacitor.isNativePlatform()', isTauri: 'useBreakpoint / Capacitor.isNativePlatform()',
  isNative: 'Capacitor.isNativePlatform()', getPlatformCapabilities: 'useBreakpoint',
  useLocalStorage: 'a small local hook', useBackendStatus: 'a small local hook', usePagination: 'DataTable\'s own pagination',
  // Removed in uikit 4.0 — apps still on 2.x/3.x meet these too.
  ...Object.fromEntries(
    ['AdminLayout', 'PageLayout', 'AuthLayout', 'BlankLayout', 'PopupLayout', 'MobileLayout', 'Header', 'HeaderNav', 'Footer', 'Container', 'SafeArea', 'TabBar'].map(
      (n) => [n, 'AppShell (6.0), or a layout route with <Outlet /> and PageHeader per page'],
    ),
  ),
  ...Object.fromEntries(
    ['Skeleton', 'Separator', 'Avatar', 'Progress', 'Accordion', 'Breadcrumb', 'Calendar', 'Collapsible', 'Menubar', 'Pagination', 'Slider', 'Toggle', 'Motion', 'DetailPage'].map(
      (n) => [n, 'a few lines of Tailwind on the token palette (removed in uikit 4.0)'],
    ),
  ),
};

const CASTS: Pattern[] = [
  { code: 'UPGRADE_REQ_ANY', regex: /\(\s*req\s+as\s+any\s*\)\s*\.\s*user\b/g, fix: 'req.user is typed in 6.0 (Express.User). Replace (req as any).user with req.user and handle undefined; add custom claims to Express.User.' },
  { code: 'UPGRADE_MIDDLEWARE_CAST', regex: /\brequire(?:LoginToken|UserRoles|ApiToken)\s*\([^()]*(?:\([^()]*\)[^()]*)*\)\s+as\s+(?:any|unknown\s+as\s+\w+)/g, fix: 'appkit 6 middleware is typed as Express RequestHandler; delete the cast.' },
  { code: 'UPGRADE_ERROR_DUCK_TYPING', regex: /startsWith\(\s*['"]\[@bloomneo\/appkit\//g, fix: 'Every appkit error is an AppKitError (import from @bloomneo/appkit); use instanceof, or let error.handleErrors() handle it.' },
];

function countInto(root: string, files: string[], patterns: Pattern[], plan: UpgradePlan): void {
  for (const p of patterns) {
    for (const file of files) {
      const n = readFileSync(file, 'utf8').match(p.regex)?.length ?? 0;
      if (n) plan.manual.push({ code: p.code, where: relative(root, file), count: n, fix: p.fix });
    }
  }
}

function planManual(root: string, plan: UpgradePlan): void {
  const sources = walk(join(root, 'src'), (f) => /\.(ts|tsx|js|jsx|mjs)$/.test(f) && !f.endsWith('.d.ts'));
  countInto(root, sources, REMOVED, plan);

  for (const file of sources) {
    const text = readFileSync(file, 'utf8');
    for (const m of text.matchAll(/import\s*(?:type\s*)?\{([^}]*)\}\s*from\s*['"]@bloomneo\/uikit(?:\/[\w-]+)?['"]/g)) {
      for (const raw of m[1].split(',')) {
        const name = raw.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0];
        if (UIKIT_REMOVED[name]) {
          plan.manual.push({ code: 'REMOVED_UIKIT_EXPORT', where: relative(root, file), fix: `${name} is not in @bloomneo/uikit 6: use ${UIKIT_REMOVED[name]}.` });
        }
      }
    }
  }

  countInto(root, sources, CASTS, plan);

  const pageRouter = ['src/web/lib/page-router.tsx', 'src/web/lib/page-router.ts'].find((f) => existsSync(join(root, f)));
  if (pageRouter) {
    plan.manual.push({
      code: 'UPGRADE_PAGE_ROUTER',
      where: pageRouter,
      fix: 'Optional: move the import.meta.glob into src/web/pages.ts and render <PageRouter pages={pages} /> from @bloomneo/uikit/router; point vite\'s page-router HMR plugin at src/web/pages.ts; then delete the copy. See MIGRATION-6.md step 3.',
    });
  }

  // Removed env vars — .env.example only; .env holds secrets and is not read.
  const example = join(root, '.env.example');
  if (existsSync(example)) {
    const text = readFileSync(example, 'utf8');
    const removed: Array<[RegExp, string]> = [
      [/^BLOOM_QUEUE_TRANSPORT\s*=\s*redis/m, 'BLOOM_QUEUE_TRANSPORT=redis now throws at startup: use the database transport.'],
      [/^(CLOUDFLARE_R2_\w+|BLOOM_STORAGE_STRATEGY\s*=\s*r2)/m, 'The R2 strategy is gone: use S3 with S3_ENDPOINT=https://<account>.r2.cloudflarestorage.com.'],
      [/^BLOOM_LOGGER_(DATABASE|DB_|HTTP_|WEBHOOK_)/m, 'Logger database/HTTP/webhook transports are gone (ignored): console and file only.'],
      [/^BLOOM_AUTH_(PERMISSIONS|SCOPES|TIERS)\b/m, 'Permissions / matrix auth env vars are ignored in 6.0.'],
      [/^BLOOM_SECURITY_(CSRF_|MAX_INPUT_LENGTH|ALLOWED_TAGS|STRIP_ALL_TAGS)/m, 'CSRF and sanitizer env vars are ignored in 6.0.'],
    ];
    for (const [re, fix] of removed) {
      if (re.test(text)) plan.manual.push({ code: 'REMOVED_ENV', where: '.env.example', fix });
    }
  }
}

// --- CI ---------------------------------------------------------------------

function planWorkflow(root: string, plan: UpgradePlan): void {
  const dir = join(root, '.github', 'workflows');
  const existing = existsSync(dir) ? readdirSync(dir).map((f) => readFileSync(join(dir, f), 'utf8')).join('\n') : '';
  if (/bloomneo\/bloom@|bloom check/.test(existing)) return;
  plan.edits.push({
    file: '.github/workflows/bloom-check.yml',
    create: true,
    description: 'run bloom check on every push and pull request (not strict: existing apps start in warn mode)',
    after: `# Every push and pull request: every route has an auth decision, every
# declared contract is served, and appkit/uikit/bloom are on one version.
# Set strict: true once the warnings are cleared.
name: bloom check

on:
  push:
    branches: [main]
  pull_request:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: bloomneo/bloom@v6
`,
  });
}

// --- entry points -----------------------------------------------------------

export function planUpgrade(root: string, version: string): UpgradePlan {
  const plan: UpgradePlan = { version, edits: [], manual: [] };
  planPackageJson(root, version, plan);
  planServer(root, plan);
  planWorkflow(root, plan);
  planManual(root, plan);
  return plan;
}

export function applyUpgrade(root: string, plan: UpgradePlan): void {
  for (const e of plan.edits) {
    const path = join(root, e.file);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, e.after);
  }
}

export function formatPlan(plan: UpgradePlan, written: boolean): string {
  const lines: string[] = [];
  lines.push(`bloom upgrade → ${plan.version}${written ? '' : ' (dry run — nothing written; --write applies the edits)'}`, '');
  if (plan.edits.length) {
    lines.push(written ? 'Applied:' : 'Would apply:');
    for (const e of plan.edits) lines.push(`  ${e.create ? '+' : '~'} ${e.file}: ${e.description}`);
    lines.push('');
  }
  if (plan.manual.length) {
    // One line per code, listing where it occurs — 108 casts should not be 108 lines.
    const byCode = new Map<string, ManualItem[]>();
    for (const m of plan.manual) byCode.set(m.code, [...(byCode.get(m.code) ?? []), m]);
    lines.push('To do by hand:');
    for (const [code, items] of byCode) {
      const total = items.reduce((n, m) => n + (m.count ?? 1), 0);
      const where = items.slice(0, 5).map((m) => (m.count && m.count > 1 ? `${m.where} (${m.count})` : m.where));
      if (items.length > 5) where.push(`… ${items.length - 5} more files`);
      lines.push(`  ${code} ×${total}  ${where.join(', ')}`);
      const fixes = [...new Set(items.map((m) => m.fix))];
      for (const f of fixes) lines.push(`      fix: ${f}`);
    }
    lines.push('');
  }
  if (!plan.edits.length && !plan.manual.length) lines.push('Nothing to change: the app is on 6.0.', '');
  lines.push('Then: npm install, npx bloom check, and your own tests.');
  return lines.join('\n');
}
