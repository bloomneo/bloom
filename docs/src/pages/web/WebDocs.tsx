import { Routes, Route, Navigate } from 'react-router-dom';
import DocsLayout from '../../components/DocsLayout';
import DocPage from '../../components/DocPage';
import { webChapters } from '../../config/chapters';

// Introduction Pages
const WhatIsHelix = () => (
  <DocPage
    title="What is Helix?"
    description="Overview of the Helix framework and its purpose"
  >
    <section className="space-y-6">
      <div>
        <p className="text-lg text-muted-foreground">
          Helix is a modern fullstack framework that combines <strong>UIKit</strong> (React frontend)
          and <strong>AppKit</strong> (Express backend) with Feature-Based Component Architecture (FBCA).
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-3">Tech Stack</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-muted rounded-lg text-center">
            <div className="font-semibold">React 18+</div>
            <div className="text-sm text-muted-foreground">Frontend</div>
          </div>
          <div className="p-4 bg-muted rounded-lg text-center">
            <div className="font-semibold">Express.js</div>
            <div className="text-sm text-muted-foreground">Backend</div>
          </div>
          <div className="p-4 bg-muted rounded-lg text-center">
            <div className="font-semibold">TypeScript</div>
            <div className="text-sm text-muted-foreground">Language</div>
          </div>
          <div className="p-4 bg-muted rounded-lg text-center">
            <div className="font-semibold">Vite</div>
            <div className="text-sm text-muted-foreground">Build Tool</div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-3">Core Components</h2>
        <div className="space-y-4">
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold text-primary">UIKit</h3>
            <p className="text-muted-foreground">
              Production-ready React component library with 37+ components, 5 themes,
              and built-in layouts for admin dashboards, marketing sites, and more.
            </p>
          </div>
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold text-primary">AppKit</h3>
            <p className="text-muted-foreground">
              Express.js backend framework with structured logging, error handling,
              and middleware utilities for building robust APIs.
            </p>
          </div>
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold text-primary">Helix CLI</h3>
            <p className="text-muted-foreground">
              Command-line tool that scaffolds fullstack projects with pre-configured
              templates for web, desktop (Electron), and mobile (Capacitor) apps.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-3">Quick Start</h2>
        <div className="bg-zinc-900 text-zinc-100 rounded-lg p-4 font-mono text-sm">
          <div className="text-zinc-500"># Install Helix CLI globally</div>
          <div>npm install -g @voilajsx/helix</div>
          <div className="mt-2 text-zinc-500"># Create a new project</div>
          <div>helix create my-app</div>
          <div className="mt-2 text-zinc-500"># Start development</div>
          <div>cd my-app && npm run dev</div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-3">Available Templates</h2>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-primary font-semibold">basicapp</span>
            <span className="text-muted-foreground">- Basic fullstack app with routing and features (default)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-semibold">userapp</span>
            <span className="text-muted-foreground">- Complete user management with authentication, roles, and Prisma</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-semibold">desktop-basicapp</span>
            <span className="text-muted-foreground">- Cross-platform Electron desktop app</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-semibold">mobile-basicapp</span>
            <span className="text-muted-foreground">- Native iOS and Android app with Capacitor</span>
          </li>
        </ul>
      </div>
    </section>
  </DocPage>
);

const WhyHelix = () => (
  <DocPage
    title="Why Helix?"
    description="Benefits and use cases for choosing Helix"
  >
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-3">Zero Configuration</h2>
        <p className="text-muted-foreground mb-4">
          Helix follows a convention-over-configuration approach. Create a file in the right place,
          and it just works. No need to manually configure routes, webpack, or build tools.
        </p>
        <div className="bg-muted rounded-lg p-4">
          <code className="text-sm">
            src/web/features/products/pages/index.tsx → /products
          </code>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-3">Fullstack Integration</h2>
        <p className="text-muted-foreground mb-4">
          Frontend and backend are designed to work together seamlessly. Built-in API hooks
          auto-detect your environment and handle communication effortlessly.
        </p>
        <div className="bg-zinc-900 text-zinc-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
{`import { useApi } from '@voilajsx/uikit/hooks';

const { loading, get, post } = useApi();
const data = await get('/api/products');`}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-3">Multi-Platform Support</h2>
        <p className="text-muted-foreground mb-4">
          Build for web, desktop, and mobile with the same architecture and patterns.
          Your knowledge transfers across platforms.
        </p>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 border border-border rounded-lg">
            <div className="text-2xl mb-2">🌐</div>
            <div className="font-semibold">Web</div>
            <div className="text-xs text-muted-foreground">React + Express</div>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <div className="text-2xl mb-2">🖥️</div>
            <div className="font-semibold">Desktop</div>
            <div className="text-xs text-muted-foreground">Electron</div>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <div className="text-2xl mb-2">📱</div>
            <div className="font-semibold">Mobile</div>
            <div className="text-xs text-muted-foreground">Capacitor</div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-3">Production-Ready Components</h2>
        <p className="text-muted-foreground mb-4">
          UIKit provides 37+ components built on ShadCN and Radix UI primitives.
          Accessible, themeable, and battle-tested.
        </p>
        <ul className="grid grid-cols-2 gap-2 text-sm">
          <li>✓ Forms & Inputs</li>
          <li>✓ Data Tables</li>
          <li>✓ Navigation & Menus</li>
          <li>✓ Dialogs & Modals</li>
          <li>✓ Cards & Layouts</li>
          <li>✓ Motion & Animation</li>
        </ul>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-3">5 Built-in Themes</h2>
        <p className="text-muted-foreground mb-4">
          Switch themes with a single line of code. Each theme includes light and dark modes.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-zinc-200 dark:bg-zinc-700 rounded-full text-sm">base</span>
          <span className="px-3 py-1 bg-sky-200 dark:bg-sky-800 rounded-full text-sm">elegant</span>
          <span className="px-3 py-1 bg-teal-200 dark:bg-teal-800 rounded-full text-sm">metro</span>
          <span className="px-3 py-1 bg-amber-200 dark:bg-amber-800 rounded-full text-sm">studio</span>
          <span className="px-3 py-1 bg-purple-200 dark:bg-purple-800 rounded-full text-sm">vivid</span>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-3">When to Use Helix</h2>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>Building fullstack web applications with React and Express</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>Rapid prototyping with consistent architecture</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>Cross-platform projects (web + desktop + mobile)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>Teams wanting convention-based development</span>
          </div>
        </div>
      </div>
    </section>
  </DocPage>
);

// Architecture Pages
const FbcaOverview = () => (
  <DocPage
    title="FBCA Overview"
    description="Understanding Feature-Based Component Architecture"
  >
    <section className="space-y-6">
      <div>
        <p className="text-lg text-muted-foreground">
          Feature-Based Component Architecture (FBCA) is the core organizational pattern in Helix.
          It structures your code by <strong>features</strong> rather than by file type, making
          large applications easier to navigate and maintain.
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-3">Traditional vs FBCA</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold text-red-500 mb-2">❌ Traditional (by type)</h3>
            <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`src/
├── components/
│   ├── ProductCard.tsx
│   ├── UserCard.tsx
│   └── OrderCard.tsx
├── pages/
│   ├── Products.tsx
│   ├── Users.tsx
│   └── Orders.tsx
├── services/
│   ├── productService.ts
│   ├── userService.ts
│   └── orderService.ts`}
            </pre>
          </div>
          <div className="border border-primary/50 rounded-lg p-4">
            <h3 className="font-semibold text-green-500 mb-2">✓ FBCA (by feature)</h3>
            <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`src/web/features/
├── products/
│   ├── pages/
│   ├── components/
│   └── services/
├── users/
│   ├── pages/
│   ├── components/
│   └── services/
└── orders/
    ├── pages/
    ├── components/
    └── services/`}
            </pre>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-3">Auto-Discovery Routing</h2>
        <p className="text-muted-foreground mb-4">
          With FBCA, routes are automatically generated based on your file structure.
          No manual route configuration needed.
        </p>
        <div className="bg-muted rounded-lg p-4 space-y-2 font-mono text-sm">
          <div className="flex justify-between">
            <span>features/main/pages/index.tsx</span>
            <span className="text-primary">→ /</span>
          </div>
          <div className="flex justify-between">
            <span>features/products/pages/index.tsx</span>
            <span className="text-primary">→ /products</span>
          </div>
          <div className="flex justify-between">
            <span>features/products/pages/[id].tsx</span>
            <span className="text-primary">→ /products/:id</span>
          </div>
          <div className="flex justify-between">
            <span>features/blog/pages/[...slug].tsx</span>
            <span className="text-primary">→ /blog/*</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-3">Feature Structure</h2>
        <p className="text-muted-foreground mb-4">
          Each feature is a self-contained module with its own pages, components, and services.
        </p>
        <pre className="bg-zinc-900 text-zinc-100 rounded-lg p-4 text-sm overflow-x-auto">
{`features/products/
├── pages/              # Route pages (auto-discovered)
│   ├── index.tsx       # /products
│   ├── [id].tsx        # /products/:id
│   └── new.tsx         # /products/new
├── components/         # Feature-specific components
│   ├── ProductCard.tsx
│   └── ProductForm.tsx
├── services/           # API calls and business logic
│   └── productService.ts
├── hooks/              # Custom hooks
│   └── useProducts.ts
└── types/              # TypeScript types
    └── product.ts`}
        </pre>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-3">Benefits of FBCA</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">1.</span>
              <div>
                <div className="font-semibold">Scalability</div>
                <div className="text-sm text-muted-foreground">Add features without touching existing code</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">2.</span>
              <div>
                <div className="font-semibold">Discoverability</div>
                <div className="text-sm text-muted-foreground">Everything related to a feature is in one place</div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">3.</span>
              <div>
                <div className="font-semibold">Team Collaboration</div>
                <div className="text-sm text-muted-foreground">Teams can work on features independently</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">4.</span>
              <div>
                <div className="font-semibold">Code Deletion</div>
                <div className="text-sm text-muted-foreground">Remove a feature by deleting one folder</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-3">Creating a New Feature</h2>
        <div className="bg-zinc-900 text-zinc-100 rounded-lg p-4 font-mono text-sm">
          <div className="text-zinc-500"># 1. Create the feature directory</div>
          <div>mkdir -p src/web/features/products/pages</div>
          <div className="mt-3 text-zinc-500"># 2. Create a page component</div>
          <div>touch src/web/features/products/pages/index.tsx</div>
          <div className="mt-3 text-zinc-500"># 3. Route /products is now available!</div>
        </div>
      </div>
    </section>
  </DocPage>
);

const ProjectStructure = () => (
  <DocPage
    title="Project Structure"
    description="How a Helix project is organized"
    isPlaceholder
  />
);

const HowItWorks = () => (
  <DocPage
    title="How It Works"
    description="The flow from request to response"
    isPlaceholder
  />
);

// Backend Pages
const ServerSetup = () => (
  <DocPage
    title="Server Setup"
    description="Setting up the Express server with AppKit"
    isPlaceholder
  />
);

const RoutesServices = () => (
  <DocPage
    title="Routes & Services"
    description="Creating API routes and business logic"
    isPlaceholder
  />
);

const ApiPatterns = () => (
  <DocPage
    title="API Patterns"
    description="Best practices for API design"
    isPlaceholder
  />
);

// Frontend Pages
const Components = () => (
  <DocPage
    title="Components"
    description="Using UIKit components in your app"
    isPlaceholder
  />
);

const Routing = () => (
  <DocPage
    title="Routing"
    description="File-based routing and navigation"
    isPlaceholder
  />
);

const Themes = () => (
  <DocPage
    title="Themes"
    description="Customizing the look with themes"
    isPlaceholder
  />
);

// Tutorial Pages
const BasicApp = () => (
  <DocPage
    title="Basic App"
    description="Build your first Helix application"
    isPlaceholder
  />
);

const EssentialApp = () => (
  <DocPage
    title="Essential App"
    description="Add authentication and database"
    isPlaceholder
  />
);

const AdvancedApp = () => (
  <DocPage
    title="Advanced App"
    description="Production-ready features and deployment"
    isPlaceholder
  />
);

const WebDocs = () => {
  return (
    <DocsLayout chapters={webChapters} platform="web">
      <Routes>
        {/* Redirect /web to first page */}
        <Route index element={<Navigate to="/web/introduction/what-is-helix" replace />} />

        {/* Introduction */}
        <Route path="introduction/what-is-helix" element={<WhatIsHelix />} />
        <Route path="introduction/why-helix" element={<WhyHelix />} />

        {/* Architecture */}
        <Route path="architecture/fbca-overview" element={<FbcaOverview />} />
        <Route path="architecture/project-structure" element={<ProjectStructure />} />
        <Route path="architecture/how-it-works" element={<HowItWorks />} />

        {/* Backend */}
        <Route path="backend/server-setup" element={<ServerSetup />} />
        <Route path="backend/routes-services" element={<RoutesServices />} />
        <Route path="backend/api-patterns" element={<ApiPatterns />} />

        {/* Frontend */}
        <Route path="frontend/components" element={<Components />} />
        <Route path="frontend/routing" element={<Routing />} />
        <Route path="frontend/themes" element={<Themes />} />

        {/* Tutorials */}
        <Route path="tutorials/basic-app" element={<BasicApp />} />
        <Route path="tutorials/essential-app" element={<EssentialApp />} />
        <Route path="tutorials/advanced-app" element={<AdvancedApp />} />
      </Routes>
    </DocsLayout>
  );
};

export default WebDocs;
