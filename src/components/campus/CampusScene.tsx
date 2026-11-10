import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import Svg, { Circle, Line, Path, Polygon, Rect } from "react-native-svg";
import { useTheme } from "@/theme";

const W = 320;
const H = 150;

const loop = (v: Animated.Value, duration: number) =>
  Animated.loop(Animated.timing(v, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true }));

/**
 * Small animated campus: clock tower with a ticking hand, windows that
 * light up one by one, drifting clouds and a student walking past with a
 * box (selling something, obviously).
 */
export function CampusScene() {
  const { c } = useTheme();
  const clock = useRef(new Animated.Value(0)).current;
  const cloudA = useRef(new Animated.Value(0)).current;
  const cloudB = useRef(new Animated.Value(0)).current;
  const walk = useRef(new Animated.Value(0)).current;
  const bob = useRef(new Animated.Value(0)).current;
  const windows = useRef(Array.from({ length: 8 }, () => new Animated.Value(0))).current;

  useEffect(() => {
    const anims = [
      loop(clock, 6000),
      loop(cloudA, 18000),
      loop(cloudB, 26000),
      loop(walk, 9000),
      Animated.loop(Animated.sequence([Animated.timing(bob, { toValue: 1, duration: 260, useNativeDriver: true }), Animated.timing(bob, { toValue: 0, duration: 260, useNativeDriver: true })])),
      ...windows.map((w, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(i * 450),
            Animated.timing(w, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.delay(2600),
            Animated.timing(w, { toValue: 0, duration: 500, useNativeDriver: true }),
            Animated.delay((7 - i) * 450),
          ]),
        ),
      ),
    ];
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, [clock, cloudA, cloudB, walk, bob, windows]);

  const wall = c.card;
  const line = c.accentSoftStrong;
  const roof = c.accent;
  // Wing windows (left wing x 22–58, right wing x 262–298).
  const winPos = [
    [26, 92], [42, 92], [26, 110], [42, 110],
    [266, 92], [282, 92], [266, 110], [282, 110],
  ];

  return (
    <View style={styles.box} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {/* Sun */}
      <View style={[styles.sun, { backgroundColor: c.dark ? "rgba(253,230,138,0.18)" : "#FEF3C7" }]} />

      {/* Clouds */}
      <Animated.View style={[styles.cloud, { top: 14, transform: [{ translateX: cloudA.interpolate({ inputRange: [0, 1], outputRange: [-70, W + 10] }) }] }]}>
        <Cloud color={c.dark ? "rgba(255,255,255,0.12)" : "#FFFFFF"} />
      </Animated.View>
      <Animated.View style={[styles.cloud, { top: 40, transform: [{ translateX: cloudB.interpolate({ inputRange: [0, 1], outputRange: [W + 10, -70] }) }, { scale: 0.7 }] }]}>
        <Cloud color={c.dark ? "rgba(255,255,255,0.1)" : "#FFFFFF"} />
      </Animated.View>

      <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
        {/* Ground */}
        <Rect x={0} y={132} width={W} height={18} rx={9} fill={c.accentSoft} />
        {/* Wings */}
        <Rect x={18} y={84} width={44} height={48} rx={4} fill={wall} stroke={line} strokeWidth={1.5} />
        <Rect x={258} y={84} width={44} height={48} rx={4} fill={wall} stroke={line} strokeWidth={1.5} />
        <Rect x={14} y={78} width={52} height={8} rx={3} fill={roof} opacity={0.85} />
        <Rect x={254} y={78} width={52} height={8} rx={3} fill={roof} opacity={0.85} />
        {/* Main hall */}
        <Rect x={62} y={70} width={196} height={62} fill={wall} stroke={line} strokeWidth={1.5} />
        <Polygon points="54,72 160,38 266,72" fill={roof} />
        <Rect x={56} y={70} width={208} height={6} rx={2} fill={roof} />
        {/* Columns */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Rect key={i} x={76 + i * 32} y={80} width={8} height={52} rx={2} fill={c.accentSoftStrong} />
        ))}
        {/* Door */}
        <Path d="M150 132 V112 a10 10 0 0 1 20 0 V132 Z" fill={roof} />
        {/* Steps */}
        <Rect x={140} y={130} width={40} height={4} rx={2} fill={line} />
        {/* Clock tower */}
        <Rect x={142} y={16} width={36} height={30} rx={3} fill={wall} stroke={line} strokeWidth={1.5} />
        <Polygon points="138,18 160,2 182,18" fill={roof} />
        <Circle cx={160} cy={31} r={9} fill={c.dark ? "#26292E" : "#FFFFFF"} stroke={roof} strokeWidth={2} />
        <Line x1={160} y1={31} x2={165} y2={31} stroke={c.text} strokeWidth={1.6} strokeLinecap="round" />
      </Svg>

      {/* Ticking minute hand */}
      <Animated.View style={[styles.hand, { transform: [{ rotate: clock.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) }] }]}>
        <View style={{ width: 1.8, height: 7, borderRadius: 1, backgroundColor: c.text, marginTop: 2 }} />
      </Animated.View>

      {/* Windows lighting up */}
      {winPos.map(([x, y], i) => (
        <View key={i} style={[styles.win, { left: x, top: y, backgroundColor: c.dark ? "#2A2D33" : "#E8ECF4" }]}>
          <Animated.View style={[StyleSheet.absoluteFill, { borderRadius: 2, backgroundColor: "#FBBF24", opacity: windows[i] }]} />
        </View>
      ))}

      {/* Student carrying a box across the quad */}
      <Animated.View
        style={[
          styles.student,
          {
            transform: [
              { translateX: walk.interpolate({ inputRange: [0, 1], outputRange: [-24, W + 24] }) },
              { translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, -1.5] }) },
            ],
          },
        ]}
      >
        <Svg width={22} height={26} viewBox="0 0 22 26">
          <Circle cx={8} cy={5} r={4} fill={c.text} />
          <Rect x={4} y={10} width={8} height={10} rx={3} fill={roof} />
          <Rect x={11} y={11} width={9} height={7} rx={1.5} fill="#F59E0B" />
          <Line x1={6} y1={20} x2={5} y2={25} stroke={c.text} strokeWidth={2} strokeLinecap="round" />
          <Line x1={10} y1={20} x2={11} y2={25} stroke={c.text} strokeWidth={2} strokeLinecap="round" />
        </Svg>
      </Animated.View>
    </View>
  );
}

function Cloud({ color }: { color: string }) {
  return (
    <Svg width={64} height={26} viewBox="0 0 64 26">
      <Path d="M14 24h38a10 10 0 0 0 0-20 14 14 0 0 0-26 2 9 9 0 0 0-12 18z" fill={color} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  box: { width: W, height: H, alignSelf: "center", overflow: "hidden" },
  sun: { position: "absolute", right: 18, top: 8, width: 30, height: 30, borderRadius: 15 },
  cloud: { position: "absolute", left: 0 },
  hand: { position: "absolute", left: 160 - 9, top: 31 - 9, width: 18, height: 18, alignItems: "center" },
  win: { position: "absolute", width: 12, height: 12, borderRadius: 2, overflow: "hidden" },
  student: { position: "absolute", left: 0, top: 108 },
});
