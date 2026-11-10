import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { productApi } from "@/api/products";
import { FilterBar, type Filters } from "@/components/product/FilterBar";
import { CategoryIcon } from "@/components/product/CategoryIcon";
import { productHref } from "@/components/product/ProductCard";
import { ProductGrid } from "@/components/product/ProductGrid";
import { EmptyState, IconButton, Screen, Skeleton } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { categoriesFor } from "@/constants/product";
import { useCampus } from "@/hooks/useCampus";
import { canSeeGirls, useAuthStore } from "@/store/auth";
import { usePrefsStore } from "@/store/prefs";
import { font, useTheme } from "@/theme";
import { inr } from "@/utils/format";
import { firstImage, ikThumb } from "@/utils/image";

const useDebounced = <T,>(value: T, ms = 250) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
};

function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const { c } = useTheme();
  return (
    <View style={styles.sectionHead}>
      <Text style={{ flex: 1, color: c.text, fontSize: 15, letterSpacing: -0.2, ...font.bold }}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={{ color: c.accentText, fontSize: 13, ...font.semibold }}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function Search() {
  const { c } = useTheme();
  const params = useLocalSearchParams<{ q?: string }>();
  const { campusSlug, label } = useCampus();
  const user = useAuthStore((s) => s.user);
  const girls = usePrefsStore((s) => s.girlsMode) && canSeeGirls(user);
  const recent = usePrefsStore((s) => s.recentSearches).slice(0, 5);
  const pushRecent = usePrefsStore((s) => s.pushRecentSearch);
  const removeRecent = usePrefsStore((s) => s.removeRecentSearch);
  const clearRecent = usePrefsStore((s) => s.clearRecentSearches);

  const [text, setText] = useState(params.q || "");
  const [query, setQuery] = useState(params.q || "");
  const [focused, setFocused] = useState(false);
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
    Keyboard.dismiss();
    setText(v);
    setQuery(v);
    pushRecent(v);
  };

  const typing = text.trim() !== query;
  const categories = categoriesFor(girls).slice(0, 8);

  return (
    <Screen padded={false}>
      <View style={[styles.bar, { borderColor: c.border }]}>
        <IconButton icon="chevron-back" onPress={() => router.back()} accessibilityLabel="Go back" />
        <View style={[styles.input, { backgroundColor: c.dark ? "#1C1F23" : "#F4F5F8", borderColor: focused ? c.accent : "transparent" }]}>
          <Icon name="search" size={18} color={focused ? c.accentText : c.textMuted} strokeWidth={2.2} />
          <TextInput
            autoFocus={!params.q}
            value={text}
            onChangeText={setText}
            onSubmitEditing={() => submit(text)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            returnKeyType="search"
            placeholder={`Search ${label || "your campus"}`}
            placeholderTextColor={c.textFaint}
            style={[styles.textInput, { color: c.text }]}
          />
          {text ? (
            <Pressable onPress={() => setText("")} hitSlop={10} style={[styles.clear, { backgroundColor: c.dark ? "#3F3F46" : "#CBD5E1" }]} accessibilityLabel="Clear search">
              <Icon name="close" size={11} color={c.dark ? "#18181B" : "#fff"} strokeWidth={3} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {query && !typing ? (
        <>
          <FilterBar value={filters} onChange={setFilters} girlsMode={girls} />
          <ProductGrid
            params={{ ...filters, q: query, campus_slug: campusSlug, audience: girls ? "girls_only" : undefined }}
            empty={<EmptyState icon="search-outline" title={`No results for “${query}”`} message="Nothing here, no cap. Try a shorter or different word." />}
          />
        </>
      ) : (
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 40 }}>
          {typing && debounced.length >= 2 ? (
            <View style={{ paddingHorizontal: 8, paddingTop: 6 }}>
              <Pressable onPress={() => submit(text)} style={({ pressed }) => [styles.row, pressed && { backgroundColor: c.surface }]}>
                <View style={[styles.rowIcon, { backgroundColor: c.accentSoft }]}>
                  <Icon name="search" size={16} color={c.accentText} />
                </View>
                <Text style={{ flex: 1, color: c.text, fontSize: 15, ...font.medium }} numberOfLines={1}>
                  Search for <Text style={{ color: c.accentText, ...font.bold }}>“{text.trim()}”</Text>
                </Text>
              </Pressable>
              {(suggestions.data || []).map((s) => (
                <Pressable key={s._id} onPress={() => router.push(productHref(s))} style={({ pressed }) => [styles.row, pressed && { backgroundColor: c.surface }]}>
                  <View style={[styles.rowIcon, { backgroundColor: c.surface }]}>
                    <Icon name="pricetag-outline" size={15} color={c.textMuted} />
                  </View>
                  <Text style={{ color: c.text, fontSize: 15, flex: 1, ...font.regular }} numberOfLines={1}>
                    {s.title}
                  </Text>
                  <Icon name="arrow-up-right" size={16} color={c.textFaint} />
                </Pressable>
              ))}
            </View>
          ) : (
            <>
              {recent.length ? (
                <View style={{ marginTop: 8 }}>
                  <SectionTitle title="Recent searches" action="Clear all" onAction={clearRecent} />
                  <View style={{ paddingHorizontal: 8 }}>
                    {recent.map((r) => (
                      <Pressable key={r} onPress={() => submit(r)} style={({ pressed }) => [styles.row, pressed && { backgroundColor: c.surface }]}>
                        <View style={[styles.rowIcon, { backgroundColor: c.surface }]}>
                          <Icon name="history" size={16} color={c.textMuted} />
                        </View>
                        <Text style={{ flex: 1, color: c.text, fontSize: 15, ...font.medium }} numberOfLines={1}>
                          {r}
                        </Text>
                        <Pressable onPress={() => setText(r)} hitSlop={8} accessibilityLabel={`Edit search ${r}`} style={styles.rowBtn}>
                          <Icon name="arrow-up-right" size={17} color={c.textFaint} />
                        </Pressable>
                        <Pressable onPress={() => removeRecent(r)} hitSlop={8} accessibilityLabel={`Remove ${r} from recent searches`} style={styles.rowBtn}>
                          <Icon name="close" size={16} color={c.textFaint} />
                        </Pressable>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}

              <View style={{ marginTop: 14 }}>
                <SectionTitle title="Browse categories" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
                  {categories.map((cat) => (
                    <Pressable
                      key={cat.value}
                      onPress={() => router.push({ pathname: "/category/[slug]", params: { slug: cat.value } })}
                      style={({ pressed }) => [styles.catChip, { backgroundColor: pressed ? c.accentSoft : c.card, borderColor: c.border }]}
                    >
                      <CategoryIcon value={cat.value} size={20} />
                      <Text style={{ color: c.text, fontSize: 13, ...font.semibold }}>{cat.label}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              <View style={{ marginTop: 22 }}>
                <SectionTitle title={`Trending on ${label || "campus"}`} />
                <View style={[styles.trendCard, { backgroundColor: c.card, borderColor: c.border }]}>
                  {trending.isLoading
                    ? [0, 1, 2, 3].map((i) => (
                        <View key={i} style={styles.trendRow}>
                          <Skeleton width={48} height={48} radius={12} />
                          <View style={{ flex: 1, gap: 6 }}>
                            <Skeleton width="70%" height={13} />
                            <Skeleton width="30%" height={11} />
                          </View>
                        </View>
                      ))
                    : (trending.data || []).slice(0, 8).map((p, i, arr) => {
                        const img = firstImage(p.images);
                        return (
                          <Pressable
                            key={p._id}
                            onPress={() => router.push(productHref(p))}
                            style={({ pressed }) => [
                              styles.trendRow,
                              i < arr.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: c.border },
                              pressed && { backgroundColor: c.surface },
                            ]}
                          >
                            <Text style={[styles.rank, { color: i < 3 ? c.accentText : c.textFaint }]}>{i + 1}</Text>
                            <View style={[styles.thumb, { backgroundColor: c.surfaceAlt }]}>
                              {img ? <Image source={{ uri: ikThumb(img, 120) }} style={StyleSheet.absoluteFill} contentFit="cover" cachePolicy="memory-disk" /> : null}
                            </View>
                            <View style={{ flex: 1, gap: 2 }}>
                              <Text numberOfLines={1} style={{ color: c.text, fontSize: 14.5, ...font.semibold }}>
                                {p.title}
                              </Text>
                              <Text style={{ color: c.textMuted, fontSize: 13, ...font.medium }}>{inr(p.selling_price)}</Text>
                            </View>
                            {i < 3 ? (
                              <View style={[styles.hot, { backgroundColor: c.dark ? "rgba(245,158,11,0.14)" : "#FFF7ED" }]}>
                                <Icon name="flame" size={11} color="#F97316" />
                                <Text style={{ color: "#EA580C", fontSize: 11, ...font.bold }}>Hot</Text>
                              </View>
                            ) : (
                              <Icon name="chevron-forward" size={16} color={c.textFaint} />
                            )}
                          </Pressable>
                        );
                      })}
                  {!trending.isLoading && !trending.data?.length ? (
                    <Text style={{ color: c.textMuted, fontSize: 13.5, padding: 16, textAlign: "center", ...font.regular }}>Nothing trending yet. Check back soon.</Text>
                  ) : null}
                </View>
              </View>
            </>
          )}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", paddingRight: 16, paddingLeft: 4, paddingVertical: 8, gap: 4, borderBottomWidth: StyleSheet.hairlineWidth },
  input: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, height: 46, paddingLeft: 14, paddingRight: 12, borderRadius: 14, borderWidth: 1.5 },
  textInput: { flex: 1, height: 44, fontSize: 15.5, paddingVertical: 0, includeFontPadding: false, textAlignVertical: "center", fontFamily: "Figtree_400Regular" },
  clear: { width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  sectionHead: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 9, paddingHorizontal: 8, borderRadius: 12 },
  rowIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rowBtn: { width: 30, height: 30, alignItems: "center", justifyContent: "center" },
  catChip: { flexDirection: "row", alignItems: "center", gap: 8, height: 40, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1 },
  trendCard: { marginHorizontal: 16, borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  trendRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11, paddingHorizontal: 14 },
  rank: { width: 18, textAlign: "center", fontSize: 15, fontFamily: "Figtree_800ExtraBold" },
  thumb: { width: 48, height: 48, borderRadius: 12, overflow: "hidden" },
  hot: { flexDirection: "row", alignItems: "center", gap: 3, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
});
