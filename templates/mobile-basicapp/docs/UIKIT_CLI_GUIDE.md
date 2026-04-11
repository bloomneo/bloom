# UIKit CLI Guide

**Master the UIKit command-line interface to scaffold, develop, and deploy production-ready React applications with zero configuration.**

## 🚀 Why UIKit CLI?

The UIKit CLI is your **development accelerator** that transforms hours of project setup into minutes of productive coding. Unlike other React scaffolding tools that give you a basic skeleton, UIKit CLI provides **production-ready project structures** with built-in routing, theming, and deployment workflows.

**Traditional React Setup Problems:**
- ⏰ **Hours of configuration** - Webpack, routing, theming, deployment setup
- 🔧 **Decision fatigue** - Which router? Which UI library? How to structure files?
- 🐛 **Integration issues** - Components don't work together seamlessly
- 📱 **Responsive headaches** - Mobile-first design requires extensive CSS work

**UIKit CLI Solutions:**
- ⚡ **Zero configuration** - Production setup in one command
- 🎯 **Opinionated structure** - Battle-tested patterns, no decisions needed
- 🎨 **Integrated theming** - 5 professional themes, custom theme generation
- 📱 **Mobile-first layouts** - Responsive AdminLayout, PageLayout, AuthLayout
- 🚀 **One-command deployment** - Deploy to GitHub Pages, Netlify, Vercel instantly

**The result:** Go from idea to deployed application in under 10 minutes.

---

## 📁 Project Templates Overview

UIKit CLI provides **4 carefully designed templates** that scale from simple demos to enterprise applications:

| Template | Command | Structure | Best For | Key Features |
|----------|---------|-----------|----------|--------------|
| **Single** | `uikit create myapp` | Single page showcase | Component demos, learning | No routing, simple structure |
| **SPA** | `uikit create myapp --spa` | Single-page application | Marketing sites, portfolios | React Router, multiple views |
| **Multi** | `uikit create myapp --multi` | Multi-layout application | Business apps, SaaS platforms | Multiple layouts, organized routing |
| **FBCA** | `uikit create myapp --fbca` | Feature-based architecture | Enterprise, large applications | Auto-discovery routing, feature isolation |

### Template Decision Guide

```
How complex is your application?

Simple Demo/Learning
└── Single Template
    ├── One page with components
    ├── No routing needed
    └── Perfect for experimenting

Marketing/Portfolio Site
└── SPA Template
    ├── Multiple pages, single layout
    ├── React Router included
    └── Clean navigation structure

Business Application
└── Multi Template
    ├── Different layouts (Admin, Auth, Page)
    ├── Organized page structure
    └── Professional routing

Enterprise Application
└── FBCA Template
    ├── Feature-based organization
    ├── Scalable architecture
    ├── Auto-discovery routing
    └── Team collaboration ready
```

---

## 🏗️ Project Generation

### Single Template
```bash
# Generate simple component showcase
uikit create demo-app

# What you get:
# /demo-app
# ├── src/
# │   ├── App.tsx          # Main component showcase
# │   ├── main.tsx         # React entry point
# │   └── index.css        # Tailwind + UIKit styles
# ├── index.html
# └── package.json
```

**Folder Structure:**
- **`src/App.tsx`** - Edit this file to showcase components
- **`src/main.tsx`** - Theme configuration and React setup
- **`src/index.css`** - Tailwind CSS + UIKit styles import

**When to use:** Learning UIKit, component demos, simple prototypes

### SPA Template
```bash
# Generate single-page application
uikit create portfolio-site --spa

# What you get:
# /portfolio-site
# ├── src/
# │   ├── App.tsx              # All pages and router configuration
# │   ├── main.tsx             # App entry with theme
# │   └── index.css            # Tailwind + UIKit styles
# ├── index.html
# └── package.json
```

**Folder Structure:**
- **`src/App.tsx`** - Contains all page components (HomePage, ComponentsPage, ThemesPage, DocsPage) and router configuration
- **`src/main.tsx`** - Theme and React setup
- **`src/index.css`** - Tailwind CSS + UIKit styles import

**When to use:** Marketing websites, portfolios, documentation sites, simple applications

### Multi Template
```bash
# Generate multi-layout application
uikit create business-app --multi

# What you get:
# /business-app
# ├── src/
# │   ├── App.tsx                  # Router with layout switching
# │   ├── main.tsx                 # App entry with theme
# │   ├── router.tsx               # Route configuration
# │   ├── pages/
# │   │   ├── Home.tsx             # Homepage with PageLayout
# │   │   ├── About.tsx            # About page
# │   │   ├── Contact.tsx          # Contact page
# │   │   ├── Components.tsx       # Component showcase
# │   │   ├── Themes.tsx           # Theme switcher
# │   │   ├── Login.tsx            # Login with AuthLayout
# │   │   ├── Dashboard.tsx        # Dashboard with AdminLayout
# │   │   └── ErrorPage.tsx        # Error page with BlankLayout
# │   ├── components/
# │   │   ├── Header.tsx           # Site header
# │   │   ├── Footer.tsx           # Site footer
# │   │   └── index.ts             # Component exports
# │   └── index.css                # Tailwind + UIKit styles
# ├── public/
# │   ├── favicon.svg
# │   └── hero.svg
# ├── docs/                        # Development guides
# ├── index.html
# └── package.json
```

**Folder Structure:**
- **`src/pages/`** - All page components (Home, About, Contact, Login, Dashboard, etc.)
- **`src/components/`** - Shared components (Header, Footer)
- **`src/router.tsx`** - Simple route configuration with path/component mapping
- **`src/App.tsx`** - Layout wrapper that chooses layout based on current route
- **`src/main.tsx`** - Theme configuration and React setup
- **`src/index.css`** - Tailwind CSS + UIKit styles import

**When to use:** Business applications, SaaS platforms, applications with distinct user roles

### FBCA Template (Recommended for Enterprise)
```bash
# Generate feature-based architecture
uikit create enterprise-app --fbca

# What you get:
# /enterprise-app
# ├── src/
# │   └── web/
# │       ├── main.tsx                    # App entry point
# │       ├── App.tsx                     # Root router with PageRouter
# │       ├── lib/
# │       │   └── page-router.tsx         # Auto-discovery routing engine
# │       ├── features/
# │       │   ├── main/
# │       │   │   ├── pages/
# │       │   │   │   ├── index.tsx       # Auto-route: / (homepage)
# │       │   │   │   └── About.tsx       # Auto-route: /about
# │       │   │   └── components/
# │       │   │       └── CTASection.tsx  # Homepage components
# │       │   ├── auth/
# │       │   │   └── pages/
# │       │   │       └── index.tsx       # Auto-route: /auth (login)
# │       │   ├── gallery/
# │       │   │   ├── pages/
# │       │   │   │   └── index.tsx       # Auto-route: /gallery
# │       │   │   └── hooks/
# │       │   │       └── useGallery.ts   # Gallery logic
# │       │   └── docs/
# │       │       └── pages/
# │       │           └── [...slug].tsx   # Auto-route: /docs/* (catch-all)
# │       ├── shared/
# │       │   ├── components/             # Reusable components
# │       │   │   ├── Header.tsx          # Site header
# │       │   │   ├── Footer.tsx          # Site footer
# │       │   │   ├── SEO.tsx             # SEO component
# │       │   │   └── index.ts            # Component exports
# │       │   └── hooks/
# │       │       └── useSEO.ts           # Shared logic
# │       ├── styles/
# │       │   └── index.css               # Tailwind + UIKit styles
# │       └── index.html
# ├── public/
# │   ├── favicon.svg
# │   └── hero.svg
# ├── docs/                               # Development guides
# └── package.json
```

**FBCA Folder Structure Explained:**

#### **Core Concepts:**
- **Feature-based organization** - Each business feature is self-contained
- **Auto-discovery routing** - File structure = URL structure (like Next.js)
- **Shared resources** - Common components and logic in `/shared`
- **Scalable architecture** - Easy to add new features without affecting others

#### **Key Directories:**

**`src/web/features/`** - Business features (auth, dashboard, public, etc.)
- Each feature contains its own pages, components, and hooks
- **Complete isolation** - features don't depend on each other
- **Team-friendly** - different teams can work on different features

**`src/web/features/[feature]/pages/`** - Auto-routing pages
- **`index.tsx`** = `/feature` route
- **`users.tsx`** = `/feature/users` route
- **`[id].tsx`** = `/feature/:id` dynamic route (optional)

**`src/web/features/[feature]/components/`** - Feature-specific UI components
- Only used within this feature
- Can import from `/shared/components` for reusable parts

**`src/web/features/[feature]/hooks/`** - Feature-specific logic
- Custom React hooks for business logic
- API calls, state management, data processing

**`src/web/shared/`** - Application-wide resources
- **`components/`** - Reusable UI components across features
- **`hooks/`** - Shared business logic and utilities
- **`utils/`** - Helper functions, constants, API clients

#### **Auto-Discovery Routing:**
```
File Structure                          → URL Route
/features/main/pages/index.tsx          → / (homepage)
/features/main/pages/About.tsx          → /about
/features/auth/pages/index.tsx          → /auth (login)
/features/gallery/pages/index.tsx       → /gallery
/features/docs/pages/[...slug].tsx      → /docs/* (catch-all dynamic route)
```

#### **Which Files to Edit in FBCA:**

**Adding a new feature:**
1. **Create feature folder:** `src/web/features/[feature-name]/`
2. **Add pages:** `src/web/features/[feature-name]/pages/index.tsx`
3. **Add components:** `src/web/features/[feature-name]/components/`
4. **Add logic:** `src/web/features/[feature-name]/hooks/`

**Common editing scenarios:**
- **Homepage:** Edit `src/web/features/main/pages/index.tsx`
- **Login:** Edit `src/web/features/auth/pages/index.tsx`
- **Gallery:** Edit `src/web/features/gallery/pages/index.tsx`
- **New page:** Create `src/web/features/[feature]/pages/[name].tsx`
- **Dynamic routes:** Use `[id].tsx` for `/feature/:id` or `[...slug].tsx` for catch-all

**When to use FBCA:**
- ✅ **Enterprise applications** with multiple business domains
- ✅ **Large teams** working on different features simultaneously
- ✅ **Long-term projects** that need to scale and evolve
- ✅ **Complex applications** with 10+ pages and distinct feature areas
- ✅ **Applications requiring feature flags** or modular deployment

**Why FBCA is powerful:**
- **Scalability** - Add new features without touching existing code
- **Team collaboration** - Multiple developers can work independently
- **Maintainability** - Features are isolated and self-contained
- **Performance** - Can implement code splitting per feature
- **Testing** - Easy to test features in isolation

---

## ⚡ CLI Commands Reference

### Project Creation

Choose the right template: Single (learning), SPA (simple sites), Multi (business apps), or FBCA (enterprise).

```bash
# Template generation
uikit create <app-name>              # Single template
uikit create <app-name> --spa        # SPA template
uikit create <app-name> --multi      # Multi-layout template
uikit create <app-name> --fbca       # Feature-based architecture

# With theme selection
uikit create myapp --theme elegant   # Start with elegant theme
```

### Code Generation (FBCA Only)

FBCA projects support automated code generation for consistent architecture.

```bash
# Generate new feature
uikit generate feature blog          # Creates /features/blog/ with pages, components, hooks

# Generate individual components
uikit generate page dashboard        # Creates page component
uikit generate component UserCard    # Creates reusable component
uikit generate hook useAuth          # Creates custom React hook
```

### Development Workflow

UIKit CLI provides smart development and build commands with automatic optimizations. `uikit serve` handles port conflicts and bundles themes. `uikit build` compiles TypeScript, processes themes, and generates SEO files.

```bash
# Start development server
uikit serve                          # Smart dev server with theme bundling
uikit serve --port 3000              # Use specific port

# Production build
uikit build                          # Optimized build with TypeScript & themes
uikit build --analyze                # Include bundle analysis

# Preview production build
uikit preview                        # Test production build locally
```

### Theme Management

Create custom themes to match your brand while maintaining UIKit's design system.

```bash
# Generate custom theme
uikit generate theme brand           # Creates custom theme with your brand colors

# Bundle themes to CSS
uikit bundle                         # Processes themes and generates CSS
uikit bundle --watch                 # Watch mode for theme development
```

### Deployment

Deploy UIKit applications as static sites. Use `uikit deploy` for manual deployment or `uikit deploy --github` for automated GitHub Pages.

**Manual Deployment:**
```bash
uikit deploy                         # Generates /dist folder for any static host
```
Creates optimized build with theme bundling, SPA routing (404.html), and SEO files.

**GitHub Pages Deployment:**
```bash
uikit deploy --github                # Automated GitHub Pages deployment
uikit deploy --github --domain example.com  # With custom domain
```
Performs all manual deployment steps plus:
- Git validation and repository checks
- Creates `.nojekyll` and CNAME files
- Pushes to `gh-pages` branch automatically
- Configures proper base paths for GitHub URLs

**Other Hosting:**
```bash
uikit build && npx surge dist/       # Surge.sh
uikit build && npx vercel --prod     # Vercel
uikit build                          # Then drag dist/ to netlify.com/drop
```

---

## 🔧 Development Workflow

### Daily Development Process
```bash
# 1. Start your project
cd your-project
uikit serve                          # Start development server

# 2. Develop with live reload
# Edit files in src/ folder
# Browser automatically refreshes with changes

# 3. Theme development (if needed)
uikit bundle --watch               # Watch theme changes in another terminal

# 4. Generate new components (FBCA only)
uikit generate page settings       # Add new pages as needed
```

### Build and Test Process
```bash
# 1. Create production build
uikit build                         # Generates optimized /dist folder

# 2. Test production build locally
uikit preview                       # Serve production build

# 3. Deploy to production
uikit deploy --github              # Deploy to GitHub Pages
# OR upload /dist folder to your hosting provider
```

### Theme Customization Workflow
```bash
# 1. Generate custom theme
uikit generate theme mycustom       # Creates theme with default colors

# 2. Start theme development
uikit bundle --watch               # Watch for theme changes

# 3. Customize your brand colors
# Edit src/themes/presets/theme-mycustom.js
# Change primary, secondary colors to match your brand

# 4. See changes instantly
# Browser updates automatically with new theme
```

---

## 🚀 Deployment Guide

### GitHub Pages (Recommended)
```bash
# Automatic deployment
uikit deploy --github

# What this does:
# 1. Builds your project (uikit build)
# 2. Creates gh-pages branch (if needed)
# 3. Pushes /dist content to gh-pages branch
# 4. Configures GitHub Pages to serve from gh-pages
# 5. Your site is live at: https://username.github.io/repository-name
```

### Manual Static Hosting
```bash
# Build your project
uikit build

# Upload /dist folder contents to:
# - Netlify (drag and drop /dist folder)
# - Vercel (vercel --prod /dist)
# - AWS S3 (aws s3 sync dist/ s3://your-bucket)
# - Any static hosting provider
```

### Custom Domain Setup
```bash
# After GitHub Pages deployment
# 1. Go to repository Settings > Pages
# 2. Add your custom domain (e.g., myapp.com)
# 3. Enable "Enforce HTTPS"
# 4. Configure DNS:
#    - CNAME record: www.myapp.com → username.github.io
#    - A records: myapp.com → GitHub Pages IPs
```

---

## 🎯 Best Practices

### Project Structure Best Practices
```bash
# ✅ DO: Organize by feature (FBCA)
/features/auth/pages/login.tsx
/features/auth/components/LoginForm.tsx
/features/dashboard/pages/index.tsx

# ❌ AVOID: Organize by file type
/pages/Login.tsx
/pages/Dashboard.tsx
/components/LoginForm.tsx
```

### Development Best Practices
```bash
# ✅ DO: Use the CLI for generation
uikit generate page settings        # Consistent structure

# ❌ AVOID: Manual file creation
# Creates inconsistent patterns and missing boilerplate
```

### Theme Best Practices
```bash
# ✅ DO: Customize existing themes
uikit generate theme brand         # Start with defaults, customize as needed

# ❌ AVOID: Building themes from scratch
# Use semantic color system for consistency
```

### Deployment Best Practices
```bash
# ✅ DO: Test production build before deployment
uikit build && uikit preview

# ✅ DO: Use automated deployment
uikit deploy --github              # Consistent, repeatable process

# ❌ AVOID: Manual FTP uploads
# Error-prone and time-consuming
```

---

## 🔍 Troubleshooting

### Common Issues

**"Command not found: uikit"**
```bash
# Install UIKit CLI globally
npm install -g @bloomneo/uikit

# Verify installation
uikit --version
```

**"Port 3000 already in use"**
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
uikit serve --port 3001
```

**"Build fails with module errors"**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild
uikit build
```

**"Theme changes not applying"**
```bash
# Rebuild themes
uikit bundle

# Clear browser cache
# Restart development server
uikit serve
```

**"Deployment to GitHub Pages fails"**
```bash
# Check repository settings
# Ensure GitHub Pages is enabled
# Verify branch permissions

# Manual deployment
uikit build
# Manually push /dist contents to gh-pages branch
```

---

## 📚 Related Guides

- **[UIKit Theme Guide](./UIKIT_THEME_GUIDE.md)** - Custom theming and colors
- **[UIKit Composite UI System](./UIKIT_COMPOSITE_UI_SYSTEM.md)** - Components and layouts
- **[UIKit LLM Guide](./UIKIT_LLM_GUIDE.md)** - Complete implementation reference
- **[GitHub Repository](https://github.com/bloomneo/uikit)** - Source code and examples

---

**Master UIKit CLI and ship production applications in minutes, not hours** ⚡