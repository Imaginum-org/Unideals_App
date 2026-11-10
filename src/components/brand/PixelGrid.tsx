import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { haptic } from "@/lib/haptics";
import { useAuthStore } from "@/store/auth";
import { usePrefsStore } from "@/store/prefs";
import { font, useTheme } from "@/theme";

// GitHub-contribution-style grid in the brand colour with a pixel heart in
// the middle. Tap a square: it lights up and a tooltip pops above it with a
// little campus in-joke (the heart has its own line).
const HEART = [".XX.XX.", "XXXXXXX", "XXXXXXX", ".XXXXX.", "..XXX..", "...X..."];
const BOW = ["XX...XX", "XXX.XXX", "XXXXXXX", "XXX.XXX", "XX...XX", "......."];
const ROWS = 7;
const LINES = [
  "Assignment submitted at 11:59 PM",
  "Sold the drafter. Engineering Graphics: survived",
  "Bunked a lecture, found a deal",
  "Mess food 2/10. This deal 10/10",
  "The hostel wing group chat found out",
  "Lab record done (don't ask how)",
  "Canteen chai break, 5 mins only",
  "Fest pass resold. Big W",
  "No cap, that was a steal",
  "End-sem mode: on",
  "Seniors' notes, passed down with love",
  "Placement season grind",
  "Proxy attendance? Not here",
  "Midnight Maggi, budget intact",
];
const HEART_LINE = "Made with love by alumni, for juniors";
// For girls: relatable (and a little funny) hostel-life lines.
const GIRL_LINES = [
  "Hostel curfew 9:30. Deal closed 9:29",
  "Bought a lehenga for one fest. Worn once. Iconic",
  "Ten minutes to get ready, two hours to pick earrings",
  "Roomie borrowed your straightener. Again",
  "Library seat saved with one dupatta",
  "Fairy lights up, assignment still pending",
  "Warden walked in. Act normal",
  "Late-night chai and gossip on the terrace",
  "Your notes so neat the whole class photocopied them",
  "Found that dress here for half the price",
  "Group project: you did all the work, again",
  "Skipped mess dinner, Maggi party in room 204",
  "Sold the kurti you never wore. Wardrobe breathes",
  "Rainy day, broken umbrella, zero regrets",
];
const BOW_LINE = "Made with love, for every girl on campus";

const hash = (x: number, y: number) => {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
};

export function PixelGrid({ cell = 10, gap = 3, style }: { cell?: number; gap?: number; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  const isGirl = useAuthStore((s) => s.user?.gender === "female");
  const girlsMode = usePrefsStore((s) => s.girlsMode);
  const forGirls = isGirl || girlsMode;
  const ART = forGirls ? BOW : HEART;
  const lines = forGirls ? GIRL_LINES : LINES;
  const [w, setW] = useState(0);
  const [lit, setLit] = useState<Set<string>>(new Set());
  const [tip, setTip] = useState<{ x: number; y: number; text: string; key: number } | null>(null);
  const t = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cols = w ? Math.floor((w + gap) / (cell + gap)) : 0;

  useEffect(() => {
    if (!cols) return;
    t.setValue(0);
    Animated.timing(t, { toValue: 1, duration: 1400, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [cols, t]);
  useEffect(() => () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  const hx = Math.floor((cols - ART[0].length) / 2);
  const isHeart = (x: number, y: number) => y < ART.length && x - hx >= 0 && x - hx < ART[0].length && ART[y][x - hx] === "X";
  const levels = c.dark ? [0.06, 0.12, 0.2, 0.32] : [0.05, 0.1, 0.17, 0.28];

  const tap = (x: number, y: number) => {
    const heart = isHeart(x, y);
    haptic.select();
    const k = `${x}:${y}`;
    if (!heart)
      setLit((cur) => {
        const next = new Set(cur);
        if (next.has(k)) next.delete(k);
        else next.add(k);
        return next;
      });
    setTip({ x, y, text: heart ? (forGirls ? BOW_LINE : HEART_LINE) : lines[Math.floor(hash(y, x) * lines.length)], key: Date.now() });
    pop.setValue(0);
    Animated.spring(pop, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 9 }).start();
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      Animated.timing(pop, { toValue: 0, duration: 160, useNativeDriver: true }).start(() => setTip(null));
    }, 2400);
  };

  // Tooltip position: centred over the tapped column, clamped to the grid.
  const TIP_W = 220;
  const tipLeft = tip ? Math.max(0, Math.min(w - TIP_W, tip.x * (cell + gap) + cell / 2 - TIP_W / 2)) : 0;
  const arrowLeft = tip ? tip.x * (cell + gap) + cell / 2 - tipLeft - 6 : 0;

  return (
    <View style={style}>
      <View style={{ height: 44, justifyContent: "flex-end" }} pointerEvents="none">
        {tip ? (
          <Animated.View
            key={tip.key}
            style={{
              position: "absolute",
              bottom: 6,
              left: tipLeft,
              width: TIP_W,
              opacity: pop,
              transform: [{ translateY: pop.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }, { scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) }],
            }}
          >
            <View style={{ backgroundColor: c.dark ? "#F4F4F5" : "#0F172A", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7 }}>
              <Text style={{ color: c.dark ? "#0F172A" : "#FFFFFF", fontSize: 11.5, textAlign: "center", ...font.semibold }}>{tip.text}</Text>
            </View>
            <View
              style={{
                position: "absolute",
                bottom: -5,
                left: Math.max(8, Math.min(TIP_W - 20, arrowLeft)),
                width: 12,
                height: 12,
                backgroundColor: c.dark ? "#F4F4F5" : "#0F172A",
                transform: [{ rotate: "45deg" }],
                borderRadius: 2,
              }}
            />
          </Animated.View>
        ) : (
          <Text style={{ color: c.textFaint, fontSize: 11, paddingBottom: 6, ...font.medium }}>Tap a square. Some of them have stories.</Text>
        )}
      </View>
      <View style={{ flexDirection: "row", gap }} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
        {Array.from({ length: cols }).map((_, x) => {
          const start = (x / Math.max(cols, 1)) * 0.65;
          return (
            <Animated.View key={x} style={{ gap, opacity: t.interpolate({ inputRange: [start, start + 0.35], outputRange: [0, 1], extrapolate: "clamp" }) }}>
              {Array.from({ length: ROWS }).map((__, y) => {
                const heart = isHeart(x, y);
                const on = lit.has(`${x}:${y}`);
                const active = tip?.x === x && tip?.y === y;
                const r = hash(x, y);
                const level = r > 0.86 ? 3 : r > 0.62 ? 2 : r > 0.3 ? 1 : 0;
                return (
                  <Pressable
                    key={y}
                    onPress={() => tap(x, y)}
                    hitSlop={1.5}
                    accessibilityLabel={heart ? (forGirls ? "Bow square" : "Heart square") : "Grid square"}
                    style={{
                      width: cell,
                      height: cell,
                      borderRadius: cell * 0.3,
                      backgroundColor: heart || on ? c.accent : c.accentText,
                      opacity: heart ? 0.95 : on ? 0.8 : levels[level],
                      transform: [{ scale: active ? 1.35 : 1 }],
                    }}
                  />
                );
              })}
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}
