import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { authApi } from "@/api/auth";
import { errorMessage } from "@/api/client";
import { GOOGLE_CLIENT_IDS } from "@/lib/env";
import { toast } from "@/lib/toast";
import { useAuthStore } from "@/store/auth";

WebBrowser.maybeCompleteAuthSession();

/** True when this platform has the OAuth client ID Google sign-in needs. */
export const googleConfigured = () =>
  Boolean(Platform.OS === "ios" ? GOOGLE_CLIENT_IDS.ios : Platform.OS === "android" ? GOOGLE_CLIENT_IDS.android : GOOGLE_CLIENT_IDS.web);

/**
 * Google sign-in → ID token → POST /api/auth/google/one-tap (the same
 * endpoint the website's One Tap uses). The backend verifies the token
 * against GOOGLE_CLIENT_ID + GOOGLE_MOBILE_CLIENT_IDS.
 * Needs a development/production build (Google blocks Expo Go redirects).
 *
 * Only call from a component that is mounted when googleConfigured() is
 * true: expo-auth-session throws during render if the platform ID is missing.
 */
export const useGoogleSignIn = (onDone?: () => void) => {
  const completeLogin = useAuthStore((s) => s.completeLogin);
  const [busy, setBusy] = useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: GOOGLE_CLIENT_IDS.web || undefined,
    androidClientId: GOOGLE_CLIENT_IDS.android || undefined,
    iosClientId: GOOGLE_CLIENT_IDS.ios || undefined,
    selectAccount: true,
  });

  useEffect(() => {
    if (response?.type !== "success") {
      if (response?.type === "error") toast.error("Google sign-in failed. Please try again.");
      return;
    }
    const idToken = response.params?.id_token || response.authentication?.idToken;
    if (!idToken) {
      toast.error("Google didn't return a sign-in token.");
      return;
    }
    (async () => {
      setBusy(true);
      try {
        const { data } = await authApi.googleIdToken(idToken);
        await completeLogin(data.data);
        onDone?.();
      } catch (err) {
        toast.error(errorMessage(err, "Google sign-in failed"));
      } finally {
        setBusy(false);
      }
    })();
  }, [response, completeLogin, onDone]);

  return { busy, ready: Boolean(request), signIn: () => promptAsync() };
};
