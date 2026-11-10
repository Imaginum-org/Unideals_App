import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { productApi } from "@/api/products";
import { badgeApi, reviewApi, userApi } from "@/api/user";
import { Wordmark } from "@/components/brand/Brand";
import { BrandFooter } from "@/components/brand/BrandFooter";
import { Avatar, Button, Card, EmptyState, Row, Skeleton } from "@/components/ui";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useCampus } from "@/hooks/useCampus";
import { useChatUnread, useNotifications } from "@/hooks/useRealtime";
import { useWishlist } from "@/hooks/useWishlist";
import { useTabBarSpace } from "@/hooks/useLayout";
import { useAuthStore } from "@/store/auth";
import { font, useTheme } from "@/theme";
import { formatName, inr, tierLabel } from "@/utils/format";
import { firstImage, ikThumb } from "@/utils/image";

// Website MobileAccountMenu groups.
const MENU: { title: string; items: { to: Href; label: string; icon: IconName; badge?: "notif" | "chat" }[] }[] = [
  {
    title: "Buying & selling",
    items: [
      { to: "/orders", label: "Orders", icon: "package" },
      { to: "/my-listings", label: "My listings", icon: "bag" },
      { to: "/wishlist", label: "Wishlist", icon: "heart-outline" },
      { to: "/notifications", label: "Notifications", icon: "notifications-outline", badge: "notif" },
    ],
  },
  {
    title: "Account",
    items: [
      { to: "/achievements", label: "Achievements", icon: "trophy-outline" },
      { to: "/subscription", label: "Subscription", icon: "crown" },
      { to: "/settings", label: "Settings", icon: "settings-outline" },
    ],
  },
  {
    title: "Support",
    items: [
      { to: "/faq", label: "FAQ", icon: "help-circle-outline" },
      { to: "/contact", label: "Help & support", icon: "life-buoy" },
      { to: "/legal/terms", label: "Terms & privacy", icon: "document-text-outline" },
    ],
  },
];

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 1 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon key={n} name="star" size={size} color={n <= Math.round(value) ? "#FACC15" : "#D4D4D8"} filled />
      ))}
    </View>
  );
}

function Guest() {
  const { c } = useTheme();
  const { space } = useTabBarSpace();
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: space }}>
        <Wordmark size={24} />
        <Card style={{ marginTop: 18, alignItems: "center", paddingVertical: 28 }}>
          <EmptyState icon="person-circle-outline" title="Your campus account" message="Log in to manage listings, orders, wishlist and plans." compact />
          <View style={{ alignSelf: "stretch", gap: 10 }}>
            <Button title="Log in" onPress={() => router.push("/login")} size="lg" />
            <Button kind="secondary" title="Create an account" onPress={() => router.push("/signup")} size="lg" />
          </View>
        </Card>
        <Card style={{ marginTop: 14, padding: 6 }}>
          <Row icon="help-circle-outline" title="FAQ" onPress={() => router.push("/faq")} />
          <Row icon="life-buoy" title="Help & support" onPress={() => router.push("/contact")} />
          <Row icon="document-text-outline" title="Terms & privacy" onPress={() => router.push("/legal/terms")} />
        </Card>
        <BrandFooter style={{ paddingHorizontal: 8 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

export default function Profile() {
  const { c } = useTheme();
  const { space } = useTabBarSpace();
  const user = useAuthStore((s) => s.user);
  const loggedIn = useAuthStore((s) => s.status === "authed");
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const logout = useAuthStore((s) => s.logout);
  const { campus } = useCampus();
  const { unreadCount } = useNotifications();
  const chatUnread = useChatUnread();
  const { items: saved } = useWishlist();

  const mine = useQuery({ queryKey: ["my-listings"], queryFn: productApi.mine, enabled: loggedIn });
  const drafts = useQuery({ queryKey: ["my-listings", "drafts"], queryFn: productApi.drafts, enabled: loggedIn });
  const insights = useQuery({ queryKey: ["insights"], queryFn: userApi.insights, enabled: loggedIn, staleTime: 60_000 });
  const ratings = useQuery({ queryKey: ["my-ratings"], queryFn: reviewApi.mine, enabled: loggedIn, staleTime: 60_000 });
  const gami = useQuery({ queryKey: ["badges"], queryFn: badgeApi.mine, enabled: loggedIn, staleTime: 60_000 });

  if (!loggedIn || !user) return <Guest />;

  const products = mine.data || [];
  const active = products.filter((p) => ["listed", "active"].includes(String(p.status))).length;
  const draftCount = new Set([...(drafts.data || []), ...products.filter((p) => p.status === "draft")].map((p) => p._id)).size;
  const views = products.reduce((n, p) => n + (p.views_count || 0), 0);
  const ins = insights.data;
  const rating = ratings.data as { avg?: number; count?: number } | undefined;
  const ratingCount = rating?.count || ins?.rating?.count || 0;
  const ratingAvg = rating?.avg ?? ins?.rating?.avg ?? 0;
  const yourTurn = ins?.deals?.yourTurn || 0;
  const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

  const todo = [
    yourTurn > 0 && { key: "deals", tone: "#F59E0B", title: `${plural(yourTurn, "deal needs", "deals need")} your next step`, hint: "Set a pickup or confirm payment", to: "/orders" as Href, cta: "Open orders" },
    chatUnread > 0 && { key: "chats", tone: c.accent, title: `${chatUnread > 99 ? "99+" : chatUnread} unread chat${chatUnread === 1 ? "" : "s"}`, hint: "Buyers reply faster when you do", to: "/chats" as Href, cta: "Reply" },
    draftCount > 0 && { key: "drafts", tone: "#94A3B8", title: `${plural(draftCount, "draft", "drafts")} not live yet`, hint: "Finish listing to start getting views", to: "/my-listings" as Href, cta: "Finish" },
  ].filter(Boolean) as { key: string; tone: string; title: string; hint: string; to: Href; cta: string }[];

  const checklist = [
    { done: Boolean(user.is_email_verified), label: "Verify your email", to: "/settings" as Href },
    { done: Boolean(campus?.name), label: "Set your campus", to: "/settings" as Href },
    { done: Boolean(user.avatar && (typeof user.avatar === "string" || user.avatar.url)), label: "Add a profile photo", to: "/settings" as Href },
    { done: products.length > 0, label: "List your first item", to: "/sell" as Href },
  ];
  const doneCount = checklist.filter((x) => x.done).length;

  const stats = [
    { label: "Active listings", value: mine.isLoading ? "—" : String(active), sub: draftCount ? `${draftCount} draft${draftCount === 1 ? "" : "s"} waiting` : "Live on your campus", to: "/my-listings" as Href },
    { label: "Items sold", value: insights.isLoading ? "—" : String(ins?.earnings?.count || 0), sub: ins?.deals?.selling ? `${ins.deals.selling} more in progress` : "Completed deals", to: "/orders" as Href },
    { label: "Listing views", value: mine.isLoading ? "—" : views.toLocaleString("en-IN"), sub: "Unique views, all listings", to: "/my-listings" as Href },
    { label: "Saved items", value: String(saved.length), sub: "In your wishlist", to: "/wishlist" as Href },
  ];

  const months: { month: string; total: number }[] = ins?.earnings?.months || [];
  const maxMonth = Math.max(1, ...months.map((m) => m.total));
  const g = gami.data;

  const refreshing = mine.isRefetching || insights.isRefetching;
  const onRefresh = () => {
    refreshProfile();
    mine.refetch();
    drafts.refetch();
    insights.refetch();
    ratings.refetch();
    gami.refetch();
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: space }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.accent} />}>
        {/* Profile header (flush on phone) */}
        <View style={[styles.header, { backgroundColor: c.card, borderColor: c.border }]}>
          <LinearGradient colors={[c.accentSoftStrong, "transparent"]} style={styles.cover} pointerEvents="none" />
          <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
            <Avatar avatar={user.avatar} name={user.name} size={72} plan={user.subscription} role={user.role} showBadge />
            <View style={{ flex: 1, gap: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text numberOfLines={1} style={{ color: c.text, fontSize: 20, letterSpacing: -0.4, flexShrink: 1, ...font.bold }}>
                  {formatName(user.name)}
                </Text>
                {user.is_email_verified ? <Icon name="verified" size={17} color={c.accent} /> : null}
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Icon name="location-outline" size={13} color={c.textMuted} />
                <Text numberOfLines={1} style={{ color: c.textMuted, fontSize: 13, flexShrink: 1, ...font.medium }}>
                  {campus?.name || "No campus yet"}
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Icon name="calendar-outline" size={13} color={c.textFaint} />
                <Text style={{ color: c.textFaint, fontSize: 12.5, ...font.regular }}>
                  {user.createdAt ? `Joined ${new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}` : "Unideals member"} · {tierLabel(user.subscription)} plan
                </Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14 }}>
            <Stars value={ratingCount ? ratingAvg : 0} />
            <Text style={{ color: c.textMuted, fontSize: 12.5, ...font.medium }}>{ratingCount ? `${Number(ratingAvg).toFixed(1)} · ${plural(ratingCount, "rating", "ratings")}` : "No ratings yet"}</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
            <View style={{ flex: 1 }}>
              <Button kind="secondary" size="sm" icon="create-outline" title="Edit profile" onPress={() => router.push("/settings")} />
            </View>
            <View style={{ flex: 1 }}>
              <Button size="sm" icon="plus" title="List an item" onPress={() => router.push("/sell")} />
            </View>
          </View>
        </View>

        <View style={{ padding: 16, gap: 14 }}>
          {/* Needs your attention */}
          {todo.map((t) => (
            <Card key={t.key} onPress={() => router.push(t.to)} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: t.tone }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.text, fontSize: 14.5, ...font.semibold }}>{t.title}</Text>
                <Text style={{ color: c.textMuted, fontSize: 12.5, ...font.regular }}>{t.hint}</Text>
              </View>
              <Text style={{ color: c.accentText, fontSize: 13, ...font.semibold }}>{t.cta}</Text>
              <Icon name="arrow-forward" size={14} color={c.accentText} />
            </Card>
          ))}

          {/* Stat cells */}
          <View style={styles.grid}>
            {stats.map((s) => (
              <Card key={s.label} onPress={() => router.push(s.to)} style={styles.stat}>
                <Text style={{ color: c.textMuted, fontSize: 12.5, ...font.medium }}>{s.label}</Text>
                <Text style={{ color: c.text, fontSize: 24, letterSpacing: -0.5, marginTop: 2, fontVariant: ["tabular-nums"], ...font.semibold }}>{s.value}</Text>
                <Text numberOfLines={1} style={{ color: c.textFaint, fontSize: 11.5, ...font.regular }}>
                  {s.sub}
                </Text>
              </Card>
            ))}
          </View>

          {/* Finish setting up */}
          {!mine.isLoading && doneCount < checklist.length ? (
            <Card>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ color: c.text, fontSize: 15, ...font.semibold }}>Finish setting up</Text>
                <Text style={{ color: c.textMuted, fontSize: 12.5, ...font.medium }}>
                  {doneCount}/{checklist.length}
                </Text>
              </View>
              <View style={{ height: 6, borderRadius: 3, backgroundColor: c.surfaceAlt, marginTop: 10, marginBottom: 6 }}>
                <View style={{ width: `${(doneCount / checklist.length) * 100}%`, height: 6, borderRadius: 3, backgroundColor: c.accent }} />
              </View>
              {checklist.map((x) =>
                x.done ? (
                  <View key={x.label} style={styles.checkRow}>
                    <Icon name="checkmark" size={15} color="#10B981" strokeWidth={3} />
                    <Text style={{ color: c.textFaint, fontSize: 13, textDecorationLine: "line-through", ...font.medium }}>{x.label}</Text>
                  </View>
                ) : (
                  <Pressable key={x.label} onPress={() => router.push(x.to)} style={styles.checkRow}>
                    <Icon name="ellipse-outline" size={15} color={c.textFaint} />
                    <Text style={{ flex: 1, color: c.text, fontSize: 13, ...font.semibold }}>{x.label}</Text>
                    <Icon name="chevron-forward" size={15} color={c.textFaint} />
                  </Pressable>
                ),
              )}
            </Card>
          ) : null}

          {/* Account menu */}
          {MENU.map((group) => (
            <View key={group.title}>
              <Text style={[styles.groupTitle, { color: c.textFaint }]}>{group.title}</Text>
              <Card style={{ padding: 4 }}>
                {group.items.map((it) => (
                  <Row key={it.label} icon={it.icon} title={it.label} badge={it.badge === "notif" ? unreadCount : undefined} onPress={() => router.push(it.to)} />
                ))}
              </Card>
            </View>
          ))}

          {/* Achievements */}
          <Card onPress={() => router.push("/achievements")}>
            {g ? (
              <>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={[styles.level, { backgroundColor: c.accentSoft }]}>
                    <Text style={{ color: c.accentText, fontSize: 18, ...font.black }}>{g.level}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: c.text, fontSize: 15, ...font.semibold }}>{g.rank_title}</Text>
                    <Text style={{ color: c.textMuted, fontSize: 12.5, ...font.regular }}>
                      {g.total_xp} XP · {g.badges.length} badge{g.badges.length === 1 ? "" : "s"}
                    </Text>
                  </View>
                  <Icon name="chevron-forward" size={18} color={c.textFaint} />
                </View>
                <View style={{ height: 6, borderRadius: 3, backgroundColor: c.surfaceAlt, marginTop: 12 }}>
                  <View style={{ width: `${Math.min(100, g.progress_percent || 0)}%`, height: 6, borderRadius: 3, backgroundColor: c.accent }} />
                </View>
                {g.xp_to_next_level != null ? (
                  <Text style={{ color: c.textFaint, fontSize: 11.5, marginTop: 6, ...font.regular }}>
                    {g.xp_to_next_level} XP to level {g.next_level}
                  </Text>
                ) : null}
              </>
            ) : (
              <Skeleton height={56} />
            )}
          </Card>

          {/* Recent listings */}
          <View>
            <View style={styles.secHead}>
              <Text style={{ color: c.text, fontSize: 16, ...font.semibold }}>
                Recent listings {products.length ? <Text style={{ color: c.textFaint }}>{products.length}</Text> : null}
              </Text>
              <Pressable onPress={() => router.push("/my-listings")} hitSlop={8}>
                <Text style={{ color: c.accentText, fontSize: 13, ...font.semibold }}>View all →</Text>
              </Pressable>
            </View>
            {mine.isLoading ? (
              <Skeleton height={120} radius={16} />
            ) : products.length === 0 ? (
              <Card style={{ alignItems: "center", gap: 10 }}>
                <Text style={{ color: c.text, fontSize: 14.5, ...font.semibold }}>Nothing listed yet</Text>
                <Button size="sm" icon="plus" title="List an item" full={false} onPress={() => router.push("/sell")} />
              </Card>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                {products.slice(0, 8).map((p) => {
                  const img = firstImage(p.images);
                  return (
                    <Card
                      key={p._id}
                      onPress={() => router.push(p.status === "draft" ? { pathname: "/edit-listing/[id]", params: { id: p._id } } : `/product/${p.slug || p._id}`)}
                      style={{ width: 150, padding: 0, overflow: "hidden" }}
                    >
                      <View style={{ height: 110, backgroundColor: c.surfaceAlt }}>{img ? <Image source={{ uri: ikThumb(img, 320) }} style={StyleSheet.absoluteFill} contentFit="cover" /> : null}</View>
                      <View style={{ padding: 10 }}>
                        <Text numberOfLines={1} style={{ color: c.text, fontSize: 13, ...font.semibold }}>
                          {p.title || "Untitled draft"}
                        </Text>
                        <Text style={{ color: c.textMuted, fontSize: 12, ...font.medium }}>
                          {p.selling_price ? inr(p.selling_price) : "—"} · {p.status === "listed" ? "Live" : p.status}
                        </Text>
                      </View>
                    </Card>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {/* Earnings */}
          <Card>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: c.textMuted, fontSize: 12.5, ...font.medium }}>Earnings</Text>
              <Text style={{ color: c.textFaint, fontSize: 11.5, ...font.regular }}>Last 6 months</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: 4 }}>
              <View>
                <Text style={{ color: c.text, fontSize: 20, fontVariant: ["tabular-nums"], ...font.semibold }}>{insights.isLoading ? "—" : inr(ins?.earnings?.total || 0)}</Text>
                <Text style={{ color: c.textMuted, fontSize: 12, ...font.regular }}>
                  {ins?.earnings?.thisMonth ? `${inr(ins.earnings.thisMonth)} this month` : ins?.earnings?.count ? `${plural(ins.earnings.count, "sale", "sales")}` : "No sales yet"}
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 4, height: 36 }}>
                {months.map((m, i) => (
                  <View
                    key={m.month}
                    style={{
                      width: 10,
                      borderRadius: 2,
                      height: `${m.total ? Math.max(15, Math.round((m.total / maxMonth) * 100)) : 8}%`,
                      backgroundColor: c.accent,
                      opacity: m.total ? (i === months.length - 1 ? 1 : 0.45) : 0.12,
                    }}
                  />
                ))}
              </View>
            </View>
            <Text style={{ color: c.textFaint, fontSize: 11.5, marginTop: 8, ...font.regular }}>Paid to you at pickup. No commission.</Text>
          </Card>

          {/* Saved */}
          <View>
            <View style={styles.secHead}>
              <Text style={{ color: c.text, fontSize: 16, ...font.semibold }}>
                Saved {saved.length ? <Text style={{ color: c.textFaint }}>{saved.length}</Text> : null}
              </Text>
              <Pressable onPress={() => router.push("/wishlist")} hitSlop={8}>
                <Text style={{ color: c.accentText, fontSize: 13, ...font.semibold }}>View all →</Text>
              </Pressable>
            </View>
            <Card style={{ padding: 6 }}>
              {saved.filter((p) => typeof p === "object").length === 0 ? (
                <Text style={{ color: c.textMuted, fontSize: 13, padding: 10, ...font.regular }}>
                  Nothing saved yet.{" "}
                  <Text onPress={() => router.push("/explore")} style={{ color: c.accentText, ...font.semibold }}>
                    Explore listings
                  </Text>
                </Text>
              ) : (
                saved
                  .filter((p) => typeof p === "object")
                  .slice(0, 4)
                  .map((p) => {
                    const img = firstImage(p.images);
                    return (
                      <Pressable key={p._id} onPress={() => router.push(`/product/${p.slug || p._id}`)} style={({ pressed }) => [styles.savedRow, { backgroundColor: pressed ? c.surface : "transparent" }]}>
                        <View style={{ width: 44, height: 44, borderRadius: 10, overflow: "hidden", backgroundColor: c.surfaceAlt }}>
                          {img ? <Image source={{ uri: ikThumb(img, 120) }} style={StyleSheet.absoluteFill} contentFit="cover" /> : null}
                        </View>
                        <Text numberOfLines={1} style={{ flex: 1, color: c.text, fontSize: 13.5, ...font.semibold }}>
                          {p.title}
                        </Text>
                        <Text style={{ color: c.text, fontSize: 13.5, ...font.bold }}>{inr(p.selling_price)}</Text>
                      </Pressable>
                    );
                  })
              )}
            </Card>
          </View>

          <Card style={{ padding: 4 }}>
            <Row
              icon="log-out-outline"
              title="Sign out"
              subtitle="Signs you out of Unideals on every device."
              danger
              chevron={false}
              onPress={() =>
                Alert.alert("Sign out?", "You'll need to log in again to chat and sell.", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Sign out", style: "destructive", onPress: () => logout() },
                ])
              }
            />
          </Card>
        </View>
        <BrandFooter />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 22, paddingBottom: 16, borderBottomWidth: 1, overflow: "hidden" },
  cover: { position: "absolute", left: 0, right: 0, top: 0, height: 110 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  stat: { width: "48.5%", padding: 14, gap: 1 },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  groupTitle: { fontSize: 11.5, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6, marginLeft: 4, fontFamily: "Figtree_600SemiBold" },
  level: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  secHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  savedRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 8, borderRadius: 12 },
});
