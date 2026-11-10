import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, FlatList, RefreshControl, ScrollView, View } from "react-native";
import { chatApi, ordersApi, type OrderRow } from "@/api/chat";
import { errorMessage } from "@/api/client";
import { Avatar, Badge, Button, Card, Chip, EmptyState, ErrorState, Loader, Screen, T, TopBar } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { toast } from "@/lib/toast";
import { useTheme } from "@/theme";
import { ORDER_STEPS, dealBadge, dealStatusToStep, formatName, inr, isActiveDeal, shortDate } from "@/utils/format";
import { firstImage, ikThumb } from "@/utils/image";
import { RateSheet } from "@/components/chat/RateSheet";

const ROLES = [
  { value: "all", label: "All" },
  { value: "buying", label: "Buying" },
  { value: "selling", label: "Selling" },
];
const STATUSES = [
  { value: "all", label: "Any status" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function Orders() {
  const { c, radius } = useTheme();
  const qc = useQueryClient();
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [rateFor, setRateFor] = useState<string | null>(null);
  const q = useQuery({ queryKey: ["orders", role, status], queryFn: () => ordersApi.list({ role, status }) });

  const cancel = (o: OrderRow) =>
    Alert.alert("Cancel this order?", "Both of you will see it as cancelled.", [
      { text: "Keep", style: "cancel" },
      {
        text: "Cancel order",
        style: "destructive",
        onPress: async () => {
          try {
            await chatApi.cancel(o.conversationId, "Cancelled from orders");
            toast.success("Order cancelled");
            qc.invalidateQueries({ queryKey: ["orders"] });
          } catch (err) {
            toast.error(errorMessage(err));
          }
        },
      },
    ]);

  return (
    <Screen padded={false} header={<TopBar title="My orders" />}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingTop: 12 }}>
        {ROLES.map((r) => (
          <Chip key={r.value} label={r.label} selected={role === r.value} onPress={() => setRole(r.value)} />
        ))}
        <View style={{ width: 8 }} />
        {STATUSES.map((s) => (
          <Chip key={s.value} label={s.label} selected={status === s.value} onPress={() => setStatus(s.value)} />
        ))}
      </ScrollView>
      {q.isLoading ? (
        <Loader full={false} />
      ) : q.isError ? (
        <ErrorState message={errorMessage(q.error)} onRetry={() => q.refetch()} />
      ) : (
        <FlatList
          data={q.data?.orders || []}
          keyExtractor={(o) => o.orderId || o.conversationId}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => void q.refetch()} tintColor={c.accent} />}
          renderItem={({ item: o }) => {
            const badge = dealBadge(o.dealStatus);
            const step = dealStatusToStep(o.dealStatus);
            const img = firstImage(o.product?.images);
            const rated = Boolean(o.myRating);
            return (
              <Card>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <View style={{ width: 64, height: 64, borderRadius: radius.md, overflow: "hidden", backgroundColor: c.surfaceAlt }}>
                    {img ? <Image source={{ uri: ikThumb(img, 160) }} style={{ width: 64, height: 64 }} /> : null}
                  </View>
                  <View style={{ flex: 1, gap: 3 }}>
                    <T variant="h3" numberOfLines={1} style={{ fontSize: 15 }}>
                      {o.product?.title || "Listing"}
                    </T>
                    <T variant="small" style={{ fontWeight: "700" }}>
                      {inr(o.price)}
                    </T>
                    <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
                      <Badge label={badge.label} tone={badge.tone} />
                      <T variant="caption" muted>
                        {o.role === "buying" ? "Buying" : "Selling"}
                      </T>
                    </View>
                  </View>
                </View>
                {o.dealStatus !== "cancelled" ? (
                  <View style={{ flexDirection: "row", gap: 5, marginTop: 12 }}>
                    {ORDER_STEPS.map((s, i) => (
                      <View key={s} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: step > i ? c.accent : c.surfaceAlt }} />
                    ))}
                  </View>
                ) : null}
                {o.pickup ? (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 8 }}>
                    <Icon name="calendar-outline" size={13} color={c.textMuted} />
                    <T variant="caption" muted>
                      {shortDate(o.pickup.date)}
                    </T>
                    {o.pickup.location ? (
                      <>
                        <Icon name="location-outline" size={13} color={c.textMuted} style={{ marginLeft: 6 }} />
                        <T variant="caption" muted numberOfLines={1} style={{ flexShrink: 1 }}>
                          {o.pickup.location}
                        </T>
                      </>
                    ) : null}
                  </View>
                ) : null}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 }}>
                  <Avatar avatar={o.otherParty?.avatar as any} name={o.otherParty?.name} size={26} />
                  <T variant="small" muted style={{ flex: 1 }} numberOfLines={1}>
                    {formatName(o.otherParty?.name)}
                  </T>
                  {isActiveDeal(o.dealStatus) ? <Button size="sm" kind="ghost" full={false} title="Cancel" onPress={() => cancel(o)} /> : null}
                  {o.dealStatus === "completed" && o.role === "buying" && !rated ? (
                    <Button size="sm" kind="soft" full={false} icon="star-outline" title="Rate" onPress={() => setRateFor(o.conversationId)} />
                  ) : null}
                  <Button size="sm" full={false} title="Open chat" onPress={() => router.push({ pathname: "/chat/[id]", params: { id: o.conversationId } })} />
                </View>
              </Card>
            );
          }}
          ListEmptyComponent={<EmptyState icon="bag-handle-outline" title="No orders here" message="Deals you lock in chat show up here, from offer to pickup." action="Browse listings" onAction={() => router.push("/explore")} />}
        />
      )}
      {rateFor ? (
        <RateSheet visible onClose={() => setRateFor(null)} conversationId={rateFor} onDone={() => qc.invalidateQueries({ queryKey: ["orders"] })} />
      ) : null}
    </Screen>
  );
}
