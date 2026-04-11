# Quick Start: Single Template

**Simple component showcase with no routing - perfect for learning UIKit components and exploring themes.**

## 🎯 What is Single Template?

The Single template creates a component showcase on one page. No routing, no complex layouts - just a clean demonstration of UIKit components and all 5 themes. Perfect for learning, prototyping, and component exploration.

**Perfect for:**
- Learning UIKit components
- Component demos and showcases
- Quick prototyping and experimentation
- Testing themes and design systems
- Simple component libraries

## ⚡ 30-Second Setup

### Step 1: Install UIKit CLI Globally
```bash
npm install -g @voilajsx/uikit
```

### Step 2: Create Single Project
```bash
uikit create my-single-app
cd my-single-app && npm run dev
```

### Step 3: Project Structure
```
src/
├── App.tsx                 # Component showcase with theme switcher
├── main.tsx               # Entry point with theme provider
└── index.css              # Global styles with Tailwind + UIKit
```

## 🎨 How Single Template Works

### App.tsx - Component Showcase
**Why:** All components demonstrated in one file for easy exploration
**When:** Learning components, testing themes, building demos
**How:** Single page with theme switcher and component examples

```jsx
const UIKitShowcase = () => {
  const { theme, mode, setTheme, toggleMode, availableThemes } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header with theme controls */}
      <header className="border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded">UI</div>
            <h1 className="voila-brand-logo text-xl font-bold">@voilajsx/uikit</h1>
          </div>

          <div className="flex items-center gap-3">
            <select value={theme} onChange={(e) => setTheme(e.target.value)}>
              {availableThemes.map(id => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
            <Button onClick={toggleMode} variant="outline" size="sm">
              {mode === 'dark' ? '☀️' : '🌙'}
            </Button>
          </div>
        </div>
      </header>

      {/* Component showcase sections */}
      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Your component examples */}
      </main>
    </div>
  );
};
```

### main.tsx - Theme Provider Setup
**Why:** Provides theme context to entire app
**When:** Always required for UIKit components
**How:** Wraps App with ThemeProvider

```jsx
import { ThemeProvider } from '@voilajsx/uikit/theme-provider';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme="base" mode="light" forceConfig={true}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
```

## 📦 Component Examples

### Button Showcase
**Why:** Demonstrate all button variants and sizes
**When:** Learning button component API
**How:** Grid layout with different configurations

```jsx
<Card>
  <CardHeader>
    <CardTitle>Buttons</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="flex flex-wrap gap-3">
      <Button size="lg">Primary</Button>
      <Button variant="secondary" size="lg">Secondary</Button>
      <Button variant="outline" size="lg">Outline</Button>
      <Button variant="ghost" size="lg">Ghost</Button>
      <Button variant="destructive" size="lg">Delete</Button>
    </div>
  </CardContent>
</Card>
```

### Card Examples
**Why:** Show different card layouts and styles
**When:** Understanding card component patterns
**How:** Grid of card variations

```jsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <Card>
    <CardHeader>
      <CardTitle>Feature Card</CardTitle>
      <CardDescription>Standard card component</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">Perfect for content areas</p>
    </CardContent>
  </Card>

  <Card>
    <CardHeader>
      <CardTitle>Interactive</CardTitle>
    </CardHeader>
    <CardContent>
      <Button className="w-full">Action</Button>
    </CardContent>
  </Card>

  <div className="bg-primary text-primary-foreground p-6 rounded-lg">
    <h4 className="font-semibold mb-2">Custom Card</h4>
    <p className="text-sm opacity-90">With custom styling</p>
  </div>
</div>
```

### Form Elements
**Why:** Demonstrate input components and styling
**When:** Learning form component patterns
**How:** Grid layout with different input types

```jsx
<Card>
  <CardHeader>
    <CardTitle>Form Elements</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input
        type="text"
        placeholder="Text input"
        className="p-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <select className="p-3 bg-background border border-input rounded-lg">
        <option>Select option</option>
        <option>Option 1</option>
      </select>
    </div>
    <textarea
      placeholder="Textarea"
      rows={3}
      className="w-full p-3 bg-background border border-input rounded-lg resize-none"
    />
  </CardContent>
</Card>
```

## 🎯 When to Use Single Template

**Perfect for:**
- Learning UIKit components
- Creating component demonstrations
- Quick prototyping without routing
- Testing themes and color systems
- Building simple component showcases
- Teaching UIKit to others

**Key Benefits:**
- Zero configuration required
- All components in one place
- Built-in theme switcher
- Perfect for experimentation
- No routing complexity

**Not ideal for:**
- Multi-page applications (use SPA template)
- Complex business applications (use Multi template)
- Large scalable apps (use FBCA template)

## 🔧 Customization

### Adding New Components
**Why:** Expand your component showcase
**When:** Want to test more UIKit components
**How:** Add new sections to App.tsx

```jsx
// Add to your component showcase
<Card>
  <CardHeader>
    <CardTitle>Your New Component</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Your component examples */}
  </CardContent>
</Card>
```

### Theme Testing
**Why:** See how components look in different themes
**When:** Designing with multiple theme options
**How:** Use the built-in theme switcher

```jsx
// Theme descriptions for each theme
const themeDescriptions = {
  base: 'Clean default configuration',
  elegant: 'Fresh sky blue theme',
  metro: 'Dark teal with yellow accents',
  studio: 'Sophisticated neutrals with gold',
  vivid: 'Premium cursive typography'
};
```

### Custom Styling
**Why:** Test custom component styling
**When:** Need to override default styles
**How:** Use semantic color classes

```jsx
// Always use semantic classes for theme compatibility
<div className="bg-primary text-primary-foreground p-4 rounded-lg">
  <h3 className="font-bold">Custom Component</h3>
  <p className="text-primary-foreground/80">With theme-aware colors</p>
</div>
```

---

**Built with @voilajsx/uikit** ✨