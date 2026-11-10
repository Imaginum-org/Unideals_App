import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, Path, Rect, Stop, LinearGradient as SvgGradient } from "react-native-svg";
import { useTheme } from "@/theme";

type Tier = "base_user" | "pro" | "pro_plus";

// One "bank card" design per plan.
const SKINS: Record<Tier, { name: string; label: string; bg: [string, string, string]; fg: string; muted: string; chip: [string, string]; ring: string }> = {
  base_user: {
    name: "Free",
    label: "CAMPUS CLASSIC",
    bg: ["#E9EDF3", "#C9D1DD", "#A9B4C4"],
    fg: "#0F172A",
    muted: "rgba(15,23,42,0.6)",
    chip: ["#E5E7EB", "#9CA3AF"],
    ring: "rgba(255,255,255,0.45)",
  },
  pro: {
    name: "Pro",
    label: "DEAN'S LIST",
    bg: ["#5B5BF5", "#3838EC", "#1E1B8F"],
    fg: "#FFFFFF",
    muted: "rgba(255,255,255,0.72)",
    chip: ["#FDE68A", "#D4A017"],
    ring: "rgba(255,255,255,0.12)",
  },
  pro_plus: {
    name: "Pro Plus",
    label: "TOPPER",
    bg: ["#2A2108", "#121010", "#050505"],
    fg: "#FDE68A",
    muted: "rgba(253,230,138,0.65)",
    chip: ["#FDE68A", "#B7791F"],
    ring: "rgba(253,230,138,0.10)",
  },
};

function Chip({ colors }: { colors: [string, string] }) {
  return (
    <Svg width={42} height={32} viewBox="0 0 42 32">
      <Defs>
        <SvgGradient id="chip" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={colors[0]} />
          <Stop offset="1" stopColor={colors[1]} />
        </SvgGradient>
      </Defs>
      <Rect x={0.5} y={0.5} width={41} height={31} rx={6} fill="url(#chip)" />
      <Path d="M0 11h13M0 21h13M29 11h13M29 21h13M13 0v32M29 0v32M13 16h16" stroke="rgba(0,0,0,0.28)" strokeWidth={1} fill="none" />
    </Svg>
  );
}

function Contactless({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      {[5, 9, 13].map((r, i) => (
        <Path key={r} d={`M${6 + i * 3.4} ${12 - r * 0.62}a${r} ${r} 0 0 1 0 ${r * 1.24}`} stroke={color} strokeWidth={2} strokeLinecap="round" fill="none" />
      ))}
    </Svg>
  );
}

/** Current-plan card styled like a debit card — a different skin per plan. */
export function PlanCard({ tier, holder, number, validTill, since, status }: { tier: string; holder?: string; number: string; validTill: string; since: string; status: string }) {
  const { c } = useTheme();
  const s = SKINS[(tier as Tier) in SKINS ? (tier as Tier) : "base_user"];
  return (
    <View style={[styles.shadow, { shadowOpacity: c.dark ? 0 : 0.25 }]}>
      <LinearGradient colors={s.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
        {/* Sheen + rings */}
        <Svg style={StyleSheet.absoluteFill} viewBox="0 0 340 214" preserveAspectRatio="xMidYMid slice">
          <Circle cx={300} cy={-10} r={120} fill={s.ring} />
          <Circle cx={330} cy={200} r={90} fill={s.ring} />
          <Path d="M-20 170 Q 120 120 360 190" stroke={s.ring} strokeWidth={26} fill="none" />
        </Svg>

        <View style={styles.row}>
          <View>
            <Text style={[styles.brand, { color: s.fg }]}>unideals</Text>
            <Text style={[styles.tierLabel, { color: s.muted }]}>
              {s.name.toUpperCase()} · {s.label}
            </Text>
          </View>
          <View style={[styles.status, { borderColor: s.muted }]}>
            <View style={[styles.dot, { backgroundColor: status === "Active" ? "#34D399" : "#FBBF24" }]} />
            <Text style={{ color: s.fg, fontSize: 10.5, letterSpacing: 0.6, fontFamily: "Figtree_700Bold" }}>{status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={[styles.row, { marginTop: 18 }]}>
          <Chip colors={s.chip} />
          <Contactless color={s.muted} />
        </View>

        <Text style={[styles.number, { color: s.fg }]}>{number}</Text>

        <View style={[styles.row, { alignItems: "flex-end" }]}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[styles.cap, { color: s.muted }]}>CARD HOLDER</Text>
            <Text numberOfLines={1} style={[styles.val, { color: s.fg }]}>
              {(holder || "Student").toUpperCase()}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end", marginLeft: 12 }}>
            <Text style={[styles.cap, { color: s.muted }]}>SINCE · VALID TILL</Text>
            <Text style={[styles.val, { color: s.fg }]}>
              {since} · {validTill}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: { borderRadius: 22, shadowColor: "#0F172A", shadowRadius: 22, shadowOffset: { width: 0, height: 12 }, elevation: 8 },
  card: { aspectRatio: 1.586, borderRadius: 22, padding: 20, overflow: "hidden", justifyContent: "space-between" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { fontSize: 20, letterSpacing: -0.6, fontFamily: "Figtree_800ExtraBold" },
  tierLabel: { fontSize: 10, letterSpacing: 2, marginTop: 1, fontFamily: "Figtree_700Bold" },
  status: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  number: { fontSize: 19, letterSpacing: 2.5, marginTop: 6, fontVariant: ["tabular-nums"], fontFamily: "Figtree_600SemiBold" },
  cap: { fontSize: 8.5, letterSpacing: 1.2, fontFamily: "Figtree_700Bold" },
  val: { fontSize: 12.5, letterSpacing: 0.6, marginTop: 2, fontFamily: "Figtree_600SemiBold" },
});
