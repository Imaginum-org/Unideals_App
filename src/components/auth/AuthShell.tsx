import { router } from "expo-router";
import type { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { LogoMark, Wordmark } from "@/components/brand/Brand";
import { IconButton, T } from "@/components/ui";
import { font, useTheme } from "@/theme";

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  const { c } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.card }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <View style={{ paddingHorizontal: 8, paddingTop: 4 }}>
          <IconButton icon="close" onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))} accessibilityLabel="Close" />
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, padding: 20, paddingTop: 8, paddingBottom: 28 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 22 }}>
            <LogoMark size={30} tint={c.girls ? c.accent : undefined} />
            <Wordmark size={24} />
          </View>
          <T variant="title">{title}</T>
          {subtitle ? (
            <T variant="body" muted style={{ marginTop: 6, marginBottom: 22 }}>
              {subtitle}
            </T>
          ) : (
            <View style={{ height: 22 }} />
          )}
          {children}
          {footer ? <View style={{ marginTop: 22, alignItems: "center" }}>{footer}</View> : null}
          <TrustStrip />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** Quiet sign-off pinned to the bottom of auth screens. */
function TrustStrip() {
  const { c } = useTheme();
  return (
    <View style={{ marginTop: "auto", paddingTop: 36, alignItems: "center", gap: 6 }}>
      <View style={{ width: 36, height: 3, borderRadius: 2, backgroundColor: c.accentSoftStrong, marginBottom: 8 }} />
      <Text style={{ color: c.text, fontSize: 14, textAlign: "center", ...font.semibold }}>Buy it from a senior. Sell it to a junior.</Text>
      <Text style={{ color: c.textFaint, fontSize: 12, textAlign: "center", ...font.regular }}>Your campus marketplace · zero commission</Text>
    </View>
  );
}

export function OrDivider() {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 16 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: c.border }} />
      <T variant="caption" faint>
        OR
      </T>
      <View style={{ flex: 1, height: 1, backgroundColor: c.border }} />
    </View>
  );
}
