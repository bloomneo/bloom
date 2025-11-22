# Development Guide

Complete guide for developing, building, and testing the Helix Mobile app on iOS and Android.

---

## Table of Contents

1. [Development Workflow](#development-workflow)
2. [Production Build & Testing](#production-build--testing)
3. [App Icons & Assets](#app-icons--assets)
4. [Troubleshooting](#troubleshooting)

---

## Development Workflow

Development mode uses hot reload - changes to your code automatically reload in the app without rebuilding.

### Prerequisites

Start the development server:
```bash
npm run dev
```

This starts Vite dev server on `http://localhost:5173` for hot reload.

### Android Development

**Option 1: Quick Start (Recommended)**
```bash
npm run mobile:run:android
```

**Option 2: Specific Device**
```bash
# List available devices
npx cap run android --list

# Run on specific device
npx cap run android --target Pixel_8_API_35
```

**What happens:**
1. Copies `capacitor.config.android.ts` → `capacitor.config.ts`
2. Syncs native Android code
3. Launches Android emulator/device
4. Installs and runs the app
5. App loads from `http://10.0.2.2:5173` (dev server)

**Platform-specific URL:**
- Android emulator uses `10.0.2.2` to access host machine's `localhost`
- Configured in `capacitor.config.android.ts`

### iOS Development

**Option 1: Quick Start (Recommended)**
```bash
npm run mobile:run:ios
```

**Option 2: Specific Simulator**
```bash
# List available simulators
xcrun simctl list devices

# Run on specific simulator
npx cap run ios --target="DEVICE_ID"
```

**What happens:**
1. Copies `capacitor.config.ios.ts` → `capacitor.config.ts`
2. Syncs native iOS code
3. Launches iOS simulator
4. Builds and runs the app
5. App loads from `http://localhost:5173` (dev server)

**Platform-specific URL:**
- iOS simulator can access `localhost` directly
- Configured in `capacitor.config.ios.ts`

### Development Tips

**Hot Reload:**
- Edit files in `src/` and see changes instantly
- No rebuild needed for code changes
- Native config changes require re-sync

**Re-sync After Changes:**
```bash
# Android
npm run mobile:sync:android

# iOS
npm run mobile:sync:ios
```

**Open in Native IDE:**
```bash
# Android Studio
npm run mobile:android

# Xcode
npm run mobile:ios
```

---

## Production Build & Testing

Production builds bundle the frontend into the APK/IPA - no dev server needed.

### Android Production Build

**Debug Build (for testing):**
```bash
npm run android:build
```

**What this does:**
1. Runs `npm run build` (creates `dist/` folder)
2. Copies `capacitor.config.android.ts` → `capacitor.config.ts`
3. Syncs with Android platform
4. Removes `server.url` from config (loads from bundled assets)
5. Builds APK using Gradle
6. Outputs: `build/helix-mobile-app.apk`

**Release Build (for Play Store):**
```bash
npm run android:release
```

Outputs: `build/helix-mobile-app-release.apk`

### iOS Production Build

**Debug Build (for testing):**
```bash
npm run ios:build
```

**What this does:**
1. Runs `npm run build` (creates `dist/` folder)
2. Copies `capacitor.config.ios.ts` → `capacitor.config.ts`
3. Syncs with iOS platform
4. Removes `server.url` from config (loads from bundled assets)
5. Builds using Xcode
6. Outputs: `build/helix-mobile-app.app`

**Release Build (for App Store):**
```bash
npm run ios:release
```

Opens archive in Xcode for App Store submission.

### Installing & Testing Production Builds

**Android:**
```bash
# Method 1: Using npm script
npm run android:install

# Method 2: Manual install
adb install build/helix-mobile-app.apk

# Method 3: Build and run in one command
npx cap run android --target Pixel_8_API_35
```

**Requirements:**
- Android emulator must be running
- Or physical device connected via ADB

**Check connected devices:**
```bash
adb devices
```

**iOS:**
```bash
# Method 1: Using npm script
npm run mobile:run:ios

# Method 2: Open in Simulator
open -a Simulator
# Drag and drop the .app file

# Method 3: Using simctl
xcrun simctl install booted build/helix-mobile-app.app
xcrun simctl launch booted com.helix.mobilebasicapp
```

### Production vs Development

| Aspect | Development | Production |
|--------|-------------|------------|
| Frontend Source | Vite dev server (port 5173) | Bundled in APK/IPA |
| Hot Reload | ✅ Yes | ❌ No |
| Dev Server Required | ✅ Yes (`npm run dev`) | ❌ No |
| Build Time | Fast (no bundling) | Slower (bundles + native build) |
| File Size | N/A | Optimized & minified |
| Config URL | Points to dev server | No URL (loads from assets) |

---

## App Icons & Assets

### Customizing App Icon

The app uses the Helix logo as the icon. To change it:

1. **Replace the source icon:**
   ```bash
   # Place your icon (1024x1024 PNG) at:
   resources/icon.png
   ```

2. **Generate all platform icons:**
   ```bash
   npx @capacitor/assets generate --iconBackgroundColor '#ffffff' --iconBackgroundColorDark '#000000' --ios --android
   ```

3. **Rebuild the app:**
   ```bash
   npm run android:build
   npm run ios:build
   ```

### What Gets Generated

- **Android**: 74 assets (icons, adaptive icons, splash screens)
- **iOS**: 7 assets (app icon, splash screens)
- **Both**: Light and dark mode variants

### Generated Locations

- `android/app/src/main/res/` - Android assets
- `ios/App/App/Assets.xcassets/` - iOS assets

---

## Troubleshooting

### Android Issues

**"adb: no devices/emulators found"**
```bash
# Start emulator first
npx cap run android --target Pixel_8_API_35

# Or check devices
adb devices
```

**"Page not loading" on Android**
- Ensure dev server is running: `npm run dev`
- Android emulator must use `10.0.2.2`, not `localhost`
- Check `capacitor.config.android.ts` has correct URL

**Build fails**
```bash
# Clean build
npm run android:clean
npm run android:build
```

### iOS Issues

**"localhost not accessible"**
- iOS simulator can access `localhost` directly
- Check `capacitor.config.ios.ts` uses `localhost:5173`

**Build fails**
```bash
# Clean build
npm run ios:clean
npm run ios:build
```

### General Issues

**TypeScript errors during build**
- Fix unused imports/variables
- Run `npm run typecheck` to check for errors

**Hot reload not working**
- Restart dev server: `npm run dev`
- Re-sync platform: `npm run mobile:sync:android` or `npm run mobile:sync:ios`

**Changes not reflecting**
- Kill and restart the app
- For native config changes, re-sync the platform

---

## Quick Reference

### Development Commands

```bash
# Start dev server (required for dev mode)
npm run dev

# Android development
npm run mobile:run:android

# iOS development
npm run mobile:run:ios

# Re-sync after config changes
npm run mobile:sync:android
npm run mobile:sync:ios
```

### Production Commands

```bash
# Android production build
npm run android:build
npm run android:install

# iOS production build
npm run ios:build

# Release builds
npm run android:release
npm run ios:release
```

### Utility Commands

```bash
# Open native IDE
npm run mobile:android    # Android Studio
npm run mobile:ios        # Xcode

# Clean builds
npm run android:clean
npm run ios:clean

# Check TypeScript
npm run typecheck
```

---

## Backend API Configuration

This app requires a backend API. Configure in development:

**Development Mode:**
- `capacitor.config.android.ts`: `url: 'http://10.0.2.2:3000'`
- `capacitor.config.ios.ts`: `url: 'http://localhost:3000'`

**Production Mode:**
- Use environment variables: `VITE_API_URL=https://your-api.com`
- Or update platform-aware detection in `src/mobile/features/main/pages/index.tsx`

See [helix-basicapp](https://github.com/voilajsx/helix-basicapp) for a compatible backend.

---

## Next Steps

- **Android Setup**: See [ANDROID_GUIDE.md](./ANDROID_GUIDE.md)
- **iOS Setup**: See [IOS_GUIDE.md](./IOS_GUIDE.md)
- **UIKit Components**: See [UIKIT_LLM_GUIDE.md](./UIKIT_LLM_GUIDE.md)
- **FBCA Architecture**: See [QUICKSTART_FBCA.md](./QUICKSTART_FBCA.md)
