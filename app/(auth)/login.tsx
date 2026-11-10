import { Link, router, useLocalSearchParams } from "expo-router";
import { finishAuth } from "@/lib/authPrompt";
import { useState } from "react";
import { Text } from "react-native";
import type { AxiosError } from "axios";
import { authApi } from "@/api/auth";
import { errorMessage } from "@/api/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Button, Card, Input, T } from "@/components/ui";
import { useAuthStore } from "@/store/auth";
import { font, useTheme } from "@/theme";

export default function Login() {
  const { next } = useLocalSearchParams<{ next?: string }>();
  const done = () => finishAuth(next);
  const { c } = useTheme();
  const completeLogin = useAuthStore((s) => s.completeLogin);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const e: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) e.email = "Enter a valid email";
    if (!password) e.password = "Enter your password";
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    try {
      const { data } = await authApi.login(email.trim().toLowerCase(), password);
      await completeLogin(data.data);
      done();
    } catch (err) {
      const body = (err as AxiosError<{ requiresVerification?: boolean }>).response?.data;
      if (body?.requiresVerification) {
        router.push({ pathname: "/check-email", params: { email: email.trim().toLowerCase() } });
        return;
      }
      setErrors({ form: errorMessage(err, "Login failed") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to chat with sellers, save items and list your own."
      footer={
        <T variant="small" muted>
          New to Unideals?{" "}
          <Link href="/signup" replace>
            <Text style={{ color: c.accentText, ...font.semibold }}>Create an account</Text>
          </Link>
        </T>
      }
    >
      {errors.form ? (
        <Card style={{ backgroundColor: c.dangerSoft, borderColor: "transparent", marginBottom: 14 }}>
          <T variant="small" color={c.danger}>
            {errors.form}
          </T>
        </Card>
      ) : null}
      <Input
        label="College email"
        icon="mail-outline"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        error={errors.email}
        placeholder="you@college.edu"
      />
      <Input
        label="Password"
        icon="lock-closed-outline"
        value={password}
        onChangeText={setPassword}
        secure
        autoComplete="current-password"
        textContentType="password"
        error={errors.password}
        onSubmitEditing={submit}
        returnKeyType="go"
      />
      <Link href="/forgot-password" style={{ alignSelf: "flex-end", marginTop: -4, marginBottom: 18 }}>
        <Text style={{ color: c.accentText, fontSize: 13.5, ...font.semibold }}>Forgot password?</Text>
      </Link>
      <Button title="Log in" onPress={submit} loading={loading} size="lg" />
      <GoogleButton title="Continue with Google" onDone={done} />
    </AuthShell>
  );
}
