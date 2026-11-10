import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { FilterBar, type Filters } from "@/components/product/FilterBar";
import { ProductGrid } from "@/components/product/ProductGrid";
import { EmptyState, Screen, TopBar } from "@/components/ui";
import { categoryOf } from "@/constants/product";
import { useCampus } from "@/hooks/useCampus";
import { canSeeGirls, useAuthStore } from "@/store/auth";
import { usePrefsStore } from "@/store/prefs";

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const cat = categoryOf(slug);
  const { campusSlug } = useCampus();
  const user = useAuthStore((s) => s.user);
  const girls = usePrefsStore((s) => s.girlsMode) && canSeeGirls(user);
  const [filters, setFilters] = useState<Filters>({ sort: "recommended" });

  return (
    <Screen padded={false} header={<TopBar title={cat?.label || "Category"} subtitle={cat?.description} />}>
      {!cat ? (
        <EmptyState icon="help-circle-outline" title="Unknown category" />
      ) : (
        <>
          <FilterBar value={filters} onChange={setFilters} girlsMode={girls} hideCategory />
          <ProductGrid
            params={{ ...filters, category: cat.value, campus_slug: campusSlug, audience: girls ? "girls_only" : undefined }}
            empty={<EmptyState icon={cat.icon} title={`No ${cat.label.toLowerCase()} yet`} message="Be the first to list one on your campus." />}
          />
        </>
      )}
    </Screen>
  );
}
