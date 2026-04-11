import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bloom.mobilebasicapp',
  appName: 'Bloom Mobile',
  webDir: 'dist',
  server: {
    // iOS simulator uses localhost directly
    url: 'http://localhost:5173',
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
