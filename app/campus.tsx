import { Icon } from "@/components/ui/Icon";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, TextInput, View } from "react-native";
import { errorMessage } from "@/api/client";
import { userApi } from "@/api/user";
import { ErrorState, Loader, Screen, T, TopBar } from "@/components/ui";
import { useCampus, useCampusDirectory } from "@/hooks/useCampus";
import { toast } from "@/lib/toast";
import { useAuthStore } from "@/store/auth";
import { usePrefsStore } from "@/store/prefs";
import { font, useTheme } from "@/theme";

/** Campus picker. `gate=1` = mandatory onboarding for logged-in users without a campus. */
export default function CampusPicker() {
  const { c, radius } = useTheme();
  const { gate } = useLocalSearchParams<{ gate?: string }>();
  const isGate = gate === "1";
  const qc = useQueryClient();
  const loggedIn = useAuthStore((s) => s.status === "authed");
  const updateUser = useAuthStore((s) => s.updateUser);
  const setGuestSlug = usePrefsStore((s) => s.setGuestCampusSlug);
  const { campus } = useCampus();
  const dir = useCampusDirectory();
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    return (dir.data || []).filter((x) => !n || `${x.name} ${x.short_name || ""} ${x.city || ""}`.toLowerCase().includes(n));
  }, [dir.data, q]);

  const pick = async (slug: string) => {
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

  return (
    <Screen padded={false}>
      {isGate ? (
        <View style={{ padding: 16, paddingBottom: 4 }}>
          <T variant="title">Pick your campus</T>
          <T variant="body" muted style={{ marginTop: 6 }}>
            Unideals is a marketplace per campus. You'll buy from and sell to students here.
          </T>
        </View>
      ) : (
        <TopBar title="Choose campus" subtitle={campus?.name ? `Current: ${campus.name}` : undefined} />
      )}
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, height: 46, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface, paddingHorizontal: 12 }}>
          <Icon name="search" size={17} color={c.textMuted} />
          <TextInput value={q} onChangeText={setQ} placeholder="Search colleges or cities" placeholderTextColor={c.textFaint} style={{ flex: 1, color: c.text, fontSize: 15 }} />
        </View>
      </View>
      {dir.isLoading ? (
        <Loader full={false} />
      ) : dir.isError ? (
        <ErrorState message={errorMessage(dir.error)} onRetry={() => dir.refetch()} />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(x) => x._id || x.slug}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, gap: 8 }}
          renderItem={({ item }) => {
            const sel = campus?.slug === item.slug;
            return (
              <Pressable
                onPress={() => pick(item.slug)}
                disabled={Boolean(saving)}
                style={({ pressed }) => [
                  { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: radius.md, borderWidth: 1 },
                  { borderColor: sel ? c.accent : c.border, backgroundColor: sel ? c.accentSoft : pressed ? c.surface : c.card },
                ]}
              >
                <Icon name="school-outline" size={22} color={sel ? c.accentText : c.textMuted} />
                <View style={{ flex: 1 }}>
                  <T variant="h3" style={{ fontSize: 15 }}>
                    {item.name}
                  </T>
                  {item.city ? (
                    <T variant="small" muted>
                      {item.city}
                    </T>
                  ) : null}
                </View>
                {saving === item.slug ? <T variant="caption">Saving…</T> : sel ? <Icon name="checkmark-circle" size={20} color={c.accent} /> : null}
              </Pressable>
            );
          }}
          ListEmptyComponent={<T muted center style={{ marginTop: 24, ...font.medium }}>No campuses match “{q}”.</T>}
        />
      )}
    </Screen>
  );
}
