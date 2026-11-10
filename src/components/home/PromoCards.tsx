import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Icon, type IconName } from "@/components/ui/Icon";
import { font, useTheme } from "@/theme";
import { BrandFooter } from "@/components/brand/BrandFooter";

// Website PromoBento (home footer cards), minus "App launching soon" — this is the app.
const STEPS = ["Enter basic details", "Upload photo", "Set price and pickup details"];
const PRO_FEATURES: [IconName, string][] = [
  ["rocket", "Monthly Boosts"],
  ["pricetag", "More Listings"],
  ["search", "Search Priority"],
  ["zap", "Chat Priority"],
  ["heart-outline", "Bigger Wishlist"],
  ["headphones", "Priority Support"],
];

function Cta({ label, onPress, light }: { label: string; onPress: () => void; light?: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.cta, { backgroundColor: light ? "#FFFFFF" : "#0F172A", transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
      <Text style={{ color: light ? "#0F172A" : "#FFFFFF", fontSize: 14, ...font.semibold }}>{label}</Text>
      <Icon name="arrow-forward" size={15} color={light ? "#0F172A" : "#FFFFFF"} />
    </Pressable>
  );
}

export function PromoCards({ offset = 34 }: { offset?: number }) {
  const { c } = useTheme();
  return (
    <View style={{ paddingHorizontal: 16, gap: 12, marginTop: offset }}>
      <View style={[styles.card, { backgroundColor: c.dark ? "#1A1D20" : "#FFF7ED", borderColor: c.dark ? "#262626" : "#FED7AA" }]}>
        <Text style={[styles.title, { color: c.text }]}>Your selling journey starts here</Text>
        <Text style={[styles.sub, { color: c.textMuted }]}>List what you don't use anymore and score the best deal for it</Text>
        <View style={{ gap: 8, marginVertical: 14 }}>
          <Text style={{ color: c.text, fontSize: 13, ...font.semibold }}>
            A simple 3-step process <Text style={{ color: c.textMuted, ...font.regular }}>· List in 2 mins</Text>
          </Text>
          {STEPS.map((s, i) => (
            <View key={s} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={[styles.step, { backgroundColor: "#F97316" }]}>
                <Text style={{ color: "#fff", fontSize: 12, ...font.bold }}>{i + 1}</Text>
              </View>
              <Text style={{ color: c.text, fontSize: 13.5, ...font.medium }}>{s}</Text>
            </View>
          ))}
        </View>
        <Cta label="Start selling" onPress={() => router.push("/sell")} />
      </View>

      <LinearGradient colors={["#3838EC", "#2829D8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.card, { borderColor: "transparent" }]}>
        <Text style={[styles.title, { color: "#fff" }]}>Unlock the Full Potential of Unideals with Pro & Pro+</Text>
        <Text style={[styles.sub, { color: "rgba(255,255,255,0.85)" }]}>
          Get free monthly boosts, keep more listings live, rank higher in search and chats, save more to your wishlist, and get priority support plus early access to new features.
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginVertical: 14 }}>
          {PRO_FEATURES.map(([icon, label]) => (
            <View key={label} style={styles.chip}>
              <Icon name={icon} size={13} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 12, ...font.semibold }}>{label}</Text>
            </View>
          ))}
        </View>
        <Cta label="Explore plans" light onPress={() => router.push("/subscription")} />
      </LinearGradient>

      <View style={[styles.card, { backgroundColor: c.dark ? "#1A1D20" : "#ECFDF5", borderColor: c.dark ? "#262626" : "#A7F3D0", flexDirection: "row", gap: 12 }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: c.text }]}>Trusted Campus Community</Text>
          <Text style={[styles.sub, { color: c.textMuted }]}>Verified students only, and every listing gets a spam check. Zero sus sellers in your feed.</Text>
        </View>
        <Icon name="shield-checkmark-outline" size={54} color="#10B981" strokeWidth={1.6} />
      </View>
      <BrandFooter style={{ paddingHorizontal: 8, paddingBottom: 8 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 1, padding: 18 },
  title: { fontSize: 19, lineHeight: 24, letterSpacing: -0.3, fontFamily: "Figtree_700Bold" },
  sub: { fontSize: 13.5, lineHeight: 19, marginTop: 6, fontFamily: "Figtree_400Regular" },
  cta: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", height: 42, paddingHorizontal: 16, borderRadius: 12 },
  step: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  chip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.14)" },
});
