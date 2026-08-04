import type { ExpoConfig, ConfigContext } from "expo/config";

const apiBaseUrl = process.env.API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error(
    "API_BASE_URL is not set. Local dev: add it to a .env file (see .env.example). " +
      "EAS builds: set it in the build profile's `env` in eas.json."
  );
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Order Management",
  slug: "coremindaimobile",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  ios: {
    ...config.ios,
    supportsTablet: true,
    bundleIdentifier: "com.nilamburfurniture.ordermanagement",
  },
  android: {
    ...config.android,
    package: "com.nilamburfurniture.ordermanagement",
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png",
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    "expo-secure-store",
    "expo-notifications",
    "expo-font",
    "expo-splash-screen",
    [
      "expo-image-picker",
      {
        photosPermission:
          "Allow $(PRODUCT_NAME) to access your photos to attach images to orders and production steps.",
        cameraPermission:
          "Allow $(PRODUCT_NAME) to use the camera to capture photos for orders and production steps.",
      },
    ],
  ],
  extra: {
    ...config.extra,
    apiBaseUrl,
    eas: {
      projectId: "41c8ed32-ceee-4f43-aee6-e5cf9667a49e",
    },
  },
});
