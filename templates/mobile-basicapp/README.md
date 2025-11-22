# mobile-basicapp

**Cross-platform Mobile UI Application for iOS and Android**

Built with React + @voilajsx/uikit + Capacitor

---

## Important: Frontend Only

This is a **UI-only mobile application**. It does not include a backend server.

To use this app, you must:
1. Deploy your own backend API to the cloud (or run locally for development)
2. Configure the API URL in `capacitor.config.ts` or `.env`

---

## Quick Start

### Prerequisites

| Requirement | iOS | Android |
|-------------|-----|---------|
| Node.js | 18+ | 18+ |
| Xcode | 15+ | - |
| Android Studio | - | Latest |
| Java JDK | - | 17 |

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Backend API

Edit `.env` or `capacitor.config.ts`:

```bash
# .env
VITE_API_URL=https://your-api.cloud.com
```

Or in `capacitor.config.ts`:
```typescript
server: {
  url: 'https://your-api.cloud.com'
}
```

### 3. Run the App

**iOS:**
```bash
npm run dev                    # Start dev server
npm run mobile:run:ios         # Run on iOS Simulator
```

**Android:**
```bash
npm run dev                    # Start dev server
npm run mobile:run:android     # Run on Android Emulator
```

---

## Documentation

| Guide | Description |
|-------|-------------|
| **[Development Guide](./docs/DEVELOPMENT.md)** | **Complete workflow: development, production builds, testing, and app icons** |
| [iOS Guide](./docs/IOS_GUIDE.md) | iOS-specific setup, Xcode, and App Store |
| [Android Guide](./docs/ANDROID_GUIDE.md) | Android-specific setup, Android Studio, and Play Store |

### What's in the Development Guide

- **Development Workflow** - Hot reload, running on simulators/emulators
- **Production Builds** - Creating APK/IPA files for distribution
- **Testing & Installation** - Installing and testing production builds
- **App Icons & Assets** - Customizing icons and splash screens
- **Troubleshooting** - Common issues and solutions
- **Quick Reference** - All commands in one place

---

## Available Scripts

### Development
```bash
npm run dev                    # Start Vite dev server
npm run build                  # Build for production
```

### iOS
```bash
npm run mobile:run:ios         # Run on iOS Simulator
npm run ios:build              # Build .app → build/helix-mobile-app.app
npm run ios:release            # Release build (needs Xcode for App Store)
npm run ios:clean              # Clean iOS build artifacts
```

### Android
```bash
npm run mobile:run:android     # Run on Android Emulator
npm run android:build          # Build APK → build/helix-mobile-app.apk
npm run android:release        # Release APK (needs keystore)
npm run android:clean          # Clean Android build artifacts
npm run android:install        # Install APK on device
```

---

## Configuration Files

| File | Purpose |
|------|---------|
| `capacitor.config.ts` | Active config (auto-generated from platform configs) |
| `capacitor.config.ios.ts` | iOS config template (localhost:5173) |
| `capacitor.config.android.ts` | Android config template (10.0.2.2:5173) |
| `.env` | API URL environment variable |

### How Platform Configs Work

The sync scripts automatically copy the correct platform config:
- `npm run mobile:run:ios` → copies `capacitor.config.ios.ts`
- `npm run mobile:run:android` → copies `capacitor.config.android.ts`

### Network Configuration (Development)

| Platform | Dev Server URL | Why |
|----------|----------------|-----|
| iOS Simulator | `localhost:5173` | iOS can access host directly |
| Android Emulator | `10.0.2.2:5173` | Android's special IP for host |

### Production Build

For production builds, the `server.url` is removed automatically so the app loads from bundled assets. You only need to configure the **backend API URL** in `.env`:

```bash
# .env
VITE_API_URL=https://your-api.cloud.com
```

Then build:
```bash
npm run android:build   # APK with bundled UI
npm run ios:build       # .app with bundled UI
```

---

## Project Structure

```
mobile-basicapp/
├── src/mobile/                  # React frontend source (focus here!)
│   ├── App.tsx                 # Main app component
│   ├── features/               # Feature modules
│   └── styles/                 # CSS styles
├── capacitor.config.ts          # Active config (auto-generated)
├── capacitor.config.ios.ts      # iOS config template
├── capacitor.config.android.ts  # Android config template
├── android/                     # Android native (gitignored, regenerated)
├── ios/                         # iOS native (gitignored, regenerated)
├── build/                       # Build outputs (APK, .app)
├── docs/
│   ├── IOS_GUIDE.md            # iOS development guide
│   └── ANDROID_GUIDE.md        # Android development guide
└── .env                         # API URL configuration
```

> **Note:** The `android/` and `ios/` folders are gitignored. They're auto-generated with `npx cap add android` / `npx cap add ios`. Developers only need to focus on `src/`.

---

## Backend Requirements

This app requires an external API. **Use [helix-basicapp](https://github.com/anthropics/helix-basicapp) as your backend project.**

### Development (Local)
```bash
# Clone and run basicapp backend locally (separate project)
git clone https://github.com/anthropics/helix-basicapp.git
cd helix-basicapp
npm install
npm run dev:api  # Starts API on http://localhost:3000
```

Then configure this mobile app to use it:
```bash
# .env
VITE_API_URL=http://localhost:3000
```

### Production (Cloud)
For production, deploy your basicapp backend to cloud:
- [Fly.io](https://fly.io)
- [Railway](https://railway.app)
- [Render](https://render.com)
- [Vercel](https://vercel.com)
- Any cloud provider

Then update your API URL:
```bash
VITE_API_URL=https://your-deployed-api.com
```

---

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Capacitor 7** - Native mobile runtime
- **@voilajsx/uikit** - UI components (5 themes)
- **Tailwind CSS v4** - Styling
- **Vite** - Build tool

---

## Features

- Cross-platform (iOS + Android)
- 5 UI themes (Base, Elegant, Metro, Studio, Vivid)
- Native capabilities (haptics, status bar, splash screen)
- Hot reload during development
- TypeScript support

---

## License

MIT License

---

**Part of the Helix Framework ecosystem**
