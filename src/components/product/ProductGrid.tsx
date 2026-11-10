import { useInfiniteQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import type { ReactElement } from "react";
import { ActivityIndicator, FlatList, RefreshControl, Text, useWindowDimensions, View } from "react-native";
import { errorMessage } from "@/api/client";
import { productApi, type FeedParams } from "@/api/products";
import { Button, EmptyState, ErrorState } from "@/components/ui";
import { font, useTheme } from "@/theme";
import type { Product } from "@/types";
import { ProductCard, ProductCardSkeleton } from "./ProductCard";

export const GRID_GAP = 10;
export const GRID_PAD = 16;

export const useCardWidth = () => {
  const { width } = useWindowDimensions();
  const cols = width >= 700 ? 3 : 2;
  return { cols, cardWidth: Math.floor((width - GRID_PAD * 2 - GRID_GAP * (cols - 1)) / cols) };
};

/** Paged feed via GET /api/product (or /search when `q` is set). */
export const useProductFeed = (params: FeedParams & { q?: string }, enabled = true) =>
  useInfiniteQuery({
    queryKey: ["feed", params],
    enabled,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (params.q) {
        const { q, search: _s, ...rest } = params;
        const r = await productApi.search({ ...rest, q, page: pageParam, limit: 20 });
        return { data: r.products || [], pagination: r.pagination, filterMeta: undefined };
      }
      const r = await productApi.feed({ ...params, page: pageParam, limit: 20 });
      return { data: r.data || [], pagination: r.pagination, filterMeta: r.filterMeta };
    },
    getNextPageParam: (last) => {
      const p = last.pagination;
      return p && p.page < p.totalPages ? p.page + 1 : undefined;
    },
  });

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  const { cols, cardWidth } = useCardWidth();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: GRID_GAP, paddingHorizontal: GRID_PAD }}>
      {Array.from({ length: count - (count % cols) }).map((_, i) => (
        <ProductCardSkeleton key={i} width={cardWidth} />
      ))}
    </View>
  );
}

/** Infinite product grid with pull-to-refresh, skeletons and end-of-feed. */
export function ProductGrid({
  params,
  header,
  empty,
  enabled = true,
  footer,
  endMessage = "You're all caught up on the latest drops ✨",
}: {
  params: FeedParams & { q?: string };
  header?: ReactElement | null;
  empty?: ReactElement;
  enabled?: boolean;
  footer?: ReactElement;
  endMessage?: string;
}) {
  const { c } = useTheme();
  const { cols, cardWidth } = useCardWidth();
  const q = useProductFeed(params, enabled);
  const items: Product[] = q.data?.pages.flatMap((p) => p.data) ?? [];
  const done = !q.hasNextPage && items.length > 0 && !q.isLoading;

  return (
    <FlatList
      key={cols}
      data={items}
      numColumns={cols}
      keyExtractor={(p) => p._id}
      columnWrapperStyle={{ gap: GRID_GAP, paddingHorizontal: GRID_PAD }}
      contentContainerStyle={{ gap: GRID_GAP, paddingBottom: 28 }}
      ListHeaderComponent={header ?? undefined}
      renderItem={({ item }) => <ProductCard product={item} width={cardWidth} />}
      onEndReachedThreshold={0.6}
      onEndReached={() => {
        if (q.hasNextPage && !q.isFetchingNextPage) q.fetchNextPage();
      }}
      refreshControl={<RefreshControl refreshing={q.isRefetching && !q.isFetchingNextPage} onRefresh={() => void q.refetch()} tintColor={c.accent} />}
      ListEmptyComponent={
        q.isLoading ? (
          <SkeletonGrid />
        ) : q.isError ? (
          <ErrorState message={errorMessage(q.error)} onRetry={() => q.refetch()} />
        ) : (
          empty || <EmptyState icon="search-outline" title="Nothing here yet" message="Try another filter or check back soon." />
        )
      }
      ListFooterComponent={
        <View>
          {q.isFetchingNextPage ? <ActivityIndicator style={{ paddingVertical: 20 }} color={c.accent} /> : null}
          {done ? (
            <View style={{ alignItems: "center", gap: 14, paddingTop: 26, paddingHorizontal: 16 }}>
              <Text style={{ color: c.textFaint, fontSize: 13, ...font.medium }}>{endMessage}</Text>
              {params.q || params.category ? null : (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, alignSelf: "stretch" }}>
                  <View style={{ flex: 1, height: 1, backgroundColor: c.border }} />
                  <Button kind="secondary" title="View more products" iconRight="chevron-forward" full={false} onPress={() => router.push("/explore")} />
                  <View style={{ flex: 1, height: 1, backgroundColor: c.border }} />
                </View>
              )}
            </View>
          ) : null}
          {footer}
        </View>
      }
    />
  );
}
