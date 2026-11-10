import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AssistantFab } from "@/components/assistant/AssistantFab";
import { HomeHeader } from "@/components/home/HomeHeader";
import { FilterBar, type Filters } from "@/components/product/FilterBar";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useCampus } from "@/hooks/useCampus";
import { canSeeGirls, useAuthStore } from "@/store/auth";
import { usePrefsStore } from "@/store/prefs";
import { font, useTheme } from "@/theme";

export default function Explore() {
  const { c } = useTheme();
  const params = useLocalSearchParams<{ sort?: Filters["sort"]; category?: string }>();
  const { campusSlug, label } = useCampus();
  const user = useAuthStore((s) => s.user);
  const girls = usePrefsStore((s) => s.girlsMode) && canSeeGirls(user);
  const [filters, setFilters] = useState<Filters>({ sort: params.sort || "recommended", category: params.category });

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: c.barSolid }}>
      <HomeHeader searchPlaceholder={`Search ${label || "your campus"}…`} />
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 14 }}>
          <Text style={{ color: c.text, fontSize: 22, letterSpacing: -0.4, ...font.bold }}>{girls ? "Explore Girls Corner 🌸" : "Explore"}</Text>
          <Text style={{ color: c.textMuted, fontSize: 13, marginTop: 1, ...font.regular }}>Everything listed on {label || "your campus"}</Text>
        </View>
        <FilterBar value={filters} onChange={setFilters} girlsMode={girls} />
        <ProductGrid params={{ ...filters, campus_slug: campusSlug, audience: girls ? "girls_only" : undefined }} />
        <AssistantFab />
      </View>
    </SafeAreaView>
  );
}
