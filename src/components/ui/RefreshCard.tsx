import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { font, shadow, useTheme } from "@/theme";

export type RefreshPhase = "idle" | "loading" | "done";

const SIZE = 30;
const R = 12;
const CIRC = 2 * Math.PI * R;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

/**
 * Pull-to-refresh card (replaces the stock spinner): slides in from the top,
 * a gradient arc breathes + spins while loading, then draws a check.
 */
export function RefreshCard({ phase, top = 10 }: { phase: RefreshPhase; top?: number }) {
  const { c } = useTheme();
  const show = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const dash = useRef(new Animated.Value(0)).current;
  const check = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(show, { toValue: phase === "idle" ? 0 : 1, useNativeDriver: true, speed: 16, bounciness: phase === "idle" ? 0 : 7 }).start();
    if (phase === "loading") {
      check.setValue(0);
      spin.setValue(0);
      const a = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: true }));
      const b = Animated.loop(
        Animated.sequence([
          Animated.timing(dash, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.cubic), useNativeDriver: false }),
          Animated.timing(dash, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.cubic), useNativeDriver: false }),
        ]),
      );
      a.start();
      b.start();
      return () => {
        a.stop();
        b.stop();
      };
    }
    if (phase === "done") {
      Animated.timing(check, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    }
  }, [phase, show, spin, dash, check]);

  const done = phase === "done";
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        { top },
        {
          opacity: show,
          transform: [{ translateY: show.interpolate({ inputRange: [0, 1], outputRange: [-70, 0] }) }, { scale: show.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) }],
        },
      ]}
    >
      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, shadow(c.dark, "lg")]}>
        <View style={{ width: SIZE, height: SIZE }}>
          {done ? (
            <Svg width={SIZE} height={SIZE} viewBox="0 0 30 30">
              <Circle cx={15} cy={15} r={R} fill={c.successSoft} stroke={c.success} strokeWidth={2.4} />
              <AnimatedPath
                d="M9.5 15.5l3.6 3.6 7.4-7.6"
                fill="none"
                stroke={c.success}
                strokeWidth={2.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={18}
                strokeDashoffset={check.interpolate({ inputRange: [0, 1], outputRange: [18, 0] })}
              />
            </Svg>
          ) : (
            <Animated.View style={{ transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) }] }}>
              <Svg width={SIZE} height={SIZE} viewBox="0 0 30 30">
                <Defs>
                  <LinearGradient id="rc" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0" stopColor={c.accent} />
                    <Stop offset="1" stopColor={c.girls ? "#F9A8D4" : "#8B93FF"} />
                  </LinearGradient>
                </Defs>
                <Circle cx={15} cy={15} r={R} fill="none" stroke={c.accentSoftStrong} strokeWidth={3} />
                <AnimatedCircle
                  cx={15}
                  cy={15}
                  r={R}
                  fill="none"
                  stroke="url(#rc)"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeDasharray={`${CIRC}`}
                  strokeDashoffset={dash.interpolate({ inputRange: [0, 1], outputRange: [CIRC * 0.78, CIRC * 0.3] })}
                />
              </Svg>
            </Animated.View>
          )}
        </View>
        <View>
          <Text style={{ color: c.text, fontSize: 13.5, ...font.semibold }}>{done ? "All caught up" : "Refreshing your feed"}</Text>
          <Text style={{ color: c.textMuted, fontSize: 11.5, marginTop: 1, ...font.regular }}>{done ? "Fresher than the 8 AM attendance" : "Fetching the latest drops…"}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, alignItems: "center", zIndex: 20 },
  card: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderRadius: 18, paddingVertical: 10, paddingLeft: 12, paddingRight: 18 },
});
