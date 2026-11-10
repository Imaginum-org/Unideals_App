import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Platform } from "react-native";
import { authApi } from "@/api/auth";
import { errorMessage } from "@/api/client";
import { API_BASE_URL } from "@/lib/env";
import { toast } from "@/lib/toast";
import { useAuthStore } from "@/store/auth";

WebBrowser.maybeCompleteAuthSession();

const OAUTH_ERRORS: Record<string, string> = {
  account_suspended: "This account is suspended. Contact support.",
  account_inactive: "This account is inactive. Contact support.",
  session_mismatch: "That sign-in took too long. Please try again.",
};

// One-time codes are single use: whichever path sees the link first
// (the auth-session promise or the /oauth route) handles it.
const handled = new Set<string>();

/** Finish Google sign-in from the app link the backend sends back. Returns true when signed in. */
export const completeGoogleFromUrl = async (url: string): Promise<boolean> => {
  const params = Linking.parse(url).queryParams || {};
  const err = params.oauth_error ? String(params.oauth_error) : "";
  const code = params.oauth_code ? String(params.oauth_code) : "";
  const key = code || `err:${err}:${url}`;
  if (handled.has(key)) return false;
  handled.add(key);
  if (err || !code) {
    toast.error(OAUTH_ERRORS[err] || "Google sign-in didn't go through. Please try again.");
    return false;
  }
  try {
    const { data } = await authApi.googleExchange(code);
    await useAuthStore.getState().completeLogin(data.data);
    return true;
  } catch (e) {
    toast.error(errorMessage(e, "Google sign-in failed"));
    return false;
  }
};

/**
 * Google sign-in through the backend's own OAuth flow (same Google client
 * as the website): open /api/auth/google in an in-app browser with
 * return_to = this app's link, get a one-time code back, exchange it for a
 * mobile session. Works in Expo Go and in the APK.
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
    const returnTo = Linking.createURL("oauth");
    // Backup listener: some Android browsers deliver the link to the app
    // without resolving the auth session.
    let viaLink: string | null = null;
    const sub = Linking.addEventListener("url", ({ url }) => {
      if (url.startsWith(returnTo)) {
        viaLink = url;
        WebBrowser.dismissBrowser();
      }
    });
    try {
      const res = await WebBrowser.openAuthSessionAsync(`${API_BASE_URL}/api/auth/google?return_to=${encodeURIComponent(returnTo)}`, returnTo);
      const url = res.type === "success" ? res.url : viaLink;
      if (url && (await completeGoogleFromUrl(url))) onDone?.();
    } catch (err) {
      toast.error(errorMessage(err, "Google sign-in failed"));
    } finally {
      sub.remove();
      setBusy(false);
    }
  };

  return { signIn, busy, ready: true };
};
