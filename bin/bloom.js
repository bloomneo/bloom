#!/usr/bin/env node

/**
 * Bloom CLI - Fullstack FBCA Framework
 * Combines UIKit (frontend) and AppKit (backend) scaffolding
 */

import { execSync } from 'child_process';
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
 * `--legacy` still resolves to the old directories for one release, for anyone
 * mid-project who needs the exact tree they started from.
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
 * The template is the next POSITIONAL argument, not simply argv[4] — otherwise
 * `bloom create my-app --admin` reads "--admin" as a template name and dies
 * with "Invalid template". Flags may appear anywhere.
 *
 * The default depends on whether layers were requested: `--auth`/`--admin`
 * compose onto the `app` base, whereas a bare `bloom create x` still means the
 * legacy basicapp until those templates are retired.
 */
const positionals = process.argv.slice(4).filter((a) => !a.startsWith('-'));

/*
 * Every preset builds on `app`. Only `--legacy` reaches the frozen directory
 * of the same name.
 */
const requestedTemplate = positionals[0];
const templateType =
  process.argv.includes('--legacy')
    ? requestedTemplate || 'basicapp'
    : requestedTemplate && requestedTemplate in PRESETS
      ? 'app'
      : requestedTemplate || 'app';
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

const useLegacy = process.argv.includes('--legacy');

if (useLegacy) {
  console.warn(
    '⚠️  --legacy uses the frozen pre-5.0 template directories.\n' +
      '   They duplicate the whole source tree per combination and receive fixes\n' +
      '   only for security. They will be removed in 6.0. Drop the flag to get\n' +
      '   the same app composed from layers.\n',
  );
}

/*
 * Layers come from BOTH the preset name and any explicit flags, so
 * `bloom create x userapp --admin` is a coherent thing to type.
 */
const requestedLayers = expandLayerRequires([
  ...(useLegacy ? [] : PRESETS[positionals[0]] ?? []),
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
 * Process template file with placeholder replacement
 */
function processTemplateFile(sourcePath, destPath, projectName, verbose = false, extraReplacements = {}) {
  try {
    let content = readFileSync(sourcePath, 'utf8');

    // Determine actual project name (use current directory name if projectName is '.')
    const actualProjectName = projectName === '.' ? process.cwd().split('/').pop() : projectName;

    // Template placeholders and their replacements
    // A CSS class name and a theme id, so it must be a safe slug: lowercase,
    // alphanumeric and dashes, never leading with a digit. `styles/brand.css`
    // declares `.theme-{{PROJECT_SLUG}}` and `shared/brand.ts` passes the same
    // value to <ThemeProvider theme=…>, so the two must agree exactly.
    const projectSlug =
      String(actualProjectName)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/^(\d)/, 'app-$1') || 'app';

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
      ...extraReplacements
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
function copyTree(sourceRoot, destRoot, verbose = false, extraReplacements = {}) {
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
        processTemplateFile(sourceItem, destItem, projectName, verbose, extraReplacements);
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

function applyLayer(layer, verbose, replacements) {
  const filesDir = join(layer.dir, 'files');
  if (existsSync(filesDir)) {
    copyTree(filesDir, process.cwd(), verbose, replacements);
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
function writeLayerEnv(layers, verbose) {
  const entries = [];
  for (const { name, meta } of layers) {
    if (!meta.env) continue;
    entries.push(`# ── ${name} ${'─'.repeat(Math.max(0, 66 - name.length))}`);
    for (const [key, raw] of Object.entries(meta.env)) {
      const gen = String(raw).match(/^\{\{GENERATE:([a-z_]*):(\d+)\}\}$/);
      entries.push(`${key}=${gen ? generateRandomSecret(gen[1], Number(gen[2])) : raw}`);
    }
    entries.push('');
  }
  if (!entries.length) return;
  const header = ['# Generated by `bloom create`. Secrets are unique to this project.', ''];
  writeFileSync('.env', header.concat(entries).join('\n'));
  if (verbose) console.log('🔍 [DEBUG] Wrote .env from layer manifests');
}

function copyBloomTemplate(templateType, verbose = false, extraReplacements = {}) {
  try {
    const templatePath = join(__dirname, '../templates', templateType);
    if (verbose) console.log(`🔍 [DEBUG] Template path: ${templatePath}`);

    if (!existsSync(templatePath)) {
      console.error(`❌ Template "${templateType}" not found at ${templatePath}`);
      return;
    }

    const filesCopied = copyTree(templatePath, './', verbose, extraReplacements);

    console.log('📋 Applied Bloom template files');
    if (verbose) console.log(`🔍 [DEBUG] Total files copied: ${filesCopied}`);

  } catch (error) {
    console.error('❌ Error copying template files:', error.message);
    if (verbose) console.error('🔍 [DEBUG] Full error:', error);
    throw error;
  }
}

/**
 * Generate cryptographically secure random strings for secrets
 */
function generateRandomSecret(prefix = '', length = 32) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix;
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Create .env file with random values for userapp template
 */
function createUserappEnvFile(projectName, verbose = false, templateType = 'userapp') {
  try {
    const envPath = './.env';

    // Generate random values similar to appkit
    const jwtSecret = generateRandomSecret('jwt_', 48);
    const authSecret = generateRandomSecret('auth_', 36);
    const defaultPassword = generateRandomSecret('', 12);
    const frontendKey = generateRandomSecret('bloom_', 24);
    const sessionSecret = generateRandomSecret('session_', 32);

    // adminapp adds a few feature flags. Keeping them in one trailing block
    // so the core .env stays familiar to userapp users and the admin extras
    // are clearly grouped. Defaults are sensible out of the box; each flag
    // has a comment pointing at the code that reads it.
    const adminBlock = templateType === 'adminapp'
      ? `
# --- adminapp feature flags ---------------------------------------------
# Allowed role:level pairs. Parsed by src/api/features/admin/admin.roles.ts
# on server boot. Format: comma-separated, each pair "role:level".
# The template ships three tiers: admin (full), moderator (user support),
# user (the default for signups). Add more if you need them.
ADMIN_USER_ROLES="admin:system,moderator:manage,user:basic"

# Master switch for the audit log. When false, auditService.logAudit() is a
# no-op — useful for early development. Read by audit.service.ts.
ADMIN_ENABLE_AUDIT_LOG=true

# Comma-separated list of dashboard widget keys to render on /admin.
# Widget implementations live in src/web/features/admin/pages/dashboard.tsx.
# Remove a key to hide a widget; add a new key after registering it there.
ADMIN_DASHBOARD_WIDGETS="users,signups,activity"
`
      : '';


    // Create .env content from template
    const envContent = `# Database Configuration
# For development, you can use PostgreSQL or SQLite
# PostgreSQL (recommended for production):
DATABASE_URL="postgresql://username:password@localhost:5432/${projectName}"

# SQLite (good for development):
# DATABASE_URL="file:./prisma/dev.db"

# JWT Configuration
JWT_SECRET="${jwtSecret}"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN="http://localhost:5173"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration (for verification emails)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
# EMAIL_FROM=noreply@${projectName}.com

# Frontend Configuration (used by Vite)
# Development: Use localhost
VITE_API_URL=http://localhost:3000
# Production: Update this to your deployed API URL (e.g., https://your-app.fly.dev)
# VITE_API_URL=https://${projectName}.fly.dev

VITE_APP_NAME="${projectName}"
# Vite Environment Variables (Frontend — exposed to the browser)
VITE_FRONTEND_KEY=${frontendKey}

# AppKit auth — server-side JWT signing secret. @bloomneo/appkit reads this
# at authClass.get() time. Rotating invalidates every existing token.
BLOOM_AUTH_SECRET=${authSecret}

# AppKit frontend-key gate — server-side check that requests came from the
# expected Vite build. Pair with VITE_FRONTEND_KEY above.
BLOOM_FRONTEND_KEY=${frontendKey}

DEFAULT_USER_PASSWORD=${defaultPassword}

# Security Configuration
BCRYPT_ROUNDS=12
PASSWORD_MIN_LENGTH=8

# Logging Configuration
LOG_LEVEL=info
LOG_TO_FILE=true

# Session Configuration
SESSION_SECRET="${sessionSecret}"
SESSION_MAX_AGE=86400000
${adminBlock}`;

    writeFileSync(envPath, envContent);
    console.log('🔑 Generated .env file with secure random values');
    if (verbose) {
      console.log('🔍 [DEBUG] Generated secure secrets for JWT, auth, and passwords');
    }

  } catch (error) {
    console.error('⚠️  Could not create .env file:', error.message);
    if (verbose) console.error('🔍 [DEBUG] Full error:', error);
    // Don't throw - this is not critical, user can still copy from .env.example
  }
}

/**
 * Add VITE_API_URL to .env file for frontend API configuration
 */
function addViteApiUrl() {
  try {
    const envPath = './.env';

    // Check if .env exists
    if (existsSync(envPath)) {
      let envContent = readFileSync(envPath, 'utf8');

      // Check if VITE_API_URL already exists
      if (!envContent.includes('VITE_API_URL')) {
        // Add VITE_API_URL to the end of the file
        envContent += '\n# Frontend API Configuration\nVITE_API_URL=http://localhost:3000\n';
        writeFileSync(envPath, envContent);
      }
    }
  } catch (error) {
    console.error('⚠️  Could not add VITE_API_URL to .env:', error.message);
    // Don't throw - this is not critical
  }
}


if (!command || isHelpFlag) {
  console.log(`
🔥 Bloom Framework - Fullstack Apps

Usage:
  bloom create <project-name> [template]  Create new fullstack project
  bloom create . [template]               Install in current directory
  bloom start                             Start production server (requires build)
  bloom --help | -h | help                Show this help
  bloom --version | -v | version          Print the installed bloom version

Templates:
  basicapp            Basic app with routing and features (default)
  userapp             User management with auth, roles, and admin panel
  adminapp            Admin console — userapp + audit log, settings, dashboard,
                        mobile bottom-nav, public marketing + legal pages
  desktop-basicapp    Electron desktop app with FBCA (cross-platform)
  desktop-userapp     Desktop user management with SQLite and PIN recovery
  mobile-basicapp     Mobile app for iOS/Android with Capacitor (UI-only)

Flags:
  --verbose           Verbose logging during scaffold
  --skip-install      Scaffold files only; skip npm install (for CI / dry-run)

Examples:
  bloom create my-app                    # Create basicapp in my-app/ directory
  bloom create my-app basicapp           # Same as above
  bloom create . basicapp                # Install basicapp in current directory
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

  // Validate template type
  const validNames = ['app', ...Object.keys(PRESETS)];
  if (requestedTemplate && !validNames.includes(requestedTemplate)) {
    console.error(`❌ Unknown template "${requestedTemplate}". Available: ${validNames.join(', ')}`);
    process.exit(1);
  }

  // Check if template exists
  const templatePath = join(__dirname, '../templates', templateType);
  if (!existsSync(templatePath)) {
    console.error(`❌ Template "${templateType}" is not yet available. Currently available: basicapp, userapp, desktop-basicapp, desktop-userapp`);
    process.exit(1);
  }

  const isCurrentDir = projectName === '.';

  if (isCurrentDir) {
    console.log(`🚀 Installing Bloom ${templateType} in current directory`);

    // Check if current directory has package.json and warn about overwrite
    if (existsSync('./package.json')) {
      console.log('📦 Found existing package.json - will merge with Bloom configuration');
    }
  } else {
    console.log(`🚀 Creating Bloom ${templateType} project: ${projectName}`);

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

    // Generate frontend key for userapp/adminapp. adminapp is a superset of
    // userapp (auth + admin console on top) so it needs the same secret.
    // `bloom_` prefix matches the @bloomneo ecosystem convention.
    let extraReplacements = {};
    if (templateType === 'userapp' || templateType === 'adminapp') {
      const frontendKey = generateRandomSecret('bloom_', 24);
      extraReplacements['{{VITE_FRONTEND_KEY}}'] = frontendKey;
    }

    // Generate secrets for desktop-userapp template. The placeholder name
    // matches what desktop-userapp/.env.example.template actually uses
    // (`{{BLOOM_AUTH_SECRET}}`). A pre-4.0.1 mismatch (template had the
    // right placeholder but this code replaced the old-scope name) meant
    // the placeholder was never filled and appkit auth broke.
    if (templateType === 'desktop-userapp') {
      const jwtSecret = generateRandomSecret('jwt_', 48);
      const authSecret = generateRandomSecret('auth_', 36);
      extraReplacements['{{JWT_SECRET}}'] = jwtSecret;
      extraReplacements['{{BLOOM_AUTH_SECRET}}'] = authSecret;
    }

    // Copy complete Bloom template (includes both frontend and backend)
    copyBloomTemplate(templateType, verbose, extraReplacements);

    // Layers go on top, in dependency order, each able to add or replace files.
    const layers = requestedLayers.map(readLayer).filter(Boolean);
    for (const layer of layers) {
      applyLayer(layer, verbose, extraReplacements);
      console.log(`🧩 Added layer: ${layer.name} — ${layer.meta.description}`);
    }
    if (layers.length) {
      mergeLayerPackageJson(layers, verbose);
      writeLayerEnv(layers, verbose);
    }

    // Create .env file with random values for userapp + adminapp.
    // adminapp uses the same env shape (plus ADMIN_* flags) so it shares
    // the userapp env-file generator.
    if (templateType === 'userapp' || templateType === 'adminapp') {
      const actualProjectName = projectName === '.' ? process.cwd().split('/').pop() : projectName;
      createUserappEnvFile(actualProjectName, verbose, templateType);
    }

    if (skipInstall) {
      console.log('⏭️  Skipping npm install (--skip-install). Run `npm install` manually in the project dir.');
    } else {
      console.log('🎉 Installing dependencies...');
      if (verbose) console.log('🔍 [DEBUG] Running: npm install');
      execSync('npm install', { stdio: verbose ? 'inherit' : 'pipe' });
      if (verbose) console.log('🔍 [DEBUG] Dependencies installed');
    }

    // Clean up unnecessary directories for basicapp
    if (templateType === 'basicapp') {
      if (verbose) console.log('🔍 [DEBUG] Cleaning up unnecessary directories...');
      try {
        if (existsSync('./src/utils') && readdirSync('./src/utils').length === 0) {
          execSync('rmdir src/utils', { stdio: 'pipe' });
          if (verbose) console.log('🔍 [DEBUG] Removed empty src/utils directory');
        }
      } catch (error) {
        // Ignore cleanup errors
        if (verbose) console.log('🔍 [DEBUG] Utils directory cleanup skipped:', error.message);
      }
    }

    if (isCurrentDir) {
      if (templateType === 'userapp') {
        console.log(`
✅ Bloom ${templateType} installed successfully!

📋 Setup steps:
  1. Edit .env with your database settings (auto-generated with secure secrets)
  2. npx prisma db push           # Setup database
  3. npm run db:seed             # Add sample data

🚀 Development:
  npm run dev          # Both API (3000) + Web (5173)
  npm run dev:api      # Backend only
  npm run dev:web      # Frontend only

🏗️ Production:
  npm run build        # Build for production
  npm start           # Start production server

💡 Default admin login: admin@example.com / admin123
`);
      } else if (templateType === 'adminapp') {
        console.log(`
✅ Bloom adminapp installed successfully!

📋 Setup steps:
  1. Edit .env with your database settings (auto-generated with secure secrets)
  2. npx prisma db push           # Setup database
  3. npm run db:seed             # Add sample data

🚀 Development:
  npm run dev          # Both API (3000) + Web (5173)

🔐 First login:        admin@example.com / admin123
🧩 Feature flags:      see ADMIN_* block in .env
`);
      } else if (templateType === 'desktop-basicapp') {
        console.log(`
✅ Bloom Desktop installed successfully!

🚀 Development:
  npm run dev          # Start Electron + Backend + Frontend

📦 Build Desktop App:
  npm run electron:build   # Creates .exe/.dmg/.AppImage in release/

💡 Your desktop app will open automatically when you run "npm run dev"!
`);
      } else if (templateType === 'desktop-userapp') {
        console.log(`
✅ Bloom Desktop UserApp installed successfully!

🔐 First Run:
  Setup wizard will appear automatically to create your admin account

🚀 Development:
  npm run dev          # Start Electron + Backend + Frontend

📦 Build Desktop App:
  npm run electron:build   # Creates .exe/.dmg/.AppImage in release/

💡 Features:
  - Complete user management with RBAC
  - SQLite database (better-sqlite3)
  - 4-digit PIN recovery for admins
  - First-run setup wizard
  - Offline-first architecture
`);
      } else if (templateType === 'mobile-basicapp') {
        console.log(`
✅ Bloom Mobile installed successfully!

📱 Requirements:
  iOS: Xcode 15+ + CocoaPods (brew install cocoapods)
  Android: Android Studio + Java JDK 21+ (21, 25, or newer)

⚡ Quick Start:
  npm install                      # Install dependencies
  cd ios/App && pod install && cd ../..  # Install iOS native deps (first time)
  npm run mobile:sync:android      # Sync Android platform
  npm run mobile:sync:ios          # Sync iOS platform

🚀 Development:
  npm run dev                      # Start dev server (5173)
  npm run mobile:run:android       # Run on Android emulator
  npm run mobile:run:ios           # Run on iOS simulator

📦 Production Build:
  npm run android:build            # Build APK
  npm run ios:build                # Build .app

💡 Features:
  - Cross-platform (iOS + Android)
  - Compatible with Java 21, 25, and newer versions
  - Hot reload during development
  - Bloom branding and icon
  - Native keyboard handling
  - 5 UIKit themes

📚 Documentation:
  • UIKit reference (for components/hooks): ./docs/uikit.md — copied by postinstall
  • Mobile platform setup: https://capacitorjs.com/docs/getting-started
  • iOS: Xcode 15+, CocoaPods (\`pod install\` in ios/App/)
  • Android: Android Studio, Java 21+

⚠️  IMPORTANT:
  - Android: Requires Java 21+ (NOT Java 17)
  - iOS: Requires CocoaPods (brew install cocoapods)
  - Android SDK location must be set in android/local.properties
`);
      } else {
        console.log(`
✅ Bloom ${templateType} installed successfully!

🚀 Development:
  npm run dev          # Both API (3000) + Web (5173)
  npm run dev:api      # Backend only
  npm run dev:web      # Frontend only

🏗️ Production:
  npm run build        # Build for production
  npm start           # Start production server

💡 Run "npm run dev" to get started!
`);
      }
    } else {
      if (templateType === 'userapp') {
        console.log(`
✅ Bloom ${templateType} project ${projectName} created successfully!

Next steps:
  cd ${projectName}
  # 1. Ensure PostgreSQL is running locally (or update DATABASE_URL in .env)
  # 2. Apply schema + seed data + start dev servers:
  npm run db:push                # Create tables in your database
  npm run db:seed                # Add sample data (optional)
  npm run dev                    # Start API (3000) + Web (5173)

🚀 Development options:
  npm run dev          # Both API (3000) + Web (5173)
  npm run dev:api      # Backend only
  npm run dev:web      # Frontend only

🏗️ Production:
  npm run build        # Build for production
  npm start           # Start production server

💡 Default admin login: admin@example.com / admin123
`);
      } else if (templateType === 'adminapp') {
        console.log(`
✅ Bloom adminapp project ${projectName} created successfully!

Next steps:
  cd ${projectName}
  # 1. Ensure PostgreSQL is running locally (or update DATABASE_URL in .env)
  # 2. Apply schema + seed data + start dev servers:
  npm run db:push                # Create tables in your database
  npm run db:seed                # Add sample data (optional)
  npm run dev                    # Start API (3000) + Web (5173)

🏢 What's inside:
  Web (public):  /, /about, /contact, /terms, /privacy, /refund, /cancellation
  Web (app):     /login, /register, /account
  Web (admin):   /admin, /admin/users, /admin/audit, /admin/settings
  API:           /api/auth, /api/user, /api/audit, /api/settings, /api/admin

🚀 Development:
  npm run dev          # Both API (3000) + Web (5173)
  npm run dev:api      # Backend only
  npm run dev:web      # Frontend only

🏗️ Production:
  npm run build        # Build for production
  npm start           # Start production server

🔐 First login:        admin@example.com / admin123
🧩 Feature flags:      see ADMIN_* block in .env
📱 Mobile:             admin sidebar becomes a bottom tab bar < 768px
`);
      } else if (templateType === 'desktop-basicapp') {
        console.log(`
✅ Bloom Desktop project ${projectName} created successfully!

Next steps:
  cd ${projectName}
  npm run dev

🚀 Development:
  npm run dev          # Start Electron + Backend + Frontend

📦 Build Desktop App:
  npm run electron:build   # Creates .exe/.dmg/.AppImage

💡 Your desktop app will open automatically!
`);
      } else if (templateType === 'desktop-userapp') {
        console.log(`
✅ Bloom Desktop UserApp project ${projectName} created successfully!

Next steps:
  cd ${projectName}
  npm run dev

🔐 First Run:
  Setup wizard will appear to create your admin.system account

🚀 Development:
  npm run dev          # Start Electron + Backend + Frontend

📦 Build Desktop App:
  npm run electron:build   # Creates .exe/.dmg/.AppImage in release/

💡 Features:
  - Complete user management with 9-tier RBAC
  - SQLite database (better-sqlite3) - offline-first
  - 4-digit PIN recovery for admin password reset
  - Settings system with database-backed configuration
  - First-run setup wizard (unique credentials per install)

🔒 Security:
  - No default credentials (setup wizard creates unique admin)
  - JWT authentication with auto-generated secrets
  - Recovery PIN for admin self-service password reset
`);
      } else if (templateType === 'mobile-basicapp') {
        console.log(`
✅ Bloom Mobile project ${projectName} created successfully!

Next steps:
  cd ${projectName}
  npm run dev                      # Start dev server (required)

📱 Requirements:
  iOS: Xcode 15+
  Android: Android Studio + Java JDK 17

🚀 Development:
  npm run mobile:run:android       # Run on Android emulator
  npm run mobile:run:ios           # Run on iOS simulator

📦 Production Build:
  npm run android:build            # Build APK → build/bloom-mobile-app.apk
  npm run ios:build                # Build .app → build/bloom-mobile-app.app

💡 Backend + UIKit conventions: ./docs/appkit.md, ./docs/uikit.md — copied by postinstall

🔗 Backend: This is a UI-only app. Use bloom-basicapp as backend.
`);
      } else {
        console.log(`
✅ Bloom ${templateType} project ${projectName} created successfully!

Next steps:
  cd ${projectName}
  npm run dev

🚀 Development options:
  npm run dev          # Both API (3000) + Web (5173)
  npm run dev:api      # Backend only
  npm run dev:web      # Frontend only

🏗️ Production:
  npm run build        # Build for production
  npm start           # Start production server
`);
      }
    }
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
} else {
  console.error(`❌ Unknown command: ${command}`);
  process.exit(1);
}
