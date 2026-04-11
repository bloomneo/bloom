# iOS Development Guide

Complete guide for developing, testing, and building the Bloom Mobile app for iOS.

---

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| **macOS** | 13+ (Ventura or later) | Required for iOS development |
| **Xcode** | 15+ | iOS SDK and Simulator |
| **Node.js** | 18+ | JavaScript runtime |
| **npm** | 9+ | Package manager |

### Check Your Setup

```bash
# Check macOS version
sw_vers

# Check Xcode version
xcodebuild -version

# Check Node.js
node --version

# Check npm
npm --version
```

---

## 1. Install Xcode

### Option A: App Store (Recommended)
1. Open **App Store** on your Mac
2. Search for "Xcode"
3. Click **Get** / **Install**
4. Wait for download (~12GB)

### Option B: Apple Developer Website
1. Go to https://developer.apple.com/download/
2. Sign in with Apple ID
3. Download Xcode

### Post-Installation

```bash
# Accept Xcode license
sudo xcodebuild -license accept

# Install command line tools
xcode-select --install

# Verify installation
xcodebuild -version
```

---

## 2. Install iOS Simulators

### Via Xcode UI
1. Open **Xcode**
2. Go to **Xcode → Settings → Platforms**
3. Click **+** button
4. Select **iOS 17** or **iOS 18**
5. Wait for download (~5GB)

### Via Command Line

```bash
# List available simulators
xcrun simctl list devices

# Download iOS 18 runtime (if not installed)
xcodebuild -downloadPlatform iOS
```

### Create a Simulator (if needed)

```bash
# List available device types
xcrun simctl list devicetypes

# Create iPhone 15 Pro Max simulator
xcrun simctl create "iPhone 15 Pro Max" "iPhone 15 Pro Max" iOS18.0
```

---

## 3. Project Setup

### Install Dependencies

```bash
cd mobile-basicapp
npm install
```

### Sync iOS Project

```bash
npm run mobile:sync:ios
```

This copies web assets to the iOS project.

---

## 4. Running the App

### Prerequisites
1. **Vite dev server** running: `npm run dev`
2. **Backend API** running (from basicapp): `npm run dev:api`

### Option A: Using npm Scripts (Recommended)

```bash
# Start dev server (in one terminal)
npm run dev

# Run on iOS Simulator (in another terminal)
npm run mobile:run:ios
```

### Option B: Using Capacitor CLI

```bash
# List available simulators
npx cap run ios --list

# Run on specific simulator
npx cap run ios --target "iPhone 15 Pro Max"
```

### Option C: Using Xcode

```bash
# Open project in Xcode
npm run mobile:ios
```

Then in Xcode:
1. Select simulator from device dropdown
2. Click **Run** (▶) button

---

## 5. Building the App

### Debug Build (Simulator)

```bash
npm run ios:build
```

**Output:** `build/bloom-mobile-app.app`

This `.app` file can be installed on any iOS Simulator.

### Release Build (Real Device / App Store)

```bash
npm run ios:release
```

**Note:** Release builds require:
- Apple Developer Program membership ($99/year)
- Provisioning profiles and certificates
- Code signing configuration in Xcode

For App Store submission, use Xcode to:
1. **Product → Archive**
2. **Distribute App → App Store Connect**

### Clean Build

```bash
npm run ios:clean
```

---

## 6. Configuration

### Capacitor Config

**File:** `capacitor.config.ts`

```typescript
const config: CapacitorConfig = {
  appId: 'com.bloom.mobilebasicapp',
  appName: 'Bloom Mobile',
  webDir: 'dist',
  server: {
    url: 'http://localhost:5173',  // Dev server URL
    cleartext: true
  }
};
```

### Platform-Specific Config

**File:** `capacitor.config.ios.ts`

```typescript
const iosConfig: CapacitorConfig = {
  ...config,
  server: {
    url: 'http://localhost:5173',  // iOS uses localhost
    cleartext: true
  }
};
```

---

## 7. Network Configuration

### Development
iOS Simulator can access `localhost` directly:
- **Dev Server:** `http://localhost:5173`
- **Backend API:** `http://localhost:3000`

### Production
Configure your production API URL in `.env`:

```bash
VITE_API_URL=https://api.yourapp.com
```

---

## 8. Troubleshooting

### Issue: Xcode not found

```
error: xcode-select: error: tool 'xcodebuild' requires Xcode
```

**Solution:**
```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

### Issue: No simulators available

```
No devices available
```

**Solution:**
1. Open Xcode → Settings → Platforms
2. Install iOS Simulator runtime
3. Or run: `xcodebuild -downloadPlatform iOS`

### Issue: App shows blank screen

**Causes:**
- Dev server not running
- Wrong server URL in config

**Solution:**
1. Ensure `npm run dev` is running
2. Check `capacitor.config.ts` has correct URL
3. Re-sync: `npm run mobile:sync:ios`

### Issue: Scrolling not working

**Solution:** Already fixed in CSS with `-webkit-overflow-scrolling: touch`

If still having issues, ensure you're clicking and dragging (not using trackpad scroll) in the Simulator.

### Issue: CocoaPods warning

```
[warn] Skipping pod install because CocoaPods is not installed
```

**Solution:** This is usually fine for basic apps. To install CocoaPods:

```bash
sudo gem install cocoapods
pod setup
```

### Issue: Build fails with signing error

```
error: Signing for "App" requires a development team
```

**Solution:**
1. Open `ios/App/App.xcworkspace` in Xcode
2. Select **App** target
3. Go to **Signing & Capabilities**
4. Select your team or enable **Automatically manage signing**

---

## 9. Useful Commands

```bash
# List all simulators
xcrun simctl list devices

# Boot a simulator
xcrun simctl boot "iPhone 15 Pro Max"

# Shutdown simulator
xcrun simctl shutdown "iPhone 15 Pro Max"

# Take screenshot
xcrun simctl io booted screenshot ~/Desktop/screenshot.png

# Install app on running simulator
xcrun simctl install booted build/bloom-mobile-app.app

# Launch app
xcrun simctl launch booted com.bloom.mobilebasicapp

# Uninstall app
xcrun simctl uninstall booted com.bloom.mobilebasicapp

# Erase all simulator data
xcrun simctl erase all
```

---

## 10. App Store Submission Checklist

- [ ] Apple Developer Program membership
- [ ] App icons (all sizes) in `ios/App/App/Assets.xcassets`
- [ ] Launch screens configured
- [ ] Bundle ID registered in App Store Connect
- [ ] Provisioning profiles created
- [ ] App signed with distribution certificate
- [ ] Screenshots for all required device sizes
- [ ] App description and metadata
- [ ] Privacy policy URL

---

## Quick Reference

| Task | Command |
|------|---------|
| Start dev server | `npm run dev` |
| Sync iOS project | `npm run mobile:sync:ios` |
| Run on simulator | `npm run mobile:run:ios` |
| Open in Xcode | `npm run mobile:ios` |
| Build debug .app | `npm run ios:build` |
| Build release | `npm run ios:release` |
| Clean builds | `npm run ios:clean` |

---

**Last Updated:** November 2024
