# Desktop UserApp - Getting Started 🚀

> **Complete guide to developing this Electron desktop application with user management, authentication, FBCA architecture, UIKit frontend, and AppKit backend**

## What is This Project?

This is an **Electron desktop application** that combines:
- **Electron** - Desktop app framework (main process + renderer process)
- **FBCA** - Feature-Based Component Architecture for scalability
- **UIKit** - React component library for the frontend (renderer)
- **AppKit** - Node.js backend modules for the server (main)
- **React** - UI library for the renderer process
- **Express** - HTTP server in the main process
- **better-sqlite3** - SQLite database for user management
- **JWT Authentication** - Secure token-based auth system
- **HashRouter** - Electron-compatible routing with React Router

**Architecture:**
```
Desktop App (Electron)
├── Main Process (Node.js)
│   └── src/desktop/main/
│       ├── server.ts              # Express backend server
│       ├── routes/                # API endpoints (FBCA)
│       └── lib/                   # AppKit utilities
│
└── Renderer Process (React)
    └── src/desktop/renderer/
        ├── App.tsx                # React root
        ├── features/              # Frontend features (FBCA)
        ├── shared/                # Shared components
        └── lib/                   # UIKit utilities

Electron Process (electron/main.js)
├── Spawns Express backend on port 3000
├── Creates browser window on port 5173 (dev)
└── Handles IPC communication
```

---

## 🎯 Quick Start

### Installation
```bash
# Install dependencies
npm install

# Start development (Electron + Backend + Frontend)
npm run dev

# This command:
# 1. Starts Vite dev server (renderer) on port 5173
# 2. Waits for Vite to be ready
# 3. Starts Electron app
# 4. Electron spawns Express backend on port 3000
# 5. Opens desktop window with hot reload
```

### Development Commands
```bash
# Development (recommended - starts everything)
npm run dev              # Electron + backend + frontend with hot reload

# Individual processes (for debugging)
npm run dev:web          # Frontend only (Vite dev server)
npm run dev:main         # Backend only (Express server)

# Database
# The database schema is managed in src/desktop/main/lib/db-client.ts
# Migrations are applied automatically on server start

# Production build
npm run build            # Build frontend and backend
npm run electron:build   # Create Electron distributables (.app, .exe, etc.)

# Clean build
npm run clean            # Remove dist/ and build artifacts
```

---

## 📂 Project Structure

### Root Structure
```
desktop-userapp/
├── electron/
│   ├── main.js                    # Electron main process entry
│   └── preload.cjs                # IPC bridge (CommonJS)
│
├── src/desktop/
│   ├── main/                      # Backend (Node.js/Express)
│   │   ├── server.ts              # Express server entry
│   │   ├── features/              # FBCA backend features
│   │   │   ├── auth/              # Auth feature
│   │   │   │   └── auth.route.ts  # Auto-mounts: /api/auth/*
│   │   │   ├── user/              # User management feature
│   │   │   │   └── user.route.ts  # Auto-mounts: /api/user/*
│   │   │   └── welcome/           # Welcome feature
│   │   │       └── welcome.route.ts
│   │   ├── middleware/            # Express middleware
│   │   ├── lib/                   # Backend utilities
│   │   └── types/                 # TypeScript types
│   │
│   └── renderer/                  # Frontend (React)
│       ├── App.tsx                # React root component
│       ├── main.tsx               # React entry point
│       ├── index.html             # HTML template
│       ├── features/              # FBCA features
│       │   ├── main/              # Main feature (homepage, 404, etc.)
│       │   │   ├── pages/
│       │   │   │   ├── index.tsx     # Route: /
│       │   │   │   └── not-found.tsx # Route: /404
│       │   │   └── components/    # Feature components
│       │   ├── auth/              # Auth feature (login, register, etc.)
│       │   │   ├── pages/
│       │   │   │   ├── login.tsx     # Route: /auth/login
│       │   │   │   ├── register.tsx  # Route: /auth/register
│       │   │   │   └── logout.tsx    # Route: /auth/logout
│       │   │   ├── context/
│       │   │   │   └── AuthContext.tsx  # Auth state management
│       │   │   └── config/        # Auth configuration
│       │   └── user/              # User management feature
│       │       ├── pages/
│       │       │   ├── index.tsx      # Route: /user (profile)
│       │       │   └── admin/
│       │       │       ├── index.tsx  # Route: /user/admin
│       │       │       ├── show.tsx   # Route: /user/admin/show
│       │       │       ├── edit.tsx   # Route: /user/admin/edit
│       │       │       └── create.tsx # Route: /user/admin/create
│       │       ├── context/
│       │       │   └── UserContext.tsx  # User state management
│       │       └── types/         # User TypeScript types
│       ├── shared/                # Shared resources
│       │   ├── components/        # Reusable components
│       │   │   ├── Header.tsx
│       │   │   ├── Footer.tsx
│       │   │   ├── SEO.tsx
│       │   │   └── ErrorBoundary.tsx
│       │   └── hooks/             # Shared hooks
│       ├── lib/
│       │   └── page-router.tsx    # Auto-discovery routing
│       └── styles/
│           └── index.css          # Global styles
│
├── docs/                          # Documentation
│   ├── DESKTOP_APP_GETTING_STARTED.md  # This file
│   ├── UIKIT_FBCA_FRONTEND.md         # Frontend guide
│   ├── APPKIT_FBCA_BACKEND.md         # Backend guide
│   ├── UIKIT_LLM_GUIDE.md             # UIKit reference
│   ├── APPKIT_LLM_GUIDE.md            # AppKit reference
│   ├── UIKIT_THEME_GUIDE.md           # Theming guide
│   └── UIKIT_COMPOSITE_UI_SYSTEM.md   # Component reference
│
├── package.json                   # Dependencies & scripts
├── vite.config.ts                 # Vite configuration
├── tsconfig.json                  # TypeScript config (renderer)
├── tsconfig.main.json             # TypeScript config (main)
└── .gitignore                     # Git ignore rules
```

---

## 🏗️ Architecture Explained

### Electron Process Model

**Main Process (Node.js)**
- Runs `electron/main.js`
- Creates browser windows
- Spawns Express backend server
- Handles native OS APIs
- IPC communication with renderer

**Renderer Process (Chromium)**
- Runs React application
- Displays UI in browser window
- Communicates with main via IPC
- Hot reload in development

**Backend Server (Express)**
- Spawned by main process
- Runs on port 3000
- Provides API endpoints
- Database access
- Background jobs

### How They Work Together

```
User Interaction
     ↓
Renderer Process (React on port 5173)
     ↓ (fetch to localhost:3000)
Backend Server (Express on port 3000)
     ↓ (AppKit modules)
Database / File System / Services
     ↑
Main Process (Electron)
     ↑ (IPC)
Renderer Process
```

### FBCA Architecture

**Frontend FBCA** (`src/desktop/renderer/features/`)
- Each feature is self-contained
- Auto-discovery routing from file structure
- Features don't import from each other
- Shared code goes in `/shared`

**Backend FBCA** (`src/desktop/main/routes/`)
- Each feature has its own route file
- Auto-discovery mounts routes
- Feature isolation
- Consistent patterns

---

## 🧭 Routing & Navigation (CRITICAL for Electron)

### Why HashRouter?

**Problem:** Electron loads pages using the `file://` protocol, which doesn't support traditional URL-based routing (BrowserRouter).

**Solution:** This app uses React Router's **HashRouter** to handle routing via URL hash fragments.

```tsx
// ✅ CORRECT - src/desktop/renderer/App.tsx
import { HashRouter as Router } from 'react-router-dom';

<Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
  <AuthProvider>
    <UserProvider>
      <PageRouter />
    </UserProvider>
  </AuthProvider>
</Router>
```

**URLs appear as:** `file:///path/to/app.html#/user/profile`

### Navigation Rules (CRITICAL)

**✅ ALWAYS use `useNavigate()` hook:**
```tsx
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();

  return (
    <Button onClick={() => navigate('/user/profile')}>
      Go to Profile
    </Button>
  );
}
```

**❌ NEVER use `window.location.href`:**
```tsx
// ❌ WRONG - Causes full page reload and breaks app state
function BadComponent() {
  return (
    <Button onClick={() => window.location.href = '/user/profile'}>
      Go to Profile
    </Button>
  );
}
```

**❌ NEVER use `<a href>` for internal navigation:**
```tsx
// ❌ WRONG - Breaks HashRouter
function BadComponent() {
  return <a href="/user/profile">Profile</a>;
}
```

### Why This Matters

| Pattern | Result | State Preserved? | Works in Electron? |
|---------|--------|------------------|-------------------|
| `navigate('/path')` | ✅ Client-side navigation | ✅ Yes | ✅ Yes |
| `window.location.href` | ❌ Full page reload | ❌ No | ❌ Breaks HashRouter |
| `<a href="/path">` | ❌ Full page reload | ❌ No | ❌ Breaks HashRouter |

### Relative Paths in HTML

**Problem:** Absolute paths don't work with `file://` protocol.

**Solution:** Use relative paths in `index.html`:

```html
<!-- ✅ CORRECT - src/desktop/renderer/index.html -->
<link rel="icon" type="image/svg+xml" href="./favicon.svg" />
<script type="module" src="./main.tsx"></script>

<!-- ❌ WRONG - Doesn't work with file:// -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<script type="module" src="/main.tsx"></script>
```

### Auto-Discovery Routing

Routes are automatically discovered from the file structure:

```
File: features/main/pages/index.tsx          → Route: /
File: features/auth/pages/login.tsx          → Route: /auth/login
File: features/user/pages/index.tsx          → Route: /user
File: features/user/pages/admin/index.tsx    → Route: /user/admin
File: features/user/pages/admin/show.tsx     → Route: /user/admin/show
```

### Route Helper Utility

```tsx
import { route } from '@/shared/utils';

// Use in navigation (optional, but ensures consistency)
navigate(route('/user/admin'));

// Can also use direct paths
navigate('/user/admin');
```

---

## 🔐 Authentication & User Management

### First-Run Setup Wizard (Production)

When you build and distribute the application, users will see a **Setup Wizard** on first launch to create their admin account securely.

**Production Flow:**
1. User launches the app for the first time
2. Setup wizard automatically appears at `/setup`
3. User creates admin account with custom credentials (name, email, password)
4. Database is initialized with their account
5. User is redirected to login page

**Security Implementation:**
- ✅ No pre-bundled database (each installation has unique credentials)
- ✅ Database files excluded from build (in package.json)
- ✅ User data stored in OS-specific directory (`app.getPath('userData')`)
- ✅ Automatic first-run detection checks if database exists

### Database Setup (Development)

For development and testing, you can use the seed command to populate test accounts:

**Database Initialization:**
The database is automatically created on first run. The schema is applied via better-sqlite3 in `src/desktop/main/lib/db-client.ts`.

**Development vs Production:**
- **Development:** Database created in `./database/dev.db`
- **Production:** Database created in OS-specific user data directory

### Test User Accounts

The database is seeded with 9 test accounts:

| Email | Password | Role | Level | Access |
|-------|----------|------|-------|--------|
| `admin@example.com` | `admin123` | admin | system | Full system access |
| `orgadmin@example.com` | `admin123` | admin | org | Organization admin |
| `tenantadmin@example.com` | `admin123` | admin | tenant | Tenant admin |
| `moderator@example.com` | `user123` | moderator | manage | Content manager |
| `reviewer@example.com` | `user123` | moderator | approve | Content approver |
| `auditor@example.com` | `user123` | moderator | review | Content reviewer |
| `user@example.com` | `user123` | user | basic | Basic user |
| `prouser@example.com` | `user123` | user | pro | Pro user |
| `maxuser@example.com` | `user123` | user | max | Premium user |

**Quick Login:**
```
Email: admin@example.com
Password: admin123
```

### Role-Based Access Control

**Permission Format:** `role.level`

```typescript
// Check permissions
import { hasRole } from '@/shared/utils';

// Single admin check
if (hasRole(user, ['admin.system'])) {
  // Show system admin features
}

// Multiple roles check
if (hasRole(user, ['admin.tenant', 'admin.org', 'admin.system'])) {
  // Show any admin features
}

// Moderator or admin check
if (hasRole(user, [
  'moderator.review', 'moderator.approve', 'moderator.manage',
  'admin.tenant', 'admin.org', 'admin.system'
])) {
  // Show moderator or admin features
}
```

**Permission Implementation:**
```tsx
// src/desktop/renderer/shared/utils/role.ts
export const hasRole = (
  user: { role: string; level: string } | null,
  allowedRoles: string[]
): boolean => {
  if (!user || !allowedRoles.length) return true;
  const userPermission = `${user.role}.${user.level}`;
  return allowedRoles.includes(userPermission);
};
```

### Auth Context

```tsx
// Use in components
import { useAuth } from '@/features/auth';

function MyComponent() {
  const { user, token, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return <div>Welcome {user.name}!</div>;
}
```

### Protected Routes

```tsx
// features/user/pages/admin/index.tsx
import { AuthGuard } from '@/features/auth';
import { USER_ROLES } from '@/features/user';

export default function AdminPage() {
  return (
    <AuthGuard requiredRoles={USER_ROLES.ADMIN_ACCESS}>
      <PageLayout>
        {/* Admin content */}
      </PageLayout>
    </AuthGuard>
  );
}
```

---

## 🎨 Frontend Development (Renderer)

### Key Concepts

**Auto-Discovery Routing:**
```
File: features/main/pages/index.tsx      → Route: /
File: features/auth/pages/index.tsx      → Route: /auth
File: features/gallery/pages/index.tsx   → Route: /gallery
File: features/blog/pages/[slug].tsx     → Route: /blog/:slug
```

**UIKit Components:**
- Use library components from `@bloomneo/uikit`
- Semantic colors: `bg-background`, `text-foreground`, `border-border`
- Never hardcode colors: avoid `bg-white`, `text-black`

**Page Structure:**
```tsx
// features/gallery/pages/index.tsx
import { PageLayout } from '@bloomneo/uikit/page';
import { Card } from '@bloomneo/uikit/card';
import { Header, Footer, SEO } from '../../../shared/components';

export default function GalleryPage() {
  return (
    <PageLayout>
      <SEO title="Gallery" description="Image gallery" />
      <Header />

      <PageLayout.Content>
        <h1 className="text-4xl font-bold text-foreground">Gallery</h1>
        <Card className="bg-card border-border">
          {/* Content */}
        </Card>
      </PageLayout.Content>

      <Footer />
    </PageLayout>
  );
}
```

### Adding New Frontend Feature

```bash
# 1. Create feature structure
mkdir -p src/desktop/renderer/features/products/pages
mkdir -p src/desktop/renderer/features/products/components
mkdir -p src/desktop/renderer/features/products/hooks

# 2. Create page (auto-route: /products)
# Create: features/products/pages/index.tsx
```

```tsx
// features/products/pages/index.tsx
import { PageLayout } from '@bloomneo/uikit/page';
import { Header, Footer, SEO } from '../../../shared/components';

export default function ProductsPage() {
  return (
    <PageLayout>
      <SEO title="Products" description="Browse products" />
      <Header />
      <PageLayout.Content>
        <h1 className="text-foreground">Products</h1>
      </PageLayout.Content>
      <Footer />
    </PageLayout>
  );
}
```

**Done!** Route `/products` is automatically available.

**Read more:** [UIKIT_FBCA_FRONTEND.md](./UIKIT_FBCA_FRONTEND.md)

---

## ⚙️ Backend Development (Main)

### Key Concepts

**Auto-Discovery Routing:**
```
File: routes/auth/auth.routes.ts         → Mounts: /api/auth
File: routes/users/users.routes.ts       → Mounts: /api/users
File: routes/products/products.routes.ts → Mounts: /api/products
```

**AppKit Modules:**
- Always use `moduleClass.get()` pattern
- Common modules: `util`, `config`, `auth`, `logger`, `error`, `security`, `database`

**Route Structure:**
```typescript
// routes/auth/auth.routes.ts
import { Router } from 'express';
import { utilClass } from '@bloomneo/appkit/util';
import { authClass } from '@bloomneo/appkit/auth';
import { errorClass } from '@bloomneo/appkit/error';
import { loggerClass } from '@bloomneo/appkit/logger';

const router = Router();
const util = utilClass.get();
const auth = authClass.get();
const error = errorClass.get();
const logger = loggerClass.get('auth');

// Register endpoint
router.post(
  '/register',
  error.asyncRoute(async (req, res) => {
    const { email, password } = req.body;

    // Validation
    if (util.isEmpty(email)) throw error.badRequest('Email required');

    // Business logic
    const hashedPassword = await auth.hashPassword(password);

    // Response
    logger.info('User registered', { email });
    res.json({ success: true });
  })
);

export default router;
```

### Adding New Backend Feature

```bash
# 1. Create feature route file
mkdir -p src/desktop/main/routes/products
touch src/desktop/main/routes/products/products.routes.ts
```

```typescript
// routes/products/products.routes.ts
import { Router } from 'express';
import { errorClass } from '@bloomneo/appkit/error';
import { loggerClass } from '@bloomneo/appkit/logger';

const router = Router();
const error = errorClass.get();
const logger = loggerClass.get('products');

// GET /api/products
router.get(
  '/',
  error.asyncRoute(async (req, res) => {
    logger.info('Fetching products');
    res.json({ products: [] });
  })
);

// POST /api/products
router.post(
  '/',
  error.asyncRoute(async (req, res) => {
    logger.info('Creating product');
    res.json({ success: true });
  })
);

export default router;
```

**Done!** Endpoints `/api/products` are automatically available.

**Read more:** [APPKIT_FBCA_BACKEND.md](./APPKIT_FBCA_BACKEND.md)

---

## 🔄 Development Workflow

### Daily Development

```bash
# 1. Start development
npm run dev

# This opens Electron window with:
# - Frontend (Vite) with hot reload
# - Backend (Express) with auto-restart
# - DevTools available (Cmd+Option+I)
```

### Making Changes

**Frontend Changes:**
1. Edit files in `src/desktop/renderer/`
2. Browser automatically hot-reloads
3. See changes instantly

**Backend Changes:**
1. Edit files in `src/desktop/main/`
2. Backend auto-restarts
3. Refresh Electron window to see changes

**Electron Changes:**
1. Edit `electron/main.js`
2. Must restart Electron: `npm run dev`

### Debugging

**Frontend Debugging:**
- Open DevTools: `Cmd+Option+I` (Mac) or `Ctrl+Shift+I` (Windows)
- React DevTools available
- Console logs visible

**Backend Debugging:**
- Check terminal for `console.log` output
- Use `logger.info()` for structured logging
- Backend logs appear in terminal

**Database:**
- Database files stored in `./database/` (development)
- Schema defined in `src/desktop/main/lib/db-client.ts`

---

## 🔌 IPC Communication (Optional Advanced)

### From Renderer to Main

```typescript
// In renderer (React)
const result = await window.electronAPI.invoke('ping', { data: 'test' });

// In main (electron/main.js)
ipcMain.handle('ping', async (event, data) => {
  return 'pong';
});
```

**Whitelist channels in `electron/preload.cjs`:**
```javascript
const validChannels = ['ping', 'your-new-channel'];
```

---

## 📦 Building for Production

### Build Process

```bash
# 1. Build frontend + backend
npm run build

# Output:
# - dist-electron/     # Compiled backend
# - dist/              # Compiled frontend

# 2. Build Electron app
npm run electron:build

# Output:
# - dist/              # Platform-specific distributables
#   ├── mac/           # macOS .app
#   ├── win/           # Windows .exe
#   └── linux/         # Linux binaries
```

### Distribution

The built application includes:
- Self-contained Electron app
- Bundled backend server
- Bundled frontend assets
- No external dependencies needed

**Install on user machines:**
- macOS: Drag `.app` to Applications
- Windows: Run `.exe` installer
- Linux: Run `.AppImage` or install `.deb`

---

## 📝 Code Comment Guidelines

### File Header Template

```typescript
/**
 * Brief description of what this file does
 * @module @voilajsx/package/module (if using external library)
 * @file src/path/to/file.ts
 *
 * @llm-rule WHEN: Specific use case when this should be used
 * @llm-rule AVOID: Common mistakes or when NOT to use
 * @llm-rule NOTE: Critical non-obvious behavior (optional)
 */
```

### Comment Rules

**Categories:**
- **WHEN** - Trigger conditions for using this code
- **AVOID** - Breaking mistakes or anti-patterns
- **NOTE** - Critical context or non-obvious behavior

**Guidelines:**
- Maximum 3 rules per item
- One line per rule
- Action-oriented language
- Specific use cases vs common pitfalls

### Good Examples

```typescript
/**
 * User authentication service
 * @file src/desktop/main/routes/auth/auth.routes.ts
 *
 * @llm-rule WHEN: Building login/register endpoints for desktop app
 * @llm-rule AVOID: Plain text passwords - always use auth.hashPassword()
 * @llm-rule NOTE: Uses dual token system (login tokens vs API tokens)
 */

/**
 * Hash user password securely
 * @llm-rule WHEN: Storing user passwords in database
 * @llm-rule AVOID: Storing plain text passwords - security vulnerability
 */
const hashPassword = async (password: string) => {
  return await auth.hashPassword(password);
};
```

### Bad Examples (Avoid)

```typescript
// ❌ Too vague
@llm-rule WHEN: Need to call this function
@llm-rule PURPOSE: Returns user data

// ❌ Wrong categories
@llm-rule USAGE: This function should be used when...
@llm-rule DESCRIPTION: This does something important

// ✅ Better
@llm-rule WHEN: Fetching authenticated user profile data
@llm-rule AVOID: Calling without auth token - will throw unauthorized error
```

### Function Comments

```typescript
/**
 * Validate email format and check for existing user
 * @llm-rule WHEN: Processing user registration or email updates
 * @llm-rule AVOID: Skipping validation - allows duplicate emails
 */
async function validateEmail(email: string): Promise<boolean> {
  // Implementation
}
```

### Component Comments (React)

```tsx
/**
 * Product card component with image, title, and price
 * @llm-rule WHEN: Displaying product in grid or list layouts
 * @llm-rule AVOID: Hardcoded colors - use semantic classes (bg-card, text-foreground)
 */
export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Card className="bg-card border-border">
      {/* ... */}
    </Card>
  );
};
```

---

## 📚 Documentation Reference

### Quick Links

**For Desktop App Configuration:**
- [DESKTOP_CONFIGURATION.md](./DESKTOP_CONFIGURATION.md) - App icons, build settings, window configuration

**For Frontend Development:**
- [UIKIT_FBCA_FRONTEND.md](./UIKIT_FBCA_FRONTEND.md) - Frontend architecture patterns
- [UIKIT_LLM_GUIDE.md](./UIKIT_LLM_GUIDE.md) - Complete UIKit reference
- [UIKIT_COMPOSITE_UI_SYSTEM.md](./UIKIT_COMPOSITE_UI_SYSTEM.md) - Component guide
- [UIKIT_THEME_GUIDE.md](./UIKIT_THEME_GUIDE.md) - Theming and colors

**For Backend Development:**
- [APPKIT_FBCA_BACKEND.md](./APPKIT_FBCA_BACKEND.md) - Backend architecture patterns
- [APPKIT_LLM_GUIDE.md](./APPKIT_LLM_GUIDE.md) - Complete AppKit reference

### When to Read Each Guide

**Need to change app icon or build settings?**
→ Read [DESKTOP_CONFIGURATION.md](./DESKTOP_CONFIGURATION.md)

**Starting a new frontend feature?**
→ Read [UIKIT_FBCA_FRONTEND.md](./UIKIT_FBCA_FRONTEND.md)

**Starting a new backend endpoint?**
→ Read [APPKIT_FBCA_BACKEND.md](./APPKIT_FBCA_BACKEND.md)

**Need a specific component?**
→ Check [UIKIT_COMPOSITE_UI_SYSTEM.md](./UIKIT_COMPOSITE_UI_SYSTEM.md)

**Want to customize colors?**
→ Read [UIKIT_THEME_GUIDE.md](./UIKIT_THEME_GUIDE.md)

**Need module details?**
→ Check [UIKIT_LLM_GUIDE.md](./UIKIT_LLM_GUIDE.md) or [APPKIT_LLM_GUIDE.md](./APPKIT_LLM_GUIDE.md)

---

## 🚨 Common Issues & Solutions

### "Port already in use"

```bash
# Kill processes on ports
npx kill-port 3000 5173

# Or restart
npm run dev
```

### "Cannot find module"

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### "Backend not responding"

```bash
# Check if backend is running
curl http://localhost:3000/health

# Restart Electron
npm run dev
```

### "Hot reload not working"

```bash
# Restart Vite dev server
npm run dev:web
```

### "TypeScript errors"

```bash
# Rebuild TypeScript
npm run build
```

### "Navigation not working / Page refreshes on click"

This usually means you're using wrong navigation patterns:

**Check 1: Using HashRouter**
```tsx
// ✅ CORRECT in App.tsx
import { HashRouter as Router } from 'react-router-dom';

// ❌ WRONG
import { BrowserRouter as Router } from 'react-router-dom';
```

**Check 2: Using useNavigate**
```tsx
// ✅ CORRECT
const navigate = useNavigate();
<Button onClick={() => navigate('/path')}>Go</Button>

// ❌ WRONG
<Button onClick={() => window.location.href = '/path'}>Go</Button>
<a href="/path">Go</a>
```

### "Database issues / Login not working"

```bash
# Reset database and reseed
npm run db:reset
npm run db:seed

# Verify database file exists
ls -la database/dev.db

# Database is automatically created on first run
```

### "Admin menu not showing"

Check if you're logged in as admin:

```
Email: admin@example.com
Password: admin123
```

The admin menu only appears for users with admin roles (`admin.tenant`, `admin.org`, `admin.system`).

---

## 🎯 Best Practices

### Frontend
- ✅ Use `useNavigate()` hook for navigation (CRITICAL for Electron)
- ✅ Use HashRouter instead of BrowserRouter
- ✅ Use UIKit library components
- ✅ Use semantic colors (`bg-background`, `text-foreground`)
- ✅ Organize by features, not file types
- ✅ Add SEO component to every page
- ✅ Use relative paths in HTML (`./favicon.svg` not `/favicon.svg`)
- ❌ Don't use `window.location.href` for navigation
- ❌ Don't use `<a href>` for internal navigation
- ❌ Don't hardcode colors (`bg-white`, `text-black`)
- ❌ Don't import from other features

### Backend
- ✅ Use AppKit modules (`util`, `auth`, `error`, etc.)
- ✅ Always use `error.asyncRoute()` wrapper
- ✅ Validate input with `util.isEmpty()`
- ✅ Use semantic error types (`error.badRequest()`, etc.)
- ❌ Don't use `console.log()` - use `logger.info()`
- ❌ Don't skip input validation

### General
- ✅ Add `@llm-rule` comments to new files
- ✅ Use structured logging
- ✅ Keep features isolated
- ✅ Follow naming conventions
- ❌ Don't mix frontend and backend code
- ❌ Don't commit `.env` files

---

## 🔥 Next Steps

1. **Read this guide** to understand the architecture
2. **Start development** with `npm run dev`
3. **Add a frontend feature** using [UIKIT_FBCA_FRONTEND.md](./UIKIT_FBCA_FRONTEND.md)
4. **Add a backend endpoint** using [APPKIT_FBCA_BACKEND.md](./APPKIT_FBCA_BACKEND.md)
5. **Customize the theme** using [UIKIT_THEME_GUIDE.md](./UIKIT_THEME_GUIDE.md)
6. **Build for production** with `npm run electron:build`

**Happy coding!** 🚀

---

**Desktop UserApp** - Built with Electron, FBCA, UIKit, and AppKit ✨
