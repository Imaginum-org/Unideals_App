import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { api } from "@/api/client";
import { userApi } from "@/api/user";
import { Button, Card, Skeleton } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { useIsLoggedIn, useAuthStore } from "@/store/auth";
import { font, useTheme } from "@/theme";

// Unideals Labs (the "Early Feature Access" perk). The server decides
// access (backend config/labs.js); the app only mirrors it for UI.
type Lab = { key: string; name?: string; description?: string; minTier?: string; enabled: boolean };
const PLAN_LABEL: Record<string, string> = { pro: "Pro", pro_plus: "Pro Plus" };
const inr = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

export const useLabs = () => {
  const loggedIn = useIsLoggedIn();
  const plan = useAuthStore((s) => s.user?.subscription);
  const q = useQuery({ queryKey: ["labs", plan], queryFn: () => userApi.labs() as Promise<Lab[]>, enabled: loggedIn, staleTime: 5 * 60_000 });
  const labs = q.data || [];
  return { labs, loading: q.isLoading && loggedIn, has: (key: string) => labs.some((f) => f.key === key && f.enabled) };
};

type Insights = {
  enoughData?: boolean;
  scope?: "condition" | "category";
  price?: { suggested: number; low: number; high: number; samples: number };
  demand?: { level: "high" | "moderate" | "low"; activeListings: number; soldLast30: number; avgViews: number };
};
const LEVEL = {
  high: { label: "High demand", fg: "#047857", bg: "#ECFDF5", bars: 3 },
  moderate: { label: "Moderate demand", fg: "#B45309", bg: "#FFFBEB", bars: 2 },
  low: { label: "Low demand", fg: "#475569", bg: "#F1F5F9", bars: 1 },
};

function EarlyBadge() {
  const { c } = useTheme();
  return (
    <View style={[styles.badge, { backgroundColor: c.dark ? "rgba(255,255,255,0.1)" : "#fff", borderColor: c.accentSoftStrong }]}>
      <Icon name="sparkles" size={11} color={c.accentText} />
      <Text style={{ color: c.accentText, fontSize: 10, letterSpacing: 0.5, ...font.semibold }}>EARLY ACCESS</Text>
    </View>
  );
}

/** Website PriceInsights: suggested price + campus demand while listing. */
export function PriceInsights({ category, condition, onUsePrice }: { category?: string; condition?: string; onUsePrice: (n: number) => void }) {
  const { c } = useTheme();
  const { has, loading } = useLabs();
  const enabled = has("price_insights");
  const q = useQuery({
    queryKey: ["price-insights", category, condition],
    queryFn: () => api.get<{ data: Insights }>("/api/product/price-insights", { params: { category, ...(condition ? { condition } : {}) } }).then((r) => r.data.data),
    enabled: enabled && Boolean(category),
    staleTime: 5 * 60_000,
  });
  if (loading || !category) return null;

  if (!enabled) {
    return (
      <View style={[styles.shell, { borderStyle: "dashed", borderColor: c.borderStrong, backgroundColor: c.dark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.6)" }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Icon name="lock-closed-outline" size={15} color={c.textMuted} />
          <Text style={{ color: c.text, fontSize: 14, flex: 1, ...font.semibold }}>Smart price suggestion</Text>
          <EarlyBadge />
        </View>
        <Text style={{ color: c.textMuted, fontSize: 13, marginTop: 6, ...font.regular }}>See what similar items list and sell for on your campus. Early access for Pro and Pro Plus.</Text>
        <Pressable onPress={() => router.push("/subscription")} style={{ marginTop: 8 }}>
          <Text style={{ color: c.accentText, fontSize: 13, ...font.semibold }}>See plans →</Text>
        </Pressable>
      </View>
    );
  }

  const d = q.data;
  const level = d?.demand ? LEVEL[d.demand.level] : null;
  return (
    <View style={[styles.shell, { borderColor: c.accentSoftStrong, backgroundColor: c.accentSoft }]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Icon name="trending-up" size={15} color={c.accentText} />
        <Text style={{ color: c.text, fontSize: 14, flex: 1, ...font.semibold }}>Smart price suggestion</Text>
        <EarlyBadge />
      </View>
      {q.isLoading ? (
        <View style={{ gap: 8, marginTop: 10 }}>
          <Skeleton height={26} width="40%" />
          <Skeleton height={12} width="80%" />
        </View>
      ) : q.isError ? (
        <Text style={{ color: c.textMuted, fontSize: 13, marginTop: 8, ...font.regular }}>Couldn't load suggestions right now.</Text>
      ) : d?.enoughData && d.price ? (
        <View style={{ marginTop: 10 }}>
          <Text style={{ color: c.text, fontSize: 26, letterSpacing: -0.5, ...font.bold }}>{inr(d.price.suggested)}</Text>
          <Text style={{ color: c.textMuted, fontSize: 13, ...font.regular }}>
            Most list between <Text style={{ color: c.text, ...font.semibold }}>{inr(d.price.low)}</Text> and <Text style={{ color: c.text, ...font.semibold }}>{inr(d.price.high)}</Text>
          </Text>
          <Button size="sm" kind="secondary" full={false} title={`Use ${inr(d.price.suggested)}`} style={{ marginTop: 10 }} onPress={() => onUsePrice(d.price!.suggested)} />
          <Text style={{ color: c.textFaint, fontSize: 11.5, marginTop: 8, ...font.regular }}>
            Based on {d.price.samples} {d.scope === "condition" ? "same-condition" : "similar"} listings at your campus in the last 6 months.
          </Text>
        </View>
      ) : (
        <Text style={{ color: c.textMuted, fontSize: 13, marginTop: 8, ...font.regular }}>Not enough similar listings on your campus yet to suggest a price.</Text>
      )}
      {d?.demand && level ? (
        <View style={[styles.demand, { borderColor: c.accentSoftStrong }]}>
          <View style={[styles.level, { backgroundColor: c.dark ? "rgba(255,255,255,0.06)" : level.bg }]}>
            <View style={{ flexDirection: "row", gap: 2, alignItems: "flex-end" }}>
              {[1, 2, 3].map((n) => (
                <View key={n} style={{ width: 3, height: 4 + n * 3, borderRadius: 1, backgroundColor: n <= level.bars ? level.fg : c.borderStrong }} />
              ))}
            </View>
            <Text style={{ color: level.fg, fontSize: 12, ...font.semibold }}>{level.label}</Text>
          </View>
          <Text style={{ flex: 1, color: c.textMuted, fontSize: 11.5, ...font.regular }}>
            {d.demand.activeListings} live · {d.demand.soldLast30} sold in 30 days · ~{d.demand.avgViews} views per new listing
          </Text>
        </View>
      ) : null}
    </View>
  );
}

/** Website EarlyAccessCard (Subscription page). */
export function EarlyAccessCard() {
  const { c } = useTheme();
  const { labs, loading } = useLabs();
  if (loading || labs.length === 0) return null;
  const enabledCount = labs.filter((f) => f.enabled).length;
  return (
    <Card>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Icon name="sparkles" size={16} color={c.accentText} />
        <Text style={{ flex: 1, color: c.text, fontSize: 16, ...font.semibold }}>Early access</Text>
        <Text style={{ color: c.textMuted, fontSize: 12, ...font.semibold }}>{enabledCount === 0 ? "None on your plan" : enabledCount === labs.length ? "Full access" : "Limited access"}</Text>
      </View>
      {labs.map((f) => (
        <View key={f.key} style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
          <View style={[styles.tick, { backgroundColor: f.enabled ? "#4A3CFF" : c.dark ? "rgba(255,255,255,0.1)" : "#E9EBF1" }]}>
            <Icon name={f.enabled ? "checkmark" : "lock-closed-outline"} size={11} color={f.enabled ? "#fff" : "#9AA3B2"} strokeWidth={3} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.text, fontSize: 14, ...font.semibold }}>
              {f.name || f.key}
              {!f.enabled && f.minTier ? <Text style={{ color: c.textFaint, fontSize: 12 }}>{`  ${PLAN_LABEL[f.minTier] || "Paid"}`}</Text> : null}
            </Text>
            {f.description ? <Text style={{ color: c.textMuted, fontSize: 12.5, lineHeight: 18, ...font.regular }}>{f.description}</Text> : null}
          </View>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  shell: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 14 },
  badge: { flexDirection: "row", alignItems: "center", gap: 3, borderRadius: 999, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 2 },
  demand: { flexDirection: "row", alignItems: "center", gap: 10, borderTopWidth: 1, marginTop: 12, paddingTop: 10 },
  level: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  tick: { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", marginTop: 1 },
});
