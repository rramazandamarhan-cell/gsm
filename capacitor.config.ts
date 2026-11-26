// Capacitor Native Wrapper Configuration for Google Play (.aab) & Apple App Store (.ipa)
// See MOBILE_RELEASE_GUIDE.md for exact build & AdMob setup commands.

const config = {
  appId: 'com.esnafgsm.simulator',
  appName: 'GSM Simulator',
  webDir: 'dist',
  bundledWebRuntime: false,
  backgroundColor: '#0F141B',
  server: {
    androidScheme: 'https',
    iosScheme: 'capacitor',
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    backgroundColor: '#0F141B',
  },
  ios: {
    contentInset: 'never',
    preferredContentMode: 'mobile',
    backgroundColor: '#0F141B',
    allowsLinkPreview: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1600,
      launchAutoHide: true,
      launchFadeOutDuration: 300,
      backgroundColor: '#0F141B',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      overlaysWebView: false,
      style: 'DARK',
      backgroundColor: '#0F141B',
    },
    Keyboard: {
      resize: 'none',
      style: 'DARK',
    },
  },
};

export default config;
