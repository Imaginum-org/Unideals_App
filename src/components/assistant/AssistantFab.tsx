import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { useTheme } from "@/theme";
import { useTabBarSpace } from "@/hooks/useLayout";

/** Floating entry to the Unideals assistant (website FloatingAssistant launcher). */
export function AssistantFab() {
  const { c } = useTheme();
  const { space } = useTabBarSpace();
  return (
    <Pressable
      onPress={() => router.push("/assistant")}
      accessibilityLabel="Open Unideals assistant"
      style={({ pressed }) => [styles.fab, { bottom: space - 4, shadowColor: c.accent, transform: [{ scale: pressed ? 0.94 : 1 }] }]}
    >
      <LinearGradient colors={[c.accent, c.girls ? "#F472B6" : "#5C6DFF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.inner}>
        <Icon name="sparkles" size={22} color="#fff" strokeWidth={2.1} />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: { position: "absolute", right: 16, bottom: 16, borderRadius: 26, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  inner: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
});
