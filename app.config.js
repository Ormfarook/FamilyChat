// app.config.js — JS form of app.json (no behavioural difference right now).
// The dev-server URL is NOT injected here — use the EXPO_PUBLIC_SERVER_URL
// env var instead (Metro inlines EXPO_PUBLIC_* vars into the bundle at build
// time, which is what we actually want). See src/state/ServerContext.tsx.

module.exports = ({ config }) => ({
  ...config,
  name: 'firebaseChat',
  slug: 'firebaseChat',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'firebasechat',
  userInterfaceStyle: 'automatic',
  ios: {
    icon: './assets/expo.icon',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#208AEF',
        android: {
          image: './assets/images/splash-icon.png',
          imageWidth: 76,
        },
      },
    ],
    'expo-secure-store',
  ],
  experiments: {
    typedRoutes: true,
  },
});
