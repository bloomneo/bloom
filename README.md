# 🌸 Bloom Framework

> Previously published as `@voilajsx/helix`. Same code, new home, new namespace, new CLI command. See the [migration note](#scope-change) below.

A modern fullstack framework that combines **@bloomneo/uikit** (React frontend) and **@bloomneo/appkit** (Express backend) with Feature-Based Component Architecture (FBCA). One CLI scaffolds web, desktop (Electron), and mobile (Capacitor) apps from the same project.

[![npm version](https://img.shields.io/npm/v/@bloomneo/bloom.svg)](https://www.npmjs.com/package/@bloomneo/bloom)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

```bash
npm install -g @bloomneo/bloom
bloom create my-app                # basicapp template
bloom create my-app userapp        # auth + user management
bloom create my-app mobile-basicapp  # iOS + Android via Capacitor
bloom create my-app desktop-basicapp # desktop via Electron
```

## ✨ Features

- 🎯 **Feature-Based Component Architecture (FBCA)** - Zero-config convention-based routing
- ⚡ **Fullstack Integration** - Seamless frontend-backend communication
- 🎨 **UIKit Components** - Production-ready React components with multiple themes
- 🔧 **AppKit Backend** - Express.js with structured logging and error handling
- 🚀 **Auto-Discovery Routing** - File-based routing similar to Next.js
- 🔄 **Hot Reload** - Fast development with Vite and nodemon
- 📦 **Zero Configuration** - Convention over configuration approach
- 🎭 **Multi-Theme Support** - Built-in theme system (base, elegant, metro, studio, vivid)
- 🖥️ **Desktop App Support** - Cross-platform desktop apps with Electron
- 📱 **Mobile App Support** - Native iOS and Android apps with Capacitor

## 📦 Templates

- **basicapp** - Basic fullstack app with routing and features (default)
- **userapp** - Complete user management with authentication, roles, admin panel, and database
- **desktop-basicapp** - Cross-platform Electron desktop app with FBCA architecture
- **mobile-basicapp** - Native iOS and Android mobile app with Capacitor 7

## 🚀 Quick Start

### Installation

```bash
npm install -g @bloomneo/bloom
```

### Create New Project

```bash
# Basic app (default)
bloom create my-app
cd my-app
npm run dev

# User management app
bloom create my-userapp userapp
cd my-userapp
npx prisma db push
npm run db:seed
npm run dev

# Desktop app (Electron)
bloom create my-desktop-app desktop-basicapp
cd my-desktop-app
npm run dev

# Mobile app (iOS + Android)
bloom create my-mobile-app mobile-basicapp
cd my-mobile-app
npm install
npm run dev                      # Start dev server
npm run mobile:run:ios          # Run on iOS simulator
npm run mobile:run:android      # Run on Android emulator
```

Your fullstack app runs on:
- **Web Apps**: Frontend (http://localhost:5173) + Backend (http://localhost:3000)
- **Desktop Apps**: Electron window (http://localhost:5183) + Backend (http://localhost:3000)
- **Mobile Apps**: Native iOS/Android apps connecting to dev server (http://localhost:5173)

## 📁 Project Structure

### Web App Structure

```
my-app/
├── src/
│   ├── api/                    # Backend (AppKit)
│   │   ├── features/
│   │   │   └── welcome/
│   │   │       ├── welcome.route.ts
│   │   │       └── welcome.service.ts
│   │   ├── lib/
│   │   └── server.ts
│   └── web/                    # Frontend (UIKit)
│       ├── features/
│       │   ├── main/
│       │   │   └── pages/
│       │   │       └── index.tsx    # → /
│       │   ├── gallery/
│       │   │   └── pages/
│       │   │       └── index.tsx    # → /gallery
│       │   └── welcome/
│       │       └── pages/
│       │           └── index.tsx    # → /welcome
│       ├── shared/
│       └── main.tsx
├── dist/                       # Production build
├── package.json
└── tsconfig.json
```

### Desktop App Structure

```
my-desktop-app/
├── src/
│   └── desktop/
│       ├── main/               # Backend (AppKit + Express)
│       │   ├── features/
│       │   ├── lib/
│       │   └── server.ts
│       └── renderer/           # Frontend (UIKit + React)
│           ├── features/
│           ├── shared/
│           └── main.tsx
├── electron/
│   └── main.js                 # Electron main process
├── dist/                       # Production build
└── package.json
```

## 🎯 Feature-Based Architecture

### Convention-Based Routing

Bloom uses file-based routing where file paths automatically become routes:

```
src/web/features/main/pages/index.tsx     → /
src/web/features/gallery/pages/index.tsx  → /gallery
src/web/features/blog/pages/index.tsx     → /blog
src/web/features/blog/pages/[slug].tsx    → /blog/:slug
src/web/features/docs/pages/[...path].tsx → /docs/*
```

### Creating a New Feature

1. Create feature directory:

```bash
mkdir -p src/web/features/products/pages
```

2. Add a page component:

```tsx
// src/web/features/products/pages/index.tsx
import React from 'react';
import { PageLayout } from '@bloomneo/uikit';

const ProductsPage: React.FC = () => {
  return (
    <PageLayout>
      <PageLayout.Content>
        <h1>Products</h1>
        <p>Your products page content here</p>
      </PageLayout.Content>
    </PageLayout>
  );
};

export default ProductsPage;
```

3. Route `/products` is automatically available!

## 🔧 Backend API Integration

### Built-in API Hooks

Bloom includes generic API hooks that auto-detect your environment:

```tsx
import { useApi } from '@bloomneo/uikit';

const MyComponent = () => {
  const { loading, error, get, post } = useApi();

  const fetchData = async () => {
    const result = await get('/api/welcome');
    console.log(result);
  };

  return (
    <button onClick={fetchData} disabled={loading}>
      {loading ? 'Loading...' : 'Fetch Data'}
    </button>
  );
};
```

### Backend Status Checking

```tsx
import { useBackendStatus } from '@bloomneo/uikit';

const StatusCheck = () => {
  const { isConnected, loading, checkStatus } = useBackendStatus();

  return (
    <div>
      {isConnected ? '✅ Backend Connected' : '❌ Backend Disconnected'}
    </div>
  );
};
```

## 📜 Available Scripts

### Web App Scripts

```bash
npm run dev          # Both API (3000) + Web (5173)
npm run dev:api      # Backend only
npm run dev:web      # Frontend only
npm run build        # Build both frontend and backend
npm start           # Start production server
```

### Desktop App Scripts

```bash
npm run dev          # Both backend + Electron window
npm run dev:web      # Vite dev server only (5183)
npm run dev:electron # Electron window only
npm run build        # Build both frontend and backend
npm run electron:build # Build distributable desktop app
npm start           # Start Electron in production mode
```

### Mobile App Scripts

```bash
npm run dev                  # Start dev server for hot reload
npm run mobile:sync:android # Sync Android platform
npm run mobile:sync:ios     # Sync iOS platform
npm run mobile:run:android  # Run on Android emulator
npm run mobile:run:ios      # Run on iOS simulator
npm run android:build       # Build Android APK
npm run ios:build           # Build iOS .app
```

### UserApp Database Commands

```bash
npm run db:generate  # Generate Prisma client
npm run db:push     # Push schema to database
npm run db:seed     # Seed with sample data
```

## 🎨 Themes

Bloom includes 5 built-in themes:

- **base** - Clean default configuration
- **elegant** - Fresh sky blue theme with clean design
- **metro** - Dark teal theme with bright yellow accents
- **studio** - Sophisticated neutral theme with golden accents
- **vivid** - Premium cursive theme with sophisticated typography

Change theme in your components:

```tsx
import { useTheme } from '@bloomneo/uikit';

const { theme, setTheme } = useTheme();
setTheme('elegant');
```

## 🔧 Configuration

### Environment Variables

Create `.env` file in your project root:

```env
# Backend Configuration
PORT=3000
NODE_ENV=development
BLOOM_FRONTEND_KEY=your-secret-key

# API Configuration
VITE_API_URL=http://localhost:3000
```

### TypeScript Configuration

Bloom includes optimized TypeScript configurations:

- `tsconfig.json` - Frontend configuration
- `tsconfig.api.json` - Backend configuration

## 🌟 Examples

### API Route (Backend)

```typescript
// src/api/features/products/products.route.ts
import express from 'express';
import { errorClass } from '@bloomneo/appkit/error';
import { loggerClass } from '@bloomneo/appkit/logger';

const router = express.Router();
const error = errorClass.get();
const logger = loggerClass.get('products');

router.get(
  '/',
  error.asyncRoute(async (req, res) => {
    logger.info('Getting products');
    const products = await getProducts();
    res.json(products);
  })
);

export default router;
```

### Page Component (Frontend)

```tsx
// src/web/features/products/pages/index.tsx
import React, { useEffect, useState } from 'react';
import { useApi, Button, Card } from '@bloomneo/uikit';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const { loading, get } = useApi();

  useEffect(() => {
    const loadProducts = async () => {
      const data = await get('/api/products');
      setProducts(data);
    };
    loadProducts();
  }, []);

  return (
    <div className="space-y-4">
      <h1>Products</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        products.map((product) => (
          <Card key={product.id}>
            <h2>{product.name}</h2>
            <p>{product.description}</p>
          </Card>
        ))
      )}
    </div>
  );
};

export default ProductsPage;
```

## 📚 Dependencies

### Core Dependencies (Web Apps)

- `@bloomneo/uikit` - React component library with FBCA support
- `@bloomneo/appkit` - Express backend framework with structured logging
- `react` & `react-dom` - React framework
- `react-router-dom` - Client-side routing
- `express` - Backend framework
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable loading

### Core Dependencies (Desktop Apps)

- All web app dependencies, plus:
- `electron` - Cross-platform desktop application framework
- `electron-builder` - Package and build desktop apps
- `wait-on` - Wait for ports to be ready
- `cross-env` - Cross-platform environment variables
- `helmet` - Security headers
- `morgan` - HTTP request logger

### Development Dependencies

- `vite` - Fast frontend build tool
- `typescript` - Type safety
- `nodemon` - Backend auto-reload (web apps)
- `concurrently` - Run multiple commands
- `tsx` - TypeScript execution
- `eslint` - Code linting

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [UIKit Documentation](https://github.com/bloomneo/uikit)
- [AppKit Documentation](https://github.com/bloomneo/appkit)
- [FBCA Guide](https://docs.bloomneo.com/fbca)

<a id="scope-change"></a>

## 🔁 Scope change (1.5.0)

This package was previously published as **`@voilajsx/helix`** with a **`helix`** CLI command. Starting with `1.5.0` it lives at **`@bloomneo/bloom`** with a **`bloom`** CLI command. The old package on npm is frozen at `1.2.0` and will not receive further updates.

**What changed:**

- **Package name** — `@voilajsx/helix` → `@bloomneo/bloom`
- **CLI command** — `helix create` → `bloom create`
- **Brand** — Helix Framework → Bloom Framework
- **GitHub home** — `voilajsx/helix` → `bloomneo/bloom`
- **Sister packages** — templates now reference `@bloomneo/uikit` and `@bloomneo/appkit` (formerly `@voilajsx/uikit` and `@voilajsx/appkit`)

**Migration:**

```diff
- npm install -g @voilajsx/helix
+ npm install -g @bloomneo/bloom
```

```diff
- helix create my-app
+ bloom create my-app
```

In any project that has Bloom installed locally:

```diff
- npx helix create my-app
+ npx bloom create my-app
```

A project-wide find-and-replace of `@voilajsx/helix` → `@bloomneo/bloom`, `@voilajsx/uikit` → `@bloomneo/uikit`, and `@voilajsx/appkit` → `@bloomneo/appkit` is sufficient. The CLI flags, template names, and FBCA conventions are identical between the two scopes — only the namespace and the CLI command word changed.

## 💖 Support

If you like Bloom Framework, please consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs and issues
- 💡 Contributing new features
- 📖 Improving documentation

---

Made with ❤️ by the Bloomneo team
