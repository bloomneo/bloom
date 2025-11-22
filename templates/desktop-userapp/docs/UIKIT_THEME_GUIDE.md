# UIKit Theme Guide

**Transform your UIKit applications with beautiful, brand-consistent themes that work seamlessly across all components and layouts.**

## 🎨 Understanding UIKit Theming

UIKit is built on **ShadCN components** and **Tailwind CSS v4**, enhanced with a powerful semantic color system that automatically adapts to your brand. Instead of hardcoded colors like `bg-white` or `text-black`, UIKit uses semantic classes like `bg-background`, `text-foreground`, and `border-border` that intelligently change based on your selected theme.

**How it works:**
- **Semantic colors** automatically map to your theme's values
- **29 color variables** control the entire design system (backgrounds, text, borders, charts, sidebar)
- **Light/dark modes** are handled automatically with proper contrast ratios
- **All components** inherit your theme without any code changes

**The result:** Change one theme file, transform your entire application instantly.

## 🎯 How Semantic Colors Work

### Primary Color Impact
When you set `primary: '#3B82F6'` (blue) in your theme, it automatically affects these classes across your entire application:

```jsx
// Button components
<Button className="bg-primary text-primary-foreground">  // Blue button with white text
<Button variant="outline" className="border-primary text-primary">  // Blue outline with blue text

// Form elements
<Input className="focus:ring-primary" />  // Blue focus ring
<Checkbox className="data-[state=checked]:bg-primary" />  // Blue when checked

// Links and accents
<a className="text-primary hover:text-primary/80">Link</a>  // Blue link
<Badge className="bg-primary text-primary-foreground">New</Badge>  // Blue badge

// Charts and data visualization
<BarChart colors={['var(--primary)']} />  // Blue charts
```

### Core Color Relationships

**Background Colors Hierarchy:**
```jsx
// Page structure
<div className="bg-background">           // Main page (white/dark)
  <Card className="bg-card">              // Elevated content (white/slightly lighter)
    <div className="bg-muted">            // Subtle sections (light gray/darker)
      <div className="bg-accent">         // Interactive areas (very light/subtle)
```

**Text Color Hierarchy:**
```jsx
<h1 className="text-foreground">         // Primary headings (dark/light)
<p className="text-muted-foreground">    // Secondary text (gray)
<span className="text-primary">          // Brand/link text (your brand color)
```

**Border System:**
```jsx
<div className="border-border">          // Standard borders (light gray)
<input className="border-input">         // Form borders (same as border)
<div className="ring-ring">              // Focus rings (usually primary color)
```

## 🎨 Color Selection Guide

### ✅ **Good Color Choices**

**Primary Color (Your Brand):**
- Use your actual brand color
- Ensure good contrast with white text
- Test in both light and dark modes
```javascript
// Good examples
primary: '#1E40AF',  // Professional blue
primary: '#059669',  // Trust green
primary: '#7C3AED',  // Creative purple
```

**Background Colors:**
- Light mode: Pure white or very light grays
- Dark mode: True darks, avoid pure black
```javascript
// Light mode
background: '#FFFFFF',     // Pure white
card: '#FFFFFF',          // Same as background for clean look
muted: '#F8FAFC',         // Very light gray for subtle sections

// Dark mode
background: '#0F172A',     // Dark blue-gray (not pure black)
card: '#1E293B',          // Slightly lighter than background
muted: '#334155',         // Lighter gray for contrast
```

### ❌ **Avoid These Mistakes**

**Don't use low-contrast colors:**
```javascript
// ❌ Bad - poor readability
primary: '#FFEB3B',           // Yellow on white background
foreground: '#9CA3AF',        // Light gray text on white

// ✅ Good - high contrast
primary: '#1D4ED8',           // Dark blue
foreground: '#1F2937',        // Dark gray/black
```

**Don't ignore dark mode:**
```javascript
// ❌ Bad - same colors for both modes
light: { primary: '#1E40AF' },
dark: { primary: '#1E40AF' },   // Too dark for dark backgrounds

// ✅ Good - adjusted for dark mode
light: { primary: '#1E40AF' },
dark: { primary: '#60A5FA' },   // Lighter version for dark mode
```

**Don't use pure black/white in dark mode:**
```javascript
// ❌ Bad - harsh contrast
dark: {
  background: '#000000',      // Pure black is too harsh
  foreground: '#FFFFFF'       // Pure white is too bright
}

// ✅ Good - softer contrast
dark: {
  background: '#0F172A',      // Dark blue-gray
  foreground: '#F8FAFC'       // Off-white
}
```

## 🚀 Why Custom Themes?

Go beyond UIKit's 5 built-in themes and create professional design systems that:

- **Match your brand identity** - Use your exact brand colors and design tokens
- **Work everywhere** - Automatic application across all 40+ components and 5 layouts
- **Support both modes** - One theme definition, light/dark modes handled automatically
- **Maintain accessibility** - Built-in contrast and readability optimization
- **Scale seamlessly** - From simple apps to enterprise applications

**Best part?** You can create and deploy a complete custom theme in under 5 minutes.

## 🚀 Quick Start (Recommended)

### Step 1: Generate Your Theme
```bash
# Create a new custom theme automatically
npx uikit generate theme brand

# This automatically:
# ✅ Creates theme file with all required colors
# ✅ Updates your main.tsx with the new theme
# ✅ Adds proper imports and configuration
# ✅ Works with SPA, Multi, and FBCA projects
```

### Step 2: Customize Your Colors
Edit the generated theme file to match your brand:

```javascript
// src/themes/presets/theme-brand.js (or src/web/themes/presets/ for FBCA)
const themeBrand = {
  id: 'brand',
  name: 'Brand Theme',

  light: {
    // Main brand color - change this to your brand color
    primary: '#3B82F6',              // Your brand blue
    primaryForeground: '#FFFFFF',

    // Backgrounds
    background: '#FFFFFF',           // Page background
    card: '#FFFFFF',                 // Card backgrounds

    // Text colors
    foreground: '#1F2937',           // Main text
    mutedForeground: '#6B7280',      // Secondary text

    // Other colors (can keep as-is initially)
    secondary: '#F3F4F6',
    secondaryForeground: '#374151',
    accent: '#F3F4F6',
    accentForeground: '#374151',
    destructive: '#EF4444',
    destructiveForeground: '#FFFFFF',
    border: '#E5E7EB',
    input: '#E5E7EB',
    ring: '#3B82F6',

    // ... more colors (see complete reference below)
  },

  dark: {
    // Dark mode versions of above colors
    primary: '#60A5FA',              // Lighter version for dark mode
    primaryForeground: '#1E293B',
    background: '#0F172A',
    foreground: '#F8FAFC',
    // ... complete dark palette
  }
};

export default themeBrand;
```

### Step 3: Bundle and Use
```bash
# Generate CSS from your theme
npx uikit bundle

# Your theme is now ready to use!
# It's already configured in your main.tsx
```

---

## 🔧 Development Workflow

### Watch Mode for Live Updates
```bash
# Start theme development with live reload
npx uikit bundle --watch

# In another terminal, start your app
npm run dev

# Now edit your theme file and see changes instantly!
```

### Testing Your Theme
1. **Switch between light/dark modes** - Ensure both look good
2. **Test different layouts** - AdminLayout, PageLayout, AuthLayout
3. **Check form components** - Buttons, inputs, alerts
4. **Verify accessibility** - Good contrast ratios

---

## 📋 Complete Color Reference

### Core Colors (Required)
```javascript
light: {
  // Backgrounds
  background: '#FFFFFF',           // Main page background
  foreground: '#1F2937',           // Primary text
  card: '#FFFFFF',                 // Card backgrounds
  cardForeground: '#1F2937',       // Text on cards
  popover: '#FFFFFF',              // Dropdown backgrounds
  popoverForeground: '#1F2937',    // Text in dropdowns

  // Brand & Actions
  primary: '#3B82F6',              // Your brand color
  primaryForeground: '#FFFFFF',    // Text on brand elements
  secondary: '#F3F4F6',            // Secondary buttons
  secondaryForeground: '#374151',  // Text on secondary elements
  destructive: '#EF4444',          // Error/danger actions
  destructiveForeground: '#FFFFFF', // Text on error elements

  // Supporting Colors
  muted: '#F9FAFB',               // Subtle backgrounds
  mutedForeground: '#6B7280',     // Secondary text
  accent: '#F3F4F6',              // Accent elements
  accentForeground: '#374151',    // Text on accents

  // Borders & Focus
  border: '#E5E7EB',              // Standard borders
  input: '#E5E7EB',               // Input borders
  ring: '#3B82F6',                // Focus rings

  // Chart Colors (for data visualization)
  chart1: '#3B82F6',              // Primary data
  chart2: '#10B981',              // Secondary data
  chart3: '#F59E0B',              // Tertiary data
  chart4: '#EF4444',              // Warning data
  chart5: '#8B5CF6',              // Additional data

  // Sidebar Colors (for AdminLayout)
  sidebar: '#F8FAFC',
  sidebarForeground: '#334155',
  sidebarPrimary: '#3B82F6',
  sidebarPrimaryForeground: '#FFFFFF',
  sidebarAccent: '#F1F5F9',
  sidebarAccentForeground: '#334155',
  sidebarBorder: '#E2E8F0',
  sidebarRing: '#3B82F6',
}
```

### Dark Mode Colors
```javascript
dark: {
  // Invert backgrounds, adjust brand colors for dark mode
  background: '#0F172A',
  foreground: '#F8FAFC',
  primary: '#60A5FA',              // Lighter version of brand color
  // ... all other colors adjusted for dark mode
}
```

---

## 💡 Quick Tips

### Color Selection
- **Start simple**: Focus on primary, background, and foreground colors first
- **Brand first**: Use your existing brand colors as the foundation
- **Test contrast**: Ensure text is readable (use tools like [contrast-ratio.com](https://contrast-ratio.com))
- **Dark mode**: Make colors lighter/softer for dark backgrounds

### Common Patterns
```javascript
// Corporate/Professional
primary: '#1E40AF',    // Professional blue
secondary: '#F1F5F9',  // Light gray

// Creative/Modern
primary: '#8B5CF6',    // Purple
accent: '#F59E0B',     // Orange

// E-commerce
primary: '#059669',    // Trust green
destructive: '#DC2626', // Clear red
```

### Project Structure
- **SPA/Multi projects**: `src/themes/presets/theme-{name}.js`
- **FBCA projects**: `src/web/themes/presets/theme-{name}.js`
- **CSS output**: Auto-generated in `globals.css`

---

## 🛠️ CLI Commands

```bash
# Theme Management
npx uikit generate theme <name>    # Create new theme
npx uikit bundle                   # Generate CSS
npx uikit bundle --watch           # Development mode

# Example Workflow
npx uikit generate theme brand     # 1. Generate
npx uikit bundle --watch          # 2. Start development
# Edit theme file                 # 3. Customize colors
# See changes live in browser     # 4. Iterate
```

---

## 🎯 Next Steps

1. **Generate your theme**: `npx uikit generate theme brand`
2. **Customize primary color**: Edit the `primary` value to match your brand
3. **Test in both modes**: Switch between light and dark mode
4. **Refine gradually**: Adjust other colors as needed
5. **Share and iterate**: Get feedback and refine your theme

**Happy theming!** ✨