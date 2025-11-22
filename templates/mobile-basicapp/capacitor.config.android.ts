import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.helix.mobilebasicapp',
  appName: 'Helix Mobile',
  webDir: 'dist',
  server: {
    // Android emulator uses 10.0.2.2 to access host machine's localhost
    url: 'http://10.0.2.2:5173',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: '#ffffff',
      showSpinner: false,
    },
    StatusBar: {
      style: 'default',
      backgroundColor: '#ffffff',
    },
    Keyboard: {
      resize: 'native',
      style: 'light',
    },
  },
};

export default config;
