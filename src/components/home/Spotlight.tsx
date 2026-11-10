import { useQueries } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { productApi } from "@/api/products";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { CategoryIcon } from "@/components/product/CategoryIcon";
import { Pressy } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { categoriesFor, type Option } from "@/constants/product";
import { useCampus } from "@/hooks/useCampus";
import { haptic } from "@/lib/haptics";
import { canSeeGirls, useAuthStore } from "@/store/auth";
import { usePrefsStore } from "@/store/prefs";
import { font, useTheme } from "@/theme";
import { formatName, inr } from "@/utils/format";
import { brandGradient } from "./HomeHeader";
import { greeting } from "./Personal";

/** Tiny five-petal flowers, very faint: a quiet Girls Corner motif. */
function Petals({ width }: { width: number }) {
  const spots = [
    [width * 0.08, 18, 1],
    [width * 0.9, 12, 0.8],
    [width * 0.22, 64, 0.6],
    [width * 0.78, 58, 0.7],
  ];
  return (
    <Svg width={width} height={90} style={StyleSheet.absoluteFill} pointerEvents="none">
      {spots.map(([x, y, s], i) => (
        <G key={i} transform={`translate(${x} ${y}) scale(${s})`} opacity={0.18}>
          {[0, 72, 144, 216, 288].map((a) => (
            <Circle key={a} cx={Math.cos((a * Math.PI) / 180) * 6} cy={Math.sin((a * Math.PI) / 180) * 6} r={5} fill="#FFFFFF" />
          ))}
          <Circle cx={0} cy={0} r={3.2} fill="#FDE68A" />
        </G>
      ))}
    </Svg>
  );
}

const short = (o: Option) => (o.description || "").split(",").slice(0, 2).join(",").trim();

/**
 * Top of the Home feed (Zepto-style): the header's brand gradient fades
 * into the page behind a ribbon title and a 3×2 grid of category cards.
 */
export function Spotlight({ onPick }: { onPick: (category: string) => void }) {
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const { label, campusSlug } = useCampus();
  const user = useAuthStore((s) => s.user);
  const girls = usePrefsStore((s) => s.girlsMode) && canSeeGirls(user);
  const firstName = user?.name ? formatName(user.name).split(" ")[0] : "";
  const g = brandGradient(c);
  const tile = Math.floor((width - 24 - 16) / 3);
  const cats = categoriesFor(girls).slice(0, 6);
  // Real numbers per card: live listing count + cheapest price (1-item page, cheapest first).
  const stats = useQueries({
    queries: cats.map((cat) => ({
      queryKey: ["cat-stat", campusSlug, girls, cat.value],
      queryFn: () => productApi.feed({ campus_slug: campusSlug, category: cat.value, audience: girls ? "girls_only" : undefined, sort: "price_low", limit: 1, page: 1 }),
      staleTime: 5 * 60_000,
    })),
  });

  return (
    <LinearGradient colors={[g[1], g[2], c.bg]} locations={[0, 0.5, 1]} style={styles.wrap}>
      {girls ? <Petals width={width} /> : null}
      <View style={styles.ribbonRow}>
        <Icon name="sparkle" size={14} color="#FDE68A" filled />
        <View style={styles.ribbon}>
          <Text style={[styles.ribbonText, { color: c.girls ? "#BE185D" : "#2B2BDB" }]}>{girls ? "GIRLS CORNER" : "CAMPUS STEALS"}</Text>
        </View>
        <Icon name="sparkle" size={14} color="#FDE68A" filled />
      </View>
      <Text style={styles.sub} numberOfLines={1}>
        {firstName ? `${greeting()}, ${firstName} · fresh finds on ${label}` : `Fresh finds from students on ${label}`}
      </Text>

      <View style={styles.grid}>
        {cats.map((cat, i) => {
          const r = stats[i]?.data;
          const count = r?.pagination?.total ?? 0;
          const from = r?.data?.[0]?.selling_price;
          return (
          <Pressy
            key={cat.value}
            onPress={() => {
              haptic.select();
              onPick(cat.value);
            }}
            scaleTo={0.96}
            style={[styles.tile, { width: tile, backgroundColor: c.card, shadowOpacity: c.dark ? 0 : 0.08 }]}
            accessibilityLabel={`Browse ${cat.label}`}
          >
            <Text numberOfLines={2} style={{ color: c.text, fontSize: 13, lineHeight: 16, letterSpacing: -0.2, ...font.bold }}>
              {cat.label}
            </Text>
            {r && count > 0 && from != null ? (
              <Text style={{ color: c.accentText, fontSize: 11.5, marginTop: 3, ...font.bold }}>from {inr(from)}</Text>
            ) : (
              <Text numberOfLines={2} style={{ color: c.textMuted, fontSize: 10.5, lineHeight: 13, marginTop: 3, ...font.medium }}>
                {short(cat)}
              </Text>
            )}
            <View style={[styles.blob, { backgroundColor: c.accentSoft }]} />
            <View style={styles.art}>
              <CategoryIcon value={cat.value} size={40} />
            </View>
            <View style={[styles.count, { backgroundColor: count ? c.accentSoft : c.surface }]}>
              <Text style={{ color: count ? c.accentText : c.textMuted, fontSize: 10, ...font.bold }}>
                {r ? (count ? `${count} live` : "Be first") : "· · ·"}
              </Text>
            </View>
          </Pressy>
          );
        })}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 12, paddingTop: 14, paddingBottom: 4 },
  ribbonRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  ribbon: { backgroundColor: "#FFFFFF", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 5 },
  ribbonText: { fontSize: 12.5, letterSpacing: 1.6, fontFamily: "Figtree_800ExtraBold" },
  sub: { color: "rgba(255,255,255,0.88)", fontSize: 12.5, textAlign: "center", marginTop: 7, fontFamily: "Figtree_500Medium" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  tile: {
    height: 116,
    borderRadius: 16,
    padding: 10,
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  art: { position: "absolute", right: 7, bottom: 8 },
  blob: { position: "absolute", right: -16, bottom: -16, width: 70, height: 70, borderRadius: 35 },
  count: { position: "absolute", left: 10, bottom: 10, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 3 },
});
