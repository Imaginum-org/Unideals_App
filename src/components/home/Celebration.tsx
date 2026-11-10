import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { useCampus } from "@/hooks/useCampus";
import { font, useTheme } from "@/theme";

const KEY = "unideals-celebrate-first-listing";
const COLORS = ["#3838EC", "#5C6DFF", "#F59E0B", "#10B981", "#EC4899", "#F43F5E"];

/** Called by the listing wizard when the server reports isFirstListing. */
export const queueCelebration = () => AsyncStorage.setItem(KEY, "1").catch(() => {});
export const consumeCelebration = async () => {
  try {
    const v = await AsyncStorage.getItem(KEY);
    if (v) await AsyncStorage.removeItem(KEY);
    return Boolean(v);
  } catch {
    return false;
  }
};

function Confetti() {
  const { width, height } = useWindowDimensions();
  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }).map((_, i) => ({
        x: Math.random() * width,
        delay: Math.random() * 500,
        rot: Math.random() * 360,
        color: COLORS[i % COLORS.length],
        size: 6 + Math.random() * 6,
        v: new Animated.Value(0),
      })),
    [width],
  );
  useEffect(() => {
    Animated.stagger(
      20,
      pieces.map((p) => Animated.timing(p.v, { toValue: 1, duration: 2200 + p.delay, delay: p.delay, easing: Easing.out(Easing.quad), useNativeDriver: true })),
    ).start();
  }, [pieces]);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            left: p.x,
            top: -20,
            width: p.size,
            height: p.size * 0.5,
            borderRadius: 2,
            backgroundColor: p.color,
            opacity: p.v.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] }),
            transform: [
              { translateY: p.v.interpolate({ inputRange: [0, 1], outputRange: [0, height * 0.8] }) },
              { rotate: p.v.interpolate({ inputRange: [0, 1], outputRange: [`${p.rot}deg`, `${p.rot + 540}deg`] }) },
            ],
          }}
        />
      ))}
    </View>
  );
}

export function FirstListingCelebration({ onClose }: { onClose: () => void }) {
  const { c } = useTheme();
  const { label } = useCampus();
  const scale = useRef(new Animated.Value(0.9)).current;
  useEffect(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }).start();
    const t = setTimeout(onClose, 7000);
    return () => clearTimeout(t);
  }, [onClose, scale]);
  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: c.overlay, alignItems: "center", justifyContent: "center", padding: 24 }]}>
        <Confetti />
        <Animated.View style={[styles.card, { backgroundColor: "#fff", transform: [{ scale }] }]}>
          <Pressable onPress={onClose} style={styles.close} hitSlop={8} accessibilityLabel="Close">
            <Icon name="close" size={18} color="#64748B" />
          </Pressable>
          <View style={styles.stamp}>
            <Icon name="checkmark" size={14} color="#008526" strokeWidth={3} />
            <Text style={{ color: "#008526", fontSize: 12, ...font.bold }}>Listed</Text>
          </View>
          <Text style={{ color: "#0F172A", fontSize: 30, letterSpacing: -0.8, marginTop: 14, ...font.bold }}>You're live.</Text>
          <Text style={{ color: "#64748B", fontSize: 15, lineHeight: 22, textAlign: "center", marginTop: 10, maxWidth: 290, ...font.regular }}>
            Your first listing just went up on <Text style={{ color: "#0F172A", ...font.semibold }}>{label || "your campus"}</Text>. Students can now find it, view it, and reach out.
          </Text>
          <View style={styles.tear} />
          <View style={{ alignSelf: "stretch", gap: 10 }}>
            <View style={styles.stubRow}>
              <Text style={styles.stubKey}>Status</Text>
              <Text style={{ color: "#008526", fontSize: 13.5, ...font.semibold }}>● Live</Text>
            </View>
            <View style={styles.stubRow}>
              <Text style={styles.stubKey}>Visible to</Text>
              <Text style={{ color: "#0F172A", fontSize: 13.5, ...font.semibold }}>All students</Text>
            </View>
          </View>
          <Pressable onPress={onClose} style={({ pressed }) => [styles.cta, { backgroundColor: "#0F172A", opacity: pressed ? 0.9 : 1 }]}>
            <Text style={{ color: "#fff", fontSize: 15, ...font.semibold }}>Continue exploring</Text>
            <Icon name="arrow-forward" size={16} color="#fff" />
          </Pressable>
          <Text style={{ color: "#94A3B8", fontSize: 12, marginTop: 10, ...font.regular }}>Closes automatically in a few seconds</Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  card: { width: "100%", maxWidth: 360, borderRadius: 24, padding: 24, alignItems: "center" },
  close: { position: "absolute", right: 14, top: 14, width: 32, height: 32, borderRadius: 16, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  stamp: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#E6FFEB", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, marginTop: 6 },
  tear: { alignSelf: "stretch", borderTopWidth: 1.5, borderStyle: "dashed", borderColor: "#E2E8F0", marginVertical: 20 },
  stubRow: { flexDirection: "row", justifyContent: "space-between" },
  stubKey: { color: "#94A3B8", fontSize: 12.5, textTransform: "uppercase", letterSpacing: 0.6, fontFamily: "Figtree_600SemiBold" },
  cta: { alignSelf: "stretch", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, borderRadius: 14, marginTop: 22 },
});
