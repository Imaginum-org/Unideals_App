import { ExpoConfig, ConfigContext } from "expo/config";

// Unideals App — single Expo client for the shared backend at api.unideals.in
// Backend source of truth: Unideals/backend (Express 5 + MongoDB + Socket.io)
// See session-ses_eca1.md § Phase 1 + PROJECT_STRUCTURE.md for API contract.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Unideals",
  slug: "unideals-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "unideals",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "in.unideals.app",
    infoPlist: {
      NSPhotoLibraryUsageDescription: "Unideals needs photo access to list products.",
      NSCameraUsageDescription: "Unideals needs camera access to capture product photos."
    }
  },
  android: {
    package: "in.unideals.app",
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    intentFilters: [
      {
        action: "VIEW",
        data: [{ scheme: "unideals" }],
        category: ["BROWSABLE", "DEFAULT"]
      }
    ],
    permissions: ["NOTIFICATIONS"]
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    [
      "expo-image-picker",
      { photosPermission: "Unideals needs photo access to list products." }
    ],
    [
      "expo-notifications",
      { icon: "./assets/images/notification-icon.png", color: "#ffffff" }
    ]
  ],
  experiments: { typedRoutes: true },
  extra: {
    router: {},
    eas: { projectId: "YOUR_EAS_PROJECT_ID" }
  }
});
