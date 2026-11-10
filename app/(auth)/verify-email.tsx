import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { authApi } from "@/api/auth";
import { errorMessage } from "@/api/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button, Loader } from "@/components/ui";

// Handles unideals://verify-email?code=… deep links (same contract as the
// website's /verify-email?code=… page).
export default function VerifyEmail() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const [state, setState] = useState<"working" | "ok" | "fail">("working");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!code) {
      setState("fail");
      setMsg("This verification link is incomplete.");
      return;
    }
    authApi
      .verifyEmail(code)
      .then(() => setState("ok"))
      .catch((err) => {
        setState("fail");
        setMsg(errorMessage(err, "Invalid or expired verification link"));
      });
  }, [code]);

  if (state === "working") return <Loader label="Verifying your email…" />;
  return state === "ok" ? (
    <AuthShell title="Email verified. You're in." subtitle="You're all set. Log in to continue.">
      <Button title="Log in" size="lg" onPress={() => router.replace("/login")} />
    </AuthShell>
  ) : (
    <AuthShell title="Link didn't work" subtitle={msg}>
      <Button title="Back to log in" onPress={() => router.replace("/login")} />
    </AuthShell>
  );
}
