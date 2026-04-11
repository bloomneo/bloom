# Quick Start: FBCA Template

**Feature-Based Component Architecture with auto-discovery routing - perfect for scalable enterprise applications.**

## 🎯 What is FBCA Template?

FBCA (Feature-Based Component Architecture) organizes code by business features instead of file types. Each feature is self-contained with its own pages, components, and hooks. Routes are automatically discovered from your file structure - no manual route configuration needed.

**Perfect for:**
- Enterprise applications with multiple features
- Large teams working on different features
- Long-term projects that need to scale
- Applications with 10+ distinct feature areas
- Projects requiring feature isolation and modularity

## ⚡ 30-Second Setup

### Step 1: Install UIKit CLI Globally
```bash
npm install -g @bloomneo/uikit
```

### Step 2: Create FBCA Project
```bash
uikit create my-fbca-app --fbca --theme elegant
cd my-fbca-app && npm run dev
```

### Step 3: Project Structure
```
src/
└── web/
    ├── App.tsx                          # Root app with theme provider
    ├── main.tsx                         # Entry point
    ├── index.html                       # HTML template
    ├── lib/
    │   └── page-router.tsx              # Auto-discovery routing engine
    ├── features/
    │   ├── main/
    │   │   ├── pages/
    │   │   │   ├── index.tsx            # Route: / (homepage)
    │   │   │   └── About.tsx            # Route: /about
    │   │   └── components/
    │   │       └── CTASection.tsx       # Feature-specific components
    │   ├── auth/
    │   │   └── pages/
    │   │       └── index.tsx            # Route: /auth (login)
    │   ├── gallery/
    │   │   ├── pages/
    │   │   │   └── index.tsx            # Route: /gallery
    │   │   └── hooks/
    │   │       └── useGallery.ts        # Feature-specific logic
    │   └── docs/
    │       └── pages/
    │           └── [...slug].tsx        # Route: /docs/* (catch-all)
    ├── shared/
    │   ├── components/                  # Reusable across features
    │   │   ├── Header.tsx               # Site header
    │   │   ├── Footer.tsx               # Site footer
    │   │   └── SEO.tsx                  # SEO component
    │   └── hooks/
    │       └── useSEO.ts                # Shared logic
    └── styles/
        └── index.css                    # Global styles
```

## 🧭 How FBCA Works

### Auto-Discovery Routing
**Why:** Zero configuration routing based on file structure
**When:** Want file-system based routing like Next.js
**How:** PageRouter scans features/*/pages/ and creates routes automatically

```jsx
// File structure determines URL routes:
/features/main/pages/index.tsx          → / (homepage)
/features/main/pages/About.tsx          → /about
/features/auth/pages/index.tsx          → /auth
/features/gallery/pages/index.tsx       → /gallery
/features/docs/pages/[...slug].tsx      → /docs/* (catch-all)
```

### App.tsx - Root Configuration
**Why:** Simple root app with theme provider and router
**When:** Global app setup
**How:** Delegates routing to PageRouter

```jsx
function App() {
  return (
    <ThemeProvider theme="base" mode="light" forceConfig={true}>
      <Router>
        <PageRouter />
      </Router>
    </ThemeProvider>
  );
}
```

### PageRouter - Auto-Discovery Engine
**Why:** Automatically discovers and configures routes
**When:** Adding new pages without manual route config
**How:** Uses Vite glob imports to scan feature pages

```jsx
// Auto-discovers all page files
const pageFiles = import.meta.glob('../features/*/pages/**/*.{tsx,jsx}', { eager: true });

// Converts file paths to routes:
// features/main/pages/index.tsx → /
// features/gallery/pages/index.tsx → /gallery
// features/auth/pages/login.tsx → /auth/login
```

## 📁 Feature Structure

### Feature Organization
**Why:** Each feature is completely self-contained
**When:** Building distinct business features
**How:** Organize by feature, not by file type

```jsx
// ✅ FBCA Way - Organize by feature
/features/blog/
  ├── pages/           # Blog pages
  ├── components/      # Blog-specific components
  ├── hooks/           # Blog business logic
  └── types/           # Blog type definitions

// ❌ Traditional Way - Organize by file type
/pages/              # All pages mixed together
/components/         # All components mixed together
/hooks/              # All hooks mixed together
```

### Page Component Example
**Why:** Each page handles its own layout and content
**When:** Creating feature pages
**How:** Use PageLayout with shared Header/Footer

```jsx
// features/gallery/pages/index.tsx
import { PageLayout } from '@bloomneo/uikit/page';
import { Header, Footer, SEO } from '../../../shared/components';
import { useGallery } from '../hooks/useGallery';

export default function GalleryPage() {
  const { images, loading } = useGallery();

  return (
    <PageLayout>
      <SEO
        title="Gallery - UIKit FBCA Demo"
        description="Browse our image gallery built with Feature-Based Component Architecture and UIKit components"
        keywords="gallery, images, fbca, uikit, react"
        ogTitle="Gallery Feature - UIKit FBCA"
        ogDescription="Explore the gallery feature in our FBCA demo application"
      />
      <Header />

      <PageLayout.Content>
        <h1 className="voila-heading text-4xl mb-8">Gallery</h1>
        {loading ? (
          <div>Loading images...</div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {images.map(image => (
              <img key={image.id} src={image.url} alt={image.title} />
            ))}
          </div>
        )}
      </PageLayout.Content>

      <Footer />
    </PageLayout>
  );
}
```

### Shared Components
**Why:** Reusable components across all features
**When:** Common UI elements like headers, footers, SEO
**How:** Place in /shared/components/

```jsx
// shared/components/Header.tsx
export const Header = () => {
  return (
    <PageLayout.Header
      navigation={[
        { key: 'home', label: 'Home', href: '/' },
        { key: 'gallery', label: 'Gallery', href: '/gallery' },
        { key: 'auth', label: 'Login', href: '/auth' },
        { key: 'docs', label: 'Docs', href: '/docs' },
      ]}
      logo={<div className="font-bold">FBCA Demo</div>}
    />
  );
};

// shared/components/SEO.tsx
export const SEO = (props) => {
  useSEO(props);
  return null; // Component doesn't render anything
};
```

### SEO Management
**Why:** Each page needs proper SEO meta tags
**When:** Want search engine optimization and social sharing
**How:** Use SEO component with useSEO hook

```jsx
// shared/hooks/useSEO.ts - Manages document head
export const useSEO = ({
  title = 'UIKit FBCA Demo',
  description = 'Feature-Based Component Architecture with UIKit components',
  keywords = 'react, fbca, uikit, components, typescript',
  ogTitle,
  ogDescription,
  ogImage = '/favicon.ico',
  canonical
}) => {
  useEffect(() => {
    document.title = title;
    // Sets meta description, keywords, Open Graph, Twitter Cards
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, canonical]);
};
```

## 🎯 When to Use FBCA Template

**Perfect for:**
- Enterprise applications with multiple business domains
- Large teams (5+ developers) working on different features
- Long-term projects that need to scale over time
- Applications with distinct feature areas (auth, billing, analytics, etc.)
- Projects requiring feature isolation for testing/deployment

**Key Benefits:**
- **Feature isolation** - Features don't depend on each other
- **Team scalability** - Different teams can work on different features
- **Zero-config routing** - File structure determines URLs
- **Maintainability** - Easy to find and modify feature code
- **Testability** - Test features in complete isolation

**Not ideal for:**
- Simple websites (use SPA template)
- Small teams (use Multi template)
- Quick prototypes (use Single template)
- Applications with heavy feature interdependency

## ⚡ Adding New Features

### Step 1: Create Feature Structure
**Why:** Follow FBCA conventions for consistency
**When:** Adding new business functionality
**How:** Create feature folder with pages, components, hooks

```bash
# Create new feature structure
mkdir -p src/web/features/blog/pages
mkdir -p src/web/features/blog/components
mkdir -p src/web/features/blog/hooks
```

### Step 2: Add Feature Pages
**Why:** Pages automatically become routes
**When:** Need URLs for your feature
**How:** Create .tsx files in pages/ folder

```jsx
// features/blog/pages/index.tsx - Route: /blog
export default function BlogPage() {
  return (
    <PageLayout>
      <Header />
      <PageLayout.Content>
        <h1>Blog Posts</h1>
        {/* Blog list */}
      </PageLayout.Content>
      <Footer />
    </PageLayout>
  );
}

// features/blog/pages/[id].tsx - Route: /blog/:id
export default function BlogPostPage() {
  return (
    <PageLayout>
      <Header />
      <PageLayout.Content>
        <h1>Blog Post</h1>
        {/* Individual blog post */}
      </PageLayout.Content>
      <Footer />
    </PageLayout>
  );
}
```

### Step 3: Add Feature Logic
**Why:** Keep business logic isolated in feature
**When:** Need feature-specific functionality
**How:** Create hooks and components in feature folder

```jsx
// features/blog/hooks/useBlog.ts
export const useBlog = () => {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    // Blog-specific logic
  };

  return { posts, fetchPosts };
};

// features/blog/components/BlogCard.tsx
export const BlogCard = ({ post }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{post.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {post.excerpt}
      </CardContent>
    </Card>
  );
};
```

## 🔧 Advanced Routing

### Dynamic Routes
**Why:** Handle variable URL segments
**When:** Need routes like /blog/post-123
**How:** Use [param].tsx file naming

```jsx
// features/blog/pages/[slug].tsx → /blog/:slug
// features/user/pages/[id]/settings.tsx → /user/:id/settings
```

### Catch-All Routes
**Why:** Handle multiple URL segments
**When:** Need routes like /docs/guide/getting-started
**How:** Use [...param].tsx file naming

```jsx
// features/docs/pages/[...slug].tsx → /docs/*
```

### Nested Routes
**Why:** Organize related pages hierarchically
**When:** Complex feature with sub-sections
**How:** Create nested folder structure

```jsx
// features/admin/pages/users/index.tsx → /admin/users
// features/admin/pages/users/[id].tsx → /admin/users/:id
// features/admin/pages/settings/billing.tsx → /admin/settings/billing
```

---

**Built with @bloomneo/uikit** ✨