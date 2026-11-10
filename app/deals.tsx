import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { FlatList, RefreshControl, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { errorMessage } from "@/api/client";
import { productApi } from "@/api/products";
import { ProductCard } from "@/components/product/ProductCard";
import { SkeletonGrid, useCardWidth } from "@/components/product/ProductGrid";
import { EmptyState, ErrorState, TopBar } from "@/components/ui";
import { useCampus } from "@/hooks/useCampus";
import { canSeeGirls, useAuthStore } from "@/store/auth";
import { usePrefsStore } from "@/store/prefs";
import { font, useTheme } from "@/theme";

/** Website /deals: every boosted listing on the campus, ending soonest. */
export default function Deals() {
  const { c } = useTheme();
  const { campusSlug } = useCampus();
  const user = useAuthStore((s) => s.user);
  const girls = usePrefsStore((s) => s.girlsMode) && canSeeGirls(user);
  const { cols, cardWidth } = useCardWidth();
  const q = useQuery({
    queryKey: ["deals", campusSlug, girls],
    queryFn: () => productApi.boosted({ campus_slug: campusSlug, audience: girls ? "girls_only" : undefined, limit: 50 }),
  });
  const items = [...(q.data || [])].sort((a, b) => new Date(a.boost_expires_at || 0).getTime() - new Date(b.boost_expires_at || 0).getTime());

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: c.barSolid }}>
      <TopBar title="Limited time deals" subtitle={items.length ? `${items.length} live` : undefined} />
      <FlatList
        style={{ backgroundColor: c.bg }}
        key={cols}
        data={items}
        numColumns={cols}
        keyExtractor={(p) => p._id}
        columnWrapperStyle={{ gap: 10, paddingHorizontal: 16 }}
        contentContainerStyle={{ gap: 10, paddingVertical: 16 }}
        ListHeaderComponent={
          <View style={{ paddingHorizontal: 16, paddingBottom: 4 }}>
            <Text style={{ color: c.textMuted, fontSize: 13.5, ...font.regular }}>Boosted by sellers on your campus. Gone when the timer runs out.</Text>
          </View>
        }
        renderItem={({ item }) => <ProductCard product={item} width={cardWidth} showBoostBar />}
        refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => void q.refetch()} tintColor={c.accent} />}
        ListEmptyComponent={
          q.isLoading ? (
            <SkeletonGrid />
          ) : q.isError ? (
            <ErrorState message={errorMessage(q.error)} onRetry={() => q.refetch()} />
          ) : (
            <EmptyState icon="flash-outline" title="No deals running right now" message="No boosted listings right now. Check back after the next lecture." action="Browse everything" onAction={() => router.push("/explore")} />
          )
        }
        ListFooterComponent={items.length ? <Text style={{ color: c.textFaint, textAlign: "center", marginTop: 18, fontSize: 13, ...font.medium }}>That's every deal right now</Text> : undefined}
      />
    </SafeAreaView>
  );
}
