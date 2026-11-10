import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { authApi } from "@/api/auth";
import { errorMessage } from "@/api/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button, Input, Loader } from "@/components/ui";
import { toast } from "@/lib/toast";
import { passwordChecks } from "@/utils/format";

export default function ResetPassword() {
  const { token = "" } = useLocalSearchParams<{ token: string }>();
  const [valid, setValid] = useState<boolean | null>(null);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authApi
      .checkResetToken(token)
      .then(() => setValid(true))
      .catch(() => setValid(false));
  }, [token]);

  const submit = async () => {
    if (passwordChecks(pw).filter((x) => x.ok).length < 4) return setError("Use a stronger password (8+ chars with upper, lower, number or symbol).");
    if (pw !== pw2) return setError("Passwords don't match");
    setError("");
    setLoading(true);
    try {
      await authApi.resetPassword(token, pw);
      toast.success("Password updated. Log in with your new password.");
      router.replace("/login");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (valid === null) return <Loader />;
  if (!valid)
    return (
      <AuthShell title="Link expired" subtitle="This password reset link is invalid or has expired.">
        <Button title="Request a new link" onPress={() => router.replace("/forgot-password")} />
      </AuthShell>
    );
  return (
    <AuthShell title="Choose a new password" subtitle="You'll be signed out on other devices.">
      <Input label="New password" secure value={pw} onChangeText={setPw} autoComplete="new-password" maxLength={72} />
      <Input label="Confirm password" secure value={pw2} onChangeText={setPw2} error={error} maxLength={72} />
      <Button title="Update password" onPress={submit} loading={loading} size="lg" />
    </AuthShell>
  );
}
