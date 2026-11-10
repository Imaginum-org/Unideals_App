import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { errorCode, errorMessage } from "@/api/client";
import { productApi } from "@/api/products";
import { usePurchase } from "@/components/payments/usePurchase";
import { Badge, Button, Card, EmptyState, ErrorState, Segmented, Skeleton, TopBar } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { toast } from "@/lib/toast";
import { font, useTheme } from "@/theme";
import { inr, isBoostLive, timeAgo } from "@/utils/format";
import { firstImage, ikThumb } from "@/utils/image";
import type { Product } from "@/types";

// Website OrderCard add-ons (backend config/boostAddons.js).
const ADDONS = [
  { id: "boost_3day", label: "3-day", price: 29 },
  { id: "boost_7day", label: "7-day", price: 49 },
];
type Tab = "active" | "drafts" | "sold";

function ListingCard({ p, boostsLeft }: { p: Product; boostsLeft: number | null }) {
  const { c } = useTheme();
  const qc = useQueryClient();
  const { start, busy, checkout } = usePurchase();
  const [showAddons, setShowAddons] = useState(false);
  const img = firstImage(p.images);
  const live = ["listed", "active"].includes(String(p.status));
  const boosted = isBoostLive(p);
  const tier = String(p.boost_tier || "").toLowerCase();

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["my-listings"] });
    qc.invalidateQueries({ queryKey: ["boost-summary"] });
    qc.invalidateQueries({ queryKey: ["feed"] });
  };
  const action = useMutation({
    mutationFn: async (a: "boost" | "sold" | "unlist" | "relist" | "delete") =>
      a === "boost" ? productApi.boost(p._id) : a === "sold" ? productApi.markSold(p._id) : a === "unlist" ? productApi.unlist(p._id) : a === "relist" ? productApi.relist(p._id) : productApi.remove(p._id),
    onSuccess: (_r, a) => {
      refresh();
      toast.success({ boost: "Boosted. Your listing has a front-row seat now.", sold: "Marked as sold", unlist: "Listing hidden", relist: "Listing is live again", delete: "Listing deleted" }[a]);
    },
    onError: (err, a) => {
      if (a === "boost" && (errorCode(err) === "BOOST_LIMIT" || /quota|limit/i.test(errorMessage(err, "")))) {
        toast.error("Boost quota exhausted. Buy an extra boost or upgrade.");
        setShowAddons(true);
      } else toast.error(errorMessage(err));
    },
  });
  const confirm = (a: "sold" | "unlist" | "delete", title: string, msg: string) =>
    Alert.alert(title, msg, [
      { text: "Cancel", style: "cancel" },
      { text: "Confirm", style: a === "delete" ? "destructive" : "default", onPress: () => action.mutate(a) },
    ]);

  return (
    <Card style={{ padding: 12, borderColor: boosted ? (tier === "pro_plus" ? "#FCD34D" : c.accentSoftStrong) : c.border }}>
      <Pressable
        onPress={() => router.push(p.status === "draft" ? { pathname: "/edit-listing/[id]", params: { id: p._id } } : `/product/${p.slug || p._id}`)}
        style={{ flexDirection: "row", gap: 12 }}
      >
        <View style={{ width: 84, height: 84, borderRadius: 12, overflow: "hidden", backgroundColor: c.surfaceAlt }}>
          {img ? <Image source={{ uri: ikThumb(img, 220) }} style={StyleSheet.absoluteFill} contentFit="cover" /> : <Icon name="image-outline" size={22} color={c.textFaint} style={{ margin: 30 }} />}
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text numberOfLines={2} style={{ color: c.text, fontSize: 14.5, lineHeight: 19, ...font.semibold }}>
            {p.title || "Untitled draft"}
          </Text>
          <Text style={{ color: c.text, fontSize: 16, ...font.bold }}>{p.selling_price ? inr(p.selling_price) : "No price yet"}</Text>
          <View style={{ flexDirection: "row", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            {boosted ? <Badge label={tier === "pro_plus" ? "Pro+ boost" : tier === "pro" ? "Pro boost" : "Boosted"} tone={tier === "pro_plus" ? "gold" : "accent"} icon="rocket" /> : null}
            {p.status === "draft" ? <Badge label="Draft" tone="warning" /> : p.status === "sold" ? <Badge label="Sold" tone="success" /> : p.status === "unlisted" ? <Badge label="Hidden" tone="neutral" /> : <Badge label="Live" tone="success" />}
            <Text style={{ color: c.textFaint, fontSize: 11.5, ...font.medium }}>
              <Icon name="eye-outline" size={11} color={c.textFaint} /> {p.views_count || 0} · {timeAgo(p.updatedAt || p.createdAt)}
            </Text>
          </View>
        </View>
      </Pressable>

      <View style={[styles.actions, { borderColor: c.border }]}>
        {p.status === "draft" ? (
          <Button size="sm" style={{ flex: 1 }} title="Finish listing" icon="create-outline" onPress={() => router.push({ pathname: "/edit-listing/[id]", params: { id: p._id } })} />
        ) : (
          <>
            {live ? (
              <View style={{ flex: 1 }}>
                <Button
                  size="sm"
                  kind={boosted ? "soft" : "primary"}
                  icon="rocket"
                  title={boosted ? "Boost active" : boostsLeft === 0 ? "Buy boost" : "Boost"}
                  disabled={boosted}
                  loading={action.isPending && action.variables === "boost"}
                  onPress={() => (boostsLeft === 0 ? setShowAddons((v) => !v) : action.mutate("boost"))}
                />
              </View>
            ) : null}
            <Pressable onPress={() => router.push({ pathname: "/edit-listing/[id]", params: { id: p._id } })} style={[styles.iconAct, { borderColor: c.border }]} accessibilityLabel="Edit">
              <Icon name="create-outline" size={17} color={c.text} />
            </Pressable>
            {live ? (
              <>
                <Pressable onPress={() => confirm("sold", "Mark as sold?", "Buyers will no longer see it.")} style={[styles.iconAct, { borderColor: c.border }]} accessibilityLabel="Mark sold">
                  <Icon name="checkmark-done" size={17} color={c.text} />
                </Pressable>
                <Pressable onPress={() => confirm("unlist", "Hide this listing?", "You can relist it any time.")} style={[styles.iconAct, { borderColor: c.border }]} accessibilityLabel="Hide">
                  <Icon name="eye-off-outline" size={17} color={c.text} />
                </Pressable>
              </>
            ) : p.status === "unlisted" ? (
              <Pressable onPress={() => action.mutate("relist")} style={[styles.iconAct, { borderColor: c.border }]} accessibilityLabel="Relist">
                <Icon name="eye-outline" size={17} color={c.text} />
              </Pressable>
            ) : null}
          </>
        )}
        <Pressable onPress={() => confirm("delete", "Delete this listing?", "This can't be undone.")} style={[styles.iconAct, { borderColor: c.dark ? "rgba(239,68,68,0.3)" : "#FECACA" }]} accessibilityLabel="Delete">
          <Icon name="trash-outline" size={17} color={c.danger} />
        </Pressable>
      </View>

      {showAddons && live && !boosted ? (
        <View style={[styles.addons, { backgroundColor: c.accentSoft }]}>
          <Text style={{ color: c.text, fontSize: 13, ...font.semibold }}>Get an extra boost for this listing</Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
            {ADDONS.map((a) => (
              <View key={a.id} style={{ flex: 1 }}>
                <Button
                  size="sm"
                  kind="secondary"
                  title={`${a.label} · ₹${a.price}`}
                  loading={busy === a.id}
                  disabled={Boolean(busy)}
                  onPress={async () => {
                    const ok = await start(a.id, `${a.label} Listing Boost`, p._id);
                    if (ok) {
                      setShowAddons(false);
                      refresh();
                    }
                  }}
                />
              </View>
            ))}
          </View>
          <Pressable onPress={() => router.push("/subscription")} style={{ marginTop: 8 }}>
            <Text style={{ color: c.accentText, fontSize: 12.5, ...font.semibold }}>Or upgrade for monthly boosts →</Text>
          </Pressable>
        </View>
      ) : null}
      {checkout}
    </Card>
  );
}

export default function MyListings() {
  const { c } = useTheme();
  const [tab, setTab] = useState<Tab>("active");
  const mine = useQuery({ queryKey: ["my-listings"], queryFn: productApi.mine });
  const drafts = useQuery({ queryKey: ["my-listings", "drafts"], queryFn: productApi.drafts });
  const summary = useQuery({ queryKey: ["boost-summary"], queryFn: productApi.boostSummary });

  const all = useMemo(() => {
    const map = new Map<string, Product>();
    [...(mine.data || []), ...(drafts.data || [])].forEach((p) => map.set(p._id, p));
    return [...map.values()];
  }, [mine.data, drafts.data]);
  const isActive = (p: Product) => ["listed", "active"].includes(String(p.status));
  const groups: Record<Tab, Product[]> = {
    active: all.filter(isActive),
    drafts: all.filter((p) => p.status === "draft" || p.status === "unlisted"),
    sold: all.filter((p) => p.status === "sold"),
  };
  const boostsLeft: number | null = summary.data?.monthlyRemaining ?? null;
  const views = all.reduce((n, p) => n + (p.views_count || 0), 0);

  const stats = [
    { label: "Active", value: groups.active.length },
    { label: "Boosts left", value: boostsLeft ?? "—" },
    { label: "Drafts", value: groups.drafts.length },
    { label: "Total views", value: views.toLocaleString("en-IN") },
  ];

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: c.barSolid }}>
      <TopBar title="My listings" right={<Button size="sm" full={false} icon="plus" title="New" onPress={() => router.push("/sell")} />} />
      <FlatList
        style={{ backgroundColor: c.bg }}
        data={mine.isLoading ? [] : groups[tab]}
        keyExtractor={(p) => p._id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={mine.isRefetching}
            onRefresh={() => {
              mine.refetch();
              drafts.refetch();
              summary.refetch();
            }}
            tintColor={c.accent}
          />
        }
        ListHeaderComponent={
          <View style={{ gap: 12 }}>
            <View style={styles.stats}>
              {stats.map((s) => (
                <Card key={s.label} style={styles.stat}>
                  <Text style={{ color: c.text, fontSize: 20, fontVariant: ["tabular-nums"], ...font.semibold }}>{s.value}</Text>
                  <Text numberOfLines={1} style={{ color: c.textMuted, fontSize: 11.5, ...font.medium }}>
                    {s.label}
                  </Text>
                </Card>
              ))}
            </View>
            <Segmented
              value={tab}
              onChange={setTab}
              options={[
                { value: "active", label: "Active", count: groups.active.length },
                { value: "drafts", label: "Drafts", count: groups.drafts.length },
                { value: "sold", label: "Sold", count: groups.sold.length },
              ]}
            />
          </View>
        }
        renderItem={({ item }) => <ListingCard p={item} boostsLeft={boostsLeft} />}
        ListEmptyComponent={
          mine.isLoading ? (
            <View style={{ gap: 12 }}>
              <Skeleton height={150} radius={16} />
              <Skeleton height={150} radius={16} />
            </View>
          ) : mine.isError ? (
            <ErrorState message={errorMessage(mine.error)} onRetry={() => mine.refetch()} />
          ) : (
            <EmptyState
              icon="pricetags-outline"
              title={tab === "active" ? "No live listings" : tab === "drafts" ? "No drafts or hidden listings" : "Nothing sold yet"}
              message={tab === "active" ? "List something in under two minutes." : undefined}
              action={tab === "active" ? "Sell an item" : undefined}
              onAction={() => router.push("/sell")}
              compact
            />
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: "row", gap: 8 },
  stat: { flex: 1, padding: 10, alignItems: "center" },
  actions: { flexDirection: "row", gap: 8, alignItems: "center", borderTopWidth: StyleSheet.hairlineWidth, marginTop: 12, paddingTop: 12 },
  iconAct: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  addons: { borderRadius: 12, padding: 12, marginTop: 10 },
});
