import { useState } from "react";
import { ScrollView, View } from "react-native";
import type { FeedParams } from "@/api/products";
import { Button, Chip, Input, OptionSheet, Sheet, SwitchRow, T } from "@/components/ui";
import { CONDITIONS, SORT_OPTIONS, categoriesFor, labelOf } from "@/constants/product";

export type Filters = Pick<FeedParams, "category" | "condition" | "min_price" | "max_price" | "sort" | "posted_within" | "negotiable">;

const POSTED: { value: string; label: string }[] = [
  // Backend accepts "1" | "7" | "30" (days) — product.service applyFacetFilters.
  { value: "1", label: "Last 24 hours" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
];

/** Horizontal filter chips + sort/filter sheets (web FilterSidebar equivalent). */
export function FilterBar({
  value,
  onChange,
  girlsMode,
  hideCategory,
}: {
  value: Filters;
  onChange: (f: Filters) => void;
  girlsMode: boolean;
  hideCategory?: boolean;
}) {
  const [sheet, setSheet] = useState<null | "sort" | "category" | "filters">(null);
  const [draft, setDraft] = useState<Filters>(value);
  const activeCount = [value.condition, value.min_price, value.max_price, value.posted_within, value.negotiable].filter(Boolean).length;

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 10 }}>
        <Chip
          icon="options-outline"
          label={activeCount ? `Filters · ${activeCount}` : "Filters"}
          selected={activeCount > 0}
          onPress={() => {
            setDraft(value);
            setSheet("filters");
          }}
        />
        <Chip icon="swap-vertical" label={labelOf(SORT_OPTIONS, value.sort) || "Recommended"} onPress={() => setSheet("sort")} />
        {!hideCategory ? (
          <Chip
            icon="grid-outline"
            label={value.category ? labelOf(categoriesFor(girlsMode), value.category) : "All categories"}
            selected={Boolean(value.category)}
            onPress={() => setSheet("category")}
          />
        ) : null}
        {CONDITIONS.slice(0, 3).map((o) => (
          <Chip
            key={o.value}
            label={o.label}
            selected={value.condition === o.value}
            onPress={() => onChange({ ...value, condition: value.condition === o.value ? undefined : o.value })}
          />
        ))}
      </ScrollView>

      <OptionSheet
        visible={sheet === "sort"}
        title="Sort by"
        options={SORT_OPTIONS}
        value={value.sort || "recommended"}
        onClose={() => setSheet(null)}
        onSelect={(v) => {
          onChange({ ...value, sort: v as Filters["sort"] });
          setSheet(null);
        }}
      />
      <OptionSheet
        visible={sheet === "category"}
        title="Category"
        options={[{ value: "", label: "All categories" }, ...categoriesFor(girlsMode)]}
        value={value.category || ""}
        onClose={() => setSheet(null)}
        onSelect={(v) => {
          onChange({ ...value, category: v || undefined });
          setSheet(null);
        }}
      />

      <Sheet visible={sheet === "filters"} onClose={() => setSheet(null)} title="Filters">
        <ScrollView keyboardShouldPersistTaps="handled">
          <T variant="label" style={{ marginBottom: 8 }}>
            Condition
          </T>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {CONDITIONS.map((o) => (
              <Chip
                key={o.value}
                label={o.label}
                selected={draft.condition === o.value}
                onPress={() => setDraft({ ...draft, condition: draft.condition === o.value ? undefined : o.value })}
              />
            ))}
          </View>
          <T variant="label" style={{ marginBottom: 8 }}>
            Price (₹)
          </T>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Input
                placeholder="Min"
                keyboardType="number-pad"
                value={draft.min_price ? String(draft.min_price) : ""}
                onChangeText={(t) => setDraft({ ...draft, min_price: t ? Number(t.replace(/\D/g, "")) : undefined })}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                placeholder="Max"
                keyboardType="number-pad"
                value={draft.max_price ? String(draft.max_price) : ""}
                onChangeText={(t) => setDraft({ ...draft, max_price: t ? Number(t.replace(/\D/g, "")) : undefined })}
              />
            </View>
          </View>
          <T variant="label" style={{ marginBottom: 8 }}>
            Posted
          </T>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
            {POSTED.map((o) => (
              <Chip
                key={o.value}
                label={o.label}
                selected={draft.posted_within === o.value}
                onPress={() => setDraft({ ...draft, posted_within: draft.posted_within === o.value ? undefined : o.value })}
              />
            ))}
          </View>
          <SwitchRow
            label="Negotiable only"
            value={draft.negotiable === "true"}
            onChange={(v) => setDraft({ ...draft, negotiable: v ? "true" : undefined })}
          />
          <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
            <View style={{ flex: 1 }}>
              <Button
                kind="secondary"
                title="Reset"
                onPress={() => {
                  const cleared: Filters = { sort: value.sort, category: value.category };
                  onChange(cleared);
                  setSheet(null);
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                title="Apply"
                onPress={() => {
                  onChange({ ...value, ...draft });
                  setSheet(null);
                }}
              />
            </View>
          </View>
        </ScrollView>
      </Sheet>
    </View>
  );
}
