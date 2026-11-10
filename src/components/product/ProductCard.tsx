import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Avatar, Skeleton } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { useWishlist } from "@/hooks/useWishlist";
import { font, shadow, useTheme } from "@/theme";
import { discountPct, isBoostLive, isHot } from "@/utils/format";
import { firstImage, ikCard } from "@/utils/image";
import type { Product, Seller } from "@/types";

export const productHref = (p: Pick<Product, "_id" | "slug">) => `/product/${p.slug || p._id}` as const;

const INR = new Intl.NumberFormat("en-IN");
const pad2 = (n: number) => String(n).padStart(2, "0");
/** Website formatEndsIn: "2d : 05h" or "05h:12m". */
const endsIn = (iso?: string) => {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  if (!Number.isFinite(ms) || ms <= 0) return null;
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h >= 48 ? `${Math.floor(h / 24)}d : ${pad2(h % 24)}h` : `${pad2(h)}h:${pad2(m)}m`;
};

/** Website HotDealChip: orange→rose gradient rectangle with flame. */
export function HotDealChip({ size = "sm" }: { size?: "sm" | "md" }) {
  return (
    <LinearGradient colors={["#FF5A1F", "#F43F5E"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.hot, size === "md" && { paddingHorizontal: 10, paddingVertical: 5 }]}>
      <Icon name="flame" size={size === "md" ? 13 : 11} color="#fff" strokeWidth={2.4} />
      <Text style={{ color: "#fff", fontSize: size === "md" ? 12 : 11, ...font.semibold }}>Hot deal</Text>
    </LinearGradient>
  );
}

function ProductCardBase({ product, width, showBoostBar }: { product: Product; width: number; showBoostBar?: boolean }) {
  const { c } = useTheme();
  const { isSaved, toggle } = useWishlist();
  const saved = isSaved(product._id);
  const off = discountPct(product.selling_price, product.original_price);
  const img = firstImage(product.images);
  const seller = (typeof product.seller_id === "object" ? product.seller_id : product.seller) as Seller | undefined;
  const boosted = isBoostLive(product);
  const tier = boosted ? product.boost_tier || "pro" : "regular";
  const borderColor = tier === "pro" || tier === "pro_plus" ? (c.dark ? "rgba(49,46,129,0.5)" : "#E2E6FB") : c.productBorder;
  const ends = boosted && showBoostBar ? endsIn(product.boost_expires_at) : null;
  const rating = seller?.rating?.count ? Number(seller.rating.avg || 0).toFixed(1) : null;

  return (
    <Pressable
      onPress={() => router.push(productHref(product))}
      style={({ pressed }) => [
        styles.card,
        { width, backgroundColor: c.productCard, borderColor, transform: [{ scale: pressed ? 0.985 : 1 }] },
        shadow(c.dark, "md"),
      ]}
      accessibilityLabel={`${product.title}, ₹${INR.format(product.selling_price || 0)}`}
    >
      {boosted && showBoostBar ? (
        <View style={styles.boostBar}>
          <Text numberOfLines={1} style={{ color: c.accentText, fontSize: 12, flexShrink: 1, ...font.black }}>
            🚀 Boosted
          </Text>
          {ends ? (
            <View style={[styles.ends, { backgroundColor: c.accentSoft }]}>
              <Text style={{ color: c.accentText, fontSize: 9.5, fontVariant: ["tabular-nums"], ...font.bold }}>{ends}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={[styles.imgWrap, { backgroundColor: c.dark ? "#202024" : "#ECEEF2" }]}>
        {img ? (
          <Image source={{ uri: ikCard(img) }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} recyclingKey={product._id} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { alignItems: "center", justifyContent: "center" }]}>
            <Icon name="image-outline" size={26} color={c.textFaint} />
          </View>
        )}
        {isHot(product.hot_until) ? (
          <View style={{ position: "absolute", left: 8, top: 8 }}>
            <HotDealChip />
          </View>
        ) : null}
        <Pressable
          onPress={() => toggle(product)}
          hitSlop={8}
          style={[styles.heart, { backgroundColor: c.dark ? "rgba(24,24,27,0.85)" : "#F7F8FA" }, shadow(c.dark, "md")]}
          accessibilityLabel={saved ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Icon name="heart" size={16} color={saved ? "#EF4444" : "#71717A"} filled={saved} strokeWidth={2.2} />
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 6, paddingTop: 12, paddingBottom: 4, flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text numberOfLines={1} style={{ color: c.accentText, fontSize: 11.5, textTransform: "capitalize", flexShrink: 1, ...font.semibold }}>
            {String(product.category || "Category").replaceAll("_", " ")}
          </Text>
          {product.isGirlsOnly ? (
            <View style={[styles.girls, { backgroundColor: c.dark ? "rgba(131,24,67,0.6)" : "#FCE7F3", borderColor: c.dark ? "#831843" : "#FBCFE8" }]}>
              <Text style={{ color: c.dark ? "#FBCFE8" : "#BE185D", fontSize: 9.5, ...font.bold }}>🌸 Girls Only</Text>
            </View>
          ) : null}
        </View>
        <Text numberOfLines={2} style={{ marginTop: 4, minHeight: 38, color: c.text, fontSize: 14, lineHeight: 19, ...font.semibold }}>
          {product.title}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6, marginTop: 8 }}>
          <Text style={{ color: c.textStrong, fontSize: 17, letterSpacing: -0.3, fontVariant: ["tabular-nums"], ...font.bold }}>₹{INR.format(product.selling_price || 0)}</Text>
          {off > 0 ? (
            <>
              <Text numberOfLines={1} style={{ color: c.textFaint, fontSize: 12, textDecorationLine: "line-through", flexShrink: 1, ...font.medium }}>
                ₹{INR.format(product.original_price || 0)}
              </Text>
              <Text style={{ color: c.success, fontSize: 12, ...font.semibold }}>{off}% off</Text>
            </>
          ) : null}
        </View>
        <View style={[styles.footer, { borderTopColor: c.dark ? "#27272A" : "#EEF1F5" }]}>
          <Avatar avatar={seller?.avatar} name={seller?.name} size={24} plan={seller?.subscription} role={seller?.role} />
          <Text numberOfLines={1} style={{ flex: 1, color: c.textMuted, fontSize: 12, textTransform: "capitalize", ...font.medium }}>
            {seller?.name || "Seller"}
          </Text>
          {rating ? (
            <View style={[styles.rating, { borderColor: c.dark ? "#3F3F46" : "#E1E1E1" }]}>
              <Icon name="star" size={10} color="#FACC15" filled />
              <Text style={{ color: c.textMuted, fontSize: 11, ...font.semibold }}>{rating}</Text>
            </View>
          ) : null}
          <Icon name="location-outline" size={14} color={c.textFaint} />
        </View>
      </View>
    </Pressable>
  );
}

export const ProductCard = memo(ProductCardBase);

export function ProductCardSkeleton({ width }: { width: number }) {
  const { c } = useTheme();
  return (
    <View style={[styles.card, { width, backgroundColor: c.productCard, borderColor: c.productBorder }]}>
      <Skeleton height={((width - 16) * 5) / 6} radius={12} />
      <View style={{ padding: 6, paddingTop: 12, gap: 8 }}>
        <Skeleton height={10} width="40%" />
        <Skeleton height={13} />
        <Skeleton height={13} width="70%" />
        <Skeleton height={16} width="50%" />
        <View style={{ flexDirection: "row", gap: 6, alignItems: "center", marginTop: 6 }}>
          <Skeleton height={24} width={24} radius={12} />
          <Skeleton height={10} width="45%" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 8 },
  boostBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 4, paddingHorizontal: 6, paddingTop: 2, marginBottom: 8 },
  ends: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  imgWrap: { width: "100%", aspectRatio: 6 / 5, borderRadius: 12, overflow: "hidden" },
  hot: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  heart: { position: "absolute", top: 8, right: 8, width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  girls: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 1 },
  footer: { flexDirection: "row", alignItems: "center", gap: 6, borderTopWidth: 1, paddingTop: 10, marginTop: 12 },
  rating: { flexDirection: "row", alignItems: "center", gap: 3, borderWidth: 1, borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2 },
});
