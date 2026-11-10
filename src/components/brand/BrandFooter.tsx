import Constants from "expo-constants";
import { Text, View, type StyleProp, type ViewStyle } from "react-native";
import { font, useTheme } from "@/theme";

/**
 * Zomato-style sign-off at the end of long screens: an oversized, faded
 * "Unideals" wordmark, the maker line and the app version.
 */
export function BrandFooter({ style }: { style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  const version = Constants.expoConfig?.version || "1.0.0";
  const faint = c.dark ? "#2B2E34" : "#DADDE5";
  return (
    <View style={[{ paddingHorizontal: 24, paddingTop: 36, paddingBottom: 28 }, style]} accessibilityLabel={`Unideals by Imaginum, version ${version}`}>
      <Text style={{ color: faint, fontSize: 60, lineHeight: 64, letterSpacing: -2.6, ...font.black }}>Unideals</Text>
      <Text style={{ color: c.textFaint, fontSize: 14, marginTop: 4, ...font.medium }}>
        by <Text style={{ color: c.textMuted, ...font.bold }}>Imaginum</Text>
      </Text>
      <Text style={{ color: c.textFaint, fontSize: 11.5, marginTop: 10, letterSpacing: 0.2, ...font.regular }}>
        Made with ❤️ for students · v{version}
      </Text>
    </View>
  );
}
