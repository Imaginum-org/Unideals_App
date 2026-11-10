import { router } from "expo-router";
import { FlatList, RefreshControl } from "react-native";
import { ProductCard } from "@/components/product/ProductCard";
import { useCardWidth } from "@/components/product/ProductGrid";
import { EmptyState, Loader, Screen, TopBar } from "@/components/ui";
import { useWishlist } from "@/hooks/useWishlist";
import { useTheme } from "@/theme";

export default function Wishlist() {
  const { c } = useTheme();
  const { items, isLoading, refetch } = useWishlist();
  const { cols, cardWidth } = useCardWidth();
  return (
    <Screen padded={false} header={<TopBar title="Wishlist" subtitle={items.length ? `${items.length} saved` : undefined} />}>
      {isLoading ? (
        <Loader full={false} />
      ) : (
        <FlatList
          key={cols}
          data={items.filter((p) => typeof p === "object" && p?._id)}
          numColumns={cols}
          keyExtractor={(p) => p._id}
          columnWrapperStyle={{ gap: 10, paddingHorizontal: 16 }}
          contentContainerStyle={{ gap: 10, paddingVertical: 14 }}
          renderItem={({ item }) => <ProductCard product={item} width={cardWidth} />}
          refreshControl={<RefreshControl refreshing={false} onRefresh={() => void refetch()} tintColor={c.accent} />}
          ListEmptyComponent={
            <EmptyState icon="heart-outline" title="Nothing saved yet" message="Tap the heart on any listing to keep it here." action="Explore listings" onAction={() => router.push("/explore")} />
          }
        />
      )}
    </Screen>
  );
}
