import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Pressy } from "@/components/ui";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useRecentStore } from "@/store/recent";
import { font, useTheme } from "@/theme";
import { firstImage, ikThumb } from "@/utils/image";

/** "Good morning" etc. — student hours: late nights count as night. */
export const greeting = (d = new Date()) => {
  const h = d.getHours();
  if (h < 5) return "Up late";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Up late";
};

// Budget- and freshness-first shortcuts: the filters students reach for most.
const PICKS: { label: string; icon: IconName; params: Record<string, string> }[] = [
  { label: "Under ₹500", icon: "wallet-outline", params: { max_price: "500" } },
  { label: "Under ₹1,000", icon: "pricetag-outline", params: { max_price: "1000" } },
  { label: "New today", icon: "sparkles-outline", params: { posted_within: "1", sort: "latest" } },
  { label: "Open to offers", icon: "handshake", params: { negotiable: "true" } },
];

export function QuickPicks() {
  const { c } = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingTop: 14 }}>
      {PICKS.map((p) => (
        <Pressy
          key={p.label}
          haptics
          onPress={() => router.push({ pathname: "/explore", params: p.params })}
          style={[styles.pick, { backgroundColor: c.card, borderColor: c.border }]}
          accessibilityLabel={`Browse ${p.label}`}
        >
          <View style={[styles.pickIcon, { backgroundColor: c.accentSoft }]}>
            <Icon name={p.icon} size={14} color={c.accentText} />
          </View>
          <Text style={{ color: c.text, fontSize: 13, ...font.semibold }}>{p.label}</Text>
        </Pressy>
      ))}
    </ScrollView>
  );
}

const INR = new Intl.NumberFormat("en-IN");

/** "Pick up where you left off": last viewed listings (on-device only). */
export function RecentlyViewed() {
  const { c } = useTheme();
  const items = useRecentStore((s) => s.items).filter((i) => i.status !== "sold");
  const clear = useRecentStore((s) => s.clear);
  if (!items.length) return null;
  return (
    <View>
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: c.text, fontSize: 18, letterSpacing: -0.3, ...font.semibold }}>Pick up where you left off</Text>
          <Text style={{ color: c.textMuted, fontSize: 13, ...font.regular }}>Recently viewed on this phone</Text>
        </View>
        <Pressable onPress={clear} hitSlop={8}>
          <Text style={{ color: c.textMuted, fontSize: 13, ...font.semibold }}>Clear</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
        {items.map((p) => {
          const img = firstImage(p.images);
          return (
            <Pressy key={p._id} onPress={() => router.push(`/product/${p.slug || p._id}`)} style={[styles.recent, { backgroundColor: c.card, borderColor: c.border }]}>
              <View style={[styles.recentImg, { backgroundColor: c.surfaceAlt }]}>
                {img ? <Image source={{ uri: ikThumb(img, 220) }} style={StyleSheet.absoluteFill} contentFit="cover" cachePolicy="memory-disk" /> : null}
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text numberOfLines={2} style={{ color: c.text, fontSize: 12.5, lineHeight: 16, ...font.semibold }}>
                  {p.title}
                </Text>
                <Text style={{ color: c.text, fontSize: 13.5, ...font.bold }}>₹{INR.format(p.selling_price || 0)}</Text>
              </View>
            </Pressy>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pick: { flexDirection: "row", alignItems: "center", gap: 7, height: 38, paddingLeft: 6, paddingRight: 13, borderRadius: 999, borderWidth: 1 },
  pickIcon: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  head: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 16, marginTop: 24, marginBottom: 12 },
  recent: { width: 236, flexDirection: "row", gap: 10, padding: 8, borderRadius: 16, borderWidth: 1, alignItems: "center" },
  recentImg: { width: 60, height: 60, borderRadius: 12, overflow: "hidden" },
});
