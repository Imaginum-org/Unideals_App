import { BrandLoader } from "@/components/brand/Brand";
import { Icon } from "@/components/ui/Icon";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToastStore } from "@/lib/toast";
import { font, useTheme } from "@/theme";
import { Button, T, type IconName } from "./primitives";

export function Loader({ full = true, label }: { full?: boolean; label?: string }) {
  return <BrandLoader full={full} label={label} />;
}

export function EmptyState({
  icon = "file-tray-outline",
  title,
  message,
  action,
  onAction,
  compact,
}: {
  icon?: IconName;
  title: string;
  message?: string;
  action?: string;
  onAction?: () => void;
  compact?: boolean;
}) {
  const { c } = useTheme();
  return (
    <View style={{ alignItems: "center", paddingVertical: compact ? 24 : 56, paddingHorizontal: 24, gap: 8 }}>
      <View style={[styles.emptyIcon, { backgroundColor: c.accentSoft }]}>
        <Icon name={icon} size={30} color={c.accentText} />
      </View>
      <T variant="h2" center>
        {title}
      </T>
      {message ? (
        <T variant="small" muted center style={{ maxWidth: 300 }}>
          {message}
        </T>
      ) : null}
      {action ? <Button title={action} onPress={onAction} full={false} style={{ marginTop: 10 }} /> : null}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <EmptyState
      icon="cloud-offline-outline"
      title="Couldn't load this"
      message={message || "Check your connection and try again."}
      action={onRetry ? "Try again" : undefined}
      onAction={onRetry}
    />
  );
}

/** Global toast host — mount once at the root. */
export function Toaster() {
  const items = useToastStore((s) => s.items);
  const dismiss = useToastStore((s) => s.dismiss);
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  if (!items.length) return null;
  return (
    <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, { justifyContent: "flex-start", paddingTop: insets.top + 8 }]}>
      {items.map((t) => {
        const icon: IconName = t.kind === "error" ? "alert-circle" : t.kind === "success" ? "checkmark-circle" : "information-circle";
        const tint = t.kind === "error" ? c.danger : t.kind === "success" ? c.success : c.accentText;
        return (
          <Pressable
            key={t.id}
            onPress={() => dismiss(t.id)}
            style={[styles.toast, { backgroundColor: c.dark ? "#26262B" : "#0F172A" }]}
            accessibilityRole="alert"
          >
            <Icon name={icon} size={18} color={tint} />
            <Text style={{ color: "#fff", fontSize: 14, flex: 1, ...font.medium }}>{t.text}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyIcon: { width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  toast: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
