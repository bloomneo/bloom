# docs

**A modern React application built with @voilajsx/uikit**

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎨 UIKit Features

This project is built with [@voilajsx/uikit](https://github.com/voilajsx/uikit) - a complete React UI framework with:

- **37 UI Components** - Forms, tables, navigation, overlays, and more
- **5 Professional Themes** - Base, Elegant, Metro, Studio, Vivid
- **5 Layout Systems** - Admin, Auth, Page, Popup, Blank layouts
- **ScrollToTop Navigation** - Automatic scroll-to-top on route changes
- **Theme System** - Light/dark mode with semantic OKLCH colors
- **TypeScript Support** - Full type safety out of the box

## 🏗️ Project Structure

```
docs/
├── src/
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   ├── index.css           # Tailwind CSS v4+ and UIKit styles
│   └── utils/
│       └── asset.ts        # Asset utility for deployment paths
├── public/                 # Static assets
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

**Single Template Features:**
- All components in single `App.tsx` file - perfect for demos and prototypes
- Complete UIKit theme showcase with interactive theme switcher
- Built-in asset utility for deployment flexibility

## 🎯 Development Commands

```bash
npm run dev         # Start development server (localhost:5173)
npm run build       # Build for production
npm run preview     # Preview production build
npm run deploy:gh   # Deploy to GitHub Pages
```

## 🎨 Theme Customization

Change your theme by updating the ThemeProvider in `src/App.tsx`:

```jsx
<ThemeProvider theme="elegant" mode="light">
  <App />
</ThemeProvider>
```

Available themes: `base` | `elegant` | `metro` | `studio` | `vivid`
Available modes: `light` | `dark`

## 📦 Built With

- **[React 19](https://react.dev)** - UI library
- **[TypeScript](https://typescriptlang.org)** - Type safety
- **[Vite](https://vitejs.dev)** - Build tool and dev server
- **[Tailwind CSS v4+](https://tailwindcss.com)** - Utility-first CSS framework
- **[@voilajsx/uikit](https://github.com/voilajsx/uikit)** - UI components and layouts
- **[Lucide React](https://lucide.dev)** - Icon library

## 🎨 Component Usage

Import UIKit components individually for optimal tree-shaking:

```jsx
import { Button } from '@voilajsx/uikit/button';
import { Card, CardContent, CardHeader } from '@voilajsx/uikit/card';
import { asset } from './utils/asset';

function MyComponent() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <h2 className="text-foreground">Welcome</h2>
      </CardHeader>
      <CardContent>
        <img src={asset('/images/logo.png')} alt="Logo" />
        <Button className="bg-primary text-primary-foreground">
          Submit
        </Button>
      </CardContent>
    </Card>
  );
}
```

## 🌐 Asset Management

Use the included asset utility for deployment-friendly paths:

```jsx
import { asset } from './utils/asset';

// Works in both development and production deployments
<img src={asset('/images/hero.jpg')} alt="Hero" />
<link rel="icon" href={asset('/favicon.ico')} />
```

## 📚 Resources

- **[UIKit Documentation](https://docs.anthropic.com/en/docs/claude-code/claude_code_docs_map.md)** - Complete component reference
- **[UIKit LLM Guide](https://github.com/voilajsx/uikit/blob/main/docs/UIKIT_LLM_GUIDE.md)** - Comprehensive usage guide
- **[React Documentation](https://react.dev)** - React framework guide
- **[Vite Documentation](https://vitejs.dev)** - Build tool documentation
- **[Tailwind CSS v4+](https://tailwindcss.com)** - Utility-first CSS framework

---

**Built with ❤️ using [@voilajsx/uikit](https://github.com/voilajsx/uikit)** ✨