import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { assistantApi, type AssistantProduct, type AssistantReply } from "@/api/assistant";
import { errorMessage } from "@/api/client";
import { LogoMark } from "@/components/brand/Brand";
import { TopBar } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { font, useTheme } from "@/theme";
import { firstImage, ikThumb } from "@/utils/image";

const QUICK = ["Cycles under ₹3,000", "Electronics", "Sell textbook", "Price check", "Safety tips"];
const INR = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

type Msg = { id: string; sender: "user" | "assistant"; text: string; isError?: boolean } & Partial<AssistantReply>;

const WELCOME: Msg = {
  id: "welcome",
  sender: "assistant",
  text: "Hey! I can find campus deals, tell you if a price is fair, draft counter-offers and flag sketchy listings. What are we hunting today?",
  suggestions: QUICK,
};

function ProductRow({ p }: { p: AssistantProduct }) {
  const { c } = useTheme();
  const img = firstImage(p.images);
  return (
    <Pressable onPress={() => router.push(`/product/${p.slug || p._id}`)} style={({ pressed }) => [styles.pRow, { backgroundColor: pressed ? c.surface : c.card, borderColor: c.border }]}>
      <View style={[styles.pImg, { backgroundColor: c.surfaceAlt }]}>{img ? <Image source={{ uri: ikThumb(img, 120) }} style={StyleSheet.absoluteFill} /> : null}</View>
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={{ color: c.text, fontSize: 13.5, ...font.semibold }}>
          {p.title}
        </Text>
        <Text numberOfLines={1} style={{ color: c.textMuted, fontSize: 11.5, ...font.regular }}>
          {[p.categoryLabel, p.conditionLabel].filter(Boolean).join(" · ") || "View listing"}
        </Text>
      </View>
      <Text style={{ color: c.text, fontSize: 14, ...font.bold }}>₹{INR.format(p.selling_price || 0)}</Text>
    </Pressable>
  );
}

function Panel({ title, icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={[styles.panel, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <Icon name={icon} size={14} color={c.accentText} />
        <Text style={{ color: c.accentText, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, ...font.bold }}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function Cards({ m }: { m: Msg }) {
  const { c } = useTheme();
  const checklistItems = Array.isArray(m.checklist) ? m.checklist : m.checklist?.checklist || [];
  return (
    <View style={{ gap: 8, marginTop: 8 }}>
      {m.estimate ? (
        <Panel title={`Fair price${m.estimate.category ? ` · ${m.estimate.category}` : ""}`} icon="chart">
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {[
              ["Low", m.estimate.low],
              ["Fair", m.estimate.fair],
              ["High", m.estimate.high],
            ].map(([k, v]) => (
              <View key={String(k)} style={{ alignItems: "center", flex: 1 }}>
                <Text style={{ color: k === "Fair" ? c.accentText : c.text, fontSize: k === "Fair" ? 20 : 15, ...font.bold }}>₹{INR.format(Number(v) || 0)}</Text>
                <Text style={{ color: c.textMuted, fontSize: 11.5, ...font.medium }}>{k}</Text>
              </View>
            ))}
          </View>
          {m.estimate.sampleSize ? <Text style={{ color: c.textFaint, fontSize: 11.5, marginTop: 8, textAlign: "center", ...font.regular }}>Based on {m.estimate.sampleSize} similar listings</Text> : null}
        </Panel>
      ) : null}
      {m.comparison?.product1 && m.comparison?.product2 ? (
        <Panel title="Side-by-side" icon="swap-vertical">
          {[m.comparison.product1, m.comparison.product2].map((p) => (
            <ProductRow key={p._id} p={p} />
          ))}
        </Panel>
      ) : null}
      {m.draft ? (
        <Panel title="Listing draft" icon="create-outline">
          {m.draft.title ? <Text style={{ color: c.text, fontSize: 15, ...font.bold }}>{m.draft.title}</Text> : null}
          {m.draft.categoryLabel ? <Text style={{ color: c.accentText, fontSize: 12, marginTop: 2, ...font.semibold }}>{m.draft.categoryLabel}</Text> : null}
          {m.draft.description ? <Text style={{ color: c.textMuted, fontSize: 13, lineHeight: 19, marginTop: 6, ...font.regular }}>{m.draft.description}</Text> : null}
          {m.draft.pricingAdvice ? <Text style={{ color: c.text, fontSize: 13, marginTop: 6, ...font.medium }}>Tip: {m.draft.pricingAdvice}</Text> : null}
          <Pressable onPress={() => router.push("/sell")} style={[styles.inlineCta, { backgroundColor: c.accent }]}>
            <Text style={{ color: "#fff", fontSize: 13, ...font.semibold }}>Start this listing</Text>
          </Pressable>
        </Panel>
      ) : null}
      {checklistItems.length ? (
        <Panel title="Inspection checklist" icon="list-checks">
          {checklistItems.map((t) => (
            <View key={t} style={{ flexDirection: "row", gap: 8, paddingVertical: 3 }}>
              <Icon name="checkmark-circle" size={15} color={c.success} />
              <Text style={{ flex: 1, color: c.text, fontSize: 13, ...font.regular }}>{t}</Text>
            </View>
          ))}
        </Panel>
      ) : null}
      {m.bundle?.products?.length ? (
        <Panel title={`Budget bundle${m.bundle.budgetUsedPercent != null ? ` · ${m.bundle.budgetUsedPercent}% used` : ""}`} icon="bag">
          {m.bundle.products.map((p) => (
            <ProductRow key={p._id} p={p} />
          ))}
          {m.bundle.totalCost != null ? (
            <Text style={{ color: c.text, fontSize: 13, marginTop: 6, ...font.semibold }}>
              Total ₹{INR.format(m.bundle.totalCost)}
              {m.bundle.remainingBudget != null ? <Text style={{ color: c.textMuted, ...font.regular }}>{`  ·  ₹${INR.format(m.bundle.remainingBudget)} left`}</Text> : null}
            </Text>
          ) : null}
        </Panel>
      ) : null}
      {m.safetyTips?.length ? (
        <Panel title="Stay safe" icon="shield-checkmark-outline">
          {m.safetyTips.map((t) => (
            <Text key={t} style={{ color: c.text, fontSize: 13, lineHeight: 19, paddingVertical: 2, ...font.regular }}>
              • {t}
            </Text>
          ))}
        </Panel>
      ) : null}
      {m.products?.length ? (
        <View style={{ gap: 6 }}>
          {m.products.slice(0, 4).map((p) => (
            <ProductRow key={p._id} p={p} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function TypingDots() {
  const { c } = useTheme();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const l = Animated.loop(Animated.timing(v, { toValue: 3, duration: 1100, useNativeDriver: true }));
    l.start();
    return () => l.stop();
  }, [v]);
  return (
    <View style={[styles.bubble, styles.left, { backgroundColor: c.card, borderColor: c.border, flexDirection: "row", gap: 5 }]}>
      {[0, 1, 2].map((i) => (
        <Animated.View key={i} style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: c.textFaint, opacity: v.interpolate({ inputRange: [i, i + 0.5, i + 1, 3], outputRange: [0.3, 1, 0.3, 0.3], extrapolate: "clamp" }) }} />
      ))}
    </View>
  );
}

export default function Assistant() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const list = useRef<FlatList<Msg>>(null);

  const send = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || typing) return;
    const history = messages.filter((m) => m.id !== "welcome").slice(-8).map((m) => ({ sender: m.sender, text: m.text }));
    setMessages((cur) => [...cur, { id: `u${Date.now()}`, sender: "user", text }]);
    setInput("");
    setTyping(true);
    try {
      const r = await assistantApi.ask(text, history);
      setMessages((cur) => [...cur, { id: `a${Date.now()}`, sender: "assistant", ...r, text: r.reply }]);
    } catch (err) {
      setMessages((cur) => [...cur, { id: `e${Date.now()}`, sender: "assistant", text: errorMessage(err, "I could not reach the assistant right now. Please try again."), isError: true }]);
    } finally {
      setTyping(false);
    }
  };

  useEffect(() => {
    setTimeout(() => list.current?.scrollToEnd({ animated: true }), 60);
  }, [messages.length, typing]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: c.barSolid }}>
      <TopBar
        title="Unideals Assistant"
        subtitle="Deals, prices & safety, instantly"
        right={
          messages.length > 1 ? (
            <Pressable onPress={() => setMessages([WELCOME])} hitSlop={8}>
              <Text style={{ color: c.accentText, fontSize: 13, ...font.semibold }}>Clear</Text>
            </Pressable>
          ) : undefined
        }
      />
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.bg }} behavior="padding">
        <FlatList
          ref={list}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 14, gap: 12 }}
          renderItem={({ item: m }) => {
            const mine = m.sender === "user";
            return (
              <View style={{ alignItems: mine ? "flex-end" : "flex-start" }}>
                <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-end", maxWidth: "92%" }}>
                  {!mine ? (
                    <View style={[styles.botAvatar, { backgroundColor: c.accentSoft }]}>
                      <LogoMark size={16} tint={c.girls ? c.accent : undefined} />
                    </View>
                  ) : null}
                  <View style={{ flexShrink: 1 }}>
                    <View
                      style={[
                        styles.bubble,
                        mine ? styles.right : styles.left,
                        mine ? { backgroundColor: c.accent, borderColor: c.accent } : { backgroundColor: m.isError ? c.dangerSoft : c.card, borderColor: m.isError ? "transparent" : c.border },
                      ]}
                    >
                      <Text selectable style={{ color: mine ? "#fff" : m.isError ? c.danger : c.text, fontSize: 14.5, lineHeight: 21, ...font.regular }}>
                        {m.text}
                      </Text>
                    </View>
                    {!mine ? <Cards m={m} /> : null}
                    {!mine && m.suggestions?.length ? (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingTop: 8 }}>
                        {m.suggestions.map((s) => (
                          <Pressable key={s} onPress={() => send(s)} style={({ pressed }) => [styles.sugg, { borderColor: c.accentSoftStrong, backgroundColor: pressed ? c.accentSoft : c.card }]}>
                            <Text style={{ color: c.accentText, fontSize: 12.5, ...font.semibold }}>{s}</Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    ) : null}
                  </View>
                </View>
              </View>
            );
          }}
          ListFooterComponent={typing ? <TypingDots /> : undefined}
        />
        <View style={[styles.composer, { borderColor: c.border, backgroundColor: c.barSolid, paddingBottom: Math.max(insets.bottom, 10) }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about deals, prices, safety…"
            placeholderTextColor={c.textFaint}
            multiline
            maxLength={800}
            style={[styles.input, { backgroundColor: c.surface, borderColor: c.border, color: c.text }]}
          />
          <Pressable onPress={() => send()} disabled={!input.trim() || typing} style={[styles.send, { backgroundColor: input.trim() && !typing ? c.accent : c.surfaceAlt }]} accessibilityLabel="Send">
            <Icon name="send" size={18} color={input.trim() && !typing ? "#fff" : c.textFaint} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bubble: { borderRadius: 18, paddingHorizontal: 13, paddingVertical: 9, borderWidth: 1 },
  left: { borderBottomLeftRadius: 6, alignSelf: "flex-start" },
  right: { borderBottomRightRadius: 6 },
  botAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  panel: { borderRadius: 14, borderWidth: 1, padding: 12 },
  pRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 8, borderRadius: 12, borderWidth: 1, marginTop: 4 },
  pImg: { width: 40, height: 40, borderRadius: 8, overflow: "hidden" },
  inlineCta: { alignSelf: "flex-start", marginTop: 10, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 8 },
  sugg: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  composer: { flexDirection: "row", alignItems: "flex-end", gap: 8, paddingHorizontal: 12, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth },
  input: { flex: 1, minHeight: 42, maxHeight: 120, borderRadius: 21, borderWidth: 1, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 10, fontSize: 15, fontFamily: "Figtree_400Regular" },
  send: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
});
