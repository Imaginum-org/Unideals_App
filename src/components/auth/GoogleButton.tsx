import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Pressy } from "@/components/ui";
import { useGoogleSignIn } from "@/hooks/useGoogleSignIn";
import { font, useTheme } from "@/theme";
import { OrDivider } from "./AuthShell";

/** Official multi-colour Google "G". */
function GoogleG({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <Path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <Path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <Path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </Svg>
  );
}

/** "Continue with Google": the backend's OAuth flow in an in-app browser. */
export function GoogleButton({ title, onDone }: { title: string; onDone?: () => void }) {
  const { c } = useTheme();
  const google = useGoogleSignIn(onDone);
  return (
    <>
      <OrDivider />
      <Pressy
        onPress={google.signIn}
        disabled={google.busy}
        scaleTo={0.98}
        style={[styles.btn, { backgroundColor: c.dark ? "#1F2226" : "#FFFFFF", borderColor: c.dark ? "#2F3238" : "#DADCE0", opacity: google.busy ? 0.7 : 1 }]}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        <View style={styles.logo}>{google.busy ? <ActivityIndicator size="small" color={c.textMuted} /> : <GoogleG />}</View>
        <Text style={{ color: c.text, fontSize: 15.5, ...font.semibold }}>{title}</Text>
      </Pressy>
    </>
  );
}

const styles = StyleSheet.create({
  btn: { height: 52, borderRadius: 14, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  logo: { width: 22, alignItems: "center" },
});
