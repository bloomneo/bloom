# Desktop App Configuration Guide 🖥️

> **Quick reference for configuring Helix Desktop App - icons, metadata, and build settings**

## 📝 Overview

Your desktop app configuration is managed in two main files:
- **`package.json`** - App metadata, build settings, and electron-builder config
- **`electron/main.js`** - Window settings and runtime behavior

---

## 🎨 App Icon Configuration

### Current Setup ✅

Your `public/app.png` is now configured as the app icon:

**Window Icon (Development):**
```javascript
// electron/main.js
icon: join(__dirname, '../public/app.png')
```

**Build Icons (Production):**
```json
// package.json
"build": {
  "mac": { "icon": "public/app.png" },
  "win": { "icon": "public/app.png" },
  "linux": { "icon": "public/app.png" }
}
```

### Icon Requirements by Platform

**Current:** Using PNG (works but not optimal)

**Optimal (for production):**

| Platform | Format | Sizes | Location |
|----------|--------|-------|----------|
| macOS | `.icns` | 512×512, 256×256, 128×128, 64×64, 32×32, 16×16 | `build/icon.icns` |
| Windows | `.ico` | 256×256, 128×128, 64×64, 48×48, 32×32, 16×16 | `build/icon.ico` |
| Linux | `.png` | 512×512 (recommended) | `build/icon.png` |

### Creating Proper Icons (Optional - For Better Quality)

**Option 1: Online Tool (Easiest)**
```bash
# 1. Go to https://www.icoconverter.com or https://cloudconvert.com
# 2. Upload public/app.png
# 3. Convert to .icns (macOS), .ico (Windows)
# 4. Save to build/ folder
```

**Option 2: Electron Icon Maker (Automated)**
```bash
# Install globally
npm install -g electron-icon-maker

# Generate all formats from app.png
electron-icon-maker --input=public/app.png --output=build
```

**Then update package.json:**
```json
"build": {
  "mac": { "icon": "build/icon.icns" },
  "win": { "icon": "build/icon.ico" },
  "linux": { "icon": "build/icon.png" }
}
```

---

## 📦 App Metadata (package.json)

### Current Configuration

```json
{
  "name": "helix-desktop-app",
  "productName": "Helix",
  "version": "1.0.0",
  "description": "Helix Desktop App - Modern Electron application",
  "appId": "com.helix.app"
}
```

### What Each Field Does

| Field | Purpose | Example |
|-------|---------|---------|
| `name` | NPM package name (internal) | `helix-desktop-app` |
| `productName` | Display name shown to users | `Helix` |
| `version` | App version (semantic) | `1.0.0`, `1.2.3` |
| `description` | App description | `Helix Desktop App` |
| `appId` | Unique identifier (reverse domain) | `com.helix.app` |

### Customization

```json
{
  "name": "helix-desktop-app",           // Keep this (internal)
  "productName": "Helix Pro",            // ✏️ Change display name
  "version": "1.0.0",                    // ✏️ Update on releases
  "description": "Your custom description", // ✏️ Describe your app
  "author": "Your Name <email@example.com>", // ✏️ Add author
  "license": "MIT"                       // ✏️ Add license
}
```

---

## 🏗️ Build Configuration (electron-builder)

### Current Settings

```json
"build": {
  "appId": "com.helix.app",
  "productName": "Helix",
  "directories": {
    "output": "release"  // Built apps go here
  },
  "mac": {
    "target": "dmg",     // Creates .dmg installer
    "category": "public.app-category.developer-tools"
  },
  "win": {
    "target": "nsis"     // Creates .exe installer
  },
  "linux": {
    "target": "AppImage", // Creates .AppImage
    "category": "Development"
  }
}
```

### Common Customizations

**Change Output Directory:**
```json
"directories": {
  "output": "dist"  // Change from 'release' to 'dist'
}
```

**macOS Settings:**
```json
"mac": {
  "target": ["dmg", "zip"],  // Multiple formats
  "category": "public.app-category.productivity",
  "hardenedRuntime": true,   // Required for notarization
  "gatekeeperAssess": false,
  "entitlements": "build/entitlements.mac.plist"
}
```

**Windows Settings:**
```json
"win": {
  "target": ["nsis", "portable"],  // Installer + portable
  "publisherName": "Your Company",
  "verifyUpdateCodeSignature": false
}
```

**Linux Settings:**
```json
"linux": {
  "target": ["AppImage", "deb", "rpm"],  // Multiple formats
  "category": "Utility",
  "maintainer": "you@example.com"
}
```

---

## 🪟 Window Configuration (electron/main.js)

### Current Settings

```javascript
mainWindow = new BrowserWindow({
  width: 1400,              // Window width
  height: 900,              // Window height
  icon: join(__dirname, '../public/app.png'),
  webPreferences: {
    preload: join(__dirname, 'preload.cjs'),
    contextIsolation: true,
    nodeIntegration: false,
    webSecurity: true
  }
});
```

### Common Customizations

**Window Size & Position:**
```javascript
{
  width: 1200,              // ✏️ Change width
  height: 800,              // ✏️ Change height
  minWidth: 800,            // Minimum width
  minHeight: 600,           // Minimum height
  maxWidth: 1920,           // Maximum width (optional)
  maxHeight: 1080,          // Maximum height (optional)
  center: true,             // Center on screen
  x: 100,                   // X position (optional)
  y: 100                    // Y position (optional)
}
```

**Window Style:**
```javascript
{
  title: 'Helix',           // Window title
  frame: true,              // Show title bar (false = frameless)
  titleBarStyle: 'default', // macOS: 'default', 'hidden', 'hiddenInset'
  backgroundColor: '#ffffff', // Background color
  transparent: false,       // Transparent window
  resizable: true,          // Allow resize
  minimizable: true,        // Allow minimize
  maximizable: true,        // Allow maximize
  fullscreenable: true      // Allow fullscreen
}
```

**Window Behavior:**
```javascript
{
  show: false,              // Don't show until ready
  autoHideMenuBar: true,    // Hide menu bar (F10 to show)
  skipTaskbar: false        // Show in taskbar
}

// Show when ready
mainWindow.once('ready-to-show', () => {
  mainWindow.show();
});
```

---

## 🚀 Quick Configuration Checklist

### Minimal Setup (Current - Works fine!)
- ✅ App icon (`public/app.png`)
- ✅ Product name (`Helix`)
- ✅ App ID (`com.helix.app`)
- ✅ Window size (1400×900)
- ✅ Build targets (DMG, NSIS, AppImage)

### Production Ready (Optional improvements)
- [ ] Optimized icons (`.icns`, `.ico` formats)
- [ ] Author information in `package.json`
- [ ] License field in `package.json`
- [ ] Custom window icon for development
- [ ] Code signing certificates (for distribution)
- [ ] Auto-update configuration

### Professional (Advanced)
- [ ] Code signing for macOS/Windows
- [ ] macOS notarization
- [ ] Windows SmartScreen certificate
- [ ] Custom installer graphics
- [ ] Auto-update server setup
- [ ] Crash reporting

---

## 🎯 Common Tasks

### Change App Name
```json
// package.json
"productName": "New Name"
```

### Change Window Size
```javascript
// electron/main.js
new BrowserWindow({
  width: 1600,
  height: 1000
})
```

### Add Frameless Window
```javascript
// electron/main.js
new BrowserWindow({
  frame: false,
  titleBarStyle: 'hidden'  // macOS
})
```

### Change Build Output
```json
// package.json
"directories": {
  "output": "dist"
}
```

### Add Multiple Build Targets
```json
// package.json
"mac": {
  "target": ["dmg", "zip", "pkg"]
},
"win": {
  "target": ["nsis", "portable", "msi"]
}
```

---

## 🐛 Troubleshooting

**Icon not showing in development:**
- Check path in `electron/main.js`
- Restart Electron: `npm run dev`

**Icon not showing in built app:**
- Verify icon in `package.json` build config
- Rebuild: `npm run electron:build`
- Check `release/` folder for built app

**Wrong app name showing:**
- Update `productName` in `package.json`
- Rebuild: `npm run electron:build`

**Build fails:**
- Check icon file exists
- Verify paths are correct
- Clear cache: `rm -rf release node_modules && npm install`

---

## 📚 Additional Resources

- [Electron Builder Docs](https://www.electron.build/)
- [Electron Window Options](https://www.electronjs.org/docs/latest/api/browser-window)
- [App Icon Guidelines](https://www.electron.build/icons)
- [Code Signing Guide](https://www.electron.build/code-signing)

---

**Your app is configured and ready to build!** 🎉

Current setup works perfectly for development and basic distribution. Consider optional improvements only when you need professional distribution.
