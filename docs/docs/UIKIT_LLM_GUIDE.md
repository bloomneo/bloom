# @voilajsx/uikit - COMPLETE LLM Usage Guide v2.1

## 🎯 QUICK START (30 SECONDS)

### STEP 1: Required Setup (COPY-PASTE EVERY PROJECT)
```jsx
import { ThemeProvider } from '@voilajsx/uikit/theme-provider';
import '@voilajsx/uikit/styles'; // ← CRITICAL: Must import this

function App() {
  return (
    <ThemeProvider theme="base" mode="light">
      {/* Your app goes here */}
    </ThemeProvider>
  );
}
```

### STEP 2: Component Selection (FOLLOW THIS DECISION TREE)
```
What are you building?
├── Dashboard/Admin Panel → AdminLayout
├── Company Website → PageLayout
├── Login/Signup Page → AuthLayout
├── Error/About Page → BlankLayout
└── Chrome Extension/Popup → PopupLayout
```

---

## 🏗️ FBCA PROJECT TEMPLATE (Feature-Based Architecture)

### When to Use FBCA
Use `--fbca` flag when building applications that need:
- **Feature isolation** - Each business feature is self-contained
- **Auto-discovery routing** - Routes generated from file structure
- **Scalable architecture** - Easy to add new features without touching existing code
- **Team collaboration** - Multiple developers can work on different features

### Quick FBCA Setup
```bash
npx uikit create myapp --fbca --theme elegant
cd myapp && npm run dev
```

### FBCA File Structure
```
src/
├── features/
│   ├── auth/                     # Authentication feature
│   │   └── pages/
│   │       ├── login.tsx         # Route: /auth/login
│   │       └── register.tsx      # Route: /auth/register
│   ├── dashboard/                # Dashboard feature
│   │   └── pages/
│   │       ├── index.tsx         # Route: /dashboard
│   │       └── settings.tsx      # Route: /dashboard/settings
│   └── main/                     # Main feature (special case)
│       └── pages/
│           └── index.tsx         # Route: / (homepage)
├── shared/
│   ├── components/               # Reusable UI components
│   └── hooks/                    # Custom React hooks (SEO, etc.)
└── lib/
    └── page-router.tsx           # Auto-discovery routing system
```

### FBCA Routing Conventions
```jsx
// File-based routing patterns:
index.tsx          → /feature (feature root)
[param].tsx        → /feature/:param (dynamic routes)
nested/page.tsx    → /feature/nested/page
main/pages/index.tsx → / (homepage - special case)
```

### FBCA Features Included
- **Auto-discovery routing** with Vite glob imports
- **SEO management** with custom useSEO hook
- **Lazy loading** with React Suspense
- **Feature isolation** with clear boundaries
- **Shared components** for reusable UI
- **TypeScript support** with full type safety

### Example FBCA Usage
```jsx
// src/features/products/pages/[id].tsx
import { useSEO } from '@/shared/hooks/useSEO';
import { ProductCard } from '@/shared/components/ProductCard';

export default function ProductDetailsPage() {
  const { id } = useParams(); // Auto-available from React Router

  useSEO({
    title: `Product ${id}`,
    description: `Details for product ${id}`,
  });

  return (
    <div>
      <h1>Product {id}</h1>
      <ProductCard productId={id} />
    </div>
  );
}
```

---

## 📋 COMPONENT PATTERNS (ONLY 2 TYPES)

### 🏗️ COMPOUND LAYOUTS (Use Child Components)
**AdminLayout & PageLayout ONLY**
```jsx
// ✅ CORRECT - Use child components
<AdminLayout scheme="sidebar" tone="subtle">
  <AdminLayout.Header title="Dashboard" position="sticky" />
  <AdminLayout.Sidebar navigation={nav} />
  <AdminLayout.Content>
    <YourContent />
  </AdminLayout.Content>
</AdminLayout>

// ❌ WRONG - Don't pass direct children
<AdminLayout>
  <YourContent /> {/* This breaks */}
</AdminLayout>
```

### 📄 SINGLE LAYOUTS (Direct Children)
**AuthLayout, BlankLayout, PopupLayout**
```jsx
// ✅ CORRECT - Pass content directly
<AuthLayout scheme="card" tone="clean">
  <LoginForm />
</AuthLayout>

// ❌ WRONG - Don't use child components
<AuthLayout>
  <AuthLayout.Content>Form</AuthLayout.Content> {/* No such thing */}
</AuthLayout>
```

---

## 🎨 PROPS SYSTEM (3 CORE PROPS EVERYWHERE)

### Standard Props (Same for ALL components)
```jsx
<AnyLayout
  scheme="specific-to-component"  // Layout structure
  tone="clean|subtle|brand|contrast"  // Visual emphasis
  size="sm|md|lg|xl|full"        // Component size
>
```

### Scheme Options by Component
```jsx
AdminLayout: scheme = 'sidebar|compact';
PageLayout: scheme = 'base|sidebar';
AuthLayout: scheme = 'simple|card|split|hero';
BlankLayout: scheme = 'simple|card';
PopupLayout: scheme = 'modal|drawer|floating';
```

### Size Configurations (Exact Measurements)
```jsx
size = 'sm'; // Sidebars: 192px, Content: max-w-2xl, Padding: 16px
size = 'md'; // Sidebars: 224px, Content: max-w-4xl, Padding: 20px
size = 'lg'; // Sidebars: 256px, Content: max-w-6xl, Padding: 24px (DEFAULT)
size = 'xl'; // Sidebars: 288px, Content: max-w-7xl, Padding: 28px
size = 'full'; // Sidebars: 320px, Content: max-w-full, Padding: 32px
```

### Tone Visual Guide
```jsx
tone = 'clean'; // Pure white/light backgrounds (websites, auth)
tone = 'subtle'; // Light gray backgrounds (admin panels, professional)
tone = 'brand'; // Primary colored backgrounds (headers, CTAs, emphasis)
tone = 'contrast'; // Dark/bold backgrounds (footers, high contrast areas)
```

---

## 🧩 ALL UI COMPONENTS (37 TOTAL)

### Form & Input Components
```jsx
import { Button } from '@voilajsx/uikit/button';
import { Input } from '@voilajsx/uikit/input';
import { Textarea } from '@voilajsx/uikit/textarea';
import { Label } from '@voilajsx/uikit/label';
import { Checkbox } from '@voilajsx/uikit/checkbox';
import { RadioGroup, RadioGroupItem } from '@voilajsx/uikit/radio-group';
import { Switch } from '@voilajsx/uikit/switch';
import { Slider } from '@voilajsx/uikit/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@voilajsx/uikit/select';

// NEW: Enhanced Form Components (Recommended for 90% of use cases)
import {
  ValidatedInput,
  ValidatedSelect,
  ValidatedCheckbox,
  FormActions,
} from '@voilajsx/uikit/form';

// Advanced React Hook Form Integration (10% of cases)
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@voilajsx/uikit/form';

// Usage Examples
<div className="space-y-4">
  {/* Basic shadcn form components */}
  <Label className="text-foreground">Email</Label>
  <Input placeholder="Enter email" className="bg-background border-border" />
  <Button className="bg-primary text-primary-foreground">Submit</Button>;

  {/* NEW: Validated form components (recommended) */}
  <ValidatedInput
    type="email"
    required
    label="Email Address"
    value={email}
    onChange={setEmail}
    showPasswordStrength // For password type
    showPasswordToggle // For password type
  />

  <ValidatedSelect
    required
    label="Country"
    value={country}
    onChange={setCountry}
    options={[
      { label: 'United States', value: 'us' },
      { label: 'Canada', value: 'ca' },
    ]}
  />

  <ValidatedCheckbox
    required
    label="I agree to terms"
    description="Please read our terms and conditions"
    checked={agreed}
    onChange={setAgreed}
  />

  <FormActions
    submitText="Create Account"
    showCancel
    loading={isLoading}
    onCancel={() => router.back()}
  />
</div>;
```

### Display & Layout Components
```jsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@voilajsx/uikit/card';
import { Badge } from '@voilajsx/uikit/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@voilajsx/uikit/avatar';
import { Separator } from '@voilajsx/uikit/separator';
import { Progress } from '@voilajsx/uikit/progress';
import { Skeleton } from '@voilajsx/uikit/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@voilajsx/uikit/alert';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@voilajsx/uikit/breadcrumb';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@voilajsx/uikit/tabs';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@voilajsx/uikit/accordion';

// Usage
<Card className="bg-card border-border">
  <CardHeader>
    <CardTitle className="text-foreground">Title</CardTitle>
  </CardHeader>
  <CardContent className="text-muted-foreground">Content here</CardContent>
</Card>;
```

### Navigation & Menu Components
```jsx
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@voilajsx/uikit/dropdown-menu';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
} from '@voilajsx/uikit/menubar';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@voilajsx/uikit/pagination';
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
} from '@voilajsx/uikit/command';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@voilajsx/uikit/collapsible';
import { Toggle } from '@voilajsx/uikit/toggle';

// Usage
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button className="bg-background border-border">Open</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent className="bg-popover border-border">
    <DropdownMenuItem className="text-foreground">Item 1</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>;
```

### Overlay & Modal Components
```jsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@voilajsx/uikit/dialog';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@voilajsx/uikit/sheet';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@voilajsx/uikit/popover';
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '@voilajsx/uikit/hover-card';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '@voilajsx/uikit/tooltip';

// Usage
<Dialog>
  <DialogTrigger asChild>
    <Button className="bg-primary text-primary-foreground">Open Dialog</Button>
  </DialogTrigger>
  <DialogContent className="bg-background border-border">
    <DialogHeader>
      <DialogTitle className="text-foreground">Dialog Title</DialogTitle>
    </DialogHeader>
    <p className="text-muted-foreground">Dialog content</p>
  </DialogContent>
</Dialog>;
```

### Data & Table Components
```jsx
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@voilajsx/uikit/table';
import { DataTable } from '@voilajsx/uikit/data-table';
import { Calendar } from '@voilajsx/uikit/calendar';
import { Toaster } from '@voilajsx/uikit/sonner';

// Basic Table Usage
<Table className="bg-background">
  <TableHeader>
    <TableRow className="border-border">
      <TableHead className="text-foreground">Name</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="border-border">
      <TableCell className="text-foreground">John</TableCell>
    </TableRow>
  </TableBody>
</Table>;

// Enhanced DataTable Usage
<DataTable
  data={users}
  columns={[
    {
      id: 'name',
      header: 'Name',
      accessorKey: 'name',
      sortable: true,
      filterable: true,
    },
    {
      id: 'email',
      header: 'Email',
      accessorKey: 'email',
      sortable: true,
      filterable: true,
      filterType: 'text',
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: (value) => <Badge>{value}</Badge>,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
    },
  ]}
  searchable
  filterable
  sortable
  pagination
  selectable
  actions={[
    {
      id: 'edit',
      label: 'Edit',
      icon: Edit,
      onClick: (row) => editUser(row),
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      onClick: (row) => deleteUser(row),
      variant: 'destructive',
    },
  ]}
/>;
```

### NEW: Motion & Animation Components
```jsx
import {
  Motion,
  LoadingSpinner,
  Reveal,
  Hover,
} from '@voilajsx/uikit/motion';

// Simple CSS-based animations
<Motion preset="fadeIn" duration="normal">
  <Card>Fades in immediately</Card>
</Motion>

<Motion preset="slideInUp" duration="slow" delay={200}>
  <div>Slides up after 200ms delay</div>
</Motion>

<Motion preset="scaleIn" trigger="hover">
  <Button>Scales on hover</Button>
</Motion>

// Scroll-triggered animations
<Reveal preset="slideInUp" duration="normal">
  <div>Animates when scrolled into view</div>
</Reveal>

// Hover effects
<Hover effect="scale">
  <Card>Scales on hover</Card>
</Hover>

<Hover effect="lift">
  <Button>Lifts on hover with shadow</Button>
</Hover>

// Loading spinner
<LoadingSpinner size="md" />
```

---

## 🧭 NAVIGATION SYSTEM (COMPLETE GUIDE)

### Basic Navigation Structure
```jsx
const navigation = [
  {
    key: 'unique-id', // REQUIRED: Unique identifier
    label: 'Display Text', // REQUIRED: What users see
    href: '/path', // For page navigation
    onClick: () => {}, // For actions/functions
    icon: HomeIcon, // Lucide React icon (optional)
    badge: 'New', // Notification badge (optional)
    isActive: true, // Current page indicator (optional)
    className: 'custom-css', // Additional styling (optional)
  },
];
```

### Advanced Navigation with Submenus
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
    key: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    badge: '5',
    items: [
      // Submenu items (max 2 levels)
      {
        key: 'overview',
        label: 'Overview',
        href: '/admin/analytics/overview',
      },
      {
        key: 'reports',
        label: 'Reports',
        href: '/admin/analytics/reports',
        badge: 'New',
      },
    ],
  },
];
```

### Navigation Handler Function
```jsx
const handleNavigation = (href, item) => {
  if (item.onClick) {
    item.onClick(); // Execute custom function
  } else if (href) {
    // Handle routing based on your app
    window.location.href = href; // Simple navigation
    // navigate(href); // React Router
    // router.push(href); // Next.js
  }
};
```

---

## 📍 BREADCRUMBS SYSTEM

### AdminLayout.Header Breadcrumbs
```jsx
<AdminLayout.Header
  title="User Management"
  position="sticky"
  breadcrumbs={[
    { label: 'Admin', href: '/admin' },
    { label: 'Users', href: '/admin/users' },
    { label: 'John Doe' }, // Current page - no href
  ]}
  actions={<Button>Edit User</Button>}
/>
```

### PageLayout.Content Breadcrumbs
```jsx
<PageLayout.Content
  title="User Profile"
  breadcrumbs={[
    { label: 'Home', href: '/' },
    { label: 'Users', href: '/users' },
    { label: 'John Doe' }, // Current page - no href
  ]}
  onNavigate={(href, item) => navigate(href)}
>
  <UserProfileContent />
</PageLayout.Content>
```

### Breadcrumb Structure
```jsx
const breadcrumbs = [
  {
    label: 'Home', // REQUIRED: Display text
    href: '/', // OPTIONAL: Link (omit for current page)
  },
  {
    label: 'Products',
    href: '/products',
  },
  {
    label: 'iPhone 15', // Current page - no href
  },
];
```

---

## 🎨 COLOR SYSTEM (COMPLETE REFERENCE)

### ✅ Semantic Color Classes (ALWAYS USE)
```jsx
// Background Colors
className = 'bg-background'; // Main page background
className = 'bg-card'; // Card/panel backgrounds
className = 'bg-popover'; // Dropdown/modal backgrounds
className = 'bg-muted'; // Subtle background areas
className = 'bg-primary'; // Primary buttons/brand elements
className = 'bg-secondary'; // Secondary buttons/elements
className = 'bg-destructive'; // Error/danger elements

// Text Colors
className = 'text-foreground'; // Primary text
className = 'text-muted-foreground'; // Secondary/subtle text
className = 'text-card-foreground'; // Text on card backgrounds
className = 'text-primary-foreground'; // Text on primary elements
className = 'text-secondary-foreground'; // Text on secondary elements
className = 'text-destructive'; // Error text

// Border Colors
className = 'border-border'; // Standard borders
className = 'border-input'; // Input field borders
className = 'border-primary'; // Primary colored borders
```

### Semantic Colors and Themes
Semantic color classes (e.g., `bg-primary`, `text-foreground`) adapt to the selected theme:
- `base`: Metallic black gradients for `bg-primary`
- `vivid`: Luxurious purple with slight orange for `bg-primary`
- `metro`: Nice green gradients for `bg-primary`
- `elegant`: Professional blue gradients for `bg-primary`
- `studio`: Black with orange accents for `bg-primary`

### ❌ Hardcoded Colors (NEVER USE)
```jsx
// These break in dark mode and don't match themes
className = 'bg-white text-black';
className = 'bg-blue-500 text-white';
className = 'border-gray-200';
className = 'bg-red-500';
className = 'text-green-600';
```

---

## 🎯 ENHANCED THEME SYSTEM (ZERO-TOUCH MAGIC)

### 🪄 Automatic Enhancement Features
The power of `@voilajsx/uikit` is that standard shadcn components automatically become beautiful without changing your code:
```jsx
// ✨ This standard code:
<Button className="bg-primary text-primary-foreground">Click Me</Button>

// 🎨 Automatically becomes (based on theme):
// base: Metallic black gradient, System UI fonts, professional styling
// vivid: Luxurious purple and slight orange gradient, Inter font, enhanced shadows
// metro: Nice green gradient, clean typography, sharp edges
// elegant: Professional blue gradient, luxury spacing, elegant shadows
// studio: Black and orange gradient, artistic fonts, bold styling
```

What happens automatically:
- **Gradients**: `bg-primary` becomes theme-specific gradients
- **Typography**: Custom fonts per theme (e.g., Inter, System UI)
- **Spacing**: Theme-specific padding and margins
- **Shadows**: Theme-appropriate shadow effects
- **Borders**: Theme-adjusted rounded corners

### Theme Migration Note
Previous versions of `@voilajsx/uikit` used themes named `aurora`, `default`, `ruby`, and `neon`. These have been replaced:
- `aurora` → `vivid` (luxurious purple with slight orange)
- `default` → `base` (metallic black)
- `ruby` → `elegant` (professional blue)
- `neon` → `studio` (black and orange)
- `metro` remains `metro` (nice green)
Update your code to use the new theme names to ensure compatibility.

### Level 1: Global Theme (Set Once in ThemeProvider)
```jsx
<ThemeProvider theme="base" mode="dark">
  {/* Affects ALL components globally with enhanced design tokens */}
</ThemeProvider>

// Available Themes with Enhanced Design Tokens:
theme = 'base';    // Metallic black with System UI fonts
theme = 'vivid';   // Luxurious purple and slight orange with Inter fonts
theme = 'metro';   // Nice green with clean typography
theme = 'elegant'; // Professional blue with enhanced spacing
theme = 'studio';  // Black and orange with artistic fonts

// Available Modes:
mode = 'light'; // Light color scheme
mode = 'dark';  // Dark color scheme with enhanced contrast
```

### 🎨 Theme Switching (Dynamic Changes)
```jsx
import { useTheme } from '@voilajsx/uikit';

function ThemeControls() {
  const { theme, setTheme, mode, setMode } = useTheme();
  
  return (
    <div className="flex gap-2">
      <Button onClick={() => setTheme('vivid')}>
        Vivid Theme
      </Button>
      <Button onClick={() => setTheme('metro')}>
        Metro Theme
      </Button>
      <Button onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}>
        Toggle {mode === 'light' ? 'Dark' : 'Light'} Mode
      </Button>
    </div>
  );
}
```

### 🚀 Theme Generation & Bundling CLI

#### Generate Custom Themes (Recommended)
Create complete custom themes automatically:
```bash
# Generate new custom theme with complete color system
npx uikit generate theme brand

# What this creates:
# - Theme file with 29 semantic colors (light + dark modes)
# - Auto-detects project structure (SPA/Multi/FBCA)
# - Updates main.tsx with theme and imports
# - Ready for bundling and use
```

#### Bundle Themes to CSS
Generate optimized CSS for custom themes:
```bash
# Bundle themes from your project directory
npx uikit bundle

# Watch mode for development
npx uikit bundle --watch

# Custom output location
npx uikit bundle --output=src/styles/themes.css
```

#### Project Structure Support
**SPA/Multi projects:**
- Themes: `src/themes/presets/`
- CSS output: `src/styles/globals.css`

**FBCA projects:**
- Themes: `src/web/themes/presets/`
- CSS output: `src/web/styles/globals.css`

**Legacy directories also supported:**
- `src/web/assets/themes/presets/`
- `themes/presets/`

The default presets include `base`, `vivid`, `metro`, `elegant`, and `studio`.

### Level 2: Component Tone (Per Component)
```jsx
<AdminLayout tone="subtle">      // Professional gray backgrounds
<Header tone="brand">            // Primary colored backgrounds
<Footer tone="contrast">         // High contrast/dark backgrounds
<AuthLayout tone="clean">        // Pure white/clean backgrounds

// Tone Meanings:
tone="clean"     // Pure, minimal, white/light backgrounds
tone="subtle"    // Muted, professional, gray backgrounds
tone="brand"     // Primary colored, branded elements
tone="contrast"  // High emphasis, dark/bold backgrounds
```

---

## 🚀 COMPLETE USAGE EXAMPLES

### 1. Enhanced Login Form (NEW Form Components)
```jsx
import { AuthLayout } from '@voilajsx/uikit/auth';
import {
  ValidatedInput,
  ValidatedCheckbox,
  FormActions,
} from '@voilajsx/uikit/form';
import { ThemeProvider } from '@voilajsx/uikit/theme-provider';
import { useState } from 'react';
import '@voilajsx/uikit/styles';

function EnhancedLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log('Login attempt:', formData);
    setIsLoading(false);
  };

  return (
    <ThemeProvider theme="base" mode="light">
      <AuthLayout
        scheme="card"
        tone="clean"
        size="md"
        title="Welcome back"
        subtitle="Sign in to your account to continue"
        logo={
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-foreground">
              L
            </span>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <ValidatedInput
            type="email"
            required
            label="Email address"
            placeholder="name@example.com"
            value={formData.email}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, email: value }))
            }
          />
          <ValidatedInput
            type="password"
            required
            minLength={8}
            label="Password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, password: value }))
            }
            showPasswordStrength
            showPasswordToggle
          />
          <ValidatedCheckbox
            label="Remember me for 30 days"
            description="Keep me signed in on this device"
            checked={formData.remember}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, remember: value }))
            }
          />
          <FormActions
            submitText="Sign in"
            showCancel={false}
            loading={isLoading}
            disabled={!formData.email || !formData.password}
          />
        </form>
      </AuthLayout>
    </ThemeProvider>
  );
}
```

### 2. Interactive Dashboard with Motion (NEW Motion Components)
```jsx
import { AdminLayout } from '@voilajsx/uikit/admin';
import { Card, CardHeader, CardTitle, CardContent } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';
import { Badge } from '@voilajsx/uikit/badge';
import { Motion, Reveal, Hover, LoadingSpinner } from '@voilajsx/uikit/motion';
import { ThemeProvider } from '@voilajsx/uikit/theme-provider';
import { Home, Users, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import '@voilajsx/uikit/styles';

const navigation = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    href: '/admin',
    icon: Home,
    isActive: true,
  },
  {
    key: 'users',
    label: 'Users',
    href: '/admin/users',
    icon: Users,
    badge: '12',
  },
  {
    key: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    items: [
      { key: 'overview', label: 'Overview', href: '/admin/analytics' },
      { key: 'reports', label: 'Reports', href: '/admin/analytics/reports' },
    ],
  },
];

function AnimatedDashboard() {
  const [loading, setLoading] = useState(false);

  const stats = [
    { title: 'Total Users', value: '1,234', change: '+12%', delay: 0 },
    { title: 'Revenue', value: '$45,678', change: '+8%', delay: 100 },
    { title: 'Orders', value: '892', change: '+15%', delay: 200 },
    { title: 'Conversion', value: '3.2%', change: '+2%', delay: 300 },
  ];

  return (
    <ThemeProvider theme="base" mode="light">
      <AdminLayout scheme="sidebar" tone="subtle" size="lg">
        <AdminLayout.Header
          title="Dashboard"
          position="sticky"
          actions={
            <Hover effect="scale">
              <Button
                className="bg-primary text-primary-foreground"
                onClick={() => setLoading(!loading)}
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Refresh Data'}
              </Button>
            </Hover>
          }
        />
        <AdminLayout.Sidebar
          navigation={navigation}
          currentPath="/admin"
          onNavigate={(href) => (window.location.href = href)}
          logo={
            <Motion preset="scaleIn" duration="normal">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg"></div>
                <span className="text-xl font-bold text-foreground">Admin</span>
              </div>
            </Motion>
          }
        />
        <AdminLayout.Content>
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <Motion
                  key={stat.title}
                  preset="slideInUp"
                  duration="normal"
                  delay={stat.delay}
                >
                  <Hover effect="lift">
                    <Card className="bg-card text-card-foreground border-border">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">
                          {stat.title}
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                          {stat.value}
                        </div>
                        <Badge className="mt-1 bg-green-100 text-green-800">
                          {stat.change} from last month
                        </Badge>
                      </CardContent>
                    </Card>
                  </Hover>
                </Motion>
              ))}
            </div>
            <Reveal preset="fadeIn" duration="slow">
              <Card className="bg-card text-card-foreground border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((item, index) => (
                      <Motion
                        key={item}
                        preset="slideInUp"
                        duration="fast"
                        delay={index * 100}
                      >
                        <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm text-foreground">
                              Activity {item}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              2 minutes ago
                            </p>
                          </div>
                        </div>
                      </Motion>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </AdminLayout.Content>
      </AdminLayout>
    </ThemeProvider>
  );
}
```

### 3. Advanced Data Table with Full Features (NEW DataTable)
```jsx
import { PageLayout } from '@voilajsx/uikit/page';
import { DataTable } from '@voilajsx/uikit/data-table';
import { Badge } from '@voilajsx/uikit/badge';
import { Button } from '@voilajsx/uikit/button';
import { Avatar, AvatarImage, AvatarFallback } from '@voilajsx/uikit/avatar';
import { ThemeProvider } from '@voilajsx/uikit/theme-provider';
import { Edit, Trash2, Eye, Download } from 'lucide-react';
import { useState } from 'react';
import '@voilajsx/uikit/styles';

function UserManagementPage() {
  const [users] = useState([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Admin',
      status: 'active',
      lastLogin: '2025-09-11',
      avatar: 'https://avatar.vercel.sh/john',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'User',
      status: 'inactive',
      lastLogin: '2025-09-10',
      avatar: 'https://avatar.vercel.sh/jane',
    },
  ]);

  const columns = [
    {
      id: 'user',
      header: 'User',
      accessorKey: 'name',
      sortable: true,
      filterable: true,
      cell: (value, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.avatar} alt={row.name} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {row.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-foreground">{row.name}</div>
            <div className="text-sm text-muted-foreground">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      id: 'role',
      header: 'Role',
      accessorKey: 'role',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Admin', value: 'Admin' },
        { label: 'User', value: 'User' },
        { label: 'Manager', value: 'Manager' },
      ],
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
      cell: (value) => (
        <Badge
          className={
            value === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      id: 'lastLogin',
      header: 'Last Login',
      accessorKey: 'lastLogin',
      sortable: true,
      filterable: true,
      filterType: 'date',
      dataType: 'date',
    },
  ];

  const actions = [
    {
      id: 'view',
      label: 'View Profile',
      icon: Eye,
      onClick: (user) => console.log('View user:', user.name),
    },
    {
      id: 'edit',
      label: 'Edit User',
      icon: Edit,
      onClick: (user) => console.log('Edit user:', user.name),
    },
    {
      id: 'delete',
      label: 'Delete User',
      icon: Trash2,
      variant: 'destructive',
      onClick: (user) => console.log('Delete user:', user.name),
      visible: (user) => user.role !== 'Admin',
    },
  ];

  const bulkActions = [
    {
      id: 'export',
      label: 'Export Selected',
      icon: Download,
      onClick: (selectedUsers) => console.log('Export:', selectedUsers),
    },
    {
      id: 'deactivate',
      label: 'Deactivate Selected',
      variant: 'destructive',
      onClick: (selectedUsers) => console.log('Deactivate:', selectedUsers),
    },
  ];

  return (
    <ThemeProvider theme="base" mode="light">
      <PageLayout scheme="base" tone="clean" size="xl">
        <PageLayout.Header
          title="User Management"
          navigation={[
            { key: 'dashboard', label: 'Dashboard', href: '/' },
            { key: 'users', label: 'Users', href: '/users', isActive: true },
            { key: 'settings', label: 'Settings', href: '/settings' },
          ]}
        />
        <PageLayout.Content>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Users</h1>
                <p className="text-muted-foreground">
                  Manage your team members and their permissions
                </p>
              </div>
              <Button className="bg-primary text-primary-foreground">
                Add User
              </Button>
            </div>
            <DataTable
              data={users}
              columns={columns}
              searchable
              searchPlaceholder="Search users..."
              filterable
              sortable
              selectable
              pagination
              pageSize={10}
              actions={actions}
              bulkActions={bulkActions}
              exportable
              exportFormats={['csv', 'json', 'excel']}
              onExport={(format, data) => {
                console.log(`Exporting ${data.length} users as ${format}`);
              }}
              emptyState={
                <div className="text-center py-12">
                  <div className="text-muted-foreground mb-4">
                    No users found
                  </div>
                  <Button>Add your first user</Button>
                </div>
              }
              className="border border-border rounded-lg"
            />
          </div>
        </PageLayout.Content>
        <PageLayout.Footer
          copyright="© 2025 User Management System. All rights reserved."
        />
      </PageLayout>
    </ThemeProvider>
  );
}
```

---

## 🔧 NEW COMPONENTS INTEGRATION PATTERNS

### Form Component Integration
```jsx
// ✅ RECOMMENDED: Use ValidatedInput for forms with validation needs
const [formData, setFormData] = useState({ email: '', password: '' });

<ValidatedInput
  type="email"
  required
  label="Email"
  value={formData.email}
  onChange={(value) => setFormData((prev) => ({ ...prev, email: value }))}
/>;

// ✅ ADVANCED: Use React Hook Form for complex forms
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormControl } from '@voilajsx/uikit/form';

const form = useForm();

<Form {...form}>
  <FormField
    control={form.control}
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormControl>
          <ValidatedInput {...field} type="email" required label="Email" />
        </FormControl>
      </FormItem>
    )}
  />
</Form>;
```

### Motion Component Integration
```jsx
// ✅ Page transitions
<Motion preset="fadeIn" duration="normal">
  <PageContent />
</Motion>;

// ✅ List item animations
{items.map((item, index) => (
  <Motion key={item.id} preset="slideInUp" delay={index * 100}>
    <ListItem item={item} />
  </Motion>
))}

// ✅ Interactive elements
<Hover effect="scale">
  <Card>Interactive card</Card>
</Hover>;

// ✅ Loading states
{loading && <LoadingSpinner size="lg" />}
```

### DataTable Integration
```jsx
// ✅ Basic usage with minimal props
<DataTable
  data={users}
  columns={basicColumns}
  searchable
  pagination
/>

// ✅ Advanced usage with all features
<DataTable
  data={users}
  columns={advancedColumns}
  searchable
  filterable
  sortable
  selectable
  pagination
  actions={rowActions}
  bulkActions={bulkActions}
  exportable
  onExport={handleExport}
/>
```

---

## 🏗️ SECTION COMPONENTS (Advanced Usage)

### Header Component (Standalone)
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
</Header>;
```

### Footer Component (Standalone)
```jsx
import { Footer } from '@voilajsx/uikit/footer';

<Footer tone="contrast" size="xl" position="relative">
  <div className="text-center py-4">
    <p className="text-sm text-muted-foreground">© 2025 Company</p>
  </div>
</Footer>;
```

### Container Component (Content with Sidebar)
```jsx
import { Container } from '@voilajsx/uikit/container';

<Container
  tone="clean"
  size="xl"
  sidebar="left"
  navigation={sidebarNav}
  currentPath="/current"
  onNavigate={handleNavigation}
>
  <MainContent />
</Container>;
```

---

## 📐 COMPOUND COMPONENT PROPS (DETAILED)

### AdminLayout Props
```jsx
// AdminLayout Root
<AdminLayout
  scheme="sidebar|compact"              // Layout structure (base: 'sidebar')
  tone="clean|subtle|brand|contrast"    // Visual emphasis (base: 'subtle')
  size="sm|md|lg|xl|full"              // Layout size (base: 'lg')
  baseSidebarOpen={true}                // Initial sidebar state (base: true)
  position="relative|sticky|fixed"      // Positioning behavior (base: 'relative')
>

// AdminLayout.Header
<AdminLayout.Header
  title="Dashboard"                    // Page title (optional)
  position="sticky|fixed|relative"     // Header positioning (base: 'sticky')
  breadcrumbs={[                      // Breadcrumb navigation (optional)
    { label: 'Admin', href: '/admin' },
    { label: 'Dashboard' }
  ]}
  actions={<Button>Action</Button>}    // Header actions (optional)
/>

// AdminLayout.Sidebar
<AdminLayout.Sidebar
  navigation={navigationItems}         // Navigation items (optional)
  currentPath="/admin"                // Current path for active states (optional)
  onNavigate={handleNavigation}       // Navigation handler (optional)
  logo={<Logo />}                     // Logo component (optional)
  footer={<SidebarFooter />}          // Footer content (optional)
  position="relative|sticky|fixed"    // Sidebar positioning (optional)
/>

// AdminLayout.Content
<AdminLayout.Content>
  {/* Your admin content here */}
</AdminLayout.Content>
```

### PageLayout Props
```jsx
// PageLayout Root
<PageLayout
  scheme="base|sidebar"                // Layout structure (base: 'base')
  tone="clean|subtle|brand|contrast"   // Visual emphasis (base: 'clean')
  size="sm|md|lg|xl|full"             // Layout size (base: 'xl')
>

// PageLayout.Header
<PageLayout.Header
  navigation={navigationItems}         // Navigation items (optional)
  currentPath="/"                     // Current path for active states (optional)
  onNavigate={handleNavigation}       // Navigation handler (optional)
  logo={<Logo />}                     // Logo component (optional)
  title="My Site"                     // Site title if no logo (optional)
  actions={<HeaderActions />}         // Header actions (optional)
  position="sticky|fixed|relative"    // Header positioning (base: 'sticky')
/>

// PageLayout.Content
<PageLayout.Content
  title="Page Title"                  // Page title above content (optional)
  breadcrumbs={[                     // Page breadcrumbs (optional)
    { label: "Home", href: "/" },
    { label: "About" }
  ]}
  sidebar="none|left|right"          // Sidebar position (base: 'none')
  navigation={sidebarNav}            // Sidebar navigation (optional)
  sidebarContent={<CustomSidebar />} // Custom sidebar content (optional)
  onNavigate={handleNavigation}      // Navigation handler (optional)
  sidebarPosition="sticky|fixed|relative" // Sidebar positioning (optional)
>
  {/* Your page content here */}
</PageLayout.Content>

// PageLayout.Footer
<PageLayout.Footer
  navigation={footerNav}             // Footer navigation (optional)
  copyright="© 2025 Company"         // Copyright text (optional)
  position="sticky|fixed|relative"   // Footer positioning (base: 'relative')
>
  {/* Custom footer content (optional) */}
</PageLayout.Footer>
```

---

## 🔧 INTEGRATION EXAMPLES

### React Router Integration
```jsx
import { useNavigate, useLocation } from 'react-router-dom';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (href, item) => {
    if (item.onClick) {
      item.onClick();
    } else if (href) {
      navigate(href);
    }
  };

  return (
    <AdminLayout>
      <AdminLayout.Sidebar
        navigation={navigation}
        currentPath={location.pathname}
        onNavigate={handleNavigation}
      />
    </AdminLayout>
  );
}
```

### Next.js Integration
```jsx
import { useRouter } from 'next/router';

function App() {
  const router = useRouter();

  const handleNavigation = (href, item) => {
    if (item.onClick) {
      item.onClick();
    } else if (href) {
      router.push(href);
    }
  };

  return (
    <PageLayout>
      <PageLayout.Header
        navigation={navigation}
        currentPath={router.pathname}
        onNavigate={handleNavigation}
      />
    </PageLayout>
  );
}
```

### State Management Integration
```jsx
import { useStore } from '@/store';

function Dashboard() {
  const { user, notifications, updateUser } = useStore();

  const navigation = [
    {
      key: 'notifications',
      label: 'Notifications',
      href: '/notifications',
      badge: notifications.length.toString(),
    },
  ];

  return (
    <AdminLayout>
      <AdminLayout.Header
        title={`Welcome, ${user.name}`}
        actions={
          <Button onClick={() => updateUser({ lastSeen: new Date() })}>
            Update Profile
          </Button>
        }
      />
      <AdminLayout.Sidebar navigation={navigation} />
    </AdminLayout>
  );
}
```

---

## 🆕 NEW COMPONENTS DEEP DIVE

### ValidatedInput Advanced Features
```jsx
// Email validation with custom pattern
<ValidatedInput
  type="email"
  required
  label="Business Email"
  placeholder="you@company.com"
  pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
  value={email}
  onChange={setEmail}
/>

// Password with strength meter
<ValidatedInput
  type="password"
  required
  minLength={12}
  label="Secure Password"
  placeholder="Create a strong password"
  value={password}
  onChange={setPassword}
  showPasswordStrength
  showPasswordToggle
/>

// Phone number with pattern validation
<ValidatedInput
  type="tel"
  required
  label="Phone Number"
  placeholder="+1 (555) 123-4567"
  pattern="^\+?[1-9]\d{1,14}$"
  value={phone}
  onChange={setPhone}
/>
```

### DataTable Advanced Configuration
```jsx
// The `virtualized` prop enables virtualization for large datasets, improving performance by rendering only visible rows. Requires a fixed `height` prop.
const advancedColumns = [
  {
    id: 'user',
    header: 'User Information',
    accessor: (row) => `${row.firstName} ${row.lastName}`,
    sortable: true,
    filterable: true,
    cell: (value, row) => (
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={row.avatar} />
          <AvatarFallback>{row.initials}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-muted-foreground">{row.email}</div>
          <div className="text-xs text-muted-foreground">{row.department}</div>
        </div>
      </div>
    ),
    width: 300,
    pinned: 'left',
  },
  {
    id: 'performance',
    header: 'Performance Score',
    accessorKey: 'performanceScore',
    sortable: true,
    filterable: true,
    filterType: 'number',
    dataType: 'number',
    cell: (value) => (
      <div className="flex items-center gap-2">
        <div className="w-16 bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${value}%` }}
          />
        </div>
        <span className="text-sm font-medium">{value}%</span>
      </div>
    ),
  },
  {
    id: 'actions',
    header: 'Quick Actions',
    cell: (value, row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="outline">
          Edit
        </Button>
        <Button size="sm" variant="outline">
          Message
        </Button>
      </div>
    ),
    width: 150,
  },
];

<DataTable
  data={employees}
  columns={advancedColumns}
  searchable
  searchPlaceholder="Search employees..."
  filterable
  sortable
  selectable
  selectionMode="multiple"
  pagination
  pageSize={25}
  height="600px"
  virtualized
  density="comfortable"
  striped
  hoverable
  actions={[
    {
      id: 'profile',
      label: 'View Profile',
      icon: User,
      onClick: (employee) => viewProfile(employee.id),
    },
    {
      id: 'edit',
      label: 'Edit Employee',
      icon: Edit,
      onClick: (employee) => editEmployee(employee.id),
    },
    {
      id: 'deactivate',
      label: 'Deactivate',
      icon: UserX,
      variant: 'destructive',
      onClick: (employee) => deactivateEmployee(employee.id),
      visible: (employee) => employee.status === 'active',
    },
  ]}
  bulkActions={[
    {
      id: 'export',
      label: 'Export Selected',
      icon: Download,
      onClick: (selected) => exportEmployees(selected),
    },
    {
      id: 'bulk-edit',
      label: 'Bulk Edit',
      icon: Edit,
      onClick: (selected) => openBulkEdit(selected),
    },
  ]}
  expandable
  renderExpanded={(employee) => (
    <div className="p-4 bg-muted/20">
      <h4 className="font-medium mb-2">Employee Details</h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>Start Date: {employee.startDate}</div>
        <div>Manager: {employee.manager}</div>
        <div>Location: {employee.location}</div>
        <div>Salary: {employee.salary}</div>
      </div>
    </div>
  )}
  exportable
  exportFormats={['csv', 'json', 'excel']}
  onExport={(format, data) => handleExport(format, data)}
/>;
```

### Motion Component Advanced Patterns
```jsx
// Page transition animations
function PageTransition({ children, pathname }) {
  return (
    <Motion
      key={pathname}
      preset="fadeIn"
      duration="normal"
      className="min-h-screen"
    >
      {children}
    </Motion>
  );
}

// Staggered list animations
function AnimatedList({ items }) {
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <Motion
          key={item.id}
          preset="slideInUp"
          duration="fast"
          delay={index * 50}
        >
          <ListItem item={item} />
        </Motion>
      ))}
    </div>
  );
}

// Scroll-triggered sections
function FeaturesSection() {
  return (
    <section className="py-20">
      <Reveal preset="fadeIn" duration="slow">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
      </Reveal>
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <Reveal
            key={feature.id}
            preset="slideInUp"
            duration="normal"
            delay={index * 200}
          >
            <Hover effect="lift">
              <Card>
                <CardContent className="p-6 text-center">
                  <feature.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </Hover>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// Interactive button with loading states
function SubmitButton({ loading, onSubmit }) {
  return (
    <Hover effect="scale">
      <Button
        onClick={onSubmit}
        disabled={loading}
        className="bg-primary text-primary-foreground min-w-32"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <LoadingSpinner size="sm" />
            Processing...
          </div>
        ) : (
          'Submit Form'
        )}
      </Button>
    </Hover>
  );
}
```

---

## ✅❌ DOS AND DON'TS (UPDATED FOR NEW COMPONENTS)

### 🎯 **NEW COMPONENT USAGE**

#### ✅ DO - Enhanced Form Components
```jsx
<ValidatedInput
  type="email"
  required
  label="Email"
  value={email}
  onChange={setEmail}
  showPasswordStrength // For passwords
/>

<FormActions
  submitText="Create Account"
  showCancel
  loading={isSubmitting}
  onCancel={() => router.back()}
/>
```

#### ❌ DON'T - Wrong Form Patterns
```jsx
// Don't use basic Input for validated forms
<Input type="email" required /> // No validation feedback

// Don't create custom form actions
<div className="flex gap-2">
  <button type="submit">Submit</button>
</div> // Use FormActions instead
```

#### ✅ DO - Motion Components
```jsx
<Motion preset="fadeIn" duration="normal">
  <Content />
</Motion>

<Reveal preset="slideInUp">
  <Section />
</Reveal>

<Hover effect="scale">
  <Card />
</Hover>
```

#### ❌ DON'T - Complex Animation Libraries
```jsx
import { motion } from 'framer-motion' // Use Motion instead
import anime from 'animejs' // Use Motion instead
className="animate-bounce" // Use Motion presets
```

#### ✅ DO - DataTable Configuration
```jsx
<DataTable
  data={users}
  columns={columns}
  searchable
  filterable
  sortable
  pagination
  actions={rowActions}
/>;

const columns = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    sortable: true,
    filterable: true,
    filterType: 'text',
  },
];
```

#### ❌ DON'T - Basic Table for Complex Data
```jsx
<Table>
  <TableRow>
    <TableCell>{user.name}</TableCell>
  </TableRow>
</Table> // Missing search, filter, pagination

<input placeholder="Search..." /> // Use DataTable's built-in search
```

### 🔄 **COMPONENT SELECTION UPDATED**

#### ✅ DO - Choose Right Component for Task
```jsx
// Forms with validation → ValidatedInput
<ValidatedInput type="email" required label="Email" />

// Search/filters → Input
<Input placeholder="Search products..." />

// Complex tables → DataTable
<DataTable data={users} columns={columns} searchable />

// Simple tables → Table
<Table>
  <TableBody>
    <TableRow>...</TableRow>
  </TableBody>
</Table>

// Page animations → Motion/Reveal
<Motion preset="fadeIn"><Page /></Motion>

// Interactive elements → Hover
<Hover effect="scale"><Button /></Hover>
```

#### ❌ DON'T - Wrong Component Choice
```jsx
<Input required /> // Use ValidatedInput for forms
<Table> + custom search/filter // Use DataTable for complex data
<div className="animate-pulse"> // Use LoadingSpinner
// Complex CSS animations // Use Motion components
```

---

## 🚨 CRITICAL REMINDERS (UPDATED)

### 🎯 **Core Rules** (Never Break These)
1. **✅ ALWAYS** import styles: `import '@voilajsx/uikit/styles'`
2. **✅ ALWAYS** wrap in ThemeProvider: `<ThemeProvider theme="base">`
3. **✅ ALWAYS** use semantic colors: `bg-background text-foreground`
4. **✅ ALWAYS** use individual imports: `import { Button } from '@voilajsx/uikit/button'` (avoid barrel imports for tree-shaking)
5. **✅ NEVER** use hardcoded colors: `bg-white text-black`
6. **✅ COMPOUND** layouts need child components: `<AdminLayout><AdminLayout.Header/></AdminLayout>`
7. **✅ SINGLE** layouts take direct children: `<AuthLayout><LoginForm/></AuthLayout>`
8. **✅ FORMS** use ValidatedInput for validation: `<ValidatedInput required />`
9. **✅ ANIMATIONS** use Motion components: `<Motion preset="fadeIn" />`
10. **✅ TABLES** use DataTable for complex data: `<DataTable searchable filterable />`

### 🔍 **Quality Checklist** (Every Component)
- [ ] File header with description and @module/@file
- [ ] Correct component pattern (compound vs single)
- [ ] Semantic colors only (no hardcoded colors)
- [ ] Standard navigation structure (key + label)
- [ ] Appropriate scheme/tone/size props
- [ ] Individual imports (not barrel imports)
- [ ] ValidatedInput for form validation
- [ ] Motion components for animations
- [ ] DataTable for complex data operations

### ⚡ **Success Factors** (High Quality Code)
- **Consistency**: Uniform patterns across files
- **Documentation**: Clear headers and comments
- **Semantic Colors**: Theme-compatible styling
- **Type Safety**: Proper TypeScript usage
- **Performance**: Optimized imports for tree-shaking
- **Validation**: Built-in form validation
- **Animation**: Smooth, performant CSS animations
- **Data Management**: Professional table features

---

## ✅ SUCCESS CHECKLIST (UPDATED)

### Required Setup
- [ ] `import '@voilajsx/uikit/styles'` in root file
- [ ] ThemeProvider setup in `main.tsx` (automatically included in templates)
- [ ] Choose correct layout: AdminLayout/PageLayout/AuthLayout/BlankLayout/PopupLayout

### Component Patterns
- [ ] Use compound pattern for AdminLayout & PageLayout (with .Header, .Content, etc.)
- [ ] Use single pattern for AuthLayout, BlankLayout & PopupLayout (direct children)
- [ ] Set appropriate scheme, tone, size props on all layouts

### NEW: Enhanced Components
- [ ] Use ValidatedInput for forms requiring validation
- [ ] Use Motion/Reveal/Hover for animations
- [ ] Use DataTable for complex data operations
- [ ] Use LoadingSpinner for loading states
- [ ] Use FormActions for consistent form buttons

### Styling
- [ ] Use ONLY semantic colors (bg-background, text-foreground, border-border)
- [ ] NEVER use hardcoded colors (bg-white, text-black, border-gray-200)
- [ ] Apply semantic classes to all UI components

### Navigation & Data
- [ ] Structure navigation with required key + label properties
- [ ] Configure DataTable columns with proper types and features
- [ ] Implement onNavigate handler for routing integration
- [ ] Use appropriate animation presets for user experience

### Integration & Testing
- [ ] Connect to your routing system (React Router, Next.js, etc.)
- [ ] Test form validation with ValidatedInput components
- [ ] Test DataTable sorting, filtering, and pagination
- [ ] Test animations and loading states
- [ ] Verify responsive behavior on mobile/desktop

Following this complete guide ensures 100% successful UIKit implementation with all new enhanced components.