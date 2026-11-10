import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Linking, StyleSheet, Text, View } from "react-native";
import Svg, { G, Path } from "react-native-svg";
import { LOGO_PATHS, LOGO_VIEWBOX } from "./logoPaths";

const AnimatedPath = Animated.createAnimatedComponent(Path);

const BRAND = "#3838EC";
const WORD = "Unideals";
const DASH = 2600; // longer than any logo outline in viewBox units
const MIN_SHOW_MS = 3600;
const IMAGINUM_URL = "https://imaginumorg.vercel.app";

/**
 * Launch intro: full-screen brand blue, the logo mark draws itself on,
 * fills, then "Unideals" rises letter by letter. Stays until the app is
 * ready (fonts + session) and the intro has played, then fades out.
 * Respects the OS "reduce motion" setting.
 */
export function AnimatedSplash({ ready, onDone }: { ready: boolean; onDone: () => void }) {
  const draw = useRef(new Animated.Value(0)).current; // stroke draw-on
  const fill = useRef(new Animated.Value(0)).current; // logo fill
  const pop = useRef(new Animated.Value(0)).current; // logo settle
  const ring = useRef(new Animated.Value(0)).current; // soft pulse ring
  const tag = useRef(new Animated.Value(0)).current; // tagline + footer
  const exit = useRef(new Animated.Value(1)).current;
  const letters = useRef(WORD.split("").map(() => new Animated.Value(0))).current;
  const [played, setPlayed] = useState(false);
  const started = useRef(Date.now());

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reduce) => {
        if (cancelled) return;
        if (reduce) {
          [draw, fill, pop, tag, ...letters].forEach((v) => v.setValue(1));
          setPlayed(true);
          return;
        }
        const ease = Easing.bezier(0.22, 1, 0.36, 1);
        Animated.sequence([
          Animated.parallel([
            Animated.timing(draw, { toValue: 1, duration: 1150, easing: Easing.inOut(Easing.cubic), useNativeDriver: false }),
            Animated.timing(pop, { toValue: 1, duration: 1150, easing: ease, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(fill, { toValue: 1, duration: 450, easing: Easing.out(Easing.quad), useNativeDriver: false }),
            Animated.timing(ring, { toValue: 1, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            Animated.stagger(
              70,
              letters.map((v) => Animated.timing(v, { toValue: 1, duration: 520, easing: ease, useNativeDriver: true })),
            ),
          ]),
          Animated.timing(tag, { toValue: 1, duration: 520, easing: ease, useNativeDriver: true }),
        ]).start(() => !cancelled && setPlayed(true));
      });
    return () => {
      cancelled = true;
    };
  }, [draw, fill, pop, ring, tag, letters]);

  useEffect(() => {
    if (!ready || !played) return;
    const wait = Math.max(0, MIN_SHOW_MS - (Date.now() - started.current));
    const t = setTimeout(() => {
      Animated.timing(exit, { toValue: 0, duration: 450, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(() => onDone());
    }, wait);
    return () => clearTimeout(t);
  }, [ready, played, exit, onDone]);

  const dashOffset = draw.interpolate({ inputRange: [0, 1], outputRange: [DASH, 0] });
  const fillOpacity = fill.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const strokeOpacity = fill.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });

  return (
    <Animated.View
      pointerEvents={played && ready ? "none" : "auto"}
      style={[StyleSheet.absoluteFill, styles.root, { opacity: exit, transform: [{ scale: exit.interpolate({ inputRange: [0, 1], outputRange: [1.04, 1] }) }] }]}
      accessibilityLabel="Unideals"
    >
      <View style={styles.center}>
        <View style={styles.markWrap}>
          <Animated.View
            style={[
              styles.ring,
              {
                opacity: ring.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.35, 0] }),
                transform: [{ scale: ring.interpolate({ inputRange: [0, 1], outputRange: [0.6, 2.1] }) }],
              },
            ]}
          />
          <Animated.View
            style={{
              opacity: pop.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 1] }),
              transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] }) }],
            }}
          >
            <Svg width={84} height={(84 * 520) / 430} viewBox={LOGO_VIEWBOX}>
              {LOGO_PATHS.map((p, i) => (
                <G key={i} transform={p.transform}>
                  <AnimatedPath d={p.d} fill="#FFFFFF" fillOpacity={fillOpacity} />
                  <AnimatedPath
                    d={p.d}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth={14}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={[DASH, DASH]}
                    strokeDashoffset={dashOffset}
                    strokeOpacity={strokeOpacity}
                  />
                </G>
              ))}
            </Svg>
          </Animated.View>
        </View>

        <View style={styles.wordRow} accessible={false}>
          {WORD.split("").map((ch, i) => (
            <Animated.Text
              key={i}
              style={[
                styles.letter,
                {
                  opacity: letters[i],
                  transform: [{ translateY: letters[i].interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
                },
              ]}
            >
              {ch}
            </Animated.Text>
          ))}
        </View>
        <Animated.Text style={[styles.tagline, { opacity: tag, transform: [{ translateY: tag.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }]}>
          Buy and sell on campus.
        </Animated.Text>
      </View>

      <Animated.View style={[styles.footer, { opacity: tag }]}>
        <Text style={styles.by} numberOfLines={1}>
          by{" "}
          <Text style={styles.company} onPress={() => Linking.openURL(IMAGINUM_URL).catch(() => {})} accessibilityRole="link">
            Imaginum
          </Text>
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: BRAND, zIndex: 999, elevation: 999 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  markWrap: { width: 140, height: 140, alignItems: "center", justifyContent: "center", marginBottom: 18 },
  ring: { position: "absolute", width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: "#FFFFFF" },
  wordRow: { flexDirection: "row" },
  letter: { color: "#FFFFFF", fontSize: 44, letterSpacing: -1.2, fontFamily: "Figtree_700Bold" },
  tagline: { color: "rgba(255,255,255,0.8)", fontSize: 15, marginTop: 10, fontFamily: "Figtree_500Medium" },
  footer: { position: "absolute", bottom: 54, left: 0, right: 0, alignItems: "center" },
  by: { color: "rgba(255,255,255,0.7)", fontSize: 15, fontFamily: "Figtree_500Medium" },
  company: { color: "#FFFFFF", fontSize: 15, letterSpacing: 0.2, fontFamily: "Figtree_700Bold", textDecorationLine: "underline" },
});
