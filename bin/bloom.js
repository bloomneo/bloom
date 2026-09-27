#!/usr/bin/env node

/**
 * Bloom CLI - Fullstack FBCA Framework
 * Combines UIKit (frontend) and AppKit (backend) scaffolding
 */

import { execSync } from 'child_process';
import { randomInt, randomBytes } from 'crypto';
import {
  appendFileSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  rmSync,
  statSync,
} from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LAYER_FLAGS = new Set(['--auth', '--admin', '--desktop', '--mobile']);

/*
 * Preset names, kept because they are what people already type.
 *
 * Each is a shorthand for a set of layers over the `app` base — NOT a separate
 * template directory. The six frozen directories these names used to point at
 * are superseded: they duplicated the whole source tree per combination, so a
 * fix had to land in six places and `userapp + desktop` did not exist at all.
 *
 * The frozen directories were removed in 6.0 (they were reachable only via
 * `--legacy`). Anyone who needs one exactly: `npx @bloomneo/bloom@5 create`.
 */
const PRESETS = {
  basicapp: [],
  userapp: ['auth'],
  adminapp: ['auth', 'admin'],
  'desktop-basicapp': ['desktop'],
  'desktop-userapp': ['auth', 'desktop'],
  'mobile-basicapp': ['mobile'],
};
const command = process.argv[2];
const projectName = process.argv[3];

/*
 * The preset is the next POSITIONAL argument, not simply argv[4] — otherwise
 * `bloom create my-app --admin` reads "--admin" as a preset name and dies
 * with "Unknown template". Flags may appear anywhere.
 *
 * Every preset composes layers onto the one `app` base; with no preset,
 * `bloom create x` builds the base alone (what basicapp means).
 */
const positionals = process.argv.slice(4).filter((a) => !a.startsWith('-'));
const requestedTemplate = positionals[0];
const verbose = process.argv.includes('--verbose');
const skipInstall = process.argv.includes('--skip-install') || process.argv.includes('--no-install');

/**
 * Optional layers, applied over the base template in this order.
 *
 * Order matters: a layer may replace a file the previous one wrote. `admin`
 * ships a `shared/layouts.tsx` registering both the auth and admin shells, so
 * it has to land after `auth`.
 *
 * `--admin` implies `--auth`: an admin console without a sign-in page is not a
 * thing anyone wants, and the admin shell imports `useAuth`.
 */
const LAYER_ORDER = ['auth', 'admin', 'desktop', 'mobile'];

/**
 * Expand the requested layers with whatever they depend on.
 *
 * `--admin` alone is a reasonable thing to type, but the admin console is
 * built on the auth layer's User model and AuthGuard, so it cannot stand on
 * its own. Rather than hardcode that pair, each layer declares its own
 * `requires` in layer.json and this pulls them in transitively — so adding a
 * layer never means editing this file.
 *
 * The result is re-sorted into LAYER_ORDER, which is what makes application
 * order deterministic: a later layer may overwrite an earlier layer's file,
 * and that only means something if the sequence is fixed.
 */
function expandLayerRequires(requested) {
  const resolved = new Set();
  const visit = (name, trail) => {
    if (resolved.has(name)) return;
    if (trail.includes(name)) {
      throw new Error(`Circular layer dependency: ${[...trail, name].join(' -> ')}`);
    }
    const layer = readLayer(name);
    if (!layer) return; // unknown layer — reported later, by the caller
    for (const dep of layer.meta.requires || []) visit(dep, [...trail, name]);
    resolved.add(name);
  };
  for (const name of requested) visit(name, []);
  return LAYER_ORDER.filter((l) => resolved.has(l));
}

/*
 * Layers come from BOTH the preset name and any explicit flags, so
 * `bloom create x userapp --admin` is a coherent thing to type.
 */
const requestedLayers = expandLayerRequires([
  ...(PRESETS[requestedTemplate] ?? []),
  ...LAYER_ORDER.filter((l) => process.argv.includes(`--${l}`)),
]);

// Normalize help flags so `bloom --help`, `bloom -h`, and `bloom help`
// all print the usage screen + exit 0 (success, not an error).
const isHelpFlag = command === '--help' || command === '-h' || command === 'help';

// Normalize version flags.
const isVersionFlag = command === '--version' || command === '-v' || command === 'version';
if (isVersionFlag) {
  const pkg = JSON.parse(
    readFileSync(join(__dirname, '..', 'package.json'), 'utf8'),
  );
  console.log(pkg.version);
  process.exit(0);
}

/**
 * The project name as a safe slug: lowercase, alphanumeric and dashes, never
 * leading with a digit. Used as a CSS class, a theme id and in seeded emails.
 */
function projectSlugOf(name) {
  return (
    String(name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/^(\d)/, 'app-$1') || 'app'
  );
}

/**
 * Process template file with placeholder replacement
 */
function processTemplateFile(sourcePath, destPath, projectName, verbose = false) {
  try {
    let content = readFileSync(sourcePath, 'utf8');

    // Determine actual project name (use current directory name if projectName is '.')
    const actualProjectName = projectName === '.' ? process.cwd().split('/').pop() : projectName;

    // Template placeholders and their replacements
    // A CSS class name and a theme id, so it must be a safe slug: lowercase,
    // alphanumeric and dashes, never leading with a digit. `styles/brand.css`
    // declares `.theme-{{PROJECT_SLUG}}` and `shared/brand.ts` passes the same
    // value to <ThemeProvider theme=…>, so the two must agree exactly.
    const projectSlug = projectSlugOf(actualProjectName);

    // Human-readable display name: `bloom-labs` -> `Bloom Labs`. Used for
    // brand.name and the browser title, where the raw directory name reads as
    // a filesystem artefact rather than a product. Small words stay lowercase
    // the way a title normally would.
    const SMALL = new Set(['a', 'an', 'and', 'as', 'at', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to']);
    const projectTitle = String(actualProjectName)
      .replace(/[-_.]+/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .trim()
      .split(/\s+/)
      .map((w, i) =>
        i > 0 && SMALL.has(w.toLowerCase())
          ? w.toLowerCase()
          : w.charAt(0).toUpperCase() + w.slice(1),
      )
      .join(' ') || actualProjectName;

    /*
     * A slug that is legal as a Java / reverse-DNS package segment.
     *
     * Bundle identifiers (`com.example.<pkg>`) are Java package names on
     * Android and reverse-DNS on iOS. Neither permits the hyphens a kebab-case
     * project slug is full of, and neither may start with a digit. Capacitor
     * rejects the whole `cap add` with "Must be in Java package form with no
     * dashes" — after the project has already been scaffolded.
     */
    const projectPkg =
      projectSlug.replace(/[^a-z0-9]/gi, '').toLowerCase().replace(/^[0-9]+/, '') || 'app';

    const replacements = {
      '{{PROJECT_NAME}}': actualProjectName,
      '{{projectName}}': actualProjectName,
      '{{PROJECT_SLUG}}': projectSlug,
      '{{PROJECT_PKG}}': projectPkg,
      '{{PROJECT_TITLE}}': projectTitle,
      '{{DEFAULT_THEME}}': 'base',
      '{{DEFAULT_MODE}}': 'light',
    };

    // Replace all placeholders
    Object.entries(replacements).forEach(([placeholder, replacement]) => {
      content = content.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), replacement);
      if (verbose && content.includes(placeholder)) {
        console.log(`🔍 [DEBUG] Replaced ${placeholder} with ${replacement}`);
      }
    });

    // Write processed content to destination
    writeFileSync(destPath, content);

    if (verbose) console.log(`🔍 [DEBUG] Template processed: ${sourcePath} -> ${destPath}`);
  } catch (error) {
    console.error(`❌ Error processing template file ${sourcePath}:`, error.message);
    throw error;
  }
}

/**
 * Convert CommonJS package.json to ESM module
 */
function convertToESM(packageObj) {
  // Convert type to module if it's commonjs or missing
  if (!packageObj.type || packageObj.type === 'commonjs') {
    packageObj.type = 'module';
    // Silently convert - will be included in "Configuring fullstack integration" message
  }

  return packageObj;
}

/**
 * Copy Bloom template files to the generated project
 */
/**
 * Apply an optional layer on top of the base template.
 *
 * A layer is an overlay: `templates/layers/<name>/files/` is copied over the
 * scaffolded project, so a layer can both ADD files and REPLACE base ones.
 * `shared/layouts.tsx` is deliberately replaceable that way — the auth layer
 * ships a version that registers the auth shell, and admin one that registers
 * both. Later layers win, so apply order is base -> auth -> admin.
 *
 * `layer.json` declares dependencies, scripts and env the layer needs. They are
 * merged into the generated package.json rather than duplicated in a template,
 * which is what stops six templates drifting apart the way they did before.
 */
/**
 * Copy a directory tree, processing `.template` files through the placeholder
 * substitution and copying everything else verbatim.
 *
 * Shared by the base template and every layer, so a layer can both ADD files
 * and REPLACE base ones — which is how `shared/layouts.tsx` gains an auth shell
 * when you scaffold with `--auth`.
 */
function copyTree(sourceRoot, destRoot, verbose = false) {
  let filesCopied = 0;

  function walk(sourcePath, destPath) {
    for (const item of readdirSync(sourcePath)) {
      const sourceItem = join(sourcePath, item);
      const stat = statSync(sourceItem);

      if (stat.isDirectory()) {
        const destItem = join(destPath, item);
        if (!existsSync(destItem)) mkdirSync(destItem, { recursive: true });
        walk(sourceItem, destItem);
        continue;
      }
      if (!stat.isFile()) continue;

      // A plain package.json in a template is superseded by package.json.template.
      // NOTE: this used to `return` rather than `continue`, which exited the whole
      // walk — so every file after it in that directory was silently skipped.
      if (item === 'package.json') {
        if (verbose) console.log(`🔍 [DEBUG] Skipped ${item} (package.json.template wins)`);
        continue;
      }

      if (item.endsWith('.template')) {
        const destItem = join(destPath, item.replace(/\.template$/, ''));
        processTemplateFile(sourceItem, destItem, projectName, verbose);
      } else {
        copyFileSync(sourceItem, join(destPath, item));
      }
      filesCopied++;
    }
  }

  walk(sourceRoot, destRoot);
  return filesCopied;
}

function readLayer(name) {
  const dir = join(__dirname, '../templates/layers', name);
  const manifest = join(dir, 'layer.json');
  if (!existsSync(manifest)) return null;
  return { name, dir, meta: JSON.parse(readFileSync(manifest, 'utf8')) };
}

function applyLayer(layer, verbose) {
  const filesDir = join(layer.dir, 'files');
  if (existsSync(filesDir)) {
    copyTree(filesDir, process.cwd(), verbose);
  }
  appendPrismaModels(layer, verbose);
  if (verbose) console.log(`🔍 [DEBUG] Applied layer: ${layer.name}`);
}

/**
 * Fold a layer's `prisma/schema.append.prisma` into the project's schema.
 *
 * Layers compose, so a layer cannot ship a whole schema — `admin` needs the
 * `User` model that `auth` declares, and replacing the file would delete it.
 * Each layer instead contributes only its own models and they are concatenated
 * in layer order.
 *
 * copyTree has already placed the fragment in the project, so this reads it
 * from there (not from the template) and removes it afterwards: leaving a
 * stray .prisma file next to schema.prisma makes `prisma generate` ambiguous.
 */
function appendPrismaModels(layer, verbose) {
  const fragment = join(process.cwd(), 'prisma', 'schema.append.prisma');
  const schema = join(process.cwd(), 'prisma', 'schema.prisma');
  if (!existsSync(fragment)) return;

  if (!existsSync(schema)) {
    // No base schema to extend — a layer ordering bug, and one that would
    // otherwise surface much later as a confusing `prisma db push` failure.
    throw new Error(
      `Layer "${layer.name}" contributes Prisma models but no prisma/schema.prisma exists. ` +
        `It likely needs a \`requires\` entry for the layer that creates it.`,
    );
  }

  const body = readFileSync(fragment, 'utf8').trimEnd();
  appendFileSync(schema, `\n\n${body}\n`);
  rmSync(fragment);
  if (verbose) console.log(`🔍 [DEBUG] Appended ${layer.name} models to prisma/schema.prisma`);
}

/** Merge a layer's declared deps/scripts into the project's package.json. */
function mergeLayerPackageJson(layers, verbose) {
  if (!layers.length || !existsSync('package.json')) return;
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  for (const { meta } of layers) {
    for (const field of ['dependencies', 'devDependencies', 'scripts']) {
      if (!meta[field]) continue;
      pkg[field] = { ...(pkg[field] || {}), ...meta[field] };
    }
    /*
     * Top-level keys a layer needs to set on package.json itself — `main` for
     * Electron, `type`, a tool's config block. Kept as an explicit escape
     * hatch rather than merging the whole manifest, so a typo in layer.json
     * cannot silently overwrite `name` or `version`.
     */
    if (meta.packageJson) {
      for (const [key, value] of Object.entries(meta.packageJson)) {
        if (['name', 'version', 'dependencies', 'devDependencies', 'scripts'].includes(key)) {
          throw new Error(
            `Layer manifest may not set packageJson.${key} — use the dedicated field, or leave it to the project.`,
          );
        }
        pkg[key] = value;
      }
    }
  }
  // Keep dependency lists sorted so a diff between two scaffolds is readable.
  for (const field of ['dependencies', 'devDependencies', 'scripts']) {
    if (!pkg[field]) continue;
    pkg[field] = Object.fromEntries(Object.entries(pkg[field]).sort(([a], [b]) => a.localeCompare(b)));
  }
  writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
  if (verbose) console.log('🔍 [DEBUG] Merged layer dependencies into package.json');
}

/** Write .env from the layers' declared env, generating any secrets. */
function writeLayerEnv(layers, verbose, serviceName = 'app') {
  /*
   * Base env, written whether or not any layer was applied.
   *
   * VITE_API_URL exists here so nobody has to guess it. Left unset, a feature
   * that builds its own fetch URL resolves against the Vite dev server, gets
   * index.html back, and fails with "Unexpected token '<'" — an error that
   * names the symptom and hides the cause. shared/api.ts also detects that
   * case now, but the far better fix is for the value to be present.
   */
  const frontendKey = generateRandomSecret('bloom_', 24);
  const entries = [
    '# ── app ────────────────────────────────────────────────────────────────',
    'VITE_API_URL=http://localhost:3000',
    '',
    '# Names this service in logs. appkit refuses to start in production',
    '# without it.',
    `BLOOM_SERVICE_NAME=${serviceName}`,
    '',
    '# AppKit logger scope.',
    '#',
    "# 'minimal' prints one clean line per entry, with any metadata rendered",
    '# compactly as key=value on the same line. That is the default and what',
    '# this template is written for.',
    '#',
    "# 'full' adds the raw metadata as pretty JSON instead — occasionally useful,",
    '# costly otherwise: it repeats service/version/environment on every line and',
    '# runs about 13 lines per request.',
    'BLOOM_LOGGER_SCOPE=minimal',
    '',
    '# Frontend key. In production the API rejects /api calls whose',
    '# X-Frontend-Key header does not match BLOOM_FRONTEND_KEY; the web client',
    '# sends VITE_FRONTEND_KEY. Keep the two equal. It ships in the browser',
    '# bundle, so it deters casual scripted access; it is not a secret.',
    `BLOOM_FRONTEND_KEY=${frontendKey}`,
    `VITE_FRONTEND_KEY=${frontendKey}`,
    '',
  ];
  for (const { name, meta } of layers) {
    if (!meta.env) continue;
    entries.push(`# ── ${name} ${'─'.repeat(Math.max(0, 66 - name.length))}`);
    for (const [key, raw] of Object.entries(meta.env)) {
      const gen = String(raw).match(/^\{\{GENERATE:([a-z_]*):(\d+)\}\}$/);
      // {{GENERATE_HEX:64}}: raw key material (e.g. an AES-256 key) as hex.
      const hex = String(raw).match(/^\{\{GENERATE_HEX:(\d+)\}\}$/);
      const value = gen
        ? generateRandomSecret(gen[1], Number(gen[2]))
        : hex
          ? randomBytes(Math.ceil(Number(hex[1]) / 2)).toString('hex').slice(0, Number(hex[1]))
          : raw;
      entries.push(`${key}=${value}`);
    }
    entries.push('');
  }
  const header = ['# Generated by `bloom create`. Secrets are unique to this project.', ''];
  writeFileSync('.env', header.concat(entries).join('\n'));
  if (verbose) console.log('🔍 [DEBUG] Wrote .env from layer manifests');
}

function copyBloomTemplate(templateType, verbose = false) {
  try {
    const templatePath = join(__dirname, '../templates', templateType);
    if (verbose) console.log(`🔍 [DEBUG] Template path: ${templatePath}`);

    if (!existsSync(templatePath)) {
      console.error(`❌ Template "${templateType}" not found at ${templatePath}`);
      return;
    }

    const filesCopied = copyTree(templatePath, './', verbose);

    console.log('📋 Applied Bloom template files');
    if (verbose) console.log(`🔍 [DEBUG] Total files copied: ${filesCopied}`);

  } catch (error) {
    console.error('❌ Error copying template files:', error.message);
    if (verbose) console.error('🔍 [DEBUG] Full error:', error);
    throw error;
  }
}

/**
 * Generate random strings for secrets (BLOOM_AUTH_SECRET signs every JWT).
 * crypto.randomInt draws from the OS CSPRNG without modulo bias;
 * Math.random() is predictable and must never produce a secret.
 */
function generateRandomSecret(prefix = '', length = 32) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix;
  for (let i = 0; i < length; i++) {
    result += chars[randomInt(chars.length)];
  }
  return result;
}

/**
 * What to do next — one message for every preset.
 *
 * The generic steps come first; each applied layer then adds its own `next`
 * lines from its layer.json (create the database, open the desktop window…),
 * so a layer's instructions live with the layer and never drift from it.
 */
function successMessage({ label, projectName, isCurrentDir, layers, skipInstall }) {
  const name = isCurrentDir ? process.cwd().split('/').pop() : projectName;
  const steps = [
    ...(isCurrentDir ? [] : [`cd ${projectName}`]),
    ...(skipInstall ? ['npm install'] : []),
    'npm run dev             # API on :3000, web on :5173',
  ];
  const where = isCurrentDir ? 'installed in the current directory' : `created in ./${projectName}`;
  const blocks = layers
    .filter(({ meta }) => meta.next?.length)
    .map(({ name: layer, meta }) =>
      [`${layer} layer:`, ...meta.next.map((l) => (l ? `  ${l.replaceAll('{{PROJECT_SLUG}}', projectSlugOf(name))}` : ''))].join('\n'),
    );
  return `
✅ Bloom ${label} ${where}${layers.length ? ` (layers: ${layers.map((l) => l.name).join(', ')})` : ''}

Next steps:
${steps.map((l) => `  ${l}`).join('\n')}
${blocks.length ? `\n${blocks.join('\n\n')}\n` : ''}
Build and check:
  npm run build && npm start   # production build, served by the API
  npx bloom check              # every route has an auth decision; versions in step

Agent docs: AGENTS.md, plus docs/ (copied from the installed framework on npm install).
`;
}

if (!command || isHelpFlag) {
  console.log(`
🔥 Bloom Framework - Fullstack Apps

Usage:
  bloom create <project-name> [template]  Create new fullstack project
  bloom create . [template]               Install in current directory
  bloom start                             Start production server (requires build)
  bloom check [--json] [--strict] [--no-db] [--probe <url>]
                                          Verify the app: route auth, served
                                          contracts, row-level security,
                                          versions; --probe attacks a running
                                          local app across tenants
  bloom upgrade [--write] [--to <ver>]    Move a Bloom 5 app to 6: pins, the
                                          api-router swap, a CI workflow; lists
                                          what must be done by hand. Dry run
                                          unless --write (clean git tree)
  bloom manifest [--check]                Write bloom.manifest.json and the
                                          generated AGENTS.md API section;
                                          --check exits 1 if out of date
  bloom --help | -h | help                Show this help
  bloom --version | -v | version          Print the installed bloom version

Templates (named sets of layers over one base app):
  basicapp            Web app + API: pages, layouts, route contracts (default)
  userapp             basicapp + auth: sign-in, users, dashboard (--auth)
  adminapp            userapp + admin console: users, audit log, settings
                        (--auth --admin)
  desktop-basicapp    basicapp wrapped as an Electron desktop app (--desktop)
  desktop-userapp     userapp wrapped as an Electron desktop app (--auth --desktop)
  mobile-basicapp     basicapp wrapped for iOS/Android with Capacitor (--mobile)

Layers (add to any template; presets are named sets of these):
  --auth              Email/password auth, users, Prisma
  --admin             Admin console: users, audit log, settings (adds --auth)
  --desktop           Electron wrapper around the same web build and API
  --mobile            Capacitor wrapper for iOS and Android

Flags:
  --verbose           Verbose logging during scaffold
  --skip-install      Scaffold files only; skip npm install (for CI / dry-run)

Examples:
  bloom create my-app                    # Create basicapp in my-app/ directory
  bloom create my-app basicapp           # Same as above
  bloom create . basicapp                # Install basicapp in current directory
  bloom create my-app --auth --mobile    # Web app with auth, wrapped for iOS/Android
  bloom create my-app --skip-install     # Scaffold without running npm install
  bloom start                            # Start production server after build
`);
  // Running with no args is usage-as-error (exit 1); explicit help flags
  // are success (exit 0) so shell pipelines handle them normally.
  process.exit(isHelpFlag ? 0 : 1);
}

if (command === 'create') {
  if (!projectName) {
    console.error(
      '❌ Please provide a project name or "." for current directory: bloom create <project-name>'
    );
    process.exit(1);
  }

  /*
   * --legacy reached the frozen pre-5.1 template directories. They were
   * removed in 6.0; say where they went instead of silently ignoring the flag.
   */
  if (process.argv.includes('--legacy')) {
    console.error(
      '❌ --legacy was removed in 6.0 along with the frozen template directories.\n' +
        '   Drop the flag to get the same app composed from layers, or use\n' +
        '   `npx @bloomneo/bloom@5 create ...` for the exact pre-6.0 tree.',
    );
    process.exit(1);
  }

  // Validate the preset name
  const validNames = ['app', ...Object.keys(PRESETS)];
  if (requestedTemplate && !validNames.includes(requestedTemplate)) {
    console.error(`❌ Unknown template "${requestedTemplate}". Available: ${validNames.join(', ')}`);
    process.exit(1);
  }
  const label = requestedTemplate && requestedTemplate !== 'app' ? requestedTemplate : 'basicapp';

  const isCurrentDir = projectName === '.';

  if (isCurrentDir) {
    console.log(`🚀 Installing Bloom ${label} in current directory`);

    // Check if current directory has package.json and warn about overwrite
    if (existsSync('./package.json')) {
      console.log('📦 Found existing package.json - will merge with Bloom configuration');
    }
  } else {
    console.log(`🚀 Creating Bloom ${label} project: ${projectName}`);

    try {
      // Create project directory
      if (existsSync(projectName)) {
        console.error(`❌ Directory ${projectName} already exists`);
        process.exit(1);
      }

      mkdirSync(projectName);
      process.chdir(projectName);
    } catch (error) {
      console.error('❌ Error creating project directory:', error.message);
      process.exit(1);
    }
  }

  try {
    console.log('🚀 Creating Bloom fullstack application...');
    if (verbose) console.log('🔍 [DEBUG] Copying Bloom template files...');

    // The base app, then the layers on top, in dependency order, each able
    // to add or replace files.
    copyBloomTemplate('app', verbose);

    const layers = requestedLayers.map(readLayer).filter(Boolean);
    for (const layer of layers) {
      applyLayer(layer, verbose);
      console.log(`🧩 Added layer: ${layer.name} — ${layer.meta.description}`);
    }
    if (layers.length) {
      mergeLayerPackageJson(layers, verbose);
    }
    // Always: the base block carries VITE_API_URL, the frontend key and the
    // auth secret, which every scaffold needs whether or not a layer was applied.
    writeLayerEnv(layers, verbose, projectName === '.' ? process.cwd().split('/').pop() : projectName);

    if (skipInstall) {
      console.log('⏭️  Skipping npm install (--skip-install). Run `npm install` manually in the project dir.');
    } else {
      console.log('🎉 Installing dependencies...');
      if (verbose) console.log('🔍 [DEBUG] Running: npm install');
      execSync('npm install', { stdio: verbose ? 'inherit' : 'pipe' });
      if (verbose) console.log('🔍 [DEBUG] Dependencies installed');
      // The manifest opts the app into drift checking (bloom check fails when
      // it is stale). It needs the installed tsx, so only after install.
      try {
        const { writeManifest } = await import('../dist/manifest/index.js');
        writeManifest(process.cwd());
        if (verbose) console.log('🔍 [DEBUG] Wrote bloom.manifest.json');
      } catch (err) {
        console.warn(`⚠️  bloom.manifest.json not written (${err.message}). Run: npx bloom manifest`);
      }
    }

    console.log(successMessage({ label, projectName, isCurrentDir, layers, skipInstall }));
  } catch (error) {
    console.error('❌ Error creating project:', error.message);
    process.exit(1);
  }
} else if (command === 'start') {
  console.log('🔍 Checking build files...');

  const distDir = './dist';
  const apiServerPath = join(distDir, 'api/server.js');
  const webIndexPath = join(distDir, 'index.html');

  if (!existsSync(distDir)) {
    console.error('❌ Build not found! Please run "npm run build" first.');
    console.log('💡 Run: npm run build');
    process.exit(1);
  }

  if (!existsSync(apiServerPath)) {
    console.error('❌ API build not found! Backend server missing.');
    console.log('💡 Run: npm run build:api');
    process.exit(1);
  }

  if (!existsSync(webIndexPath)) {
    console.error('❌ Web build not found! Frontend build missing.');
    console.log('💡 Run: npm run build:web');
    process.exit(1);
  }

  console.log('✅ Build files found. Starting production server...');

  try {
    execSync('npm run start:api', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Error starting server:', error.message);
    process.exit(1);
  }
} else if (command === 'upgrade') {
  // Dry run by default. --write applies the mechanical edits, and only on a
  // clean git tree so the result is one reviewable diff.
  const { planUpgrade, applyUpgrade, formatPlan } = await import('../dist/upgrade/index.js');
  const toAt = process.argv.indexOf('--to');
  const version = toAt !== -1 ? process.argv[toAt + 1] : JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8')).version;
  const write = process.argv.includes('--write');
  const root = process.cwd();
  if (!existsSync(join(root, 'package.json'))) {
    console.error('❌ No package.json here. Run bloom upgrade in the app root.');
    process.exit(1);
  }
  const plan = planUpgrade(root, version);
  if (write && plan.edits.length) {
    let dirty;
    try {
      dirty = execSync('git status --porcelain', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    } catch {
      dirty = null;
    }
    if (dirty === null && !process.argv.includes('--force')) {
      console.error('❌ Not a git repository. Commit the app to git first (or pass --force) so the upgrade is one reviewable diff.');
      process.exit(1);
    }
    if (dirty && !process.argv.includes('--force')) {
      console.error('❌ Uncommitted changes. Commit or stash them first (or pass --force) so the upgrade is one reviewable diff.');
      process.exit(1);
    }
    applyUpgrade(root, plan);
  }
  const json = { version: plan.version, written: write, edits: plan.edits.map(({ after, ...e }) => e), manual: plan.manual };
  console.log(process.argv.includes('--json') ? JSON.stringify(json, null, 2) : formatPlan(plan, write));
} else if (command === 'manifest') {
  // Write bloom.manifest.json and the generated AGENTS.md section; with
  // --check, write nothing and exit 1 when either is out of date.
  const { manifestFiles, writeManifest, ManifestError } = await import('../dist/manifest/index.js');
  const checkOnly = process.argv.includes('--check');
  try {
    const files = checkOnly ? manifestFiles(process.cwd()) : writeManifest(process.cwd());
    const count = JSON.parse(files.expected['bloom.manifest.json']).contracts.length;
    if (checkOnly) {
      if (files.stale.length) {
        console.error(`❌ Out of date: ${files.stale.join(', ')}. Run: npx bloom manifest`);
        process.exit(1);
      }
      console.log(`✅ manifest up to date (${count} contracts)`);
    } else {
      console.log(files.stale.length ? `✅ wrote ${files.stale.join(', ')} (${count} contracts)` : `✅ manifest already up to date (${count} contracts)`);
    }
  } catch (err) {
    if (!(err instanceof ManifestError)) throw err;
    console.error(`❌ ${err.message}\n   fix: ${err.fix}`);
    process.exit(1);
  }
} else if (command === 'check') {
  // Load the app's .env without overriding what the shell already set, so
  // DATABASE_URL / BLOOM_DB_TENANT match what the app runs with.
  const envFile = join(process.cwd(), '.env');
  if (existsSync(envFile)) {
    for (const line of readFileSync(envFile, 'utf8').split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  const { runCheck, formatReport } = await import('../dist/check/index.js');
  // --probe <baseUrl>: identities come from BLOOM_CHECK_IDENTITIES (JSON array
  // of { label, email, password }) — two users in different tenants.
  const probeAt = process.argv.indexOf('--probe');
  let probe;
  if (probeAt !== -1) {
    const baseUrl = process.argv[probeAt + 1] || 'http://localhost:3000';
    let identities = [];
    try {
      identities = JSON.parse(process.env.BLOOM_CHECK_IDENTITIES || '[]');
    } catch {
      console.error('❌ BLOOM_CHECK_IDENTITIES must be a JSON array of { label, email, password }');
      process.exit(1);
    }
    probe = { baseUrl, identities, allowDestructive: process.argv.includes('--destructive') };
  }
  const report = await runCheck({
    strict: process.argv.includes('--strict'),
    skipDb: process.argv.includes('--no-db'),
    probe,
  });
  console.log(process.argv.includes('--json') ? JSON.stringify(report, null, 2) : formatReport(report));
  process.exit(report.ok ? 0 : 1);
} else {
  console.error(`❌ Unknown command: ${command}`);
  process.exit(1);
}
