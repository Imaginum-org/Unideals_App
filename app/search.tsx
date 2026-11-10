import { Icon } from "@/components/ui/Icon";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { productApi } from "@/api/products";
import { FilterBar, type Filters } from "@/components/product/FilterBar";
import { productHref } from "@/components/product/ProductCard";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Chip, EmptyState, IconButton, Screen, T } from "@/components/ui";
import { useCampus } from "@/hooks/useCampus";
import { canSeeGirls, useAuthStore } from "@/store/auth";
import { usePrefsStore } from "@/store/prefs";
import { font, useTheme } from "@/theme";

const useDebounced = <T,>(value: T, ms = 250) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
};

export default function Search() {
  const { c, radius } = useTheme();
  const params = useLocalSearchParams<{ q?: string }>();
  const { campusSlug } = useCampus();
  const user = useAuthStore((s) => s.user);
  const girls = usePrefsStore((s) => s.girlsMode) && canSeeGirls(user);
  const recent = usePrefsStore((s) => s.recentSearches);
  const pushRecent = usePrefsStore((s) => s.pushRecentSearch);
  const clearRecent = usePrefsStore((s) => s.clearRecentSearches);

  const [text, setText] = useState(params.q || "");
  const [query, setQuery] = useState(params.q || "");
  const [filters, setFilters] = useState<Filters>({ sort: "recommended" });
  const debounced = useDebounced(text.trim());

  const suggestions = useQuery({
    queryKey: ["suggest", debounced, campusSlug],
    queryFn: () => productApi.suggestions(debounced, campusSlug),
    enabled: debounced.length >= 2 && debounced !== query,
    staleTime: 60_000,
  });
  const trending = useQuery({
    queryKey: ["trending", campusSlug],
    queryFn: () => productApi.trending({ campus_slug: campusSlug }),
    enabled: !query,
    staleTime: 2 * 60_000,
  });

  const submit = (q: string) => {
    const v = q.trim();
    if (!v) return;
    setText(v);
    setQuery(v);
    pushRecent(v);
  };

  const typing = text.trim() !== query;

  return (
    <Screen padded={false}>
      <View style={styles.bar}>
        <IconButton icon="chevron-back" onPress={() => router.back()} accessibilityLabel="Go back" />
        <View style={[styles.input, { backgroundColor: c.surface, borderColor: c.border, borderRadius: radius.md }]}>
          <Icon name="search" size={18} color={c.textMuted} />
          <TextInput
            autoFocus={!params.q}
            value={text}
            onChangeText={setText}
            onSubmitEditing={() => submit(text)}
            returnKeyType="search"
            placeholder="Search listings"
            placeholderTextColor={c.textFaint}
            style={{ flex: 1, color: c.text, fontSize: 15 }}
          />
          {text ? <IconButton icon="close-circle" size={18} color={c.textFaint} onPress={() => setText("")} /> : null}
        </View>
      </View>

      {query && !typing ? (
        <>
          <FilterBar value={filters} onChange={setFilters} girlsMode={girls} />
          <ProductGrid
            params={{ ...filters, q: query, campus_slug: campusSlug, audience: girls ? "girls_only" : undefined }}
            empty={<EmptyState icon="search-outline" title={`No results for “${query}”`} message="Try a shorter or different word." />}
          />
        </>
      ) : (
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, gap: 6 }}>
          {typing && debounced.length >= 2 ? (
            <>
              <Pressable onPress={() => submit(text)} style={styles.suggest}>
                <Icon name="search" size={16} color={c.accentText} />
                <Text style={{ color: c.accentText, fontSize: 15, ...font.semibold }}>Search “{text.trim()}”</Text>
              </Pressable>
              {(suggestions.data || []).map((s) => (
                <Pressable key={s._id} onPress={() => router.push(productHref(s))} style={styles.suggest}>
                  <Icon name="pricetag-outline" size={16} color={c.textMuted} />
                  <Text style={{ color: c.text, fontSize: 15, flex: 1 }} numberOfLines={1}>
                    {s.title}
                  </Text>
                  <Icon name="arrow-forward" size={16} color={c.textFaint} />
                </Pressable>
              ))}
            </>
          ) : (
            <>
              {recent.length ? (
                <>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <T variant="label">Recent searches</T>
                    <Pressable onPress={clearRecent} hitSlop={8}>
                      <Text style={{ color: c.accentText, fontSize: 13 }}>Clear</Text>
                    </Pressable>
                  </View>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6, marginBottom: 18 }}>
                    {recent.map((r) => (
                      <Chip key={r} icon="time-outline" label={r} onPress={() => submit(r)} />
                    ))}
                  </View>
                </>
              ) : null}
              {trending.data?.length ? (
                <>
                  <T variant="label" style={{ marginBottom: 4 }}>
                    Trending on campus
                  </T>
                  {trending.data.map((p) => (
                    <Pressable key={p._id} onPress={() => router.push(productHref(p))} style={styles.suggest}>
                      <Icon name="trending-up" size={16} color={c.accentText} />
                      <Text style={{ color: c.text, fontSize: 15, flex: 1 }} numberOfLines={1}>
                        {p.title}
                      </Text>
                    </Pressable>
                  ))}
                </>
              ) : null}
            </>
          )}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", paddingRight: 16, paddingLeft: 4, paddingVertical: 6, gap: 4 },
  input: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, height: 44, paddingLeft: 12, borderWidth: 1 },
  suggest: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
});
