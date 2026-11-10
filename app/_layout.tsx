import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
  Figtree_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/figtree";
import { QueryClientProvider } from "@tanstack/react-query";
import { DarkTheme, DefaultTheme, SplashScreen, Stack, ThemeProvider, router, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AnimatedSplash } from "@/components/brand/AnimatedSplash";
import { Toaster } from "@/components/ui";
import { useCampus } from "@/hooks/useCampus";
import { useRealtimeBridge } from "@/hooks/useRealtime";
import { queryClient } from "@/lib/queryClient";
import { canSeeGirls, useAuthStore } from "@/store/auth";
import { usePrefsStore } from "@/store/prefs";
import { useTheme } from "@/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

function Guards() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const girlsMode = usePrefsStore((s) => s.girlsMode);
  const setGirlsMode = usePrefsStore((s) => s.setGirlsMode);
  const { needsGate } = useCampus();
  const segments = useSegments();

  useRealtimeBridge();

  // Logged-in users without a campus must pick one before using the app
  // (same onboarding gate as the website's CampusGate).
  useEffect(() => {
    if (status !== "authed" || !needsGate) return;
    if (segments[0] === "campus") return;
    router.replace({ pathname: "/campus", params: { gate: "1" } });
  }, [status, needsGate, segments]);

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
          <Guards />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.c.bg } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" options={{ presentation: "modal" }} />
            <Stack.Screen name="campus" options={{ gestureEnabled: false }} />
          </Stack>
          <Toaster />
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
        <QueryClientProvider client={queryClient}>
          <Shell />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
