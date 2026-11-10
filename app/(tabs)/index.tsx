import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { productApi } from "@/api/products";
import { FirstListingCelebration, consumeCelebration } from "@/components/home/Celebration";
import { GirlsCornerDrawer } from "@/components/home/GirlsCornerDrawer";
import { HomeHeader } from "@/components/home/HomeHeader";
import { PromoCards } from "@/components/home/PromoCards";
import { CategoryIcon } from "@/components/product/CategoryIcon";
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
  const [heroQuery, setHeroQuery] = useState("");
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    consumeCelebration().then((v) => v && setCelebrate(true));
  }, []);

  const boosted = useQuery({
    queryKey: ["boosted", campusSlug, audience],
    queryFn: () => productApi.boosted({ campus_slug: campusSlug, audience, limit: 12 }),
  });
  const railWidth = Math.min(Math.round(width * 0.46), 220);
  const deals = boosted.data || [];

  const submitHero = () => {
    const q = heroQuery.trim();
    router.push(q ? { pathname: "/search", params: { q } } : "/explore");
  };

  const header = (
    <View>
      {/* Hero (brand-surface) */}
      <View style={[styles.hero, { backgroundColor: c.accent }]}>
        <Text style={styles.heroTitle}>{girls ? "Girls Corner 🌸" : "Buy and sell\non campus."}</Text>
        <Text style={styles.heroSub}>
          {girls ? "Listings by girls, for girls. Only verified female students can see and chat on these." : "Textbooks, gadgets, cycles and more from verified students near you."}
        </Text>
        <View style={styles.heroForm}>
          <Icon name="search" size={19} color="#94A3B8" style={{ marginLeft: 10 }} />
          <TextInput
            value={heroQuery}
            onChangeText={setHeroQuery}
            onSubmitEditing={submitHero}
            returnKeyType="search"
            placeholder="What are you looking for?"
            placeholderTextColor="#94A3B8"
            style={{ flex: 1, height: 44, color: "#0F172A", fontSize: 15, fontFamily: "Figtree_400Regular" }}
          />
          <Pressable onPress={submitHero} style={({ pressed }) => [styles.heroBtn, { opacity: pressed ? 0.85 : 1 }]}>
            <Text style={{ color: "#fff", fontSize: 14, ...font.semibold }}>Search</Text>
          </Pressable>
        </View>
        <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, marginTop: 16, ...font.regular }}>
          Have something to sell?{" "}
          <Text onPress={() => router.push("/sell")} style={{ color: "#fff", textDecorationLine: "underline", ...font.semibold }}>
            List it free
          </Text>
        </Text>
      </View>

      {/* Shop by Category */}
      <View style={{ paddingHorizontal: 16 }}>
        <SectionHeader title="Shop by Category" subtitle="Textbooks, gadgets, cycles & more" style={{ marginTop: 18 }} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 4 }}>
        {categoriesFor(girls).map((cat) => (
          <Pressable
            key={cat.value}
            onPress={() => router.push({ pathname: "/category/[slug]", params: { slug: cat.value } })}
            style={({ pressed }) => [styles.cat, { backgroundColor: c.dark ? "#171717" : "#FFFFFF", borderColor: c.dark ? "#404040" : "#E1E5EA", transform: [{ scale: pressed ? 0.97 : 1 }] }]}
            accessibilityLabel={`Browse ${cat.label} category`}
          >
            <CategoryIcon value={cat.value} size={40} />
            <Text numberOfLines={2} style={{ color: c.dark ? "#fff" : "#4A5565", fontSize: 12, textAlign: "center", paddingHorizontal: 4, ...font.semibold }}>
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

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

      <View style={{ paddingHorizontal: 16 }}>
        <SectionHeader title="Trending Items" subtitle="Hot on your campus right now 🔥" style={{ marginTop: 26 }} />
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: c.barSolid }}>
      <HomeHeader />
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <ProductGrid
          params={{ campus_slug: campusSlug, audience }}
          header={header}
          empty={<EmptyState icon="pricetags-outline" title={`No listings on ${label || "your campus"} yet`} message="Be the first to list something. It takes 2 minutes." action="List an item" onAction={() => router.push("/sell")} />}
          footer={<PromoCards />}
        />
        <GirlsCornerDrawer />
        <AssistantFab />
      </View>
      {celebrate ? <FirstListingCelebration onClose={() => setCelebrate(false)} /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: { marginHorizontal: 16, marginTop: 12, borderRadius: 16, paddingHorizontal: 22, paddingVertical: 34 },
  heroTitle: { color: "#fff", fontSize: 34, lineHeight: 35, letterSpacing: -1.2, fontFamily: "Figtree_700Bold" },
  heroSub: { color: "rgba(255,255,255,0.85)", fontSize: 15, lineHeight: 22, marginTop: 14, fontFamily: "Figtree_400Regular" },
  heroForm: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 6,
    marginTop: 24,
    shadowColor: "#020617",
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  heroBtn: { height: 44, paddingHorizontal: 18, borderRadius: 12, backgroundColor: "#0F172A", alignItems: "center", justifyContent: "center" },
  cat: { width: 96, height: 85, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  deals: { marginHorizontal: 16, marginTop: 24, borderRadius: 16, borderWidth: 1, padding: 16 },
  live: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2 },
  viewAll: { flexDirection: "row", alignItems: "center", gap: 6, height: 36, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1 },
});
