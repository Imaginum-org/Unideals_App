import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Session tokens. The 7-day refresh token lives in the OS keychain /
// keystore (expo-secure-store); the 15-minute access token is kept in
// memory and re-minted from the refresh token on cold start.
const REFRESH_KEY = "unideals.refreshToken";

// SecureStore has no web implementation. The app does not ship to the web;
// the web build exists for local development/testing only, where the token
// falls back to localStorage.
const store = {
  get: (k: string) => (Platform.OS === "web" ? Promise.resolve(globalThis.localStorage?.getItem(k) ?? null) : SecureStore.getItemAsync(k)),
  set: (k: string, v: string) => (Platform.OS === "web" ? Promise.resolve(globalThis.localStorage?.setItem(k, v)) : SecureStore.setItemAsync(k, v)),
  del: (k: string) => (Platform.OS === "web" ? Promise.resolve(globalThis.localStorage?.removeItem(k)) : SecureStore.deleteItemAsync(k)),
};

let accessToken: string | null = null;
let refreshToken: string | null = null;
let loaded = false;

export const getAccessToken = () => accessToken;

export const loadRefreshToken = async () => {
  if (!loaded) {
    try {
      refreshToken = await store.get(REFRESH_KEY);
    } catch {
      refreshToken = null;
    }
    loaded = true;
  }
  return refreshToken;
};

export const setTokens = async (next: { accessToken?: string; refreshToken?: string }) => {
  if (next.accessToken) accessToken = next.accessToken;
  if (next.refreshToken && next.refreshToken !== refreshToken) {
    refreshToken = next.refreshToken;
    loaded = true;
    try {
      await store.set(REFRESH_KEY, next.refreshToken);
    } catch {
      // Keychain unavailable: session still works until the app is killed.
    }
  }
};

export const clearTokens = async () => {
  accessToken = null;
  refreshToken = null;
  loaded = true;
  try {
    await store.del(REFRESH_KEY);
  } catch {
    // ignore
  }
};

/** Seconds until the access token expires (JWT exp), or 0 if unknown/expired. */
export const accessTokenTtl = () => {
  if (!accessToken) return 0;
  try {
    const payload = accessToken.split(".")[1];
    const json = JSON.parse(base64UrlDecode(payload));
    return Math.max(0, Number(json.exp || 0) - Math.floor(Date.now() / 1000));
  } catch {
    return 0;
  }
};

const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function base64UrlDecode(input: string) {
  const s = input.replace(/-/g, "+").replace(/_/g, "/");
  let out = "";
  let buffer = 0;
  let bits = 0;
  for (const ch of s) {
    if (ch === "=") break;
    const val = B64.indexOf(ch);
    if (val < 0) continue;
    buffer = (buffer << 6) | val;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }
  return out;
}
