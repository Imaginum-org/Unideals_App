import Constants from "expo-constants";
import { Linking, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { font, useTheme } from "@/theme";
import { PixelGrid } from "./PixelGrid";
import { useAuthStore } from "@/store/auth";

/**
 * Zomato-style sign-off at the end of long screens: an oversized, faded
 * "Unideals" wordmark, the maker line, the app version and a
 * contribution-style pixel grid with a heart in it.
 */
export function BrandFooter({ style }: { style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  const version = Constants.expoConfig?.version || "1.0.0";
  const isGirl = useAuthStore((s) => s.user?.gender === "female");
  const faint = c.dark ? "#2B2E34" : "#DADDE5";
  return (
    <View style={[{ paddingHorizontal: 24, paddingTop: 36, paddingBottom: 28 }, style]} accessibilityLabel={`Unideals by Imaginum, version ${version}`}>
      <Text style={{ color: faint, fontSize: 60, lineHeight: 64, letterSpacing: -2.6, ...font.black }}>Unideals</Text>
      <Text style={{ color: c.textFaint, fontSize: 14, marginTop: 4, ...font.medium }}>
        by{" "}
        <Text style={{ color: c.accentText, ...font.bold }} onPress={() => Linking.openURL("https://imaginumorg.vercel.app").catch(() => {})} accessibilityRole="link">
          Imaginum
        </Text>
      </Text>
      <Text style={{ color: c.textFaint, fontSize: 11.5, marginTop: 10, letterSpacing: 0.2, ...font.regular }}>
        {isGirl ? "Built by alumni (and the girl whose notes got everyone through end-sems)" : "Built by alumni who still haven’t returned that borrowed calculator"} · v{version}
      </Text>
      <PixelGrid style={{ marginTop: 12 }} />
    </View>
  );
}
