import type { ConfigContext, ExpoConfig } from "expo/config";

// Unideals mobile app — Expo client for the SAME backend as the website
// (E:\Unideals\backend, Express + MongoDB + Socket.io on Render).
// All runtime config comes from EXPO_PUBLIC_* env vars (see .env.sample).
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Unideals",
  slug: "unideals-app",
  owner: "imaginums-projs",
  version: "1.0.0",
  orientation: "portrait",
  scheme: "unideals",
  userInterfaceStyle: "automatic",
  // Website favicon (frontend/public/fav.svg) rendered at 1024px.
  icon: "./assets/icon.png",
  ios: {
    supportsTablet: false,
    bundleIdentifier: "in.unideals.app",
    infoPlist: {
      NSPhotoLibraryUsageDescription: "Unideals needs photo access so you can add pictures to your listings.",
      NSCameraUsageDescription: "Unideals needs camera access so you can photograph items you sell.",
    },
  },
  android: {
    package: "in.unideals.app",
    adaptiveIcon: { foregroundImage: "./assets/adaptive-icon.png", backgroundColor: "#3038FC" },
  },
  web: { favicon: "./assets/favicon.png" },
  plugins: [
    "expo-router",
    // Native splash = the same brand blue the animated intro starts on, so
    // launch → intro → app has no white flash.
    ["expo-splash-screen", { backgroundColor: "#3838EC", dark: { backgroundColor: "#3838EC" } }],
    "expo-secure-store",
    "expo-web-browser",
    [
      "expo-image-picker",
      {
        photosPermission: "Unideals needs photo access so you can add pictures to your listings.",
        cameraPermission: "Unideals needs camera access so you can photograph items you sell.",
      },
    ],
    "@react-native-community/datetimepicker",
    // Edge-to-edge: content runs under transparent system bars. Without this,
    // Android paints a white contrast scrim behind 3-button navigation.
    ["expo-navigation-bar", { enforceContrast: false }],
  ],
  extra: {
    eas: { "projectId": "7c9b74d3-7714-4877-9e33-89bf35b563b6" },
  },
});
