import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { LayoutAnimation, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { errorMessage } from "@/api/client";
import { paymentApi } from "@/api/payments";
import { usePurchase } from "@/components/payments/usePurchase";
import { EarlyAccessCard } from "@/components/labs/Labs";
import { PlanCard } from "@/components/payments/PlanCard";
import { Badge, Button, Card, EmptyState, ErrorState, Skeleton, TopBar } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { toast } from "@/lib/toast";
import { useAuthStore } from "@/store/auth";
import { font, useTheme } from "@/theme";
import { shortDate } from "@/utils/format";
import { shareReceipt } from "@/utils/receipt";

// Same copy as frontend Subscription.jsx / PricingModel.jsx.
const PLANS = [
  { id: "free", tier: "base_user", name: "Free", tagline: "Everything you need to start selling.", highlights: ["10 active listings", "25 wishlist saves", "Standard search ranking", "Standard support"] },
  { id: "pro", tier: "pro", name: "Pro", badge: "Most popular", tagline: "For regular sellers who want more reach.", highlights: ["25 active listings", "100 wishlist saves", "2 boosts every month (3-day)", "Higher search ranking", "Priority chat & support"] },
  { id: "pro-plus", tier: "pro_plus", name: "Pro Plus", badge: "Best value", tagline: "No limits. Top of every list.", highlights: ["Unlimited listings", "Unlimited wishlist", "5 boosts every month (7-day)", "Highest search ranking", "Top chat & support priority"] },
];
const UNLOCKS: Record<string, { value: string; label: string }[]> = {
  pro: [
    { value: "25", label: "active listings" },
    { value: "2 / month", label: "free 3-day boosts" },
    { value: "Higher", label: "search ranking" },
    { value: "Priority", label: "chat & support" },
  ],
  pro_plus: [
    { value: "Unlimited", label: "listings & wishlist" },
    { value: "5 / month", label: "free 7-day boosts" },
    { value: "Highest", label: "search ranking" },
    { value: "Top", label: "chat & support priority" },
  ],
};
const COMPARE: { label: string; values: (string | false)[] }[] = [
  { label: "Active listings", values: ["10", "25", "Unlimited"] },
  { label: "Wishlist saves", values: ["25", "100", "Unlimited"] },
  { label: "Monthly boosts", values: [false, "2 × 3-day", "5 × 7-day"] },
  { label: "Search ranking", values: ["Standard", "Higher", "Highest"] },
  { label: "Chat priority", values: [false, "Higher", "Highest"] },
  { label: "Support", values: ["Standard", "Priority", "Highest priority"] },
  { label: "Early access features", values: [false, "Limited", "Full"] },
];
const FAQ = [
  ["Is this a subscription?", "No. You pay once through Razorpay. Nothing renews automatically."],
  ["Can I upgrade later?", "Yes, any time. Your listings, chats and badges stay exactly as they are."],
  ["What's a boost?", "A boost places your listing near the top of the feed for a few days. Paid plans include monthly boosts; anyone can buy one from ₹29."],
];
const RANK: Record<string, number> = { base_user: 0, pro: 1, pro_plus: 2 };
const NAME: Record<string, string> = { base_user: "Free", pro: "Pro", pro_plus: "Pro Plus" };
const FALLBACK: Record<string, number> = { pro: 99, pro_plus: 199 };
const inr = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function Subscription() {
  const { c } = useTheme();
  const user = useAuthStore((s) => s.user);
  const loggedIn = useAuthStore((s) => s.status === "authed");
  const billing = useQuery({ queryKey: ["billing"], queryFn: paymentApi.billing, enabled: loggedIn });
  const pricing = useQuery({ queryKey: ["pricing", loggedIn], queryFn: paymentApi.pricing });
  const { start, busy, checkout } = usePurchase();
  const [compareOpen, setCompareOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [downloading, setDownloading] = useState<string | null>(null);

  const b = billing.data;
  const current = b?.tier || user?.subscription || "base_user";
  const next = PLANS.find((p) => RANK[p.tier] === RANK[current] + 1) || null;
  const priceOf = (tier: string) => pricing.data?.plans?.[tier] || { amount: FALLBACK[tier] || 0, baseAmount: FALLBACK[tier] || 0 };
  const girlsOffer = pricing.data?.offer === "girls_founder";
  const renewal = b?.isLifetime ? "Lifetime" : b?.expiresAt ? shortDate(b.expiresAt) : "No expiry";
  const usage = b
    ? [
        { label: "Active listings", used: b.usage?.activeListings || 0, total: b.limits?.activeListings ?? null },
        { label: "Wishlist", used: b.usage?.wishlist || 0, total: b.limits?.wishlist ?? null },
        ...(b.usage?.boost
          ? [{ label: "Boosts this month", used: b.usage.boost.monthlyUsed || 0, total: b.usage.boost.monthlyRemaining == null ? null : (b.usage.boost.monthlyUsed || 0) + b.usage.boost.monthlyRemaining }]
          : []),
      ]
    : [];
  const pressure = usage.filter((u) => u.total && u.label !== "Boosts this month").sort((x, y) => y.used / (y.total || 1) - x.used / (x.total || 1))[0];
  const showPressure = pressure && pressure.total && pressure.used / pressure.total >= 0.7;

  const receipt = async (p: NonNullable<typeof b>["payments"] extends (infer P)[] | undefined ? P : never) => {
    setDownloading(p._id);
    try {
      await shareReceipt({ payment: p, customer: { name: user?.name, email: user?.email }, validity: p.plan === b?.tier ? renewal : "As per plan" });
    } catch {
      toast.error("Could not generate receipt");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: c.barSolid }}>
      <TopBar title="Subscription" subtitle="Plans & billing" />
      <ScrollView
        style={{ backgroundColor: c.bg }}
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 48 }}
        refreshControl={<RefreshControl refreshing={billing.isRefetching} onRefresh={() => { billing.refetch(); pricing.refetch(); }} tintColor={c.accent} />}
      >
        {loggedIn && billing.isLoading ? <Skeleton height={190} radius={16} /> : null}
        {loggedIn && billing.isError ? <ErrorState message={errorMessage(billing.error)} onRetry={() => billing.refetch()} /> : null}

        {b ? (
          <>
            <PlanCard
              tier={current}
              holder={user?.name}
              number={`•••• •••• •••• ${String(user?._id || "0000").slice(-4).toUpperCase()}`}
              validTill={renewal}
              since={shortDate(b.startedAt) || "—"}
              status={(b.status || "active") === "active" ? "Active" : String(b.status)}
            />
            <Card>
              <Text style={{ color: c.text, fontSize: 15, marginBottom: 12, ...font.semibold }}>Your usage</Text>
              <View style={{ gap: 12 }}>
                {usage.map((u) => (
                  <View key={u.label} style={{ gap: 6 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text style={{ color: c.text, fontSize: 13, ...font.medium }}>{u.label}</Text>
                      <Text style={{ color: c.textMuted, fontSize: 13, fontVariant: ["tabular-nums"], ...font.semibold }}>
                        {u.used} / {u.total == null ? "∞" : u.total}
                      </Text>
                    </View>
                    <View style={{ height: 6, borderRadius: 3, backgroundColor: c.surfaceAlt }}>
                      <View style={{ height: 6, borderRadius: 3, backgroundColor: c.accent, width: u.total ? `${Math.min(100, (u.used / Math.max(1, u.total)) * 100)}%` : "6%" }} />
                    </View>
                  </View>
                ))}
              </View>
            </Card>
          </>
        ) : null}

        {showPressure && next ? (
          <Card style={{ backgroundColor: c.warningSoft, borderColor: "transparent" }}>
            <Text style={{ color: c.warning, fontSize: 13.5, ...font.semibold }}>
              You've used {pressure.used} of {pressure.total} {pressure.label.toLowerCase()}. {next.name} gives you more room.
            </Text>
          </Card>
        ) : null}

        {next && UNLOCKS[next.tier] ? (
          <Card>
            <Text style={{ color: c.text, fontSize: 16, ...font.semibold }}>What {next.name} unlocks</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
              {UNLOCKS[next.tier].map((u) => (
                <View key={u.label} style={[styles.unlock, { backgroundColor: c.accentSoft }]}>
                  <Text style={{ color: c.accentText, fontSize: 16, ...font.bold }}>{u.value}</Text>
                  <Text style={{ color: c.textMuted, fontSize: 12, ...font.medium }}>{u.label}</Text>
                </View>
              ))}
            </View>
          </Card>
        ) : null}

        {girlsOffer ? (
          <Card style={{ backgroundColor: c.dark ? "rgba(236,72,153,0.12)" : "#FDF2F8", borderColor: c.dark ? "#831843" : "#FBCFE8" }}>
            <Text style={{ color: "#DB2777", fontSize: 14, ...font.semibold }}>Girls Founder offer unlocked: special prices applied below.</Text>
          </Card>
        ) : null}

        <Text style={{ color: c.text, fontSize: 20, letterSpacing: -0.4, marginTop: 6, ...font.bold }}>Sell smarter</Text>
        {PLANS.map((p) => {
          const isCurrent = current === p.tier;
          const lower = RANK[p.tier] < RANK[current];
          const price = priceOf(p.tier);
          const highlight = p.tier === "pro";
          return (
            <Card key={p.id} style={[{ gap: 10, padding: 18 }, highlight ? { borderColor: c.accent, borderWidth: 1.5 } : null, isCurrent ? { borderColor: c.success, borderWidth: 1.5 } : null]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={{ flex: 1, color: c.text, fontSize: 18, ...font.bold }}>{p.name}</Text>
                {p.badge ? <Badge label={p.badge} tone={p.tier === "pro_plus" ? "gold" : "accent"} /> : null}
                {isCurrent ? <Badge label="Current plan" tone="success" icon="checkmark" /> : null}
              </View>
              <Text style={{ color: c.textMuted, fontSize: 13.5, ...font.regular }}>{p.tagline}</Text>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
                <Text style={{ color: c.text, fontSize: 32, letterSpacing: -1, ...font.bold }}>{p.tier === "base_user" ? "₹0" : inr(price.amount)}</Text>
                {price.baseAmount > price.amount ? <Text style={{ color: c.textFaint, fontSize: 15, textDecorationLine: "line-through", ...font.medium }}>{inr(price.baseAmount)}</Text> : null}
                <Text style={{ color: c.textMuted, fontSize: 13, ...font.regular }}>{p.tier === "base_user" ? "forever" : "one-time"}</Text>
              </View>
              <View style={{ gap: 8 }}>
                {p.highlights.map((h) => (
                  <View key={h} style={{ flexDirection: "row", gap: 9, alignItems: "center" }}>
                    <View style={[styles.tick, { backgroundColor: c.successSoft }]}>
                      <Icon name="checkmark" size={11} color={c.success} strokeWidth={3} />
                    </View>
                    <Text style={{ color: c.text, fontSize: 13.5, ...font.regular }}>{h}</Text>
                  </View>
                ))}
              </View>
              {p.tier !== "base_user" && !isCurrent && !lower ? (
                <Button title={`Get ${p.name}`} kind={highlight ? "primary" : "dark"} size="lg" style={{ marginTop: 6 }} loading={busy === p.tier} disabled={Boolean(busy)} onPress={() => start(p.tier, `${p.name} Plan`)} />
              ) : null}
            </Card>
          );
        })}

        {loggedIn ? <EarlyAccessCard /> : null}

        <Pressable
          onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setCompareOpen((v) => !v);
          }}
          style={[styles.compareBtn, { borderColor: c.border, backgroundColor: c.card }]}
        >
          <Text style={{ color: c.text, fontSize: 14, ...font.semibold }}>{compareOpen ? "Hide" : "Compare all"} features</Text>
          <Icon name={compareOpen ? "chevron-up" : "chevron-down"} size={17} color={c.text} />
        </Pressable>
        {compareOpen ? (
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <View style={[styles.cRow, { backgroundColor: c.surface }]}>
              <Text style={[styles.cLabel, { color: c.textMuted }]}> </Text>
              {["Free", "Pro", "Pro+"].map((h) => (
                <Text key={h} style={[styles.cCell, { color: c.text, ...font.bold }]}>
                  {h}
                </Text>
              ))}
            </View>
            {COMPARE.map((row) => (
              <View key={row.label} style={[styles.cRow, { borderTopWidth: StyleSheet.hairlineWidth, borderColor: c.border }]}>
                <Text style={[styles.cLabel, { color: c.text }]}>{row.label}</Text>
                {row.values.map((v, i) => (
                  <View key={i} style={styles.cCellWrap}>
                    {v === false ? <Icon name="minus" size={14} color={c.textFaint} /> : <Text style={[styles.cCell, { color: c.textMuted }]}>{v}</Text>}
                  </View>
                ))}
              </View>
            ))}
          </Card>
        ) : null}

        {b?.payments?.length ? (
          <Card>
            <Text style={{ color: c.text, fontSize: 16, marginBottom: 6, ...font.semibold }}>Payment history</Text>
            {b.payments.map((pay, i) => (
              <View key={pay._id} style={[styles.payRow, i ? { borderTopWidth: StyleSheet.hairlineWidth, borderColor: c.border } : null]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontSize: 14, ...font.semibold }}>{NAME[pay.plan || ""] ? `${NAME[pay.plan || ""]} plan` : pay.plan === "boost_3day" ? "3-day boost" : pay.plan === "boost_7day" ? "7-day boost" : pay.plan}</Text>
                  <Text style={{ color: c.textMuted, fontSize: 12, ...font.regular }}>
                    {shortDate(pay.createdAt)} · {pay.status}
                  </Text>
                </View>
                <Text style={{ color: c.text, fontSize: 14, ...font.bold }}>{inr((pay.amount || 0) / 100)}</Text>
                <Pressable onPress={() => receipt(pay)} hitSlop={8} style={[styles.dl, { borderColor: c.border }]} accessibilityLabel="Download receipt">
                  <Icon name={downloading === pay._id ? "time-outline" : "download"} size={15} color={c.text} />
                </Pressable>
              </View>
            ))}
          </Card>
        ) : null}

        <Card style={{ padding: 0, overflow: "hidden" }}>
          {FAQ.map(([q, a], i) => (
            <View key={q} style={i ? { borderTopWidth: StyleSheet.hairlineWidth, borderColor: c.border } : null}>
              <Pressable
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setOpenFaq((o) => (o === i ? -1 : i));
                }}
                style={styles.faqQ}
              >
                <Text style={{ flex: 1, color: c.text, fontSize: 14.5, ...font.semibold }}>{q}</Text>
                <Icon name={openFaq === i ? "minus" : "plus"} size={16} color={c.textMuted} />
              </Pressable>
              {openFaq === i ? <Text style={{ color: c.textMuted, fontSize: 13.5, lineHeight: 20, paddingHorizontal: 16, paddingBottom: 14, ...font.regular }}>{a}</Text> : null}
            </View>
          ))}
        </Card>

        {!loggedIn ? <EmptyState icon="crown" title="Log in to upgrade" action="Log in" onAction={() => router.push("/login")} compact /> : null}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Icon name="lock-closed-outline" size={13} color={c.textFaint} />
          <Text style={{ color: c.textFaint, fontSize: 12, ...font.medium }}>Payments secured by Razorpay, in INR</Text>
        </View>
      </ScrollView>
      {checkout}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  unlock: { width: "47.8%", borderRadius: 12, padding: 12, gap: 2 },
  tick: { width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  compareBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, height: 46, borderRadius: 12, borderWidth: 1 },
  cRow: { flexDirection: "row", alignItems: "center", paddingVertical: 11, paddingHorizontal: 12 },
  cLabel: { flex: 1.4, fontSize: 12.5, fontFamily: "Figtree_500Medium" },
  cCellWrap: { flex: 1, alignItems: "center" },
  cCell: { flex: 1, textAlign: "center", fontSize: 12, fontFamily: "Figtree_500Medium" },
  payRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
  dl: { width: 32, height: 32, borderRadius: 8, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  faqQ: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 14 },
});
