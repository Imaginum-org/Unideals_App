import { router } from "expo-router";
import { useState } from "react";
import { authApi } from "@/api/auth";
import { errorMessage } from "@/api/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button, Card, Input, T } from "@/components/ui";
import { useTheme } from "@/theme";

export default function ForgotPassword() {
  const { c } = useTheme();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Enter a valid email");
    setError("");
    setLoading(true);
    try {
      const { data } = await authApi.forgotPassword(email.trim().toLowerCase());
      setSent(data.message || "If an account exists for this email, a reset link has been sent.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Reset your password" subtitle="Enter your account email and we'll send you a reset link (valid for 15 minutes).">
      {sent ? (
        <>
          <Card style={{ backgroundColor: c.successSoft, borderColor: "transparent", marginBottom: 18 }}>
            <T variant="small" color={c.success}>
              {sent}
            </T>
          </Card>
          <Button title="Back to log in" onPress={() => router.replace("/login")} />
        </>
      ) : (
        <>
          <Input label="Email" icon="mail-outline" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" error={error} onSubmitEditing={submit} />
          <Button title="Send reset link" onPress={submit} loading={loading} size="lg" />
        </>
      )}
    </AuthShell>
  );
}
