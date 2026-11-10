import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ListingWizard } from "@/components/listing/ListingWizard";
import { CategoryIcon } from "@/components/product/CategoryIcon";
import { Button, IconButton } from "@/components/ui";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useIsLoggedIn } from "@/store/auth";
import { font, useTheme } from "@/theme";

// Facts about selling on Unideals (no commission, campus-only, 2-minute flow).
const WHY: [IconName, string, string][] = [
  ["wallet-outline", "Keep every rupee", "No commission. Buyers pay you directly at pickup."],
  ["school-outline", "Only your campus", "Verified students nearby — meet between classes."],
  ["zap", "Live in 2 minutes", "Snap a photo, set a price, done."],
];

export default function Sell() {
  const { c } = useTheme();
  const loggedIn = useIsLoggedIn();
  if (loggedIn) return <ListingWizard />;
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ paddingHorizontal: 6 }}>
        <IconButton icon="close" onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))} accessibilityLabel="Close" />
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 4, paddingBottom: 40 }}>
        <View style={styles.art}>
          {["study_material", "electronics", "vehicles", "hostel_essentials"].map((v, i) => (
            <View key={v} style={[styles.artTile, { backgroundColor: c.card, borderColor: c.border, transform: [{ rotate: `${[-8, 5, -4, 7][i]}deg` }, { translateY: i % 2 ? 10 : 0 }] }]}>
              <CategoryIcon value={v} size={40} />
            </View>
          ))}
        </View>
        <Text style={{ color: c.text, fontSize: 28, lineHeight: 33, letterSpacing: -0.7, ...font.bold }}>Turn last sem's stuff into cash.</Text>
        <Text style={{ color: c.textMuted, fontSize: 15, lineHeight: 22, marginTop: 8, ...font.regular }}>Textbooks, calculators, cycles, hostel gear — someone on campus needs it right now.</Text>
        <View style={{ gap: 14, marginTop: 24, marginBottom: 28 }}>
          {WHY.map(([icon, t, d]) => (
            <View key={t} style={{ flexDirection: "row", gap: 14 }}>
              <View style={[styles.why, { backgroundColor: c.accentSoft }]}>
                <Icon name={icon} size={19} color={c.accentText} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.text, fontSize: 15, ...font.semibold }}>{t}</Text>
                <Text style={{ color: c.textMuted, fontSize: 13.5, ...font.regular }}>{d}</Text>
              </View>
            </View>
          ))}
        </View>
        <Button title="Log in to start selling" size="lg" onPress={() => router.push("/login")} />
        <View style={{ height: 10 }} />
        <Button kind="ghost" title="New here? Create an account" onPress={() => router.push("/signup")} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  art: { flexDirection: "row", gap: 10, marginBottom: 26, marginTop: 6 },
  artTile: { width: 70, height: 70, borderRadius: 18, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  why: { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center" },
});
