import { Redirect, Stack, useSegments } from "expo-router";
import { useAuthStore } from "@/store/auth";
import { useTheme } from "@/theme";

// Public-only routes (website PublicOnlyRoute): logged-in users go home.
// Reset/verify links stay reachable regardless of session.
export default function AuthLayout() {
  const { c } = useTheme();
  const status = useAuthStore((s) => s.status);
  const segments = useSegments() as string[];
  const always = segments.includes("verify-email") || segments.includes("reset-password");
  if (status === "authed" && !always) return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }} />;
}
