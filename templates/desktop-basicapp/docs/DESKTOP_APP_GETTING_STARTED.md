# Desktop App Getting Started 🚀

> **Complete guide to developing this Electron desktop application with FBCA architecture, UIKit frontend, and AppKit backend**

## What is This Project?

This is an **Electron desktop application** that combines:
- **Electron** - Desktop app framework (main process + renderer process)
- **FBCA** - Feature-Based Component Architecture for scalability
- **UIKit** - React component library for the frontend (renderer)
- **AppKit** - Node.js backend modules for the server (main)
- **React** - UI library for the renderer process
- **Express** - HTTP server in the main process

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
aitestengine/
├── electron/
│   ├── main.js                    # Electron main process entry
│   └── preload.cjs                # IPC bridge (CommonJS)
│
├── src/desktop/
│   ├── main/                      # Backend (Node.js/Express)
│   │   ├── server.ts              # Express server entry
│   │   ├── routes/                # Auto-discovery API routes
│   │   │   ├── index.ts           # Route discovery engine
│   │   │   ├── auth/              # Auth feature routes
│   │   │   └── users/             # Users feature routes
│   │   ├── middleware/            # Express middleware
│   │   ├── lib/                   # Backend utilities
│   │   └── types/                 # TypeScript types
│   │
│   └── renderer/                  # Frontend (React)
│       ├── App.tsx                # React root component
│       ├── main.tsx               # React entry point
│       ├── index.html             # HTML template
│       ├── features/              # FBCA features
│       │   ├── main/              # Main feature (homepage, etc.)
│       │   │   ├── pages/
│       │   │   │   └── index.tsx  # Route: /
│       │   │   └── components/    # Feature components
│       │   ├── auth/              # Auth feature
│       │   │   └── pages/
│       │   │       └── index.tsx  # Route: /auth
│       │   └── gallery/           # Gallery feature
│       │       └── pages/
│       │           └── index.tsx  # Route: /gallery
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
│   ├── uikit.md         # Frontend guide
│   ├── appkit.md         # Backend guide
│   ├── uikit.md             # UIKit reference
│   ├── appkit.md            # AppKit reference
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
import { PageLayout } from '@bloomneo/uikit';
import { Card } from '@bloomneo/uikit';
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
import { PageLayout } from '@bloomneo/uikit';
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

**Read more:** [uikit.md](./uikit.md)

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

**Read more:** [appkit.md](./appkit.md)

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
- Use Prisma Studio: `npx prisma studio`
- View/edit database records

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
 * @module @bloomneo/package/module (if using external library)
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

**For Frontend Development:**
- [uikit.md](./uikit.md) - Frontend architecture patterns
- [uikit.md](./uikit.md) - Complete UIKit reference
- [UIKIT_COMPOSITE_UI_SYSTEM.md](./UIKIT_COMPOSITE_UI_SYSTEM.md) - Component guide
- [UIKIT_THEME_GUIDE.md](./UIKIT_THEME_GUIDE.md) - Theming and colors

**For Backend Development:**
- [appkit.md](./appkit.md) - Backend architecture patterns
- [appkit.md](./appkit.md) - Complete AppKit reference

### When to Read Each Guide

**Starting a new frontend feature?**
→ Read [uikit.md](./uikit.md)

**Starting a new backend endpoint?**
→ Read [appkit.md](./appkit.md)

**Need a specific component?**
→ Check [UIKIT_COMPOSITE_UI_SYSTEM.md](./UIKIT_COMPOSITE_UI_SYSTEM.md)

**Want to customize colors?**
→ Read [UIKIT_THEME_GUIDE.md](./UIKIT_THEME_GUIDE.md)

**Need module details?**
→ Check [uikit.md](./uikit.md) or [appkit.md](./appkit.md)

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

---

## 🎯 Best Practices

### Frontend
- ✅ Use UIKit library components
- ✅ Use semantic colors (`bg-background`, `text-foreground`)
- ✅ Organize by features, not file types
- ✅ Add SEO component to every page
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
3. **Add a frontend feature** using [uikit.md](./uikit.md)
4. **Add a backend endpoint** using [appkit.md](./appkit.md)
5. **Customize the theme** using [UIKIT_THEME_GUIDE.md](./UIKIT_THEME_GUIDE.md)
6. **Build for production** with `npm run electron:build`

**Happy coding!** 🚀

---

**Bloom Desktop App** - Built with Electron, FBCA, UIKit, and AppKit ✨
