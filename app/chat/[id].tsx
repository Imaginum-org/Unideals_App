import { Icon } from "@/components/ui/Icon";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { chatApi } from "@/api/chat";
import { errorMessage } from "@/api/client";
import { userApi } from "@/api/user";
import { DealPanel } from "@/components/chat/DealPanel";
import { ChatWallpaper } from "@/components/chat/Wallpaper";
import { productApi } from "@/api/products";
import { RateSheet } from "@/components/chat/RateSheet";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { Avatar, Button, ErrorState, IconButton, Input, Loader, OptionSheet, Sheet, T } from "@/components/ui";
import { REPORT_REASONS } from "@/constants/product";
import { UNREAD_CHAT_KEY } from "@/hooks/useRealtime";
import { acquireSocket, releaseSocket } from "@/lib/socket";
import { toast } from "@/lib/toast";
import { useAuthStore } from "@/store/auth";
import { font, useTheme } from "@/theme";
import { formatName, inr } from "@/utils/format";
import { firstImage, ikThumb } from "@/utils/image";
import type { Deal, Message } from "@/types";

// Website Chat.jsx QUICK_CHIPS.
const QUICK_CHIPS = ["Yes", "No", "Let me check", "Sounds good", "Can we negotiate?", "When can we meet?"];

const idOf = (v: unknown) => (typeof v === "object" && v ? String((v as { _id: string })._id) : String(v || ""));

export default function ChatThread() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { c, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const me = useAuthStore((s) => s.user);
  const meId = String(me?._id || "");
  const chatSettings = (me?.chat_settings || {}) as { wallpaper?: string; read_receipts?: boolean; typing_indicators?: boolean };
  const receiptsOn = chatSettings.read_receipts !== false;
  const typingOn = chatSettings.typing_indicators !== false;
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [reportProductOpen, setReportProductOpen] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]); // oldest → newest
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [peerTyping, setPeerTyping] = useState(false);
  const [online, setOnline] = useState<string[]>([]);
  const [offerOpen, setOfferOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const socketRef = useRef<ReturnType<typeof acquireSocket> | null>(null);

  const conv = useQuery({ queryKey: ["conversation", id], queryFn: () => chatApi.get(id) });
  const msgs = useQuery({ queryKey: ["messages", id], queryFn: () => chatApi.messages(id), staleTime: 0 });

  useEffect(() => {
    if (msgs.data) {
      setMessages(msgs.data.messages);
      setHasMore(msgs.data.hasMore);
    }
  }, [msgs.data]);
  useEffect(() => {
    if (conv.data) setDeal(conv.data.deal);
  }, [conv.data]);

  const markRead = useCallback(() => {
    chatApi
      .markRead(id, receiptsOn)
      .then(() => qc.invalidateQueries({ queryKey: UNREAD_CHAT_KEY }))
      .catch(() => {});
  }, [id, qc, receiptsOn]);
  useEffect(() => {
    markRead();
  }, [markRead]);

  const upsert = useCallback((m: Message) => {
    setMessages((cur) => {
      if (cur.some((x) => x._id === m._id)) return cur.map((x) => (x._id === m._id ? { ...x, ...m } : x));
      // Replace my optimistic copy (same text, still pending) with the real one.
      const pendingIdx = cur.findIndex((x) => x.pending && x.text === m.text && idOf(m.sender_id) === idOf(x.sender_id));
      if (pendingIdx >= 0) {
        const next = [...cur];
        next[pendingIdx] = m;
        return next;
      }
      return [...cur, m];
    });
  }, []);

  // Realtime: join the room, listen for messages/deal/receipts/typing/presence.
  useEffect(() => {
    const socket = acquireSocket();
    socketRef.current = socket;
    const join = () => socket.emit("join_conversation", id);
    const onMessage = (m: Message) => {
      if (String(m.conversation_id) !== String(id)) return;
      upsert(m);
      if (idOf(m.sender_id) !== meId) markRead();
    };
    const onDeal = (p: { conversationId: string; deal: Deal }) => {
      if (String(p?.conversationId) === String(id) && p.deal) setDeal(p.deal);
    };
    const onDelivered = (p: { conversationId: string; messageIds: string[] }) => {
      if (String(p?.conversationId) !== String(id)) return;
      const set = new Set((p.messageIds || []).map(String));
      setMessages((cur) => cur.map((m) => (set.has(String(m._id)) && m.message_status === "sent" ? { ...m, message_status: "delivered" } : m)));
    };
    const onRead = (p: { conversationId: string; readBy: string }) => {
      if (String(p?.conversationId) !== String(id) || String(p.readBy) === meId) return;
      setMessages((cur) => cur.map((m) => (idOf(m.sender_id) === meId ? { ...m, message_status: "read" } : m)));
    };
    const onTyping = (p: { conversationId: string; userId: string; isTyping: boolean }) => {
      if (String(p?.conversationId) !== String(id) || String(p.userId) === meId) return;
      setPeerTyping(Boolean(p.isTyping));
      if (typingTimer.current) clearTimeout(typingTimer.current);
      if (p.isTyping) typingTimer.current = setTimeout(() => setPeerTyping(false), 5000);
    };
    const onPresence = (p: { conversationId: string; onlineUserIds: string[] }) => {
      if (String(p?.conversationId) === String(id)) setOnline((p.onlineUserIds || []).map(String));
    };
    socket.on("connect", join);
    socket.on("message:new", onMessage);
    socket.on("deal:updated", onDeal);
    socket.on("message:delivered", onDelivered);
    socket.on("message:read", onRead);
    socket.on("typing", onTyping);
    socket.on("presence:update", onPresence);
    if (socket.connected) join();
    return () => {
      socket.emit("leave_conversation", id);
      socket.off("connect", join);
      socket.off("message:new", onMessage);
      socket.off("deal:updated", onDeal);
      socket.off("message:delivered", onDelivered);
      socket.off("message:read", onRead);
      socket.off("typing", onTyping);
      socket.off("presence:update", onPresence);
      if (typingTimer.current) clearTimeout(typingTimer.current);
      socketRef.current = null;
      releaseSocket(socket);
      qc.invalidateQueries({ queryKey: ["conversations"] });
    };
  }, [id, meId, upsert, markRead, qc]);

  const lastTypingSent = useRef(0);
  const onChangeText = (t: string) => {
    setText(t);
    const now = Date.now();
    if (typingOn && t && now - lastTypingSent.current > 1500) {
      lastTypingSent.current = now;
      socketRef.current?.emit("typing", { conversationId: id, isTyping: true });
    }
  };

  const send = async (preset?: string) => {
    const body = (preset ?? text).trim();
    if (!body) return;
    const tempId = `tmp-${Date.now()}`;
    const optimistic: Message = {
      _id: tempId,
      conversation_id: id,
      sender_id: meId,
      message_type: "text",
      text: body,
      createdAt: new Date().toISOString(),
      message_status: "sent",
      pending: true,
      reply: replyTo ? { _id: replyTo._id, text: replyTo.text, sender_id: idOf(replyTo.sender_id) } : null,
    };
    setMessages((cur) => [...cur, optimistic]);
    if (preset === undefined) setText("");
    const reply = replyTo?._id;
    setReplyTo(null);
    socketRef.current?.emit("typing", { conversationId: id, isTyping: false });
    try {
      const saved = await chatApi.send(id, body, reply);
      setMessages((cur) => {
        const withoutTemp = cur.filter((m) => m._id !== tempId);
        return withoutTemp.some((m) => m._id === saved._id) ? withoutTemp : [...withoutTemp, saved];
      });
    } catch (err) {
      setMessages((cur) => cur.map((m) => (m._id === tempId ? { ...m, pending: false, failed: true } : m)));
      toast.error(errorMessage(err, "Message not sent"));
    }
  };

  const loadOlder = async () => {
    if (!hasMore || loadingOlder || !messages.length) return;
    setLoadingOlder(true);
    try {
      const firstReal = messages.find((m) => !m.pending);
      const r = await chatApi.messages(id, firstReal?._id);
      setMessages((cur) => {
        const ids = new Set(cur.map((m) => m._id));
        return [...r.messages.filter((m) => !ids.has(m._id)), ...cur];
      });
      setHasMore(r.hasMore);
    } catch {
      // keep what we have
    } finally {
      setLoadingOlder(false);
    }
  };

  const runDeal = async (fn: () => Promise<any>, ok: string) => {
    setBusy(true);
    try {
      const res = await fn();
      const d: Deal | undefined = res?.deal || (res?.status ? res : undefined);
      if (d) setDeal(d);
      else chatApi.deal(id).then((x) => x && setDeal(x)).catch(() => {});
      toast.success(ok);
      qc.invalidateQueries({ queryKey: ["orders"] });
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const sendOffer = async () => {
    const amt = Number(offerAmount);
    if (!amt || amt < 1) return;
    setBusy(true);
    try {
      const r = await chatApi.makeOffer(id, amt);
      if (r?.deal) setDeal(r.deal);
      if (r?.message) upsert(r.message);
      setOfferOpen(false);
      setOfferAmount("");
    } catch (err) {
      toast.error(errorMessage(err, "Couldn't send offer"));
    } finally {
      setBusy(false);
    }
  };

  const respond = (m: Message, action: "accept" | "decline") =>
    runDeal(() => chatApi.respondOffer(id, String(m._id), action), action === "accept" ? "Offer accepted" : "Offer declined");

  const onBubbleLongPress = (m: Message) => {
    if (m.pending || m.message_type === "system") return;
    const actions = [
      { label: "Reply", run: () => setReplyTo(m) },
      ...(m.message_type === "text" && !m.is_flagged ? [{ label: "Copy", run: () => Clipboard.setStringAsync(m.text).then(() => toast("Copied")) }] : []),
    ];
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions({ options: [...actions.map((a) => a.label), "Cancel"], cancelButtonIndex: actions.length }, (i) => actions[i]?.run());
    } else {
      Alert.alert("Message", undefined, [...actions.map((a) => ({ text: a.label, onPress: a.run })), { text: "Cancel", style: "cancel" as const }]);
    }
  };

  const openMenu = () => {
    const status = deal?.status;
    const canCancel = status && !["completed", "cancelled"].includes(status);
    const items = [
      ...(conv.data?.product_id?._id ? [{ label: "View listing", run: () => router.push(`/product/${conv.data!.product_id!._id}`) }] : []),
      ...(canCancel
        ? [
            {
              label: "Cancel deal",
              destructive: true,
              run: () =>
                Alert.alert("Cancel this deal?", "The item becomes available to others again.", [
                  { text: "Keep deal", style: "cancel" },
                  { text: "Cancel deal", style: "destructive", onPress: () => runDeal(() => chatApi.cancel(id, "Cancelled from chat"), "Deal cancelled") },
                ]),
            },
          ]
        : []),
      ...(conv.data?.product_id?._id ? [{ label: "Report listing", destructive: true, run: () => setReportProductOpen(true) }] : []),
      { label: "Report user", destructive: true, run: () => setReportOpen(true) },
    ];
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: [...items.map((i) => i.label), "Close"], cancelButtonIndex: items.length, destructiveButtonIndex: items.findIndex((i) => (i as any).destructive) },
        (i) => items[i]?.run(),
      );
    } else {
      Alert.alert("Options", undefined, [...items.map((i) => ({ text: i.label, onPress: i.run })), { text: "Close", style: "cancel" as const }]);
    }
  };

  const needle = searchText.trim().toLowerCase();
  const reversed = useMemo(
    () => [...messages].filter((m) => !needle || (m.message_type === "text" && !m.is_flagged && String(m.text || "").toLowerCase().includes(needle))).reverse(),
    [messages, needle],
  );

  if (conv.isLoading || msgs.isLoading) return <Loader />;
  if (conv.isError || !conv.data) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
        <IconButton icon="chevron-back" onPress={() => router.back()} style={{ margin: 8 }} />
        <ErrorState message={errorMessage(conv.error)} onRetry={() => conv.refetch()} />
      </SafeAreaView>
    );
  }

  const data = conv.data;
  const other = data.otherParty;
  const otherName = formatName(other?.name);
  const product = data.product_id;
  const productTitle = product?.title || data.product_snapshot?.title || "Listing";
  const productImg = firstImage(product?.images) || data.product_snapshot?.image;
  const isOnline = other?._id ? online.includes(String(other._id)) : false;
  const negotiable = product?.is_negotiable !== false;
  const canOffer = negotiable && (!deal || ["negotiating", "offer_accepted", "cancelled"].includes(deal.status));
  const pickup = product?.pickup_address_snapshot;

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Header */}
      <View style={[styles.header, { borderColor: c.border }]}>
        <IconButton icon="chevron-back" onPress={() => (router.canGoBack() ? router.back() : router.replace("/chats"))} />
        <Avatar avatar={other?.avatar} name={other?.name} size={38} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <T variant="h3" numberOfLines={1}>
            {otherName}
          </T>
          <T variant="caption" color={peerTyping || isOnline ? c.success : c.textMuted}>
            {peerTyping ? "typing…" : isOnline ? "Online" : data.role === "buying" ? "Seller" : "Buyer"}
          </T>
        </View>
        <IconButton icon="search" onPress={() => { setSearchOpen((v) => !v); setSearchText(""); }} accessibilityLabel="Search in chat" />
        <IconButton icon="ellipsis-vertical" onPress={openMenu} accessibilityLabel="Chat options" />
      </View>

      {/* Product strip */}
      <Pressable
        onPress={() => product?._id && router.push(`/product/${product._id}`)}
        style={[styles.productStrip, { backgroundColor: c.surface, borderColor: c.border }]}
      >
        {productImg ? <Image source={{ uri: ikThumb(productImg, 120) }} style={{ width: 40, height: 40, borderRadius: radius.sm }} /> : null}
        <View style={{ flex: 1 }}>
          <T variant="small" numberOfLines={1} style={font.semibold}>
            {productTitle}
          </T>
          <T variant="caption" muted>
            Listed at {inr(product?.selling_price ?? data.product_snapshot?.selling_price)}
            {negotiable ? " · Negotiable" : ""}
          </T>
        </View>
        <Icon name="chevron-forward" size={16} color={c.textFaint} />
      </Pressable>

      {deal || data.role ? (
        <DealPanel
          deal={deal}
          role={data.role}
          busy={busy}
          defaultLocation={pickup?.address_line ? [pickup.address_line, pickup.city].filter(Boolean).join(", ") : ""}
          onConfirm={(amt) => runDeal(() => chatApi.confirmDeal(id, amt), "Deal locked")}
          onSchedule={(d, loc) => runDeal(() => chatApi.schedulePickup(id, d, loc), "Pickup set")}
          onPayment={() => runDeal(() => chatApi.confirmPayment(id), "Payment confirmed")}
          onReceived={() => runDeal(() => chatApi.confirmReceived(id), "Done. Enjoy your buy.")}
          onRevert={() => runDeal(() => chatApi.revert(id, deal?.status), "Step undone")}
          onRate={() => setRateOpen(true)}
        />
      ) : null}

      {searchOpen ? (
        <View style={[styles.searchBar, { backgroundColor: c.barSolid, borderColor: c.border }]}>
          <Icon name="search" size={16} color={c.textMuted} />
          <TextInput autoFocus value={searchText} onChangeText={setSearchText} placeholder="Search messages" placeholderTextColor={c.textFaint} style={{ flex: 1, color: c.text, fontSize: 14.5, fontFamily: "Figtree_400Regular" }} />
          <Text style={{ color: c.textMuted, fontSize: 12, fontFamily: "Figtree_500Medium" }}>{needle ? `${reversed.length} found` : ""}</Text>
        </View>
      ) : null}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={0}>
        <ChatWallpaper id={chatSettings.wallpaper} />
        <FlatList
          inverted
          data={reversed}
          keyExtractor={(m) => m._id}
          contentContainerStyle={{ paddingVertical: 10 }}
          renderItem={({ item }) => (
            <MessageBubble
              msg={item}
              meId={meId}
              deal={deal}
              otherName={otherName}
              busy={busy}
              onAccept={(m) => respond(m, "accept")}
              onDecline={(m) => respond(m, "decline")}
              onCounter={() => setOfferOpen(true)}
              onLongPress={onBubbleLongPress}
            />
          )}
          onEndReached={loadOlder}
          onEndReachedThreshold={0.3}
          ListFooterComponent={loadingOlder ? <ActivityIndicator style={{ margin: 12 }} color={c.accent} /> : undefined}
          ListEmptyComponent={
            <View style={{ transform: [{ scaleY: -1 }], alignItems: "center", padding: 32, gap: 6 }}>
              <T variant="h3">Say hi to {otherName.split(" ")[0]} 👋</T>
              <T variant="small" muted center>
                Ask about the item, agree on a price, then confirm the deal here.
              </T>
            </View>
          }
        />

        {!text && !searchOpen && !replyTo ? (
          <ScrollView horizontal keyboardShouldPersistTaps="handled" showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 6, paddingHorizontal: 12, paddingVertical: 8 }}>
            {QUICK_CHIPS.map((q) => (
              <Pressable key={q} onPress={() => send(q)} style={({ pressed }) => [styles.quick, { backgroundColor: pressed ? c.accentSoft : c.card, borderColor: c.border }]}>
                <Text style={{ color: c.text, fontSize: 12.5, fontFamily: "Figtree_500Medium" }}>{q}</Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}
        {/* Composer */}
        <View style={[styles.composerWrap, { borderColor: c.border, paddingBottom: Math.max(insets.bottom, 8), backgroundColor: c.bg }]}>
          {replyTo ? (
            <View style={[styles.replyBar, { backgroundColor: c.surface, borderLeftColor: c.accent }]}>
              <View style={{ flex: 1 }}>
                <T variant="caption" color={c.accentText} style={font.bold}>
                  Replying to {idOf(replyTo.sender_id) === meId ? "yourself" : otherName}
                </T>
                <T variant="caption" muted numberOfLines={1}>
                  {replyTo.text}
                </T>
              </View>
              <IconButton icon="close" size={18} onPress={() => setReplyTo(null)} />
            </View>
          ) : null}
          <View style={styles.composer}>
            {canOffer ? (
              <Pressable onPress={() => setOfferOpen(true)} style={[styles.offerBtn, { backgroundColor: c.accentSoft }]} accessibilityLabel="Make an offer">
                <Icon name="pricetag-outline" size={18} color={c.accentText} />
              </Pressable>
            ) : null}
            <TextInput
              value={text}
              onChangeText={onChangeText}
              placeholder="Message"
              placeholderTextColor={c.textFaint}
              multiline
              maxLength={2000}
              style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
            />
            <Pressable
              onPress={() => send()}
              disabled={!text.trim()}
              style={[styles.sendBtn, { backgroundColor: text.trim() ? c.accent : c.surfaceAlt }]}
              accessibilityLabel="Send"
            >
              <Icon name="send" size={18} color={text.trim() ? "#fff" : c.textFaint} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Sheet visible={offerOpen} onClose={() => setOfferOpen(false)} title="Make an offer">
        <T variant="small" muted style={{ marginBottom: 12 }}>
          Listed at {inr(product?.selling_price ?? data.product_snapshot?.selling_price)}. The other side can accept, decline or counter.
        </T>
        <Input prefix="₹" value={offerAmount} onChangeText={(t) => setOfferAmount(t.replace(/\D/g, ""))} keyboardType="number-pad" placeholder="Your offer" autoFocus />
        <Button title="Send offer" onPress={sendOffer} loading={busy} disabled={!Number(offerAmount)} />
      </Sheet>

      <ReportUserSheet visible={reportOpen} onClose={() => setReportOpen(false)} userId={other?._id} />
      <ReportUserSheet visible={reportProductOpen} onClose={() => setReportProductOpen(false)} productId={product?._id} />
      <RateSheet visible={rateOpen} onClose={() => setRateOpen(false)} conversationId={id} />
    </SafeAreaView>
  );
}

function ReportUserSheet({ visible, onClose, userId, productId }: { visible: boolean; onClose: () => void; userId?: string; productId?: string }) {
  const [reason, setReason] = useState<string | null>(null);
  const [desc, setDesc] = useState("");
  const [pick, setPick] = useState(false);
  const send = useMutation({
    mutationFn: () => {
      const body = { reason: reason!, ...(desc.trim().length >= 10 ? { description: desc.trim() } : {}) };
      return productId ? productApi.reportProduct(productId, body) : userApi.reportUser(userId!, body);
    },
    onSuccess: () => {
      toast.success("Report sent. Our team will take a look.");
      onClose();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
  return (
    <Sheet visible={visible} onClose={onClose} title={productId ? "Report listing" : "Report user"}>
      <Pressable onPress={() => setPick(true)}>
        <View pointerEvents="none">
          <Input label="Reason" value={REPORT_REASONS.find((r) => r.value === reason)?.label || ""} placeholder="Choose a reason" editable={false} />
        </View>
      </Pressable>
      <Input label="What happened? (optional)" multiline value={desc} onChangeText={setDesc} maxLength={500} />
      <Button title="Send report" disabled={!reason || (!userId && !productId)} loading={send.isPending} onPress={() => send.mutate()} />
      <OptionSheet visible={pick} title="Reason" options={REPORT_REASONS} value={reason} onClose={() => setPick(false)} onSelect={(v) => { setReason(v); setPick(false); }} />
    </Sheet>
  );
}


const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 6, paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth },
  productStrip: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 12, marginTop: 8, padding: 8, borderRadius: 14, borderWidth: 1 },
  composerWrap: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 8, paddingHorizontal: 10 },
  composer: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  input: { flex: 1, minHeight: 42, maxHeight: 120, borderRadius: 21, borderWidth: 1, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 10, fontSize: 15.5 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  offerBtn: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, height: 44, borderBottomWidth: StyleSheet.hairlineWidth },
  quick: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  replyBar: { flexDirection: "row", alignItems: "center", borderLeftWidth: 3, borderRadius: 8, paddingLeft: 10, marginBottom: 8 },
});
