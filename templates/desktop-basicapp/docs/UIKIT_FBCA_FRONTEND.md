# UIKit FBCA Frontend - Complete LLM Guide 🚀

> **Essential foundation for AI agents to generate perfect UIKit FBCA frontend code**

## CRITICAL: Read This First

This guide establishes the core patterns that ALL UIKit FBCA frontend code must follow. Every example is production-ready. Every pattern is tested. Every rule is absolute.

---

## WHEN TO USE UIKIT FBCA

✅ **ALWAYS use UIKit FBCA when:**

- Building feature-rich React applications with 3+ distinct features
- Need auto-discovery file-based routing (no manual route config)
- Want feature isolation for team collaboration
- Building enterprise applications that need to scale
- Require modular architecture with clear boundaries
- Want zero-configuration routing like Next.js
- Need SEO management per page

❌ **NEVER use FBCA when:**

- Building simple single-page applications (use SPA template)
- Creating small prototypes with 1-2 pages (use Single template)
- Building non-React applications
- Creating backend-only services
- Working with existing routing systems you can't change

---

## FBCA ARCHITECTURE PRINCIPLES

### The Three Golden Rules

1. **Feature Organization**: Code organized by business features, NOT by file types
2. **Auto-Discovery Routing**: File structure determines URLs automatically
3. **Isolation**: Each feature is completely self-contained

### File Structure Convention

```
src/web/
├── App.tsx                          # Root app with theme + router
├── main.tsx                         # Entry point
├── index.html                       # HTML template
├── lib/
│   └── page-router.tsx              # Auto-discovery routing engine
├── features/                        # CRITICAL: All features here
│   ├── main/                        # Special: Gets priority routes
│   │   ├── pages/
│   │   │   ├── index.tsx            # Route: / (homepage)
│   │   │   └── About.tsx            # Route: /about
│   │   └── components/              # Feature-specific components
│   ├── auth/
│   │   ├── pages/
│   │   │   └── index.tsx            # Route: /auth
│   │   └── hooks/                   # Feature-specific logic
│   └── gallery/
│       ├── pages/
│       │   └── index.tsx            # Route: /gallery
│       └── components/
├── shared/                          # CRITICAL: Reusable across features
│   ├── components/                  # Header, Footer, SEO, ErrorBoundary
│   └── hooks/                       # useSEO, etc.
└── styles/
    └── index.css                    # Global styles
```

---

## ROUTING CONVENTIONS (MEMORIZE THESE)

### File-Based Routing Patterns

```typescript
// File structure → URL route mapping

// Main feature (priority routes)
features/main/pages/index.tsx          → /
features/main/pages/About.tsx          → /about
features/main/pages/Contact.tsx        → /contact

// Other features (prefixed)
features/auth/pages/index.tsx          → /auth
features/auth/pages/Login.tsx          → /auth/login
features/gallery/pages/index.tsx       → /gallery
features/blog/pages/index.tsx          → /blog

// Dynamic routes
features/blog/pages/[slug].tsx         → /blog/:slug
features/user/pages/[id].tsx           → /user/:id

// Nested dynamic routes
features/user/pages/[id]/settings.tsx  → /user/:id/settings

// Catch-all routes
features/docs/pages/[...slug].tsx      → /docs/*
```

### Route Priority (CRITICAL)

1. **Root route** (`/`) - Always from `main/pages/index.tsx`
2. **Static routes** - Exact matches sorted by length
3. **Dynamic routes** - `[param]` routes
4. **Catch-all routes** - `[...param]` routes last

---

## THE ONE FUNCTION RULE: LIBRARY COMPONENTS FIRST

**ALWAYS prefer UIKit library components over custom components**

### Component Selection Decision Tree

```
Need a component?
├── Layout/Page Structure?
│   ├── Admin Panel → AdminLayout (from @bloomneo/uikit/admin)
│   ├── Website → PageLayout (from @bloomneo/uikit/page)
│   ├── Auth Pages → AuthLayout (from @bloomneo/uikit/auth)
│   └── Simple Page → BlankLayout (from @bloomneo/uikit/blank)
│
├── Form Components?
│   ├── Validated Input → ValidatedInput (from @bloomneo/uikit/form)
│   ├── Select → ValidatedSelect (from @bloomneo/uikit/form)
│   ├── Checkbox → ValidatedCheckbox (from @bloomneo/uikit/form)
│   └── Form Actions → FormActions (from @bloomneo/uikit/form)
│
├── Data Display?
│   ├── Complex Table → DataTable (from @bloomneo/uikit/data-table)
│   ├── Simple Table → Table (from @bloomneo/uikit/table)
│   └── Card → Card (from @bloomneo/uikit/card)
│
├── Animations?
│   ├── Page Transition → Motion (from @bloomneo/uikit/motion)
│   ├── Scroll Animation → Reveal (from @bloomneo/uikit/motion)
│   ├── Hover Effect → Hover (from @bloomneo/uikit/motion)
│   └── Loading → LoadingSpinner (from @bloomneo/uikit/motion)
│
└── Custom Component?
    └── ONLY if no library component exists
```

---

## REQUIRED SETUP (COPY-PASTE EVERY PROJECT)

### Step 1: Root App Configuration

```tsx
// src/web/App.tsx
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@bloomneo/uikit/theme-provider';
import { PageRouter } from './lib/page-router';
import { ErrorBoundary } from './shared/components';
import '@bloomneo/uikit/styles'; // CRITICAL: Must import

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme="base" mode="light" forceConfig={true}>
        <Router
          basename="/"
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <PageRouter />
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
```

### Step 2: Auto-Discovery Router

```tsx
// src/web/lib/page-router.tsx
import { useMemo } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// Auto-discover all page files
const pageFiles = import.meta.glob('../features/*/pages/**/*.{tsx,jsx}', {
  eager: true
});

function generateRoutes() {
  const routes = [];

  Object.entries(pageFiles).forEach(([filePath, module]) => {
    const match = filePath.match(/\.\.\/features\/([^/]+)\/pages\/(.+)\.tsx?$/);
    if (!match) return;

    const [, feature, nestedPath] = match;
    const pathSegments = nestedPath.split('/');

    let routePath: string;

    if (feature === 'main') {
      // Main feature gets priority routes
      if (pathSegments.length === 1 && pathSegments[0] === 'index') {
        routePath = '/';
      } else {
        routePath = '/' + pathSegments
          .map(segment => segment === 'index' ? '' : segment.toLowerCase())
          .filter(Boolean)
          .map(segment => {
            if (segment.startsWith('[...') && segment.endsWith(']')) {
              return '*';
            }
            if (segment.startsWith('[') && segment.endsWith(']')) {
              return ':' + segment.slice(1, -1);
            }
            return segment;
          })
          .join('/');
      }
    } else {
      // Other features: /feature/nested/path
      const nestedRoute = pathSegments
        .map(segment => segment === 'index' ? '' : segment.toLowerCase())
        .filter(Boolean)
        .map(segment => {
          if (segment.startsWith('[...') && segment.endsWith(']')) {
            return '*';
          }
          if (segment.startsWith('[') && segment.endsWith(']')) {
            return ':' + segment.slice(1, -1);
          }
          return segment;
        })
        .join('/');

      if (pathSegments.length === 1 && pathSegments[0] === 'index') {
        routePath = `/${feature}`;
      } else {
        routePath = `/${feature}${nestedRoute ? '/' + nestedRoute : ''}`;
      }
    }

    routes.push({
      path: routePath,
      component: (module as any).default
    });
  });

  // Sort routes for proper matching
  routes.sort((a, b) => {
    if (a.path === '/') return 1;
    if (b.path === '/') return -1;
    return b.path.length - a.path.length;
  });

  return routes;
}

export const PageRouter = () => {
  const routes = useMemo(() => {
    const discoveredRoutes = generateRoutes();
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Auto-discovered routes:', discoveredRoutes.map(r => r.path));
    }
    return discoveredRoutes;
  }, []);

  return (
    <Routes>
      {routes.map(({ path, component: Component }) => (
        <Route key={path} path={path} element={<Component />} />
      ))}
      <Route path="*" element={
        <div className="text-center py-12 text-muted-foreground">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p>Page not found</p>
        </div>
      } />
    </Routes>
  );
};
```

### Step 3: Shared Components (REQUIRED)

```tsx
// src/web/shared/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription } from '@bloomneo/uikit/alert';
import { Button } from '@bloomneo/uikit/button';
import { Card, CardContent, CardHeader, CardTitle } from '@bloomneo/uikit/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Something Went Wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription>
                  <strong>Error:</strong> {this.state.error?.message || 'Unknown error'}
                </AlertDescription>
              </Alert>

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="bg-muted p-4 rounded-lg">
                  <summary className="cursor-pointer font-medium text-sm">
                    Error Details (Development Only)
                  </summary>
                  <pre className="mt-2 text-xs overflow-auto max-h-64">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex gap-2">
                <Button onClick={this.handleReset} variant="default">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
```

```tsx
// src/web/shared/components/Header.tsx
import { PageLayout } from '@bloomneo/uikit/page';

export const Header = () => {
  return (
    <PageLayout.Header
      navigation={[
        { key: 'home', label: 'Home', href: '/' },
        { key: 'gallery', label: 'Gallery', href: '/gallery' },
        { key: 'auth', label: 'Login', href: '/auth' },
      ]}
      logo={<div className="font-bold text-foreground">FBCA App</div>}
      position="sticky"
    />
  );
};
```

```tsx
// src/web/shared/components/Footer.tsx
import { PageLayout } from '@bloomneo/uikit/page';

export const Footer = () => {
  return (
    <PageLayout.Footer
      copyright="© 2025 FBCA App. All rights reserved."
      position="relative"
    />
  );
};
```

```tsx
// src/web/shared/components/SEO.tsx
import { useSEO } from '../hooks/useSEO';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
}

export const SEO = (props: SEOProps) => {
  useSEO(props);
  return null; // Component doesn't render anything
};
```

```tsx
// src/web/shared/components/index.ts
export { Header } from './Header';
export { Footer } from './Footer';
export { SEO } from './SEO';
export { ErrorBoundary } from './ErrorBoundary';
```

```tsx
// src/web/shared/hooks/useSEO.ts
import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
}

export const useSEO = ({
  title = 'UIKit FBCA App',
  description = 'Feature-Based Component Architecture with UIKit',
  keywords = 'react, fbca, uikit, components, typescript',
  ogTitle,
  ogDescription,
  ogImage = '/favicon.ico',
  canonical
}: SEOProps) => {
  useEffect(() => {
    // Set document title
    document.title = title;

    // Set meta description
    setMetaTag('description', description);
    setMetaTag('keywords', keywords);

    // Set Open Graph tags
    setMetaTag('og:title', ogTitle || title, 'property');
    setMetaTag('og:description', ogDescription || description, 'property');
    setMetaTag('og:image', ogImage, 'property');

    // Set canonical URL
    if (canonical) {
      setLinkTag('canonical', canonical);
    }
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, canonical]);
};

function setMetaTag(name: string, content: string, attribute: string = 'name') {
  let element = document.querySelector(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setLinkTag(rel: string, href: string) {
  let element = document.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}
```

---

## PAGE COMPONENT PATTERNS

### Pattern 1: Basic Feature Page

```tsx
// features/gallery/pages/index.tsx
import { PageLayout } from '@bloomneo/uikit/page';
import { Card, CardContent, CardHeader, CardTitle } from '@bloomneo/uikit/card';
import { Header, Footer, SEO } from '../../../shared/components';

export default function GalleryPage() {
  return (
    <PageLayout>
      <SEO
        title="Gallery - FBCA App"
        description="Browse our image gallery"
        keywords="gallery, images, photos"
      />
      <Header />

      <PageLayout.Content>
        <h1 className="text-4xl font-bold text-foreground mb-8">Gallery</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Image 1</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Gallery content here</p>
            </CardContent>
          </Card>
        </div>
      </PageLayout.Content>

      <Footer />
    </PageLayout>
  );
}
```

### Pattern 2: Feature Page with Custom Hooks

```tsx
// features/blog/pages/index.tsx
import { PageLayout } from '@bloomneo/uikit/page';
import { Card, CardContent, CardHeader, CardTitle } from '@bloomneo/uikit/card';
import { Motion } from '@bloomneo/uikit/motion';
import { Header, Footer, SEO } from '../../../shared/components';
import { useBlog } from '../hooks/useBlog';

export default function BlogPage() {
  const { posts, loading } = useBlog();

  return (
    <PageLayout>
      <SEO
        title="Blog - FBCA App"
        description="Read our latest blog posts"
        keywords="blog, articles, news"
      />
      <Header />

      <PageLayout.Content>
        <h1 className="text-4xl font-bold text-foreground mb-8">Blog</h1>

        {loading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post, index) => (
              <Motion key={post.id} preset="slideInUp" delay={index * 100}>
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{post.excerpt}</p>
                  </CardContent>
                </Card>
              </Motion>
            ))}
          </div>
        )}
      </PageLayout.Content>

      <Footer />
    </PageLayout>
  );
}
```

```tsx
// features/blog/hooks/useBlog.ts
import { useState, useEffect } from 'react';

interface Post {
  id: string;
  title: string;
  excerpt: string;
}

export const useBlog = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      // Fetch posts from API
      const response = await fetch('/api/posts');
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return { posts, loading, fetchPosts };
};
```

### Pattern 3: Dynamic Route Page

```tsx
// features/blog/pages/[slug].tsx
import { useParams } from 'react-router-dom';
import { PageLayout } from '@bloomneo/uikit/page';
import { Card, CardContent, CardHeader, CardTitle } from '@bloomneo/uikit/card';
import { Header, Footer, SEO } from '../../../shared/components';
import { useBlogPost } from '../hooks/useBlogPost';

export default function BlogPostPage() {
  const { slug } = useParams();
  const { post, loading } = useBlogPost(slug);

  if (loading) {
    return (
      <PageLayout>
        <Header />
        <PageLayout.Content>
          <div className="text-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        </PageLayout.Content>
        <Footer />
      </PageLayout>
    );
  }

  if (!post) {
    return (
      <PageLayout>
        <Header />
        <PageLayout.Content>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground">Post not found</h1>
          </div>
        </PageLayout.Content>
        <Footer />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <SEO
        title={`${post.title} - Blog`}
        description={post.excerpt}
        keywords={post.tags?.join(', ')}
      />
      <Header />

      <PageLayout.Content>
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-3xl text-foreground">{post.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate max-w-none text-foreground">
              {post.content}
            </div>
          </CardContent>
        </Card>
      </PageLayout.Content>

      <Footer />
    </PageLayout>
  );
}
```

---

## LIBRARY USAGE: DO'S AND DON'TS

### ✅ DO - Use Library Components

```tsx
// ✅ CORRECT - Use PageLayout from library
import { PageLayout } from '@bloomneo/uikit/page';

<PageLayout>
  <PageLayout.Header />
  <PageLayout.Content>
    {/* Your content */}
  </PageLayout.Content>
  <PageLayout.Footer />
</PageLayout>

// ✅ CORRECT - Use ValidatedInput for forms
import { ValidatedInput, FormActions } from '@bloomneo/uikit/form';

<ValidatedInput
  type="email"
  required
  label="Email"
  value={email}
  onChange={setEmail}
/>
<FormActions submitText="Submit" loading={isLoading} />

// ✅ CORRECT - Use DataTable for complex data
import { DataTable } from '@bloomneo/uikit/data-table';

<DataTable
  data={users}
  columns={columns}
  searchable
  filterable
  pagination
/>

// ✅ CORRECT - Use Motion for animations
import { Motion, Reveal, Hover } from '@bloomneo/uikit/motion';

<Motion preset="fadeIn">
  <Card />
</Motion>
```

### ❌ DON'T - Create Custom Equivalents

```tsx
// ❌ WRONG - Custom layout when library has one
<div className="flex flex-col min-h-screen">
  <header>...</header>
  <main>...</main>
  <footer>...</footer>
</div>
// Use PageLayout instead!

// ❌ WRONG - Basic input for forms with validation
<input
  type="email"
  required
  onChange={(e) => setEmail(e.target.value)}
/>
// Use ValidatedInput instead!

// ❌ WRONG - Manual table with search/filter/pagination
<table>
  <thead>...</thead>
  <tbody>...</tbody>
</table>
<input placeholder="Search..." />
<button onClick={nextPage}>Next</button>
// Use DataTable instead!

// ❌ WRONG - Custom CSS animations
<div className="animate-pulse">...</div>
<div style={{ animation: 'fadeIn 0.3s' }}>...</div>
// Use Motion/Reveal/Hover instead!
```

---

## SEMANTIC COLOR SYSTEM (CRITICAL)

### ✅ ALWAYS Use Semantic Colors

```tsx
// Background colors
className="bg-background"        // Main page background
className="bg-card"              // Card/panel backgrounds
className="bg-popover"           // Dropdown/modal backgrounds
className="bg-muted"             // Subtle background areas
className="bg-primary"           // Primary buttons/brand elements
className="bg-destructive"       // Error/danger elements

// Text colors
className="text-foreground"      // Primary text
className="text-muted-foreground" // Secondary text
className="text-card-foreground" // Text on card backgrounds
className="text-primary-foreground" // Text on primary backgrounds
className="text-destructive"     // Error text

// Border colors
className="border-border"        // Standard borders
className="border-input"         // Input field borders
className="border-primary"       // Primary colored borders
```

### ❌ NEVER Use Hardcoded Colors

```tsx
// ❌ WRONG - Breaks in dark mode and different themes
className="bg-white text-black"
className="bg-blue-500 text-white"
className="border-gray-200"
className="bg-red-500"
className="text-green-600"
```

---

## FEATURE ISOLATION RULES

### ✅ DO - Keep Features Self-Contained

```
features/blog/
├── pages/              # Blog pages only
├── components/         # Blog-specific components only
│   ├── BlogCard.tsx    # Only used in blog feature
│   └── BlogList.tsx    # Only used in blog feature
├── hooks/              # Blog-specific logic only
│   └── useBlog.ts      # Blog business logic
└── types/              # Blog type definitions only
    └── blog.types.ts
```

### ❌ DON'T - Mix Features

```
// ❌ WRONG - Importing from another feature
import { UserCard } from '../../user/components/UserCard';

// ✅ CORRECT - Move to shared if needed across features
import { UserCard } from '../../../shared/components/UserCard';
```

---

## ADDING NEW FEATURES (STEP-BY-STEP)

### Step 1: Create Feature Structure

```bash
mkdir -p src/web/features/products/pages
mkdir -p src/web/features/products/components
mkdir -p src/web/features/products/hooks
```

### Step 2: Add Feature Pages

```tsx
// features/products/pages/index.tsx - Route: /products
import { PageLayout } from '@bloomneo/uikit/page';
import { Header, Footer, SEO } from '../../../shared/components';

export default function ProductsPage() {
  return (
    <PageLayout>
      <SEO title="Products" description="Browse our products" />
      <Header />
      <PageLayout.Content>
        <h1 className="text-4xl font-bold text-foreground">Products</h1>
      </PageLayout.Content>
      <Footer />
    </PageLayout>
  );
}
```

```tsx
// features/products/pages/[id].tsx - Route: /products/:id
import { useParams } from 'react-router-dom';
import { PageLayout } from '@bloomneo/uikit/page';
import { Header, Footer, SEO } from '../../../shared/components';

export default function ProductDetailPage() {
  const { id } = useParams();

  return (
    <PageLayout>
      <SEO title={`Product ${id}`} />
      <Header />
      <PageLayout.Content>
        <h1 className="text-4xl font-bold text-foreground">Product {id}</h1>
      </PageLayout.Content>
      <Footer />
    </PageLayout>
  );
}
```

### Step 3: Add Feature Components (If Needed)

```tsx
// features/products/components/ProductCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@bloomneo/uikit/card';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
  };
}

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">{product.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">${product.price}</p>
      </CardContent>
    </Card>
  );
};
```

### Step 4: Add Feature Hooks (If Needed)

```tsx
// features/products/hooks/useProducts.ts
import { useState, useEffect } from 'react';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, fetchProducts };
};
```

---

## COMMON LLM MISTAKES TO AVOID

```tsx
// ❌ WRONG - Manual route configuration
import { Route } from 'react-router-dom';
<Route path="/products" element={<Products />} />
// File-based routing handles this automatically!

// ❌ WRONG - Organizing by file type
src/
├── components/
│   ├── BlogCard.tsx
│   └── UserCard.tsx
├── pages/
│   ├── Blog.tsx
│   └── User.tsx
// Use feature-based organization instead!

// ❌ WRONG - Importing features from each other
import { BlogCard } from '../../blog/components/BlogCard';
// Move to shared/ if needed across features!

// ❌ WRONG - Hardcoded colors
<div className="bg-white text-black">
// Use semantic colors: bg-background text-foreground

// ❌ WRONG - Custom layout components
const CustomLayout = () => <div>...</div>
// Use PageLayout/AdminLayout from library!

// ❌ WRONG - Manual form validation
const [errors, setErrors] = useState({});
if (!email.includes('@')) setErrors({ email: 'Invalid' });
// Use ValidatedInput from library!

// ❌ WRONG - Custom data table
<table><tr><td>...</td></tr></table>
const [search, setSearch] = useState('');
const [page, setPage] = useState(1);
// Use DataTable from library!
```

---

## COMPREHENSIVE CHECKLIST FOR LLMs

### Architecture
- [ ] Code organized by features, not file types
- [ ] Each feature has pages/ folder
- [ ] Shared components in shared/ folder
- [ ] Auto-discovery routing via page-router.tsx

### Required Setup
- [ ] ThemeProvider wrapping entire app
- [ ] ErrorBoundary wrapping app
- [ ] React Router with future flags
- [ ] Import '@bloomneo/uikit/styles'

### Routing
- [ ] main/pages/index.tsx for homepage (/)
- [ ] Other features create /feature routes
- [ ] Dynamic routes use [param].tsx naming
- [ ] Catch-all routes use [...param].tsx naming
- [ ] useMemo in PageRouter for optimization

### Library Components
- [ ] Use PageLayout for website pages
- [ ] Use AdminLayout for admin panels
- [ ] Use AuthLayout for login/signup pages
- [ ] Use ValidatedInput for forms
- [ ] Use DataTable for complex tables
- [ ] Use Motion/Reveal/Hover for animations
- [ ] Use LoadingSpinner for loading states
- [ ] Use FormActions for form buttons

### Semantic Colors
- [ ] ALWAYS use bg-background, bg-card, bg-muted
- [ ] ALWAYS use text-foreground, text-muted-foreground
- [ ] ALWAYS use border-border, border-input
- [ ] NEVER use hardcoded colors (bg-white, text-black)

### SEO
- [ ] SEO component on every page
- [ ] Unique title per page
- [ ] Unique description per page
- [ ] Keywords relevant to page content

### Feature Isolation
- [ ] Each feature self-contained
- [ ] No imports from other features
- [ ] Move shared code to shared/

### Performance
- [ ] useMemo for route generation
- [ ] Lazy loading if needed (React.lazy)
- [ ] Optimized images
- [ ] Code splitting per feature (automatic with Vite)

---

**Built with @bloomneo/uikit** ✨
