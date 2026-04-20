import type { CapacitorConfig } from "@capacitor/cli";

// Capacitor configuration for packaging Flow as an Android/iOS app.
// To build an APK locally:
//   1. npm install
//   2. npm install -D @capacitor/cli && npm install @capacitor/core @capacitor/android
//   3. npm run build
//   4. npx cap add android
//   5. npx cap sync android
//   6. npx cap open android   (then Build > Build APK in Android Studio)
const config: CapacitorConfig = {
  appId: "app.lovable.7654d2fc168e4e1c96fc8ecbc8d6eec6",
  appName: "Flow",
  webDir: "dist",
  bundledWebRuntime: false,
  android: {
    backgroundColor: "#0f0f0f",
  },
  ios: {
    backgroundColor: "#0f0f0f",
  },
};

export default config;
