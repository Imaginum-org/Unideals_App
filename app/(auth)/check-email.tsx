import { Icon } from "@/components/ui/Icon";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { AppState, View } from "react-native";
import { authApi } from "@/api/auth";
import { errorMessage } from "@/api/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button, Card, T } from "@/components/ui";
import { toast } from "@/lib/toast";
import { useTheme } from "@/theme";

// After signup: the verification link opens the website. We poll
// /check-verification (like the web CheckEmail page) and move on to login
// as soon as the account is verified.
export default function CheckEmail() {
  const { c } = useTheme();
  const { email = "" } = useLocalSearchParams<{ email?: string }>();
  const [verified, setVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);
  const stop = useRef(false);

  useEffect(() => {
    if (!email) return undefined;
    stop.current = false;
    const check = async () => {
      try {
        const { data } = await authApi.checkVerification(email);
        if (data.verified && !stop.current) {
          stop.current = true;
          setVerified(true);
        }
      } catch {
        // keep polling
      }
    };
    check();
    const t = setInterval(() => !stop.current && check(), 6000);
    const sub = AppState.addEventListener("change", (s) => s === "active" && !stop.current && check());
    return () => {
      stop.current = true;
      clearInterval(t);
      sub.remove();
    };
  }, [email]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const resend = async () => {
    setSending(true);
    try {
      const { data } = await authApi.resendVerification(email);
      toast.success(data.message || "Verification email sent");
      setCooldown(60);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSending(false);
    }
  };

  if (verified) {
    return (
      <AuthShell title="Email verified 🎉" subtitle="Your account is ready. Log in to start buying and selling.">
        <Button title="Continue to log in" size="lg" onPress={() => router.replace("/login")} />
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Check your inbox" subtitle={`We sent a verification link to ${email || "your email"}. Open it on this phone or any device.`}>
      <Card style={{ alignItems: "center", gap: 10, paddingVertical: 22 }}>
        <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: c.accentSoft, alignItems: "center", justifyContent: "center" }}>
          <Icon name="mail-unread-outline" size={30} color={c.accentText} />
        </View>
        <T variant="small" muted center>
          This screen updates automatically once you verify. Can't find it? Check spam or promotions.
        </T>
      </Card>
      <View style={{ height: 18 }} />
      <Button kind="secondary" title={cooldown ? `Resend in ${cooldown}s` : "Resend email"} disabled={!email || cooldown > 0} loading={sending} onPress={resend} />
      <View style={{ height: 10 }} />
      <Button kind="ghost" title="Back to log in" onPress={() => router.replace("/login")} />
    </AuthShell>
  );
}
