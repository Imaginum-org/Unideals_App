import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, RefreshControl, SectionList, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { chatApi } from "@/api/chat";
import { errorMessage } from "@/api/client";
import { Avatar, Badge, Button, Card, EmptyState, ErrorState, Segmented, Skeleton } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { useIsLoggedIn } from "@/store/auth";
import { useTabBarSpace } from "@/hooks/useLayout";
import { font, useTheme } from "@/theme";
import { dealBadge, formatName, inr, timeAgo } from "@/utils/format";
import { firstImage, ikThumb } from "@/utils/image";
import type { ConversationRow } from "@/types";

type Role = "all" | "buying" | "selling";

export default function Chats() {
  const { c } = useTheme();
  const loggedIn = useIsLoggedIn();
  const { space } = useTabBarSpace();
  const [role, setRole] = useState<Role>("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const q = useQuery({ queryKey: ["conversations", role, debounced], queryFn: () => chatApi.list({ role, search: debounced }), enabled: loggedIn, staleTime: 10_000 });
  useFocusEffect(
    useCallback(() => {
      if (loggedIn) q.refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loggedIn]),
  );

  const rows = q.data || [];
  const totalUnread = rows.reduce((t, r) => t + (r.unread || 0), 0);
  const sections = useMemo(() => {
    const visible = unreadOnly ? rows.filter((r) => r.unread > 0) : rows;
    // Pro circle sits above everything; Pro+ ranks above Pro inside it (website Chat.jsx).
    const pro = visible
      .filter((r) => ["pro", "pro_plus"].includes(String(r.otherParty?.subscription)))
      .sort((a, b) => (a.otherParty?.subscription === "pro_plus" ? 0 : 1) - (b.otherParty?.subscription === "pro_plus" ? 0 : 1));
    const normal = visible.filter((r) => !["pro", "pro_plus"].includes(String(r.otherParty?.subscription)));
    return [
      ...(pro.length ? [{ key: "pro", title: "Pro members", data: pro }] : []),
      ...(normal.length ? [{ key: "all", title: pro.length ? "All messages" : "", data: normal }] : []),
    ];
  }, [rows, unreadOnly]);

  if (!loggedIn) {
    return (
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: c.bg }}>
        <Text style={[styles.title, { color: c.text, paddingHorizontal: 16 }]}>Chats</Text>
        <Card style={{ margin: 16, alignItems: "center" }}>
          <EmptyState icon="chatbubbles-outline" title="Your conversations live here" message="Log in to slide into sellers’ DMs (the wholesome kind), make offers and close deals." compact />
          <Button title="Log in" onPress={() => router.push("/login")} />
        </Card>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: c.barSolid }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 6, gap: 10, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: c.border }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={[styles.title, { color: c.text, flex: 1 }]}>Chats</Text>
          <Pressable
            onPress={() => setUnreadOnly((v) => !v)}
            style={[styles.unreadBtn, { backgroundColor: unreadOnly ? c.accentSoft : "transparent", borderColor: unreadOnly ? c.accentSoftStrong : c.border }]}
          >
            <Text style={{ color: unreadOnly ? c.accentText : c.textMuted, fontSize: 12.5, ...font.semibold }}>Unread{totalUnread ? ` · ${totalUnread}` : ""}</Text>
          </Pressable>
        </View>
        <View style={[styles.search, { backgroundColor: c.dark ? "#1F2226" : "#F4F5F8", borderColor: c.dark ? "#262626" : "#E5E7EB" }]}>
          <Icon name="search" size={17} color={c.textMuted} />
          <TextInput value={search} onChangeText={setSearch} placeholder="Search people or items" placeholderTextColor={c.textFaint} style={{ flex: 1, color: c.text, fontSize: 14.5, fontFamily: "Figtree_400Regular" }} />
          {search ? (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Icon name="close-circle" size={17} color={c.textFaint} />
            </Pressable>
          ) : null}
        </View>
        <Segmented
          value={role}
          onChange={setRole}
          options={[
            { value: "all", label: "All" },
            { value: "buying", label: "Buying" },
            { value: "selling", label: "Selling" },
          ]}
        />
      </View>
      {q.isLoading ? (
        <View style={{ backgroundColor: c.bg, flex: 1, padding: 16, gap: 16 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
              <Skeleton width={50} height={50} radius={25} />
              <View style={{ flex: 1, gap: 8 }}>
                <Skeleton height={12} width="55%" />
                <Skeleton height={10} width="85%" />
              </View>
            </View>
          ))}
        </View>
      ) : q.isError ? (
        <View style={{ flex: 1, backgroundColor: c.bg }}>
          <ErrorState message={errorMessage(q.error)} onRetry={() => q.refetch()} />
        </View>
      ) : (
        <SectionList
          style={{ backgroundColor: c.bg }}
          sections={sections}
          keyExtractor={(r) => r._id}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) =>
            section.title ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 }}>
                {section.key === "pro" ? <Icon name="crown" size={13} color="#D97706" /> : null}
                <Text style={{ color: c.textFaint, fontSize: 11.5, textTransform: "uppercase", letterSpacing: 0.8, ...font.semibold }}>{section.title}</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => <ConversationItem row={item} />}
          contentContainerStyle={{ paddingBottom: space }}
          removeClippedSubviews
          ItemSeparatorComponent={() => <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.border, marginLeft: 78 }} />}
          refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => void q.refetch()} tintColor={c.accent} />}
          ListEmptyComponent={
            <EmptyState
              icon="chatbubble-ellipses-outline"
              title={debounced ? "No matches" : unreadOnly ? "You're all caught up" : "No chats yet"}
              message={debounced ? "Try another name or item." : unreadOnly ? "No unread messages." : "Open a listing and tap “Chat Now” to start."}
              action={debounced || unreadOnly ? undefined : "Browse listings"}
              onAction={() => router.push("/explore")}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

function ConversationItem({ row }: { row: ConversationRow }) {
  const { c } = useTheme();
  const badge = dealBadge(row.dealStatus);
  const img = firstImage(row.product?.images);
  const unread = row.unread > 0;
  return (
    <Pressable
      onPress={() => router.push({ pathname: "/chat/[id]", params: { id: row._id } })}
      style={({ pressed }) => [styles.item, { backgroundColor: pressed ? (c.dark ? "rgba(255,255,255,0.04)" : "#F1F5F9") : c.card }]}
    >
      <View>
        <Avatar avatar={row.otherParty?.avatar} name={row.otherParty?.name} size={50} plan={row.otherParty?.subscription} role={row.otherParty?.role} />
        {img ? <Image source={{ uri: ikThumb(img, 80) }} style={[styles.thumb, { borderColor: c.card }]} contentFit="cover" /> : null}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text numberOfLines={1} style={{ flex: 1, color: c.text, fontSize: 15, ...(unread ? font.bold : font.semibold) }}>
            {formatName(row.otherParty?.name)}
          </Text>
          <Text style={{ color: unread ? c.accentText : c.textFaint, fontSize: 11.5, ...font.medium }}>{timeAgo(row.last_activity_at)}</Text>
        </View>
        <Text numberOfLines={1} style={{ color: c.textMuted, fontSize: 12, ...font.medium }}>
          {row.role === "buying" ? "Buying" : "Selling"} · {row.product?.title || "Listing"} · {inr(row.dealPrice ?? row.product?.selling_price)}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text numberOfLines={1} style={{ flex: 1, fontSize: 13.5, color: unread ? c.text : c.textMuted, ...(unread ? font.semibold : font.regular) }}>
            {row.last_message || " "}
          </Text>
          {row.dealStatus && row.dealStatus !== "negotiating" ? <Badge label={badge.label} tone={badge.tone} /> : null}
          {unread ? (
            <View style={[styles.unread, { backgroundColor: c.accent }]}>
              <Text style={{ color: "#fff", fontSize: 11, ...font.bold }}>{row.unread > 99 ? "99+" : row.unread}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, letterSpacing: -0.5, fontFamily: "Figtree_700Bold", marginTop: 6 },
  search: { flexDirection: "row", alignItems: "center", gap: 8, height: 42, paddingHorizontal: 12, borderWidth: 1, borderRadius: 12 },
  unreadBtn: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, height: 30, justifyContent: "center", marginTop: 6 },
  item: { flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingVertical: 12, alignItems: "center" },
  thumb: { position: "absolute", right: -4, bottom: -4, width: 24, height: 24, borderWidth: 2, borderRadius: 7 },
  unread: { minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 5, alignItems: "center", justifyContent: "center" },
});
