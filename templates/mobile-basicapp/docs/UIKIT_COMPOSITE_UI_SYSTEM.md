# UIKit Composite UI System

**Industry-standard design system built on ShadCN foundations, enhanced with rapid prototyping capabilities for enterprise-scale applications.**

## 🏗️ Built on Industry Standards

UIKit is strategically built on **ShadCN components** and **Tailwind CSS v4** - the proven foundation used by thousands of production applications. This isn't reinventing the wheel; it's enhancing what already works.

**Why this foundation matters:**
- **Industry adoption** - ShadCN is the de-facto standard for React component libraries
- **Battle-tested patterns** - Proven in production across enterprises and startups
- **Radix UI primitives** - Accessibility and keyboard navigation built-in
- **Tailwind CSS integration** - The most adopted utility-first CSS framework
- **Community ecosystem** - Extensive documentation, tutorials, and community support

**UIKit's enhancement approach:**
- **Maintains 100% ShadCN compatibility** - Use any ShadCN pattern or tutorial
- **Adds semantic color system** - Automatic theme adaptation without code changes
- **Provides production layouts** - Skip weeks of layout development
- **Enables rapid prototyping** - From idea to interface in minutes

## 🎯 Why Consistent Design Matters

The composite system ensures **design consistency** across your entire application:

**🧩 Components (37 Standard)** → **📐 Section Components (3 Bridging)** → **🏗️ Layouts (5 Production-Ready)**

**Consistency benefits:**
- **Predictable behavior** - Users know how to interact with your interface
- **Faster development** - Developers use familiar patterns everywhere
- **Easier maintenance** - Changes propagate systematically across the system
- **Professional appearance** - Cohesive design that builds user trust
- **Team productivity** - No more "how should this look?" debates

**Rapid prototyping advantage:**
- **Start with components** - Build individual features quickly
- **Compose with sections** - Combine into reusable interface blocks
- **Scale to layouts** - Deploy complete application structures
- **Iterate fast** - Modify any tier without breaking others

---

## 🧩 Tier 1: Components (37 Total)

### Component Categories

| Category            | Count | Components                                                                | Usage                    |
| ------------------- | ----- | ------------------------------------------------------------------------- | ------------------------ |
| **Form & Input**    | 9     | Button, Input, Textarea, Label, Checkbox, RadioGroup, Switch, Slider, Select | User interactions       |
| **Display & Layout** | 10    | Card, Badge, Avatar, Separator, Progress, Skeleton, Alert, Breadcrumb, Tabs, Accordion | Information presentation |
| **Navigation & Menu** | 6     | DropdownMenu, Menubar, Pagination, Command, Collapsible, Toggle        | User navigation          |
| **Overlay & Modal**  | 5     | Dialog, Sheet, Popover, HoverCard, Tooltip                              | Layered interactions     |
| **Data & Table**     | 4     | Table, DataTable, Calendar, Toaster                                     | Data management          |
| **Motion & Animation** | 3     | Motion, LoadingSpinner, Reveal, Hover                                  | Visual effects           |

### Component Usage Patterns

All UIKit components follow consistent prop patterns for predictable behavior:

#### Button Component Example
```jsx
import { Button } from '@voilajsx/uikit/button';

// Variant system - different visual styles
<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="outline">Outline Style</Button>
<Button variant="ghost">Subtle Action</Button>
<Button variant="destructive">Delete Action</Button>

// Size system - consistent sizing across components
<Button size="sm">Small</Button>
<Button size="md">Medium (default)</Button>
<Button size="lg">Large</Button>

// Common props available on most components
<Button
  variant="default"
  size="md"
  disabled={isLoading}
  className="w-full"  // Extend with Tailwind classes
  onClick={handleClick}
>
  Save Changes
</Button>
```

#### Pattern Consistency
```jsx
// Same patterns work across all components
<Input variant="default" size="md" placeholder="Enter text" />
<Card variant="default" size="md">
  <CardContent>Consistent sizing and styling</CardContent>
</Card>
<Badge variant="default" size="sm">Status</Badge>
```

### Import Patterns
```jsx
// ✅ Individual imports (recommended for tree-shaking)
import { Button } from '@voilajsx/uikit/button';
import { Card, CardContent, CardHeader } from '@voilajsx/uikit/card';
import { ValidatedInput } from '@voilajsx/uikit/form';

// ❌ Avoid barrel imports
import { Button, Card } from '@voilajsx/uikit'; // Larger bundle size
```

### Complete Component Reference

| Component | Prop | Possible Values |
|-----------|------|-----------------|
| **Form & Input (9)** | | |
| **Button** | `variant` | `default\|secondary\|outline\|ghost\|destructive` |
| | `size` | `sm\|md\|lg` |
| | `disabled` | `boolean` |
| **Input** | `type` | `text\|email\|password\|number\|search` |
| | `variant` | `default` |
| | `size` | `sm\|md\|lg` |
| **Textarea** | `rows` | `number` |
| | `variant` | `default` |
| | `resize` | `none\|vertical\|horizontal\|both` |
| **Label** | `htmlFor` | `string` |
| **Checkbox** | `checked` | `boolean` |
| | `variant` | `default` |
| **RadioGroup** | `value` | `string` |
| | `orientation` | `horizontal\|vertical` |
| **Switch** | `checked` | `boolean` |
| | `size` | `sm\|md\|lg` |
| **Slider** | `value` | `number[]` |
| | `min` | `number` |
| | `max` | `number` |
| | `step` | `number` |
| **Select** | `value` | `string` |
| | `size` | `sm\|md\|lg` |
| **Display & Layout (10)** | | |
| **Card** | `variant` | `default` |
| | `size` | `sm\|md\|lg\|xl` |
| **Badge** | `variant` | `default\|secondary\|destructive\|outline` |
| | `size` | `sm\|md\|lg` |
| **Avatar** | `size` | `sm\|md\|lg\|xl` |
| | `src` | `string` |
| | `fallback` | `string` |
| **Separator** | `orientation` | `horizontal\|vertical` |
| | `variant` | `default` |
| **Progress** | `value` | `number` |
| | `max` | `number` |
| | `size` | `sm\|md\|lg` |
| **Skeleton** | `variant` | `default\|circular\|text` |
| | `animation` | `pulse\|wave\|none` |
| **Alert** | `variant` | `default\|destructive\|warning\|success` |
| | `size` | `sm\|md\|lg` |
| **Breadcrumb** | `separator` | `string\|component` |
| | `maxItems` | `number` |
| **Tabs** | `value` | `string` |
| | `orientation` | `horizontal\|vertical` |
| **Accordion** | `type` | `single\|multiple` |
| | `collapsible` | `boolean` |
| **Navigation & Menu (6)** | | |
| **DropdownMenu** | `open` | `boolean` |
| | `modal` | `boolean` |
| **Menubar** | `value` | `string` |
| | `orientation` | `horizontal\|vertical` |
| **Pagination** | `page` | `number` |
| | `totalPages` | `number` |
| | `showEdges` | `boolean` |
| **Command** | `value` | `string` |
| | `filter` | `function` |
| **Collapsible** | `open` | `boolean` |
| | `disabled` | `boolean` |
| **Toggle** | `pressed` | `boolean` |
| | `variant` | `default\|outline` |
| | `size` | `sm\|md\|lg` |
| **Overlay & Modal (5)** | | |
| **Dialog** | `open` | `boolean` |
| | `modal` | `boolean` |
| **Sheet** | `open` | `boolean` |
| | `side` | `top\|bottom\|left\|right` |
| **Popover** | `open` | `boolean` |
| | `side` | `top\|bottom\|left\|right` |
| | `align` | `start\|center\|end` |
| **HoverCard** | `openDelay` | `number` |
| | `closeDelay` | `number` |
| **Tooltip** | `side` | `top\|bottom\|left\|right` |
| | `align` | `start\|center\|end` |
| | `delayDuration` | `number` |
| **Data & Table (4)** | | |
| **Table** | `variant` | `default` |
| | `size` | `sm\|md\|lg` |
| **DataTable** | `data` | `array` |
| | `columns` | `array` |
| | `searchable` | `boolean` |
| | `filterable` | `boolean` |
| | `sortable` | `boolean` |
| | `pagination` | `boolean` |
| **Calendar** | `mode` | `single\|multiple\|range` |
| | `selected` | `Date\|Date[]` |
| | `numberOfMonths` | `number` |
| **Toaster** | `position` | `top-left\|top-right\|bottom-left\|bottom-right` |
| | `richColors` | `boolean` |
| **Motion & Animation (3)** | | |
| **Motion** | `preset` | `fadeIn\|slideInUp\|scaleIn\|slideInLeft\|slideInRight` |
| | `duration` | `fast\|normal\|slow` |
| | `delay` | `number` |
| **LoadingSpinner** | `size` | `sm\|md\|lg\|xl` |
| | `variant` | `default\|dots\|pulse\|ring` |
| **Reveal** | `preset` | `fadeIn\|slideInUp\|slideInLeft\|slideInRight` |
| | `threshold` | `number` |

---

## 📐 Tier 2: Section Components (3 Standalone)

Section components are **standalone layout building blocks** that bridge individual components and complete page layouts. They provide reusable interface sections that can be used independently or combined to create custom layouts.

**Why use section components:**
- **Independent sections** - Use without full page layouts
- **Flexible composition** - Mix and match with any layout
- **Consistent styling** - Follow the same prop patterns as all UIKit components
- **Rapid prototyping** - Quickly build custom interface sections

| Component | Prop | Possible Values |
|-----------|------|-----------------|
| **Header** | `tone` | `clean\|subtle\|brand\|contrast` |
| | `size` | `sm\|md\|lg\|xl\|full` |
| | `position` | `sticky\|fixed\|relative` |
| | `navigation` | `NavigationItem[]` |
| | `logo` | `ReactNode` |
| | `actions` | `ReactNode` |
| **Footer** | `tone` | `clean\|subtle\|brand\|contrast` |
| | `size` | `sm\|md\|lg\|xl\|full` |
| | `position` | `sticky\|fixed\|relative` |
| | `navigation` | `NavigationItem[]` |
| | `copyright` | `string` |
| **Container** | `tone` | `clean\|subtle\|brand\|contrast` |
| | `size` | `sm\|md\|lg\|xl\|full` |
| | `sidebar` | `left\|right\|none` |
| | `navigation` | `NavigationItem[]` |
| | `onNavigate` | `function` |

### Section Component Examples

#### Standalone Header
```jsx
import { Header, HeaderLogo, HeaderNav } from '@voilajsx/uikit/header';

<Header tone="clean" size="xl" position="sticky">
  <HeaderLogo>
    <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
  </HeaderLogo>
  <HeaderNav
    navigation={navigation}
    currentPath="/current"
    onNavigate={handleNavigation}
  />
</Header>
```

#### Standalone Footer
```jsx
import { Footer } from '@voilajsx/uikit/footer';

<Footer tone="contrast" size="xl" position="relative">
  <div className="text-center py-4">
    <p className="text-muted-foreground">© 2025 Company</p>
  </div>
</Footer>
```

#### Container with Sidebar
```jsx
import { Container } from '@voilajsx/uikit/container';

<Container
  tone="clean"
  size="xl"
  sidebar="left"
  navigation={sidebarNav}
  onNavigate={handleNavigation}
>
  <MainContent />
</Container>
```

---

## 🏗️ Tier 3: Layouts (5 Production-Ready)

Layouts are **complete page structures** that provide instant application scaffolding. They include built-in responsive design, routing support, and production-ready patterns used by thousands of applications.

**Why use layouts:**
- **Instant scaffolding** - Complete page structure in one component
- **Production-ready** - Battle-tested patterns from real applications
- **Responsive design** - Mobile-first approach with breakpoint handling
- **Routing integration** - Built-in navigation state management
- **Consistent behavior** - Standardized patterns across your application

### Layout Decision Tree

```
What are you building?
├── Admin Dashboard/SaaS App → AdminLayout (compound pattern)
├── Marketing Website → PageLayout (compound pattern)
├── Authentication Pages → AuthLayout (single pattern)
├── Error/Simple Pages → BlankLayout (single pattern)
└── Browser Extensions → PopupLayout (single pattern)
```

### Layout Reference

| Layout | Child Component | Prop | Possible Values |
|--------|----------------|------|-----------------|
| **AdminLayout** | | `scheme` | `sidebar\|compact` |
| | | `tone` | `clean\|subtle\|brand\|contrast` |
| | | `size` | `sm\|md\|lg\|xl\|full` |
| | | `defaultSidebarOpen` | `boolean` |
| | **AdminLayout.Header** | `title` | `string` |
| | | `position` | `sticky\|fixed\|relative` |
| | | `breadcrumbs` | `array` |
| | | `actions` | `ReactNode` |
| | **AdminLayout.Sidebar** | `navigation` | `NavigationItem[]` |
| | | `currentPath` | `string` |
| | | `onNavigate` | `function` |
| | | `logo` | `ReactNode` |
| | | `footer` | `ReactNode` |
| | **AdminLayout.Content** | `className` | `string` |
| **PageLayout** | | `scheme` | `base\|sidebar` |
| | | `tone` | `clean\|subtle\|brand\|contrast` |
| | | `size` | `sm\|md\|lg\|xl\|full` |
| | **PageLayout.Header** | `navigation` | `NavigationItem[]` |
| | | `currentPath` | `string` |
| | | `onNavigate` | `function` |
| | | `logo` | `ReactNode` |
| | | `title` | `string` |
| | | `actions` | `ReactNode` |
| | **PageLayout.Content** | `title` | `string` |
| | | `breadcrumbs` | `array` |
| | | `sidebar` | `none\|left\|right` |
| | | `sidebarContent` | `ReactNode` |
| | **PageLayout.Footer** | `navigation` | `NavigationItem[]` |
| | | `copyright` | `string` |
| **AuthLayout** | | `scheme` | `simple\|card\|split\|hero` |
| | | `tone` | `clean\|subtle\|brand\|contrast` |
| | | `size` | `sm\|md\|lg\|xl\|full` |
| | | `title` | `string` |
| | | `subtitle` | `string` |
| | | `logo` | `ReactNode` |
| | | `imageUrl` | `string` |
| **BlankLayout** | | `scheme` | `simple\|card` |
| | | `tone` | `clean\|subtle\|brand\|contrast` |
| | | `size` | `sm\|md\|lg\|xl\|full` |
| **PopupLayout** | | `scheme` | `modal\|drawer\|floating` |
| | | `tone` | `clean\|subtle\|brand\|contrast` |
| | | `size` | `sm\|md\|lg\|xl\|full` |
| | | `title` | `string` |
| | | `showClose` | `boolean` |
| | | `onClose` | `function` |

### Layout Examples

#### AdminLayout (Compound Pattern)
```jsx
import { AdminLayout } from '@voilajsx/uikit/admin';

// Compound pattern: Use child components
<AdminLayout scheme="sidebar" tone="subtle" size="lg">
  <AdminLayout.Header
    title="Dashboard"
    position="sticky"
    breadcrumbs={breadcrumbs}
    actions={<Button>Export</Button>}
  />
  <AdminLayout.Sidebar
    navigation={navigation}
    currentPath="/admin"
    onNavigate={handleNavigation}
    logo={<Logo />}
  />
  <AdminLayout.Content>
    <DataTable data={users} columns={columns} />
  </AdminLayout.Content>
</AdminLayout>
```

#### PageLayout (Compound Pattern)
```jsx
import { PageLayout } from '@voilajsx/uikit/page';

// Compound pattern: Use child components
<PageLayout scheme="base" tone="clean" size="xl">
  <PageLayout.Header
    logo="MyApp"
    navigation={navigation}
    currentPath="/"
    onNavigate={handleNavigation}
  />
  <PageLayout.Content>
    <h1 className="text-foreground">Welcome</h1>
    <p className="text-muted-foreground">Build amazing apps</p>
  </PageLayout.Content>
  <PageLayout.Footer copyright="© 2025 MyApp" />
</PageLayout>
```

#### AuthLayout (Single Pattern)
```jsx
import { AuthLayout } from '@voilajsx/uikit/auth';

// Single pattern: Direct children
<AuthLayout scheme="card" tone="clean" size="md">
  <ValidatedInput
    type="email"
    required
    label="Email"
    placeholder="Enter your email"
  />
  <ValidatedInput
    type="password"
    required
    label="Password"
    showPasswordToggle
  />
  <Button variant="default" size="md" className="w-full">
    Sign In
  </Button>
</AuthLayout>
```

---

## 🎨 Common Prop Patterns

UIKit follows consistent naming conventions across similar component types:

### Layout Props (AdminLayout, PageLayout, etc.)
```jsx
<Layout
  scheme="sidebar"     // Layout structure
  tone="subtle"        // Visual emphasis
  size="lg"           // Layout dimensions
/>
```

### Component Props (Button, Input, Card, etc.)
```jsx
<Component
  variant="default"    // Visual style (where applicable)
  size="md"           // Component sizing (where applicable)
/>
```

### Size System
| Size   | Layout Width | Sidebar Width | Usage             |
| ------ | ------------ | ------------- | ----------------- |
| `sm`   | 672px        | 192px         | Compact interfaces |
| `md`   | 896px        | 224px         | Standard content  |
| `lg`   | 1152px       | 256px         | Wide content      |
| `xl`   | 1280px       | 288px         | Full-width layouts |
| `full` | 100%         | 320px         | Edge-to-edge      |

### Tone System
| Tone       | Background      | Usage                    |
| ---------- | --------------- | ------------------------ |
| `clean`    | Pure white/light | Minimal, marketing pages |
| `subtle`   | Light gray      | Professional, admin panels |
| `brand`    | Primary color   | Headers, CTAs, emphasis  |
| `contrast` | Dark/bold       | Footers, high contrast   |

---

## 🧭 Navigation System

### Navigation Structure
```typescript
interface NavigationItem {
  key: string;              // REQUIRED: Unique identifier
  label: string;            // REQUIRED: Display text
  href?: string;            // For page navigation
  onClick?: () => void;     // For actions/functions
  icon?: ComponentType;     // Lucide React icon
  badge?: string;          // Notification badge
  isActive?: boolean;      // Current page indicator
  items?: NavigationItem[]; // Submenu (max 2 levels)
}
```

### Navigation Examples
```jsx
const navigation = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    isActive: true,
  },
  {
    key: 'users',
    label: 'Users',
    icon: Users,
    badge: '12',
    items: [
      { key: 'list', label: 'All Users', href: '/admin/users' },
      { key: 'new', label: 'Add User', href: '/admin/users/new' },
    ],
  },
  {
    key: 'logout',
    label: 'Logout',
    icon: LogOut,
    onClick: () => handleLogout(),
  },
];
```

### Navigation Handlers
```jsx
const handleNavigation = (href, item) => {
  if (item.onClick) {
    item.onClick(); // Execute custom function
  } else if (href) {
    navigate(href); // React Router
    // router.push(href); // Next.js
    // window.location.href = href; // Simple navigation
  }
};
```

---

## 🚀 Quick Start Patterns

### 1. Simple Page with Components
```jsx
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';

function SimplePage() {
  return (
    <div className="p-6 bg-background">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Get started with UIKit</p>
          <Button className="mt-4">Continue</Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 2. Complete Admin Interface
```jsx
import { AdminLayout } from '@voilajsx/uikit/admin';
import { DataTable } from '@voilajsx/uikit/data-table';

function AdminDashboard() {
  return (
    <AdminLayout scheme="sidebar" tone="subtle" size="lg">
      <AdminLayout.Header title="Users" />
      <AdminLayout.Sidebar navigation={nav} />
      <AdminLayout.Content>
        <DataTable
          data={users}
          columns={columns}
          searchable
          pagination
        />
      </AdminLayout.Content>
    </AdminLayout>
  );
}
```

### 3. Marketing Site
```jsx
import { PageLayout } from '@voilajsx/uikit/page';

function MarketingSite() {
  return (
    <PageLayout scheme="base" tone="clean" size="xl">
      <PageLayout.Header logo="MyApp" navigation={nav} />
      <PageLayout.Content>
        <div className="text-center py-20">
          <h1 className="text-4xl font-bold text-foreground">
            Build Better Apps
          </h1>
          <p className="text-muted-foreground mt-4">
            With UIKit's composite system
          </p>
        </div>
      </PageLayout.Content>
      <PageLayout.Footer />
    </PageLayout>
  );
}
```

---

## 💡 Best Practices

### ✅ Do This
- **Use semantic colors** for theme compatibility
- **Individual imports** for better tree-shaking
- **Compound patterns** for AdminLayout and PageLayout
- **Single patterns** for AuthLayout, BlankLayout, PopupLayout
- **Consistent props** (scheme, tone, size) across components

### ❌ Avoid This
- **Hardcoded colors** that break in themes
- **Barrel imports** that increase bundle size
- **Wrong layout patterns** (single vs compound)
- **Inconsistent navigation** structure
- **Missing semantic classes**

### Component Selection Guide
```jsx
// Forms with validation → Use Enhanced Components
<ValidatedInput type="email" required />

// Simple forms → Use Basic Components
<Input placeholder="Search..." />

// Complex data → Use DataTable
<DataTable data={users} searchable filterable />

// Simple data → Use Table
<Table>
  <TableBody>
    <TableRow>...</TableRow>
  </TableBody>
</Table>
```

---

## 📚 Related Guides

- **[UIKit Theme Guide](./UIKIT_THEME_GUIDE.md)** - Custom theming and colors
- **[UIKit LLM Guide](./UIKIT_LLM_GUIDE.md)** - Complete implementation reference
- **[GitHub Repository](https://github.com/voilajsx/uikit)** - Source code and examples

---

**Build beautiful, consistent interfaces with UIKit's Composite UI System** ✨