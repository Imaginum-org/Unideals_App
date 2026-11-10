import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Wordmark } from "@/components/brand/Brand";
import { IconButton } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { useCampus } from "@/hooks/useCampus";
import { useNotifications } from "@/hooks/useRealtime";
import { useAuthStore } from "@/store/auth";
import { usePrefsStore } from "@/store/prefs";
import { font, useTheme } from "@/theme";

/** Website mobile header: wordmark + campus pill · theme · alerts, then the search field. */
export function HomeHeader({ searchPlaceholder = "Search textbooks, cycles, gadgets…" }: { searchPlaceholder?: string }) {
  const { c } = useTheme();
  const { label } = useCampus();
  const loggedIn = useAuthStore((s) => s.status === "authed");
  const isAdmin = useAuthStore((s) => s.user?.role === "admin");
  const setTheme = usePrefsStore((s) => s.setTheme);
  const { unreadCount } = useNotifications();
  const campusLocked = loggedIn && !isAdmin; // web: logged-in campus changes live in Settings

  return (
    <View style={{ backgroundColor: c.barSolid, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: c.dark ? "#262626" : "rgba(229,231,235,0.8)" }}>
      <View style={styles.row}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
          <Pressable onPress={() => router.replace("/")} hitSlop={6}>
            <Wordmark />
          </Pressable>
          <Pressable
            onPress={() => router.push(campusLocked ? "/settings" : "/campus")}
            style={({ pressed }) => [styles.pill, { backgroundColor: c.accentSoft, transform: [{ scale: pressed ? 0.95 : 1 }] }]}
            accessibilityLabel={campusLocked ? `Your campus: ${label}` : "Choose a campus to browse"}
          >
            <Icon name="location-outline" size={13} color={c.accentText} strokeWidth={2.2} />
            <Text numberOfLines={1} style={{ color: c.accentText, fontSize: 12, maxWidth: 130, ...font.semibold }}>
              {label}
            </Text>
            {!campusLocked ? <Icon name="chevron-down" size={12} color={c.accentText} strokeWidth={2.5} /> : null}
          </Pressable>
        </View>
        <IconButton icon={c.dark ? "sun" : "moon"} onPress={() => setTheme(c.dark ? "light" : "dark")} accessibilityLabel="Toggle theme" />
        {loggedIn ? <IconButton icon="notifications-outline" badge={unreadCount} onPress={() => router.push("/notifications")} accessibilityLabel="Notifications" /> : null}
      </View>
      <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
        <Pressable
          onPress={() => router.push("/search")}
          style={({ pressed }) => [
            styles.search,
            { backgroundColor: c.dark ? "#1F2226" : pressed ? "#EDEFF3" : "#F4F5F8", borderColor: c.dark ? "#262626" : "#E5E7EB" },
          ]}
        >
          <Icon name="search" size={18} color={c.dark ? "#A1A1AA" : "#64748B"} />
          <Text numberOfLines={1} style={{ color: c.dark ? "#71717A" : "#94A3B8", fontSize: 14, ...font.regular }}>
            {searchPlaceholder}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", height: 56, paddingLeft: 16, paddingRight: 8 },
  pill: { flexDirection: "row", alignItems: "center", gap: 4, height: 28, borderRadius: 999, paddingHorizontal: 10, flexShrink: 1 },
  search: { flexDirection: "row", alignItems: "center", gap: 10, height: 42, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14 },
});
