import { completeGoogleFromUrl } from "@/hooks/useGoogleSignIn";
import { finishAuth } from "@/lib/authPrompt";

/**
 * Rewrites incoming app links before routing. The Google sign-in return
 * link (…/oauth?oauth_code=…) never shows a screen: the sign-in finishes in
 * the background and the app lands straight on Home, whether it was
 * already running or just launched.
 */
export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  try {
    const isOAuth = /(^|\/)oauth(\/|\?|$)/.test(path) || /[?&]oauth_(code|error)=/.test(path);
    if (!isOAuth) return path;
    const q = path.indexOf("?");
    if (q >= 0) {
      completeGoogleFromUrl(`unideals://oauth${path.slice(q)}`)
        .then((ok) => {
          if (ok) setTimeout(() => finishAuth(), 0);
        })
        .catch(() => {});
    }
    return "/";
  } catch {
    return "/";
  }
}
