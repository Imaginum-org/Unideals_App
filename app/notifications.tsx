import { Icon } from "@/components/ui/Icon";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router, type Href } from "expo-router";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { notificationApi } from "@/api/chat";
import { errorMessage } from "@/api/client";
import { EmptyState, ErrorState, IconButton, Loader, Screen, T, TopBar } from "@/components/ui";
import { NOTIFICATIONS_KEY, useNotifications } from "@/hooks/useRealtime";
import { toast } from "@/lib/toast";
import { font, useTheme } from "@/theme";
import { timeAgo } from "@/utils/format";
import type { AppNotification } from "@/types";

// Web action paths → app routes (the backend writes website paths).
const toAppRoute = (path?: string): string | null => {
  if (!path || path === "/notification") return null;
  const map: [RegExp, (m: RegExpMatchArray) => string][] = [
    [/^\/product\/([^/?#]+)/, (m) => `/product/${m[1]}`],
    [/^\/chat\?.*conversation=([a-f0-9]{24})/i, (m) => `/chat/${m[1]}`],
    [/^\/chat/, () => "/chats"],
    [/^\/myorders/, () => "/orders"],
    [/^\/(profile|profileoverview)/, () => "/profile"],
    [/^\/(achievements|badge)/, () => "/achievements"],
    [/^\/(subscription|price)/, () => "/subscription"],
    [/^\/wishlist/, () => "/wishlist"],
    [/^\/(settings|setting)/, () => "/settings"],
    [/^\/upload/, () => "/sell"],
    [/^\/category\/([^/?#]+)/, (m) => `/category/${m[1]}`],
    [/^\/explore|^\/deals/, () => "/explore"],
    [/^\/$/, () => "/"],
  ];
  for (const [re, to] of map) {
    const m = path.match(re);
    if (m) return to(m);
  }
  return null;
};

export default function Notifications() {
  const { c, radius } = useTheme();
  const qc = useQueryClient();
  const { items, isLoading, isError, error, refetch, isRefetching, unreadCount } = useNotifications();

  const patch = (fn: (cur: AppNotification[]) => AppNotification[]) => qc.setQueryData<AppNotification[]>(NOTIFICATIONS_KEY, (cur = []) => fn(cur));

  const open = (n: AppNotification) => {
    if (n.unread) {
      patch((cur) => cur.map((x) => (x.id === n.id ? { ...x, unread: false } : x)));
      notificationApi.markRead(n.id).catch(() => refetch());
    }
    notificationApi.trackClick(n.id).catch(() => {});
    const route = toAppRoute(n.actionPath);
    if (route) router.push(route as Href);
  };
  const dismiss = (n: AppNotification) => {
    patch((cur) => cur.filter((x) => x.id !== n.id));
    notificationApi.dismiss(n.id).catch(() => {
      toast.error("Couldn't dismiss. Try again.");
      refetch();
    });
  };
  const markAll = () => {
    patch((cur) => cur.map((x) => ({ ...x, unread: false })));
    notificationApi.markAllRead().catch(() => refetch());
  };

  return (
    <Screen padded={false} header={<TopBar
        title="Notifications"
        subtitle={unreadCount ? `${unreadCount} unread` : undefined}
        right={
          unreadCount ? (
            <Pressable onPress={markAll} hitSlop={8} style={{ paddingHorizontal: 8 }}>
              <Text style={{ color: c.accentText, fontSize: 13.5, ...font.semibold }}>Mark all read</Text>
            </Pressable>
          ) : undefined
        }
      />}>
      {isLoading ? (
        <Loader full={false} />
      ) : isError ? (
        <ErrorState message={errorMessage(error)} onRetry={() => refetch()} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(n) => n.id}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} tintColor={c.accent} />}
          renderItem={({ item: n }) => (
            <Pressable onPress={() => open(n)} style={({ pressed }) => [{ flexDirection: "row", gap: 12, padding: 14, paddingRight: 4, backgroundColor: pressed ? c.surface : n.unread ? c.accentSoft : "transparent" }]}>
              {n.imageUrl ? (
                <Image source={{ uri: n.imageUrl }} style={{ width: 44, height: 44, borderRadius: radius.md }} contentFit="cover" />
              ) : (
                <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: c.surfaceAlt, alignItems: "center", justifyContent: "center" }}>
                  <Icon name="notifications-outline" size={20} color={c.accentText} />
                </View>
              )}
              <View style={{ flex: 1, gap: 2 }}>
                <T variant="h3" style={{ fontSize: 15 }}>
                  {n.title}
                </T>
                {n.description ? (
                  <T variant="small" muted>
                    {n.description}
                  </T>
                ) : null}
                <T variant="caption" faint>
                  {n.createdAt ? timeAgo(n.createdAt) : n.time}
                  {n.actionLabel ? `  ·  ${n.actionLabel}` : ""}
                </T>
              </View>
              <IconButton icon="close" size={18} color={c.textFaint} onPress={() => dismiss(n)} accessibilityLabel="Dismiss" />
            </Pressable>
          )}
          ListEmptyComponent={<EmptyState icon="notifications-off-outline" title="You're all caught up" message="Offers, deal updates and campus news show up here." />}
        />
      )}
    </Screen>
  );
}
