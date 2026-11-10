import { Button } from "@/components/ui";
import { googleConfigured, useGoogleSignIn } from "@/hooks/useGoogleSignIn";
import { OrDivider } from "./AuthShell";

function GoogleButtonInner({ title, onDone }: { title: string; onDone?: () => void }) {
  const google = useGoogleSignIn(onDone);
  return (
    <>
      <OrDivider />
      <Button kind="secondary" icon="logo-google" title={title} onPress={google.signIn} disabled={!google.ready} loading={google.busy} size="lg" />
    </>
  );
}

/** Renders nothing until Google client IDs are configured for this platform. */
export function GoogleButton(props: { title: string; onDone?: () => void }) {
  if (!googleConfigured()) return null;
  return <GoogleButtonInner {...props} />;
}
