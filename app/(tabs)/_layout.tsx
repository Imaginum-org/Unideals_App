import { BlurView } from "expo-blur";
import { Tabs, type BottomTabBarProps } from "expo-router/js-tabs";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/ui";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useChatUnread } from "@/hooks/useRealtime";
import { useAuthStore } from "@/store/auth";
import { font, useTheme } from "@/theme";
import { avatarUrl } from "@/utils/format";

// Website MobileTabBar: Home · Explore · [+] · Chats · Profile/Log in.
const TABS: Record<string, { label: string; icon: IconName }> = {
  index: { label: "Home", icon: "home" },
  explore: { label: "Explore", icon: "compass" },
  chats: { label: "Chats", icon: "chatbubbles" },
  profile: { label: "Profile", icon: "person-outline" },
};

function TabBar({ state, navigateToTab }: BottomTabBarProps) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const unread = useChatUnread();
  const user = useAuthStore((s) => s.user);
  const loggedIn = useAuthStore((s) => s.status === "authed");

  const go = (_name: string, index: number) => {
    if (state.index !== index) navigateToTab(state.routes[index].key);
  };

  return (
    <View style={[styles.wrap, { paddingBottom: insets.bottom, borderTopColor: c.dark ? "#262626" : "rgba(229,231,235,0.8)" }]}>
      {Platform.OS === "ios" ? <BlurView intensity={60} tint={c.dark ? "dark" : "light"} style={StyleSheet.absoluteFill} /> : null}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: Platform.OS === "ios" ? (c.dark ? "rgba(22,24,27,0.8)" : "rgba(255,255,255,0.8)") : c.barSolid }]} />
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          if (route.name === "sell") {
            return (
              <View key={route.key} style={styles.tab}>
                <Pressable
                  onPress={() => go(route.name, index)}
                  accessibilityRole="button"
                  accessibilityLabel="Sell an item"
                  style={({ pressed }) => [styles.sell, { backgroundColor: c.accent, shadowColor: c.accent, transform: [{ scale: pressed ? 0.95 : 1 }] }]}
                >
                  <Icon name="plus" size={24} color="#fff" strokeWidth={2.4} />
                </Pressable>
              </View>
            );
          }
          const meta = TABS[route.name];
          if (!meta) return null;
          const tint = focused ? c.accentText : c.dark ? "#A1A1AA" : "#64748B";
          const isProfile = route.name === "profile";
          const showAvatar = isProfile && loggedIn && avatarUrl(user?.avatar);
          const badge = route.name === "chats" ? unread : 0;
          return (
            <Pressable key={route.key} onPress={() => go(route.name, index)} accessibilityRole="tab" accessibilityState={{ selected: focused }} style={styles.tab}>
              <View style={[styles.pill, focused && { backgroundColor: c.accentSoft }]}>
                {showAvatar ? (
                  <Avatar avatar={user?.avatar} name={user?.name} size={23} />
                ) : (
                  <Icon name={meta.icon} size={21} color={tint} strokeWidth={focused ? 2.3 : 1.9} />
                )}
                {badge > 0 ? (
                  <View style={[styles.badge, { borderColor: c.barSolid }]}>
                    <Text style={styles.badgeText}>{badge > 99 ? "99+" : badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text numberOfLines={1} style={{ color: tint, fontSize: 10.5, letterSpacing: 0.1, ...font.medium }}>
                {isProfile && !loggedIn ? "Log in" : meta.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="sell" />
      <Tabs.Screen name="chats" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrap: { borderTopWidth: StyleSheet.hairlineWidth, overflow: "hidden" },
  row: { flexDirection: "row", height: 64, paddingHorizontal: 4 },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, paddingTop: 6 },
  pill: { width: 48, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  sell: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center", shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  badge: { position: "absolute", top: -2, right: 6, minWidth: 16, height: 16, borderRadius: 8, paddingHorizontal: 4, backgroundColor: "#FF3B30", alignItems: "center", justifyContent: "center", borderWidth: 2 },
  badgeText: { color: "#fff", fontSize: 9.5, fontFamily: "Figtree_700Bold" },
});
