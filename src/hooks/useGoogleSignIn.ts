import Constants, { ExecutionEnvironment } from "expo-constants";
import { CryptoDigestAlgorithm, digestStringAsync, getRandomBytes } from "expo-crypto";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Platform } from "react-native";
import { authApi } from "@/api/auth";
import { api, errorMessage } from "@/api/client";
import { API_BASE_URL, GOOGLE_CLIENT_IDS } from "@/lib/env";
import { toast } from "@/lib/toast";
import { useAuthStore } from "@/store/auth";

WebBrowser.maybeCompleteAuthSession();

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// ── Native Google Sign-In (APK / store builds) ─────────────────────────────
// Android's own account sheet over the app: no browser, no redirect. The ID
// token is minted for the website's web client ID, which the backend's
// /google/one-tap already verifies. Not available in Expo Go.
type NativeModule = typeof import("@react-native-google-signin/google-signin");
let nativeMod: NativeModule | null | undefined;
const getNative = (): NativeModule | null => {
  if (nativeMod !== undefined) return nativeMod;
  nativeMod = null;
  if (isExpoGo || Platform.OS === "web" || !GOOGLE_CLIENT_IDS.web) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod: NativeModule = require("@react-native-google-signin/google-signin");
    mod.GoogleSignin.configure({ webClientId: GOOGLE_CLIENT_IDS.web, iosClientId: GOOGLE_CLIENT_IDS.ios || undefined, offlineAccess: false });
    nativeMod = mod;
  } catch {
    nativeMod = null;
  }
  return nativeMod;
};

const nativeSignIn = async (g: NativeModule): Promise<boolean> => {
  try {
    await g.GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // Always show the account chooser (students switch college/personal accounts).
    await g.GoogleSignin.signOut().catch(() => null);
    const res = await g.GoogleSignin.signIn();
    if (!g.isSuccessResponse(res)) return false; // sheet closed
    const idToken = res.data.idToken;
    if (!idToken) throw new Error("Google didn't return a sign-in token.");
    const { data } = await authApi.googleIdToken(idToken);
    await useAuthStore.getState().completeLogin(data.data);
    return true;
  } catch (err) {
    if (g.isErrorWithCode(err)) {
      if (err.code === g.statusCodes.SIGN_IN_CANCELLED || err.code === g.statusCodes.IN_PROGRESS) return false;
      if (err.code === g.statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        toast.error("Google Play services are needed for Google sign-in.");
        return false;
      }
      if (String(err.code) === "10" || /DEVELOPER_ERROR/i.test(String(err.message))) {
        // This build's signing SHA-1 isn't registered as an Android OAuth client.
        console.warn("Google sign-in DEVELOPER_ERROR: register this build's SHA-1 for in.unideals.app in Google Cloud.");
        toast.error("Google sign-in isn't set up for this build yet. Use email for now.");
        return false;
      }
    }
    toast.error(errorMessage(err, "Google sign-in failed"));
    return false;
  }
};

// ── Browser fallback (Expo Go / dev only) ──────────────────────────────────
const OAUTH_ERRORS: Record<string, string> = {
  account_suspended: "This account is suspended. Contact support.",
  account_inactive: "This account is inactive. Contact support.",
  session_mismatch: "That sign-in took too long. Please try again.",
};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const hex = (bytes: Uint8Array) => Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
const handled = new Set<string>();
let finished = false;

/** Finish from the app link (…/oauth?oauth_code=…). Returns true when the user is signed in. */
export const completeGoogleFromUrl = async (url: string): Promise<boolean> => {
  if (useAuthStore.getState().status === "authed") return true; // polling already did it
  const params = Linking.parse(url).queryParams || {};
  const err = params.oauth_error ? String(params.oauth_error) : "";
  const code = params.oauth_code ? String(params.oauth_code) : "";
  const key = code || `err:${err}`;
  if (handled.has(key) || finished) return false;
  handled.add(key);
  if (err || !code) {
    toast.error(OAUTH_ERRORS[err] || "Google sign-in didn't go through. Please try again.");
    return false;
  }
  try {
    const { data } = await authApi.googleExchange(code);
    await useAuthStore.getState().completeLogin(data.data);
    finished = true;
    return true;
  } catch (e) {
    if (useAuthStore.getState().status === "authed") return true;
    toast.error(errorMessage(e, "Google sign-in failed"));
    return false;
  }
};

/** Browser flow: PKCE-style polling while the Google tab is open. */
const browserSignIn = async (): Promise<boolean> => {
  finished = false;
  const verifier = hex(getRandomBytes(32));
  const challenge = (await digestStringAsync(CryptoDigestAlgorithm.SHA256, verifier)).toLowerCase();
  const returnTo = Linking.createURL("oauth");
  const url = `${API_BASE_URL}/api/auth/google?return_to=${encodeURIComponent(returnTo)}&challenge=${challenge}`;
  let closedAt = 0;
  WebBrowser.openAuthSessionAsync(url, returnTo, { createTask: false })
    .then(async (res) => {
      closedAt = Date.now();
      if (res.type === "success") await completeGoogleFromUrl(res.url);
    })
    .catch(() => {
      closedAt = Date.now();
    });

  const started = Date.now();
  while (!finished && Date.now() - started < 4 * 60_000 && (!closedAt || Date.now() - closedAt < 4000)) {
    await sleep(900);
    if (useAuthStore.getState().status === "authed") return true;
    try {
      const r = await api.post("/api/auth/google/poll", { verifier });
      if (r.status === 200 && r.data?.data) {
        finished = true;
        await useAuthStore.getState().completeLogin(r.data.data);
        if (Platform.OS === "ios") {
          try {
            WebBrowser.dismissAuthSession();
          } catch {
            // already closed
          }
        } else if (!isExpoGo) {
          // Our task holds the tab (createTask: false): opening our own link
          // brings the app back over it. Skipped in Expo Go, where opening an
          // exp:// link restarts the project.
          Linking.openURL(Linking.createURL("/")).catch(() => {});
        }
        return true;
      }
    } catch (err) {
      if ((err as { response?: { status?: number } })?.response?.status === 403) {
        toast.error(errorMessage(err, "This account can't sign in right now."));
        return false;
      }
    }
  }
  return useAuthStore.getState().status === "authed";
};

/**
 * "Continue with Google". Real builds (APK): the native Google account
 * sheet. Expo Go: browser flow (if Android keeps the tab open after you
 * pick an account, close it: you're already signed in).
 */
export const useGoogleSignIn = (onDone?: () => void) => {
  const [busy, setBusy] = useState(false);
  const signIn = async () => {
    if (busy) return;
    if (Platform.OS === "web") {
      toast("Google sign-in works in the phone app.");
      return;
    }
    setBusy(true);
    try {
      const g = getNative();
      const ok = g ? await nativeSignIn(g) : await browserSignIn();
      if (ok) onDone?.();
    } catch (err) {
      toast.error(errorMessage(err, "Google sign-in failed"));
    } finally {
      setBusy(false);
    }
  };
  return { signIn, busy, ready: true };
};
