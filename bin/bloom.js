#!/usr/bin/env node

/**
 * Bloom CLI - Fullstack FBCA Framework
 * Combines UIKit (frontend) and AppKit (backend) scaffolding
 */

import { execSync } from 'child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
} from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const command = process.argv[2];
const projectName = process.argv[3];
const templateType = process.argv[4] || 'basicapp'; // Default to basicapp
const verbose = process.argv.includes('--verbose');
const skipInstall = process.argv.includes('--skip-install') || process.argv.includes('--no-install');

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
    const replacements = {
      '{{PROJECT_NAME}}': actualProjectName,
      '{{projectName}}': actualProjectName,
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
function copyBloomTemplate(templateType, verbose = false, extraReplacements = {}) {
  try {
    const templatePath = join(__dirname, '../templates', templateType);
    if (verbose) console.log(`🔍 [DEBUG] Template path: ${templatePath}`);

    if (!existsSync(templatePath)) {
      console.error(`❌ Template "${templateType}" not found at ${templatePath}`);
      return;
    }

    let filesCopied = 0;

    // Recursively copy template files, processing .template files
    function copyRecursive(sourcePath, destPath) {
      const items = readdirSync(sourcePath);

      for (const item of items) {
        const sourceItem = join(sourcePath, item);
        const stat = statSync(sourceItem);

        if (stat.isDirectory()) {
          const destItem = join(destPath, item);
          if (!existsSync(destItem)) {
            mkdirSync(destItem, { recursive: true });
            if (verbose) console.log(`🔍 [DEBUG] Created directory: ${destItem}`);
          }
          copyRecursive(sourceItem, destItem);
        } else if (stat.isFile()) {
          // Process package.json.template, skip regular package.json
          if (item === 'package.json') {
            if (verbose) console.log(`🔍 [DEBUG] Skipped ${item} (will use package.json.template instead)`);
            return;
          }

          // Handle .template files with placeholder processing
          if (item.endsWith('.template')) {
            const destItem = join(destPath, item.replace('.template', ''));
            processTemplateFile(sourceItem, destItem, projectName, verbose, extraReplacements);
            filesCopied++;
            if (verbose) console.log(`🔍 [DEBUG] Processed template file: ${item} -> ${item.replace('.template', '')}`);
          } else {
            const destItem = join(destPath, item);
            copyFileSync(sourceItem, destItem);
            filesCopied++;
            if (verbose) console.log(`🔍 [DEBUG] Copied file: ${item}`);
          }
        }
      }
    }

    copyRecursive(templatePath, './');
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
# The default covers a standard admin/moderator/viewer split.
ADMIN_USER_ROLES="admin:system,moderator:manage,viewer:basic"

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
  const validTemplates = ['basicapp', 'userapp', 'adminapp', 'desktop-basicapp', 'desktop-userapp', 'mobile-basicapp'];
  if (!validTemplates.includes(templateType)) {
    console.error(`❌ Invalid template "${templateType}". Available templates: ${validTemplates.join(', ')}`);
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
