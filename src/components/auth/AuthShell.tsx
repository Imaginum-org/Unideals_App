import { router } from "expo-router";
import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LogoMark, Wordmark } from "@/components/brand/Brand";
import { IconButton, T } from "@/components/ui";
import { font, useTheme } from "@/theme";

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  const { c } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.card }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={{ paddingHorizontal: 8, paddingTop: 4 }}>
          <IconButton icon="close" onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))} accessibilityLabel="Close" />
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingTop: 8, paddingBottom: 40 }}>
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
