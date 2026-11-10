import { Redirect } from "expo-router";

/** Safety net for the Google sign-in link: never a visible screen, straight to Home. */
export default function OAuthReturn() {
  return <Redirect href="/" />;
}
