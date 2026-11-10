import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Alert, FlatList, Modal, Pressable, ScrollView, Share, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { chatApi } from "@/api/chat";
import { errorCode, errorMessage, errorStatus } from "@/api/client";
import { productApi } from "@/api/products";
import { HotDealChip } from "@/components/product/ProductCard";
import { Avatar, Badge, Button, Card, Divider, EmptyState, IconButton, Input, OptionSheet, Sheet, Skeleton } from "@/components/ui";
import { Icon, type IconName } from "@/components/ui/Icon";
import { CONDITIONS, PAYMENT_OPTIONS, REPORT_REASONS, USAGE_DURATIONS, categoryOf, labelOf, rulesFor } from "@/constants/product";
import { useCampus } from "@/hooks/useCampus";
import { useWishlist } from "@/hooks/useWishlist";
import { previewProduct } from "@/lib/productPreview";
import { promptLogin } from "@/lib/authPrompt";
import { useRecentStore } from "@/store/recent";
import { WEB_URL } from "@/lib/env";
import { toast } from "@/lib/toast";
import { useAuthStore } from "@/store/auth";
import { font, useTheme } from "@/theme";
import { discountPct, formatName, isBoostLive, isHot, shortDate, timeAgo } from "@/utils/format";
import { ikCard, ikFull } from "@/utils/image";
import type { Product, Seller } from "@/types";

const INR = new Intl.NumberFormat("en-IN");
const inr = (n?: number) => `₹${INR.format(n || 0)}`;
// Website ProductDescription SAFETY_TIPS.
const SAFETY_TIPS = [
  "Meet at a busy, public spot on campus, ideally in daylight.",
  "Check the item properly before you pay.",
  "Pay at pickup by cash or UPI. Never pay in advance.",
  "Keep the conversation in Unideals chat.",
];

function Section({ title, icon, children }: { title: string; icon: IconName; children: ReactNode }) {
  const { c } = useTheme();
  return (
    <Card style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Icon name={icon} size={16} color={c.textMuted} />
        <Text style={{ color: c.text, fontSize: 15.5, ...font.semibold }}>{title}</Text>
      </View>
      {children}
    </Card>
  );
}

function Notice({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "pink" | "warning" }) {
  const { c } = useTheme();
  const bg = tone === "pink" ? (c.dark ? "rgba(236,72,153,0.12)" : "#FDF2F8") : tone === "warning" ? c.warningSoft : c.surface;
  const fg = tone === "pink" ? "#DB2777" : tone === "warning" ? c.warning : c.textMuted;
  return (
    <View style={[styles.notice, { backgroundColor: bg }]}>
      <Icon name="information-circle" size={15} color={fg} />
      <Text style={{ flex: 1, color: fg, fontSize: 13, lineHeight: 18, ...font.medium }}>{children}</Text>
    </View>
  );
}

function RoundBtn({ icon, onPress, tint, filled }: { icon: IconName; onPress: () => void; tint?: string; filled?: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.round, { transform: [{ scale: pressed ? 0.94 : 1 }] }]} hitSlop={6}>
      <Icon name={icon} size={19} color={tint || "#0F172A"} filled={filled} strokeWidth={2.1} />
    </Pressable>
  );
}

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const { campus, campusSlug } = useCampus();
  const me = useAuthStore((s) => s.user);
  const loggedIn = useAuthStore((s) => s.status === "authed");
  const { isSaved, toggle } = useWishlist();

  const [index, setIndex] = useState(0);
  const [viewer, setViewer] = useState<number | null>(null);
  const [manageOpen, setManageOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const q = useQuery({
    queryKey: ["product", id, campusSlug],
    queryFn: () => productApi.detail(id, { campus_slug: campusSlug }),
    staleTime: 30_000,
    // Paint instantly from the card the user tapped; the full record replaces it.
    placeholderData: () => previewProduct(id),
  });
  const p = q.data;
  const partial = q.isPlaceholderData;
  const pushRecent = useRecentStore((s) => s.push);
  useEffect(() => {
    if (q.data && !q.isPlaceholderData) pushRecent(q.data);
  }, [q.data, q.isPlaceholderData, pushRecent]);

  const viewed = useRef(false);
  useEffect(() => {
    if (p?._id && !viewed.current) {
      viewed.current = true;
      productApi.recordView(p._id, campusSlug).catch(() => {});
    }
  }, [p?._id, campusSlug]);

  const seller = (typeof p?.seller_id === "object" ? p?.seller_id : p?.seller) as Seller | undefined;
  const sellerId = seller?._id || (typeof p?.seller_id === "string" ? p.seller_id : "");
  const isOwner = Boolean(me?._id && sellerId && String(me._id) === String(sellerId));

  const startChat = useMutation({
    mutationFn: () => chatApi.start(p!._id),
    onSuccess: (conv) => router.push({ pathname: "/chat/[id]", params: { id: conv._id } }),
    onError: (err) => toast.error(errorMessage(err, "Couldn't open the chat")),
  });

  const ownerAction = useMutation({
    mutationFn: async (action: "sold" | "unlist" | "relist" | "delete" | "boost") => {
      const pid = p!._id;
      if (action === "sold") return productApi.markSold(pid);
      if (action === "unlist") return productApi.unlist(pid);
      if (action === "relist") return productApi.relist(pid);
      if (action === "boost") return productApi.boost(pid);
      return productApi.remove(pid);
    },
    onSuccess: (_r, action) => {
      setManageOpen(false);
      ["product", "feed", "my-listings", "boost-summary"].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
      toast.success({ sold: "Marked as sold", unlist: "Listing hidden", relist: "Listing is live again", delete: "Listing deleted", boost: "Boosted. Front-row seat secured." }[action]);
      if (action === "delete") router.back();
    },
    onError: (err) => {
      setManageOpen(false);
      if (errorCode(err) === "BOOST_LIMIT" || /boost|quota/i.test(errorMessage(err, ""))) {
        Alert.alert("No boosts left", `${errorMessage(err)}\n\nBuy a one-off boost from My listings, or upgrade for monthly boosts.`, [
          { text: "Not now", style: "cancel" },
          { text: "My listings", onPress: () => router.push("/my-listings") },
        ]);
      } else toast.error(errorMessage(err));
    },
  });

  const share = async () => {
    if (!p) return;
    const url = `${WEB_URL}/product/${p.slug || p._id}`;
    try {
      await Share.share({ message: `${p.title} for ${inr(p.selling_price)} on Unideals\n${url}`, url });
    } catch {
      // dismissed
    }
  };

  if (q.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <Skeleton height={width} radius={0} />
        <View style={{ padding: 16, gap: 12 }}>
          <Skeleton height={14} width="45%" />
          <Skeleton height={26} width="85%" />
          <Skeleton height={30} width="40%" />
          <Skeleton height={120} radius={16} />
        </View>
      </View>
    );
  }
  if (q.isError || !p) {
    const status = errorStatus(q.error);
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
        <View style={{ padding: 8 }}>
          <IconButton icon="chevron-back" onPress={() => router.back()} />
        </View>
        <EmptyState
          icon={status === 404 || status === 403 ? "eye-off-outline" : "cloud-offline-outline"}
          title={status === 404 ? "This listing isn't available" : "Couldn't load this listing"}
          message={errorMessage(q.error, "It may have been sold or removed.")}
          action={status && status < 500 ? "Explore listings" : "Try again"}
          onAction={() => (status && status < 500 ? router.replace("/explore") : q.refetch())}
        />
      </SafeAreaView>
    );
  }

  const images = p.images || [];
  const off = discountPct(p.selling_price, p.original_price);
  const cat = categoryOf(p.category);
  const rules = rulesFor(p.category);
  const available = p.status === "listed" && !p.is_deleted;
  const reservedByOther = available && p.reservation?.reserved && String(p.reservation.buyerId || "") !== String(me?._id || "");
  const girlsBlocked = p.isGirlsOnly && me && me.gender !== "female" && me.role !== "admin" && me.role !== "support";
  const availability = !available ? (p.status === "sold" ? "Sold" : "Unavailable") : reservedByOther ? "Reserved" : "Available";
  const paymentLabel = labelOf(PAYMENT_OPTIONS, p.payment_preference);
  const saved = isSaved(p._id);
  const campusName = typeof p.campus_id === "object" ? p.campus_id.name : campus?.name;

  const specs: [IconName, string, string | undefined][] = [
    ["sparkles-outline", "Condition", rules.condition?.fixed ? undefined : labelOf(CONDITIONS, p.condition)],
    ["pricetag-outline", "Brand", String(p.attributes?.brand || "").trim() || undefined],
    ["color-palette-outline", "Colour", rules.color === "off" ? undefined : String(p.attributes?.color || "").trim() || undefined],
    ["timer", "Used for", rules.usage?.fixed ? undefined : labelOf(USAGE_DURATIONS, p.attributes?.usage_duration)],
    ["calendar-outline", "Purchased", p.attributes?.purchase_date ? shortDate(p.attributes.purchase_date) : undefined],
    ["package", "Quantity", p.quantity ? `${p.quantity} available` : undefined],
    ["wallet-outline", "Payment", paymentLabel || undefined],
    ["handshake", "Price", p.is_negotiable === false ? "Fixed" : "Negotiable"],
    ["time-outline", "Listed on", shortDate(p.createdAt)],
  ];
  const sellerRows: [string, string][] = [
    ["Buyer rating", seller?.rating?.count ? `★ ${Number(seller.rating.avg || 0).toFixed(1)} (${seller.rating.count})` : "New seller"],
    ...(seller?.createdAt ? ([["Member since", new Date(seller.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })]] as [string, string][]) : []),
    ...(Number.isFinite(p.seller_stats?.active_listings as number) ? ([["Active listings", String(p.seller_stats?.active_listings)]] as [string, string][]) : []),
  ];

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        <View style={{ width, height: width, backgroundColor: c.dark ? "#1A1D20" : "#ECEEF2" }}>
          {images.length ? (
            <FlatList
              data={images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(im, i) => im.fileId || `${i}`}
              onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
              renderItem={({ item, index: i }) => (
                <Pressable onPress={() => setViewer(i)}>
                  <Image source={{ uri: ikCard(item.url) }} style={{ width, height: width }} contentFit="cover" transition={150} cachePolicy="memory-disk" />
                </Pressable>
              )}
            />
          ) : (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <Icon name="image-outline" size={44} color={c.textFaint} />
            </View>
          )}
          <View style={[styles.galleryTop, { top: insets.top + 6 }]}>
            <RoundBtn icon="chevron-back" onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <RoundBtn icon="share-social-outline" onPress={share} />
              {!isOwner ? <RoundBtn icon="heart" tint={saved ? "#EF4444" : "#71717A"} filled={saved} onPress={() => toggle(p as Product)} /> : null}
            </View>
          </View>
          {images.length > 1 ? (
            <View style={styles.counter}>
              <Text style={{ color: "#fff", fontSize: 12, ...font.semibold }}>
                {index + 1} / {images.length}
              </Text>
            </View>
          ) : null}
        </View>
        {images.length > 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingTop: 10 }}>
            {images.map((im, i) => (
              <Pressable key={im.fileId || i} onPress={() => setViewer(i)} style={[styles.thumb, { borderColor: i === index ? c.accent : c.border }]}>
                <Image source={{ uri: ikCard(im.url) }} style={StyleSheet.absoluteFill} contentFit="cover" />
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        <View style={{ padding: 16, gap: 14 }}>
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
              {isHot(p.hot_until) ? <HotDealChip size="md" /> : null}
              {cat ? (
                <Pressable onPress={() => router.push({ pathname: "/category/[slug]", params: { slug: cat.value } })}>
                  <Badge label={cat.label} tone="accent" />
                </Pressable>
              ) : null}
              {!rules.condition?.fixed && p.condition ? <Badge label={labelOf(CONDITIONS, p.condition)} /> : null}
              <Badge label={availability} tone={reservedByOther ? "warning" : available ? "success" : "neutral"} />
              {p.isGirlsOnly ? <Badge label="Girls only" icon="flower-outline" tone="pink" /> : null}
              {isBoostLive(p) ? <Badge label="Boosted" tone="gold" icon="rocket" /> : null}
            </View>
            <Text style={{ color: c.text, fontSize: 22, lineHeight: 28, letterSpacing: -0.4, ...font.bold }}>{p.title}</Text>
            <View style={{ flexDirection: "row", gap: 14 }}>
              <Text style={styles.meta(c.textMuted)}>
                <Icon name="time-outline" size={12} color={c.textMuted} /> {timeAgo(p.createdAt)}
              </Text>
              <Text style={styles.meta(c.textMuted)}>
                <Icon name="eye-outline" size={12} color={c.textMuted} /> {p.views_count || 0} views
              </Text>
            </View>
          </View>

          <Card style={{ gap: 6 }}>
            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10, flexWrap: "wrap" }}>
              <Text style={{ color: c.textStrong, fontSize: 30, letterSpacing: -0.8, fontVariant: ["tabular-nums"], ...font.bold }}>{inr(p.selling_price)}</Text>
              {off > 0 ? <Text style={{ color: c.textFaint, fontSize: 16, textDecorationLine: "line-through", marginBottom: 4, ...font.medium }}>{inr(p.original_price)}</Text> : null}
              {off > 0 ? (
                <View style={{ marginBottom: 6 }}>
                  <Badge label={`${off}% off`} tone="success" />
                </View>
              ) : null}
            </View>
            <Text style={{ color: c.textMuted, fontSize: 13, ...font.regular }}>
              {off > 0 ? `You save ${inr((p.original_price || 0) - p.selling_price)} · ` : ""}
              {p.is_negotiable === false ? "Fixed price" : "Price negotiable"}
              {paymentLabel ? ` · ${paymentLabel}` : ""}
            </Text>
            {!available ? <Notice>This listing is {availability.toLowerCase()} and no longer accepting buyers.</Notice> : null}
            {reservedByOther ? <Notice tone="warning">Reserved for another buyer. It may become available again if the deal falls through.</Notice> : null}
            {girlsBlocked ? <Notice tone="pink">This is a Girls Corner listing. Only verified female students can chat on it.</Notice> : null}
            {isOwner ? <Notice>This is your listing. Buyers see a Chat button here.</Notice> : null}
          </Card>

          {seller ? (
            <Section title="Seller" icon="person-outline">
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Avatar avatar={seller.avatar} name={seller.name} size={50} plan={seller.subscription} role={seller.role} showBadge />
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <Text numberOfLines={1} style={{ color: c.text, fontSize: 15.5, flexShrink: 1, ...font.semibold }}>
                      {formatName(seller.name)}
                    </Text>
                    {seller.is_email_verified ? <Icon name="verified" size={15} color={c.accent} /> : null}
                  </View>
                  <Text style={{ color: c.textMuted, fontSize: 12.5, ...font.medium }}>
                    {seller.gamification?.rank_title ? `${seller.gamification.rank_title}${seller.gamification.level ? ` · Level ${seller.gamification.level}` : ""}` : "Campus member"}
                  </Text>
                </View>
              </View>
              <View style={[styles.sellerGrid, { borderColor: c.border }]}>
                {sellerRows.map(([k, v]) => (
                  <View key={k} style={{ flex: 1, alignItems: "center", gap: 2 }}>
                    <Text style={{ color: c.text, fontSize: 14, ...font.semibold }}>{v}</Text>
                    <Text style={{ color: c.textFaint, fontSize: 11, ...font.medium }}>{k}</Text>
                  </View>
                ))}
              </View>
            </Section>
          ) : null}

          <Section title="About this item" icon="document-text-outline">
            {partial ? (
              <View style={{ gap: 8 }}>
                <Skeleton height={12} />
                <Skeleton height={12} width="85%" />
                <Skeleton height={12} width="60%" />
              </View>
            ) : (
              <Text selectable style={{ color: p.description ? c.text : c.textMuted, fontSize: 14.5, lineHeight: 22, ...font.regular }}>
                {p.description || "The seller hasn't added a description. Ask them in chat."}
              </Text>
            )}
          </Section>

          <Section title="Specifications" icon="list-checks">
            {specs
              .filter(([, , v]) => v)
              .map(([icon, k, v], i) => (
                <View key={k}>
                  {i ? <Divider /> : null}
                  <View style={styles.spec}>
                    <Icon name={icon} size={15} color={c.textFaint} />
                    <Text style={{ flex: 1, color: c.textMuted, fontSize: 13.5, ...font.regular }}>{k}</Text>
                    <Text numberOfLines={1} style={{ color: c.text, fontSize: 13.5, maxWidth: "55%", textAlign: "right", ...font.semibold }}>
                      {v}
                    </Text>
                  </View>
                </View>
              ))}
          </Section>

          <Section title="Pickup & safety" icon="shield-checkmark-outline">
            <View style={{ flexDirection: "row", gap: 10 }}>
              {[
                ["school-outline", "Campus", campusName || "Campus marketplace"],
                ["location-outline", "Meetup spot", p.pickup_address_snapshot?.address_line ? [p.pickup_address_snapshot.address_line, p.pickup_address_snapshot.city].filter(Boolean).join(" · ") : "Shared in chat"],
              ].map(([icon, k, v]) => (
                <View key={k} style={[styles.tile, { backgroundColor: c.surface }]}>
                  <Icon name={icon as IconName} size={16} color={c.accentText} />
                  <Text style={{ color: c.textFaint, fontSize: 11.5, ...font.medium }}>{k}</Text>
                  <Text numberOfLines={2} style={{ color: c.text, fontSize: 13, ...font.semibold }}>
                    {v}
                  </Text>
                </View>
              ))}
            </View>
            <View style={[styles.safety, { backgroundColor: c.accentSoft }]}>
              <Text style={{ color: c.accentText, fontSize: 13.5, ...font.semibold }}>Safe campus exchange</Text>
              {SAFETY_TIPS.map((t) => (
                <View key={t} style={{ flexDirection: "row", gap: 8 }}>
                  <Icon name="checkmark-circle" size={15} color="#10B981" />
                  <Text style={{ flex: 1, color: c.text, fontSize: 13, lineHeight: 18, ...font.regular }}>{t}</Text>
                </View>
              ))}
            </View>
          </Section>

          {!isOwner && loggedIn ? (
            <Pressable onPress={() => setReportOpen(true)} style={{ alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 6, padding: 8 }}>
              <Icon name="flag-outline" size={13} color={c.textMuted} />
              <Text style={{ color: c.textMuted, fontSize: 13, ...font.medium }}>Report this listing</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.cta, { paddingBottom: insets.bottom + 10, backgroundColor: c.barSolid, borderColor: c.border }]}>
        {isOwner ? (
          <>
            <View style={{ flex: 1 }}>
              <Button kind="secondary" icon="create-outline" title="Edit listing" onPress={() => router.push({ pathname: "/edit-listing/[id]", params: { id: p._id } })} />
            </View>
            <View style={{ flex: 1 }}>
              <Button icon="settings-outline" title="Manage" onPress={() => setManageOpen(true)} loading={ownerAction.isPending} />
            </View>
          </>
        ) : (
          <>
            <Pressable
              onPress={() => toggle(p as Product)}
              style={[styles.wish, { borderColor: saved ? "#FECACA" : c.border, backgroundColor: saved ? (c.dark ? "rgba(239,68,68,0.12)" : "#FEF2F2") : c.card }]}
              accessibilityLabel={saved ? "Remove from wishlist" : "Save to wishlist"}
            >
              <Icon name="heart" size={19} color={saved ? "#EF4444" : c.textMuted} filled={saved} />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Button
                icon="chatbubble-ellipses-outline"
                title={!available ? "No longer available" : girlsBlocked ? "Girls Corner only" : reservedByOther ? "Chat with seller" : "Chat Now"}
                disabled={!available || Boolean(girlsBlocked)}
                loading={startChat.isPending}
                onPress={() => (loggedIn ? startChat.mutate() : promptLogin("Log in to chat with the seller", `/product/${id}`))}
              />
            </View>
          </>
        )}
      </View>

      <Sheet visible={manageOpen} onClose={() => setManageOpen(false)} title="Manage listing">
        {p.status === "listed" ? (
          <>
            <ManageRow icon="rocket-outline" label="Boost to the top" hint="Uses one of your plan's boosts" onPress={() => ownerAction.mutate("boost")} />
            <ManageRow icon="checkmark-done-outline" label="Mark as sold" onPress={() => confirm("Mark as sold?", "Buyers will no longer see it.", () => ownerAction.mutate("sold"))} />
            <ManageRow icon="eye-off-outline" label="Hide listing" hint="Unlist it; relist any time" onPress={() => ownerAction.mutate("unlist")} />
          </>
        ) : p.status === "unlisted" ? (
          <ManageRow icon="eye-outline" label="Relist" onPress={() => ownerAction.mutate("relist")} />
        ) : null}
        <Divider style={{ marginVertical: 6 }} />
        <ManageRow icon="trash-outline" danger label="Delete listing" onPress={() => confirm("Delete this listing?", "This can't be undone.", () => ownerAction.mutate("delete"), true)} />
      </Sheet>

      <ReportSheet visible={reportOpen} onClose={() => setReportOpen(false)} productId={p._id} />

      <Modal visible={viewer !== null} transparent={false} animationType="fade" onRequestClose={() => setViewer(null)}>
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            initialScrollIndex={viewer ?? 0}
            getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
            keyExtractor={(im, i) => im.fileId || `${i}`}
            renderItem={({ item }) => <Image source={{ uri: ikFull(item.url) }} style={{ width, height: "100%" }} contentFit="contain" />}
          />
          <View style={{ position: "absolute", top: insets.top + 8, right: 12 }}>
            <RoundBtn icon="close" onPress={() => setViewer(null)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const confirm = (title: string, msg: string, onOk: () => void, destructive = false) =>
  Alert.alert(title, msg, [
    { text: "Cancel", style: "cancel" },
    { text: "Confirm", style: destructive ? "destructive" : "default", onPress: onOk },
  ]);

function ManageRow({ icon, label, hint, onPress, danger }: { icon: IconName; label: string; hint?: string; onPress: () => void; danger?: boolean }) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13, paddingHorizontal: 6, borderRadius: 12, backgroundColor: pressed ? c.surface : "transparent" }]}>
      <Icon name={icon} size={20} color={danger ? c.danger : c.text} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: danger ? c.danger : c.text, fontSize: 15, ...font.semibold }}>{label}</Text>
        {hint ? <Text style={{ color: c.textMuted, fontSize: 12, ...font.regular }}>{hint}</Text> : null}
      </View>
    </Pressable>
  );
}

function ReportSheet({ visible, onClose, productId }: { visible: boolean; onClose: () => void; productId: string }) {
  const [reason, setReason] = useState<string | null>(null);
  const [desc, setDesc] = useState("");
  const [pick, setPick] = useState(false);
  const send = useMutation({
    mutationFn: () => productApi.reportProduct(productId, { reason: reason!, ...(desc.trim().length >= 10 ? { description: desc.trim() } : {}) }),
    onSuccess: () => {
      toast.success("Thanks, our team will review this listing.");
      setReason(null);
      setDesc("");
      onClose();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
  return (
    <Sheet visible={visible} onClose={onClose} title="Report listing">
      <Pressable onPress={() => setPick(true)}>
        <View pointerEvents="none">
          <Input label="Reason" required value={REPORT_REASONS.find((r) => r.value === reason)?.label || ""} placeholder="Choose a reason" editable={false} />
        </View>
      </Pressable>
      <Input label="Details (optional)" multiline value={desc} onChangeText={setDesc} placeholder="At least 10 characters if you add details" maxLength={500} />
      <Button title="Submit report" disabled={!reason} loading={send.isPending} onPress={() => send.mutate()} />
      <OptionSheet
        visible={pick}
        title="Reason"
        options={REPORT_REASONS}
        value={reason}
        onClose={() => setPick(false)}
        onSelect={(v) => {
          setReason(v);
          setPick(false);
        }}
      />
    </Sheet>
  );
}

const styles = {
  ...StyleSheet.create({
    galleryTop: { position: "absolute", left: 12, right: 12, flexDirection: "row", justifyContent: "space-between" },
    round: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.94)", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
    counter: { position: "absolute", bottom: 12, right: 12, backgroundColor: "rgba(15,23,42,0.6)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
    thumb: { width: 60, height: 60, borderRadius: 10, overflow: "hidden", borderWidth: 2 },
    notice: { flexDirection: "row", gap: 8, borderRadius: 10, padding: 10, marginTop: 4 },
    sellerGrid: { flexDirection: "row", borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 12, marginTop: 2 },
    spec: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
    tile: { flex: 1, borderRadius: 12, padding: 12, gap: 3 },
    safety: { borderRadius: 12, padding: 12, gap: 8 },
    cta: { position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth },
    wish: { width: 44, height: 44, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  }),
  meta: (color: string) => ({ color, fontSize: 12.5, fontFamily: "Figtree_500Medium" }),
};
