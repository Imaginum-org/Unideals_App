import { Icon } from "@/components/ui/Icon";
import { Link, router } from "expo-router";
import { finishAuth } from "@/lib/authPrompt";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { authApi } from "@/api/auth";
import { errorMessage } from "@/api/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Button, Card, Input, T } from "@/components/ui";
import { font, useTheme } from "@/theme";
import { passwordChecks } from "@/utils/format";

const goHome = () => finishAuth();

export default function Signup() {
  const { c } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const checks = passwordChecks(password);
  const met = checks.filter((x) => x.ok).length;
  // Same bar as the website: "good" (4/5) or "strong" (5/5).
  const strongEnough = met >= 4;
  const strength = !password ? null : met <= 2 ? ["Weak", c.danger] : met === 3 ? ["Fair", c.gold] : met === 4 ? ["Good", "#0EA5E9"] : ["Strong", c.success];

  const submit = async () => {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = "Enter your name";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) e.email = "Enter a valid email";
    if (!strongEnough) e.password = "Use a stronger password (meet at least 4 of the checks)";
    if (password.length > 72) e.password = "Password must be at most 72 characters";
    if (!agree) e.agree = "Please accept the Terms and Privacy Policy";
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    try {
      await authApi.register({ name: name.trim(), email: email.trim().toLowerCase(), password });
      router.replace({ pathname: "/check-email", params: { email: email.trim().toLowerCase() } });
    } catch (err) {
      setErrors({ form: errorMessage(err, "Couldn't create your account") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join your campus marketplace in under a minute."
      footer={
        <T variant="small" muted>
          Already have an account?{" "}
          <Link href="/login" replace>
            <Text style={{ color: c.accentText, ...font.semibold }}>Log in</Text>
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
      <Input label="Full name" icon="person-outline" value={name} onChangeText={setName} autoComplete="name" error={errors.name} maxLength={100} />
      <Input
        label="College email"
        icon="mail-outline"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        error={errors.email}
      />
      <Input label="Password" icon="lock-closed-outline" value={password} onChangeText={setPassword} secure autoComplete="new-password" error={errors.password} maxLength={72} />
      {password ? (
        <View style={{ marginTop: -6, marginBottom: 14, gap: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: c.surfaceAlt }}>
              <View style={{ width: `${(met / 5) * 100}%`, height: 5, borderRadius: 3, backgroundColor: strength?.[1] }} />
            </View>
            <Text style={{ color: strength?.[1], fontSize: 12, ...font.bold }}>{strength?.[0]}</Text>
          </View>
          {checks.map((ch) => (
            <View key={ch.label} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Icon name={ch.ok ? "checkmark-circle" : "ellipse-outline"} size={14} color={ch.ok ? c.success : c.textFaint} />
              <T variant="caption" muted>
                {ch.label}
              </T>
            </View>
          ))}
        </View>
      ) : null}

      <Pressable onPress={() => setAgree((v) => !v)} style={{ flexDirection: "row", gap: 10, alignItems: "flex-start", marginBottom: errors.agree ? 4 : 18 }}>
        <Icon name={agree ? "checkbox" : "square-outline"} size={22} color={agree ? c.accent : c.textMuted} />
        <T variant="small" muted style={{ flex: 1 }}>
          I agree to the{" "}
          <Text style={{ color: c.accentText, ...font.semibold }} onPress={() => router.push("/legal/terms")}>
            Terms & Conditions
          </Text>{" "}
          and{" "}
          <Text style={{ color: c.accentText, ...font.semibold }} onPress={() => router.push("/legal/privacy")}>
            Privacy Policy
          </Text>
          .
        </T>
      </Pressable>
      {errors.agree ? (
        <T variant="small" color={c.danger} style={{ marginBottom: 14 }}>
          {errors.agree}
        </T>
      ) : null}

      <Button title="Create account" onPress={submit} loading={loading} size="lg" />
      <GoogleButton title="Sign up with Google" onDone={goHome} />
    </AuthShell>
  );
}
