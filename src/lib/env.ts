// Expo inlines EXPO_PUBLIC_* at build time. Everything here is public.
const strip = (v?: string) => String(v || "").trim().replace(/\/+$/, "");

export const API_BASE_URL = strip(process.env.EXPO_PUBLIC_API_BASE_URL);
export const WEB_URL = strip(process.env.EXPO_PUBLIC_WEB_URL) || "https://app.unideals.in";
export const IMAGEKIT_PUBLIC_KEY = String(process.env.EXPO_PUBLIC_IMAGEKIT_PUBLIC_KEY || "").trim();
export const DEFAULT_CAMPUS_SLUG =
  String(process.env.EXPO_PUBLIC_DEFAULT_CAMPUS_SLUG || "").trim() || "vit-vellore";

export const GOOGLE_CLIENT_IDS = {
  web: String(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "").trim(),
  android: String(process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || "").trim(),
  ios: String(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || "").trim(),
};

if (!API_BASE_URL) {
  console.warn("EXPO_PUBLIC_API_BASE_URL is not set: copy .env.sample to .env and restart Expo.");
}
