import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Animated, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { errorMessage } from "@/api/client";
import { userApi } from "@/api/user";
import { CampusScene } from "@/components/campus/CampusScene";
import { ErrorState, Loader, Pressy, Screen, TopBar } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { useCampus, useCampusDirectory } from "@/hooks/useCampus";
import { haptic } from "@/lib/haptics";
import { toast } from "@/lib/toast";
import { useAuthStore } from "@/store/auth";
import { usePrefsStore } from "@/store/prefs";
import { font, useTheme } from "@/theme";
import type { Campus } from "@/types";

const initials = (x: Campus) =>
  (x.short_name && x.short_name.replace(/s/g, "").length <= 4 ? x.short_name.replace(/s/g, "").toUpperCase() : "") ||
  (x.short_name || x.name)
    .replace(/[^A-Za-z ]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase() || "U";

/** Three dots that breathe: "more campuses loading…" */
function Dots({ color }: { color: string }) {
  const v = useRef([0, 1, 2].map(() => new Animated.Value(0.3))).current;
  useEffect(() => {
    const a = Animated.loop(
      Animated.stagger(
        180,
        v.map((d) => Animated.sequence([Animated.timing(d, { toValue: 1, duration: 360, useNativeDriver: true }), Animated.timing(d, { toValue: 0.3, duration: 360, useNativeDriver: true })])),
      ),
    );
    a.start();
    return () => a.stop();
  }, [v]);
  return (
    <View style={{ flexDirection: "row", gap: 5 }}>
      {v.map((d, i) => (
        <Animated.View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color, opacity: d }} />
      ))}
    </View>
  );
}

/** Campus picker. `gate=1` = mandatory onboarding for logged-in users without a campus. */
export default function CampusPicker() {
  const { c } = useTheme();
  const { gate } = useLocalSearchParams<{ gate?: string }>();
  const isGate = gate === "1";
  const qc = useQueryClient();
  const loggedIn = useAuthStore((s) => s.status === "authed");
  const updateUser = useAuthStore((s) => s.updateUser);
  const setGuestSlug = usePrefsStore((s) => s.setGuestCampusSlug);
  const { campus } = useCampus();
  const dir = useCampusDirectory();
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    return (dir.data || []).filter((x) => !n || `${x.name} ${x.short_name || ""} ${x.city || ""}`.toLowerCase().includes(n));
  }, [dir.data, q]);

  const pick = async (slug: string) => {
    haptic.select();
    if (loggedIn) {
      setSaving(slug);
      try {
        const r = await userApi.updateProfile({ campus_slug: slug });
        if (r.user) updateUser(r.user);
        qc.invalidateQueries();
        toast.success(r.movedListings ? `Campus updated · ${r.movedListings} listings moved` : "Campus updated");
      } catch (err) {
        toast.error(errorMessage(err, "Could not set campus. Try again."));
        return;
      } finally {
        setSaving(null);
      }
    } else {
      setGuestSlug(slug);
      qc.invalidateQueries({ queryKey: ["feed"] });
    }
    if (isGate || !router.canGoBack()) router.replace("/");
    else router.back();
  };

  const header = (
    <View>
      <View style={[styles.hero, { backgroundColor: c.dark ? "#16181B" : "#EEF0FF" }]}>
        <CampusScene />
      </View>
      <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
        <Text style={[styles.title, { color: c.text }]}>{isGate ? "Where do you study?" : "Switch your campus"}</Text>
        <Text style={{ color: c.textMuted, fontSize: 14.5, lineHeight: 21, marginTop: 6, ...font.regular }}>
          Every campus is its own little marketplace. You buy from and sell to students right here, no long trips across the city.
        </Text>
      </View>
      <View style={[styles.search, { backgroundColor: c.dark ? "#1C1F23" : "#F4F5F8", borderColor: focused ? c.accent : "transparent" }]}>
        <Icon name="search" size={18} color={focused ? c.accentText : c.textMuted} strokeWidth={2.2} />
        <TextInput
          value={q}
          onChangeText={setQ}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search by college or city"
          placeholderTextColor={c.textFaint}
          returnKeyType="search"
          style={[styles.input, { color: c.text }]}
        />
      </View>
      <Text style={[styles.caps, { color: c.textMuted }]}>{q ? `${list.length} match${list.length === 1 ? "" : "es"}` : "Live on Unideals"}</Text>
    </View>
  );

  const footer = (
    <View style={[styles.soon, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={[styles.soonIcon, { backgroundColor: c.accentSoft }]}>
        <Icon name="rocket-outline" size={20} color={c.accentText} />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 }}>
        <Text style={{ color: c.text, fontSize: 16, ...font.bold }}>More campuses, very soon</Text>
        <Dots color={c.accent} />
      </View>
      <Text style={{ color: c.textMuted, fontSize: 13.5, lineHeight: 20, textAlign: "center", marginTop: 6, ...font.regular }}>
        We're rolling out college by college, like a fest that keeps getting bigger. Don't see yours yet? Tell us and we'll bump it up the list.
      </Text>
      <Pressy onPress={() => router.push("/contact")} scaleTo={0.97} style={[styles.soonBtn, { borderColor: c.accentSoftStrong }]}>
        <Text style={{ color: c.accentText, fontSize: 14, ...font.semibold }}>Request my campus</Text>
        <Icon name="arrow-forward" size={15} color={c.accentText} />
      </Pressy>
    </View>
  );

  return (
    <Screen padded={false} header={isGate ? undefined : <TopBar title="Choose campus" subtitle={campus?.name ? `Current: ${campus.name}` : undefined} />}>
      {dir.isError ? (
        <ErrorState message={errorMessage(dir.error)} onRetry={() => dir.refetch()} />
      ) : (
        <FlatList
          data={dir.isLoading ? [] : list}
          keyExtractor={(x) => x._id || x.slug}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={header}
          ListFooterComponent={dir.isLoading ? <Loader full={false} /> : footer}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => {
            const sel = campus?.slug === item.slug;
            return (
              <Pressable
                onPress={() => pick(item.slug)}
                disabled={Boolean(saving)}
                style={({ pressed }) => [
                  styles.row,
                  { borderColor: sel ? c.accent : c.border, backgroundColor: sel ? c.accentSoft : pressed ? c.surface : c.card },
                ]}
                accessibilityState={{ selected: sel }}
              >
                <View style={[styles.mono, { backgroundColor: sel ? c.accent : c.accentSoft }]}>
                  <Text style={{ color: sel ? "#fff" : c.accentText, fontSize: 14, letterSpacing: 0.4, ...font.black }}>{initials(item)}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text numberOfLines={1} style={{ color: c.text, fontSize: 15, ...font.semibold }}>
                    {item.name}
                  </Text>
                  {item.city ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 }}>
                      <Icon name="location-outline" size={12} color={c.textMuted} />
                      <Text style={{ color: c.textMuted, fontSize: 12.5, ...font.medium }}>{item.city}</Text>
                    </View>
                  ) : null}
                </View>
                {saving === item.slug ? (
                  <ActivityIndicator color={c.accent} />
                ) : sel ? (
                  <View style={[styles.current, { backgroundColor: c.accent }]}>
                    <Icon name="checkmark" size={12} color="#fff" strokeWidth={3} />
                    <Text style={{ color: "#fff", fontSize: 11.5, ...font.bold }}>Current</Text>
                  </View>
                ) : (
                  <Icon name="chevron-forward" size={18} color={c.textFaint} />
                )}
              </Pressable>
            );
          }}
          ListEmptyComponent={
            dir.isLoading ? undefined : (
              <Text style={{ color: c.textMuted, textAlign: "center", marginTop: 12, marginHorizontal: 20, fontSize: 14, ...font.medium }}>
                No campus matches “{q}” yet. It might be next on our list.
              </Text>
            )
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { paddingTop: 14, paddingBottom: 4, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: "hidden" },
  title: { fontSize: 26, letterSpacing: -0.6, fontFamily: "Figtree_700Bold" },
  search: { flexDirection: "row", alignItems: "center", gap: 10, height: 48, marginHorizontal: 16, marginTop: 18, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1.5 },
  input: { flex: 1, height: 46, fontSize: 15.5, paddingVertical: 0, includeFontPadding: false, textAlignVertical: "center", fontFamily: "Figtree_400Regular" },
  caps: { fontSize: 11.5, letterSpacing: 0.8, textTransform: "uppercase", marginHorizontal: 20, marginTop: 20, marginBottom: 10, fontFamily: "Figtree_700Bold" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, marginHorizontal: 16, marginBottom: 10, padding: 12, borderRadius: 16, borderWidth: 1 },
  mono: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  current: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4 },
  soon: { alignItems: "center", marginHorizontal: 16, marginTop: 14, padding: 20, borderRadius: 20, borderWidth: 1, borderStyle: "dashed" },
  soonIcon: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  soonBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 14, height: 40, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1.5 },
});
