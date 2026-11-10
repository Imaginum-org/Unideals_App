import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { productApi } from "@/api/products";
import { FirstListingCelebration, consumeCelebration } from "@/components/home/Celebration";
import { HomeHeader } from "@/components/home/HomeHeader";
import { Spotlight } from "@/components/home/Spotlight";
import { PromoCards } from "@/components/home/PromoCards";
import { QuickPicks, RecentlyViewed } from "@/components/home/Personal";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import { ProductGrid } from "@/components/product/ProductGrid";
import { AssistantFab } from "@/components/assistant/AssistantFab";
import { EmptyState, SectionHeader } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { categoriesFor } from "@/constants/product";
import { useCampus } from "@/hooks/useCampus";
import { canSeeGirls, useAuthStore } from "@/store/auth";
import { usePrefsStore } from "@/store/prefs";
import { font, useTheme } from "@/theme";

function LivePill({ count }: { count: number }) {
  const { c } = useTheme();
  const v = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([Animated.timing(v, { toValue: 0.3, duration: 900, useNativeDriver: true }), Animated.timing(v, { toValue: 1, duration: 900, useNativeDriver: true })]));
    loop.start();
    return () => loop.stop();
  }, [v]);
  return (
    <View style={[styles.live, { backgroundColor: c.dark ? "rgba(255,255,255,0.05)" : "#fff", borderColor: c.accentSoftStrong }]}>
      <Animated.View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.accent, opacity: v }} />
      <Text style={{ color: c.accentText, fontSize: 11.5, ...font.semibold }}>{count} live</Text>
    </View>
  );
}

export default function Home() {
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const { campusSlug, label } = useCampus();
  const user = useAuthStore((s) => s.user);
  const girlsMode = usePrefsStore((s) => s.girlsMode);
  const girls = girlsMode && canSeeGirls(user);
  const audience = girls ? ("girls_only" as const) : undefined;
  const [celebrate, setCelebrate] = useState(false);
  const [category, setCategory] = useState<string | undefined>();
  const activeCat = category ? categoriesFor(girls).find((x) => x.value === category) : undefined;
  // Leaving Girl Mode can hide the selected (girls-only) category.
  useEffect(() => {
    if (category && !activeCat) setCategory(undefined);
  }, [category, activeCat]);
  const qc = useQueryClient();

  useEffect(() => {
    consumeCelebration().then((v) => v && setCelebrate(true));
  }, []);

  const boosted = useQuery({
    queryKey: ["boosted", campusSlug, audience],
    queryFn: () => productApi.boosted({ campus_slug: campusSlug, audience, limit: 12 }),
  });
  const railWidth = Math.min(Math.round(width * 0.46), 220);
  const deals = boosted.data || [];

  const header = activeCat ? (
    <View style={{ paddingHorizontal: 16 }}>
      <SectionHeader title={activeCat.label} subtitle={activeCat.description} style={{ marginTop: 16, marginBottom: 4 }} />
    </View>
  ) : (
    <View>
      <Spotlight onPick={setCategory} />

      <QuickPicks />

      {/* Limited time deals */}
      {boosted.isLoading || deals.length > 0 ? (
        <View style={[styles.deals, { borderColor: c.accentSoftStrong, backgroundColor: c.accentSoft }]}>
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={{ color: c.text, fontSize: 18, letterSpacing: -0.3, ...font.semibold }}>Limited time deals</Text>
                {deals.length ? <LivePill count={deals.length} /> : null}
              </View>
              <Text style={{ color: c.textMuted, fontSize: 13, marginTop: 1, ...font.regular }}>Boosted listings, ending soon</Text>
            </View>
            <Pressable
              onPress={() => router.push("/deals")}
              style={({ pressed }) => [styles.viewAll, { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.8 : 1 }]}
            >
              <Text style={{ color: c.text, fontSize: 13, ...font.semibold }}>View all</Text>
              <Icon name="arrow-forward" size={14} color={c.text} />
            </Pressable>
          </View>
          <FlatList
            horizontal
            data={boosted.isLoading ? [] : deals.slice(0, 8)}
            keyExtractor={(p) => p._id}
            showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: -16, marginTop: 14 }}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            snapToInterval={railWidth + 12}
            decelerationRate="fast"
            renderItem={({ item }) => <ProductCard product={item} width={railWidth} showBoostBar />}
            ListEmptyComponent={
              <View style={{ flexDirection: "row", gap: 12 }}>
                <ProductCardSkeleton width={railWidth} />
                <ProductCardSkeleton width={railWidth} />
              </View>
            }
          />
        </View>
      ) : null}

      <RecentlyViewed />

      <View style={{ paddingHorizontal: 16 }}>
        <SectionHeader title="Trending Items" subtitle="What your batch is eyeing right now" style={{ marginTop: 26 }} />
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <HomeHeader brand category={category} onCategory={setCategory} />
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <ProductGrid
          params={{ campus_slug: campusSlug, audience, category }}
          header={header}
          empty={<EmptyState icon="pricetags-outline" title={`No listings on ${label || "your campus"} yet`} message="Be the first to list something. It takes less time than a viva." action="List an item" onAction={() => router.push("/sell")} />}
          footer={<PromoCards offset={category ? 72 : 34} />}
          inTabs
          tab="index"
          onRefresh={() => Promise.all(["boosted", "cat-stat"].map((k) => qc.invalidateQueries({ queryKey: [k] })))}
        />
        <AssistantFab />
      </View>
      {celebrate ? <FirstListingCelebration onClose={() => setCelebrate(false)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  deals: { marginHorizontal: 16, marginTop: 24, borderRadius: 16, borderWidth: 1, padding: 16 },
  live: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2 },
  viewAll: { flexDirection: "row", alignItems: "center", gap: 6, height: 36, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1 },
});
