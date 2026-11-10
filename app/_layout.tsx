import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
  Figtree_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/figtree";
import { QueryClientProvider } from "@tanstack/react-query";
import { DarkTheme, DefaultTheme, SplashScreen, Stack, ThemeProvider, router, usePathname, useSegments } from "expo-router";
import { NavigationBar } from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AnimatedSplash } from "@/components/brand/AnimatedSplash";
import { Toaster } from "@/components/ui";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { useCampus } from "@/hooks/useCampus";
import { useRealtimeBridge } from "@/hooks/useRealtime";
import { ThemeRevealHost } from "@/components/theme/ThemeReveal";
import { PROTECTED_ROOTS } from "@/lib/authPrompt";
import { queryClient } from "@/lib/queryClient";
import { userApi } from "@/api/user";
import { toast } from "@/lib/toast";
import { canSeeGirls, useAuthStore } from "@/store/auth";
import { usePrefsStore } from "@/store/prefs";
import { useTheme } from "@/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

function Guards() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const girlsMode = usePrefsStore((s) => s.girlsMode);
  const setGirlsMode = usePrefsStore((s) => s.setGirlsMode);
  const { needsGate, campuses, directoryLoading } = useCampus();
  const updateUser = useAuthStore((s) => s.updateUser);
  const autoAssigning = useRef(false);
  const segments = useSegments();

  useRealtimeBridge();

  const pathname = usePathname();
  useEffect(() => {
    if (status !== "guest") return;
    const root = String(segments[0] || "");
    if (!PROTECTED_ROOTS.has(root)) return;
    toast("Please log in to continue");
    router.replace({ pathname: "/login", params: { next: pathname } });
  }, [status, segments, pathname]);

  // Logged-in users without a campus must pick one before using the app
  // (same onboarding gate as the website's CampusGate).
  // With a single live campus there is nothing to choose: assign it quietly
  // and keep the user on Home.
  useEffect(() => {
    if (status !== "authed" || !needsGate || directoryLoading) return;
    const live = campuses.filter((x) => x.is_active !== false);
    if (live.length === 1) {
      if (autoAssigning.current) return;
      autoAssigning.current = true;
      userApi
        .updateProfile({ campus_slug: live[0].slug })
        .then((r) => {
          if (r.user) updateUser(r.user);
          queryClient.invalidateQueries();
        })
        .catch(() => router.replace({ pathname: "/campus", params: { gate: "1" } }))
        .finally(() => {
          autoAssigning.current = false;
        });
      return;
    }
    if (segments[0] === "campus") return;
    router.replace({ pathname: "/campus", params: { gate: "1" } });
  }, [status, needsGate, segments, campuses, directoryLoading, updateUser]);

  // Girls Mode is meaningless (and server-blocked) for ineligible viewers.
  useEffect(() => {
    if (status === "booting") return;
    if (girlsMode && !canSeeGirls(user)) setGirlsMode(false);
  }, [status, user, girlsMode, setGirlsMode]);

  return null;
}

function Shell() {
  const theme = useTheme();
  const status = useAuthStore((s) => s.status);
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const [fontsLoaded, fontError] = useFonts({
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
    Figtree_800ExtraBold,
  });
  const fontsReady = fontsLoaded || Boolean(fontError);
  const ready = status !== "booting" && fontsReady;
  const [introDone, setIntroDone] = useState(false);
  const finishIntro = useCallback(() => setIntroDone(true), []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  // Native splash (brand blue) only covers font loading; the animated intro
  // takes over from there and stays until the session is restored.
  useEffect(() => {
    if (fontsReady) SplashScreen.hideAsync().catch(() => {});
  }, [fontsReady]);

  const navTheme = theme.c.dark ? DarkTheme : DefaultTheme;
  const rootBg = ready ? theme.c.bg : "#3838EC";

  // Paint the native window too, so no white shows behind the transparent
  // status/navigation bars, the keyboard, or screen transitions.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(rootBg).catch(() => {});
  }, [rootBg]);

  if (!fontsReady) return <View style={{ flex: 1, backgroundColor: "#3838EC" }} />;

  return (
    // Stable tree: the intro is always the same sibling, so it never
    // remounts (and restarts) when the app underneath becomes ready.
    <View style={{ flex: 1, backgroundColor: ready ? theme.c.bg : "#3838EC" }}>
      {ready ? (
        <ThemeProvider
          value={{
            ...navTheme,
            colors: { ...navTheme.colors, background: theme.c.bg, card: theme.c.bg, primary: theme.c.accent, text: theme.c.text, border: theme.c.border },
          }}
        >
          <StatusBar style={!introDone || theme.c.dark ? "light" : "dark"} />
          {Platform.OS === "android" ? <NavigationBar style={!introDone || theme.c.dark ? "light" : "dark"} /> : null}
          <Guards />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.c.bg } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" options={{ presentation: "modal" }} />
            <Stack.Screen name="campus" options={{ gestureEnabled: false }} />
          </Stack>
          <Toaster />
          <OfflineBanner />
        </ThemeProvider>
      ) : (
        <StatusBar style="light" />
      )}
      {introDone ? null : <AnimatedSplash ready={ready} onDone={finishIntro} />}
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeRevealHost>
              <Shell />
            </ThemeRevealHost>
          </QueryClientProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
