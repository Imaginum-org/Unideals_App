import { useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { canSeeGirls, useAuthStore } from "@/store/auth";
import { usePrefsStore } from "@/store/prefs";
import { font, shadow, useTheme } from "@/theme";

const PERKS = ["Girls-only listings from your campus", "Beauty, fashion & decor categories", "Only girls can chat on these listings"];

/**
 * Girls Corner 🌸 right-edge drawer (website GirlsEntryPill): the only entry
 * to Girls Mode, shown to eligible viewers (female + admin/support).
 */
export function GirlsCornerDrawer() {
  const { c } = useTheme();
  const user = useAuthStore((s) => s.user);
  const girlsMode = usePrefsStore((s) => s.girlsMode);
  const setGirlsMode = usePrefsStore((s) => s.setGirlsMode);
  const [open, setOpen] = useState(false);
  if (!canSeeGirls(user)) return null;

  if (!open) {
    return (
      <Pressable onPress={() => setOpen(true)} style={[styles.handle, { backgroundColor: girlsMode ? "#DB2777" : c.card, borderColor: girlsMode ? "#DB2777" : "#FBCFE8" }, shadow(c.dark, "lg")]} accessibilityLabel="Open Girl Mode panel">
        <Text style={{ fontSize: 16 }}>🌸</Text>
        <Text style={[styles.vertical, { color: girlsMode ? "#fff" : "#DB2777" }]}>Girl Mode</Text>
      </Pressable>
    );
  }
  return (
    <View style={[styles.panel, { backgroundColor: c.card, borderColor: c.dark ? "#831843" : "#FBCFE8" }, shadow(c.dark, "lg")]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={{ fontSize: 18 }}>🌸</Text>
        <Text style={{ flex: 1, color: c.text, fontSize: 16, ...font.bold }}>Girls Corner</Text>
        <Pressable onPress={() => setOpen(false)} hitSlop={8} accessibilityLabel="Collapse Girl Mode panel">
          <Icon name="close" size={18} color={c.textMuted} />
        </Pressable>
      </View>
      {PERKS.map((p) => (
        <View key={p} style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <Icon name="checkmark" size={14} color="#DB2777" strokeWidth={2.6} />
          <Text style={{ flex: 1, color: c.textMuted, fontSize: 12.5, ...font.medium }}>{p}</Text>
        </View>
      ))}
      <View style={[styles.toggle, { backgroundColor: girlsMode ? "rgba(236,72,153,0.1)" : c.surface }]}>
        <Text style={{ flex: 1, color: girlsMode ? "#DB2777" : c.text, fontSize: 14, ...font.semibold }}>{girlsMode ? "Girl Mode is on" : "Turn on Girl Mode"}</Text>
        <Switch value={girlsMode} onValueChange={setGirlsMode} trackColor={{ true: "#DB2777", false: c.borderStrong }} thumbColor="#fff" accessibilityLabel={girlsMode ? "Turn off Girl Mode" : "Turn on Girl Mode"} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  handle: { position: "absolute", right: -1, bottom: 96, width: 38, paddingVertical: 12, borderTopLeftRadius: 14, borderBottomLeftRadius: 14, borderWidth: 1, alignItems: "center", gap: 8 },
  vertical: { transform: [{ rotate: "-90deg" }], width: 76, textAlign: "center", fontSize: 11.5, marginVertical: 26, fontFamily: "Figtree_700Bold" },
  panel: { position: "absolute", right: 12, bottom: 90, width: 264, borderRadius: 18, borderWidth: 1, padding: 14, gap: 9 },
  toggle: { flexDirection: "row", alignItems: "center", borderRadius: 12, paddingLeft: 12, paddingRight: 6, paddingVertical: 6, marginTop: 2 },
});
