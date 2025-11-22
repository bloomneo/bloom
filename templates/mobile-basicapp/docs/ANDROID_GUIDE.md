# Android Development Guide

Complete guide for developing, testing, and building the Helix Mobile app for Android.

---

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| **Java JDK** | 17 | Android build system |
| **Android Studio** | Latest | Android SDK and Emulator |
| **Node.js** | 18+ | JavaScript runtime |
| **npm** | 9+ | Package manager |

### Check Your Setup

```bash
# Check Java version (must be 17)
java -version

# Check JAVA_HOME
echo $JAVA_HOME

# Check Node.js
node --version

# Check npm
npm --version
```

---

## 1. Install Java JDK 17

**Important:** Android/Capacitor requires Java 17 (not 21 or higher).

### macOS

```bash
# Using Homebrew
brew install openjdk@17

# Set JAVA_HOME (add to ~/.zshrc or ~/.bash_profile)
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH="$JAVA_HOME/bin:$PATH"

# Reload shell
source ~/.zshrc
```

### Windows

1. Download from https://adoptium.net/temurin/releases/?version=17
2. Run installer
3. Set environment variables:
   - `JAVA_HOME` = `C:\Program Files\Eclipse Adoptium\jdk-17.x.x`
   - Add `%JAVA_HOME%\bin` to `PATH`

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install openjdk-17-jdk

# Set JAVA_HOME (add to ~/.bashrc)
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH="$JAVA_HOME/bin:$PATH"
```

### Verify Installation

```bash
java -version
# Should show: openjdk version "17.x.x"
```

---

## 2. Install Android Studio

### Download
1. Go to https://developer.android.com/studio
2. Download Android Studio
3. Run installer

### First Launch Setup
1. Open Android Studio
2. Select **Standard** installation
3. Wait for SDK download

### Required SDK Components

Go to **Android Studio → Settings → Languages & Frameworks → Android SDK**

**SDK Platforms tab:**
- [x] Android 14 (API 34) or Android 15 (API 35)

**SDK Tools tab:**
- [x] Android SDK Build-Tools
- [x] Android SDK Command-line Tools
- [x] Android Emulator
- [x] Android SDK Platform-Tools

### Set Environment Variables

Add to `~/.zshrc` (macOS) or `~/.bashrc` (Linux):

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
# export ANDROID_HOME=$HOME/Android/Sdk        # Linux
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
```

Reload: `source ~/.zshrc`

---

## 3. Create Android Emulator

### Via Android Studio (Recommended)

1. Open **Android Studio**
2. Go to **Tools → Device Manager**
3. Click **Create Device**
4. Select **Pixel 8** (or any phone)
5. Select **API 35** (or latest)
6. Click **Finish**

### Via Command Line

```bash
# List available system images
sdkmanager --list | grep system-images

# Download system image
sdkmanager "system-images;android-35;google_apis;arm64-v8a"

# Create emulator
avdmanager create avd -n Pixel_8_API_35 -k "system-images;android-35;google_apis;arm64-v8a" -d "pixel_8"

# List emulators
emulator -list-avds

# Start emulator
emulator -avd Pixel_8_API_35
```

---

## 4. Project Setup

### Install Dependencies

```bash
cd mobile-basicapp
npm install
```

### Sync Android Project

```bash
npm run mobile:sync:android
```

This:
1. Copies web assets to Android project
2. Patches config for Android emulator (10.0.2.2)

---

## 5. Running the App

### Prerequisites
1. **Emulator running** (or device connected)
2. **Vite dev server** running: `npm run dev`
3. **Backend API** running (from basicapp): `npm run dev:api`

### Option A: Using npm Scripts (Recommended)

```bash
# Start emulator (in one terminal)
emulator -avd Pixel_8_API_35

# Start dev server (in another terminal)
npm run dev

# Run on Android (in another terminal)
npm run mobile:run:android
```

### Option B: Using Capacitor CLI

```bash
# List available devices/emulators
npx cap run android --list

# Run on specific target
npx cap run android --target Pixel_8_API_35
```

### Option C: Using Android Studio

```bash
# Open project in Android Studio
npm run mobile:android
```

Then click **Run** (▶) button.

---

## 6. Building the App

### Debug Build (APK)

```bash
npm run android:build
```

**Output:** `build/helix-mobile-app.apk`

### Release Build (Signed APK)

```bash
npm run android:release
```

**Note:** Release builds require keystore configuration (see below).

### Clean Build

```bash
npm run android:clean
```

### Install APK on Device

```bash
npm run android:install
# or
adb install build/helix-mobile-app.apk
```

---

## 7. Release Build Configuration

### Create Keystore

```bash
keytool -genkey -v -keystore helix-release.keystore -alias helix -keyalg RSA -keysize 2048 -validity 10000
```

### Configure Signing

Edit `android/app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            storeFile file('helix-release.keystore')
            storePassword 'your-store-password'
            keyAlias 'helix'
            keyPassword 'your-key-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

**Security:** Don't commit passwords! Use environment variables or `local.properties`.

---

## 8. Network Configuration

### Development

Android Emulator uses special IP `10.0.2.2` to access host machine:
- **Dev Server:** `http://10.0.2.2:5173`
- **Backend API:** `http://10.0.2.2:3000`

The `mobile:sync:android` script automatically patches this.

### Production

Configure your production API URL in `.env`:

```bash
VITE_API_URL=https://api.yourapp.com
```

### Cleartext Traffic (HTTP)

For development, HTTP is enabled in `android/app/src/main/AndroidManifest.xml`:

```xml
<application android:usesCleartextTraffic="true" ...>
```

**Remove for production** when using HTTPS.

---

## 9. Troubleshooting

### Issue: Java version error

```
error: invalid source release: 21
```

**Cause:** Wrong Java version installed.

**Solution:**
```bash
# Check version
java -version

# Install Java 17
brew install openjdk@17

# Set JAVA_HOME
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```

### Issue: ANDROID_HOME not set

```
error: ANDROID_HOME not set
```

**Solution:**
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Issue: No emulators found

```
No devices available
```

**Solution:**
1. Create emulator in Android Studio → Device Manager
2. Or start existing: `emulator -avd Pixel_8_API_35`

### Issue: Emulator starts but app not installed

**Solution:**
```bash
# Check ADB sees the emulator
adb devices

# Should show:
# emulator-5554   device

# Reinstall
npm run mobile:run:android
```

### Issue: Backend not connecting

```
Backend Status: Disconnected
```

**Causes:**
1. Backend not running
2. Wrong IP (should be 10.0.2.2 for emulator)
3. Cleartext traffic not enabled

**Solution:**
```bash
# Ensure backend is running on 0.0.0.0
cd basicapp && npm run dev:api

# Test from emulator
adb shell curl http://10.0.2.2:3000/health

# Re-sync Android project
npm run mobile:sync:android
```

### Issue: Gradle build fails

```
Could not determine the dependencies of task ':app:compileDebugJavaWithJavac'
```

**Solution:**
```bash
# Clean Gradle cache
cd android && ./gradlew clean && cd ..

# Rebuild
npm run android:build
```

### Issue: Emulator too slow

**Solutions:**
1. Enable **Hardware Acceleration** in Android Studio → SDK Manager → SDK Tools
2. Use **x86_64** system image instead of ARM
3. Allocate more RAM to emulator (Device Manager → Edit → Show Advanced Settings)

---

## 10. Useful Commands

```bash
# List connected devices
adb devices

# Install APK
adb install path/to/app.apk

# Uninstall app
adb uninstall com.helix.mobilebasicapp

# View logs
adb logcat | grep -i helix

# Clear app data
adb shell pm clear com.helix.mobilebasicapp

# Take screenshot
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png ~/Desktop/

# Start emulator
emulator -avd Pixel_8_API_35

# Kill emulator
adb -s emulator-5554 emu kill

# List installed packages
adb shell pm list packages | grep helix
```

---

## 11. Google Play Store Checklist

- [ ] Signed release APK or AAB (Android App Bundle)
- [ ] App icons (all densities) in `android/app/src/main/res`
- [ ] Package name registered in Google Play Console
- [ ] Keystore safely backed up (lose it = can't update app)
- [ ] Screenshots for various device sizes
- [ ] Feature graphic (1024x500)
- [ ] App description and metadata
- [ ] Privacy policy URL
- [ ] Content rating questionnaire completed

### Build AAB for Play Store

```bash
cd android && ./gradlew bundleRelease && cd ..
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Start dev server | `npm run dev` |
| Sync Android project | `npm run mobile:sync:android` |
| Run on emulator | `npm run mobile:run:android` |
| Open in Android Studio | `npm run mobile:android` |
| Build debug APK | `npm run android:build` |
| Build release APK | `npm run android:release` |
| Clean builds | `npm run android:clean` |
| Install APK | `npm run android:install` |

---

**Last Updated:** November 2024
