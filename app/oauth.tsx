import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { Loader } from "@/components/ui";
import { completeGoogleFromUrl } from "@/hooks/useGoogleSignIn";
import { finishAuth } from "@/lib/authPrompt";

/**
 * Landing route for the Google sign-in link (unideals://oauth?oauth_code=…).
 * Normally the in-app browser hands the code to useGoogleSignIn; if the OS
 * opened this route instead (or the app was cold-started from the link),
 * finish the sign-in here.
 */
export default function OAuthReturn() {
  const { oauth_code, oauth_error } = useLocalSearchParams<{ oauth_code?: string; oauth_error?: string }>();
  useEffect(() => {
    let alive = true;
    const qs = oauth_code ? `oauth_code=${encodeURIComponent(oauth_code)}` : oauth_error ? `oauth_error=${encodeURIComponent(oauth_error)}` : "";
    (async () => {
      const ok = qs ? await completeGoogleFromUrl(`unideals://oauth?${qs}`) : false;
      if (!alive) return;
      if (ok) finishAuth();
      else if (router.canGoBack()) router.back();
      else router.replace("/");
    })();
    return () => {
      alive = false;
    };
  }, [oauth_code, oauth_error]);
  return <Loader label="Signing you in…" />;
}
