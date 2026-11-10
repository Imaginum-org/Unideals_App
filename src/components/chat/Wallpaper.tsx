import { StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, Line, Path, Pattern, RadialGradient, Rect, Stop } from "react-native-svg";
import { useTheme } from "@/theme";

// IDs must match the backend allowlist (user.controller updateChatSettings).
export const WALLPAPERS = [
  { id: "default", name: "Default" },
  { id: "campus", name: "Pinstripe" },
  { id: "grid", name: "Indigo Grid" },
  { id: "paper", name: "Warm Paper" },
  { id: "waves", name: "Waves" },
] as const;
export type WallpaperId = (typeof WALLPAPERS)[number]["id"];

/** Native take on the website's .chat-doodle / .wall-* CSS textures. */
export function ChatWallpaper({ id = "default" }: { id?: string }) {
  const { c } = useTheme();
  const ink = c.dark ? "rgba(165,180,252,0.10)" : "rgba(56,56,236,0.06)";
  const ink2 = c.dark ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.045)";
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: c.thread }]}>
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse">
            <Circle cx="3" cy="3" r="1.2" fill={ink} />
            <Circle cx="14" cy="14" r="1.2" fill={ink2} />
          </Pattern>
          <Pattern id="stripes" width="14" height="14" patternUnits="userSpaceOnUse">
            <Line x1="0" y1="14" x2="14" y2="0" stroke={ink} strokeWidth="1" />
          </Pattern>
          <Pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <Path d="M28 0H0V28" fill="none" stroke={ink} strokeWidth="1" />
          </Pattern>
          <Pattern id="waves" width="56" height="28" patternUnits="userSpaceOnUse">
            <Path d="M0 14 Q14 4 28 14 T56 14" fill="none" stroke={ink} strokeWidth="1.3" />
          </Pattern>
          <RadialGradient id="glowA" cx="12%" cy="8%" r="45%">
            <Stop offset="0" stopColor={c.dark ? "#6366F1" : "#3838EC"} stopOpacity={c.dark ? 0.14 : 0.08} />
            <Stop offset="1" stopColor="#3838EC" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="glowB" cx="88%" cy="30%" r="40%">
            <Stop offset="0" stopColor="#F59E0B" stopOpacity={c.dark ? 0.08 : 0.07} />
            <Stop offset="1" stopColor="#F59E0B" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="glowTop" cx="50%" cy="-6%" r="70%">
            <Stop offset="0" stopColor="#3838EC" stopOpacity={c.dark ? 0.1 : 0.06} />
            <Stop offset="1" stopColor="#3838EC" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        {id === "campus" ? (
          <Rect width="100%" height="100%" fill="url(#stripes)" />
        ) : id === "grid" ? (
          <Rect width="100%" height="100%" fill="url(#grid)" />
        ) : id === "paper" ? (
          <>
            <Rect width="100%" height="100%" fill={c.dark ? "#14120F" : "#FBF8F2"} />
            <Rect width="100%" height="100%" fill="url(#glowA)" />
            <Rect width="100%" height="100%" fill="url(#glowB)" />
          </>
        ) : id === "waves" ? (
          <Rect width="100%" height="100%" fill="url(#waves)" />
        ) : (
          <>
            <Rect width="100%" height="100%" fill="url(#glowTop)" />
            <Rect width="100%" height="100%" fill="url(#dots)" />
          </>
        )}
      </Svg>
    </View>
  );
}
