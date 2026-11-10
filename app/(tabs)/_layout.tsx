import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs, type BottomTabBarProps } from "expo-router/js-tabs";
import { useEffect, useRef, useState } from "react";
import { Animated, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/components/ui";
import { Icon, type IconName } from "@/components/ui/Icon";
import { TAB_BAR_HEIGHT, useTabBarSpace } from "@/hooks/useLayout";
import { useChatUnread } from "@/hooks/useRealtime";
import { haptic } from "@/lib/haptics";
import { emitTabPress } from "@/lib/tabEvents";
import { useAuthStore } from "@/store/auth";
import { font, useTheme } from "@/theme";
import { avatarUrl } from "@/utils/format";

const TABS: Record<string, { label: string; icon: IconName }> = {
  index: { label: "Home", icon: "home-outline" },
  explore: { label: "Explore", icon: "compass-outline" },
  chats: { label: "Chats", icon: "chatbubbles-outline" },
  profile: { label: "Profile", icon: "person-outline" },
};
const PILL_W = 58;
const PILL_H = 32;

/**
 * Floating capsule tab bar: a Material-style pill slides (and stretches)
 * behind the active icon; Sell is the raised gradient button. Tapping Home
 * (from anywhere) scrolls the feed to the top and reloads it. Hidden on the
 * full-screen Sell flow.
 */
function TabBar({ state, navigateToTab }: BottomTabBarProps) {
  const { c } = useTheme();
  const { bottom } = useTabBarSpace();
  const unread = useChatUnread();
  const user = useAuthStore((s) => s.user);
  const loggedIn = useAuthStore((s) => s.status === "authed");
  const [rowW, setRowW] = useState(0);
  const slot = rowW / state.routes.length;
  const x = useRef(new Animated.Value(0)).current;
  const stretch = useRef(new Animated.Value(1)).current;
  const current = state.routes[state.index]?.name;
  const highlightIndex = current === "sell" ? -1 : state.index;

  useEffect(() => {
    if (!slot || highlightIndex < 0) return;
    Animated.spring(x, { toValue: highlightIndex * slot + (slot - PILL_W) / 2, useNativeDriver: true, speed: 14, bounciness: 6 }).start();
    Animated.sequence([
      Animated.timing(stretch, { toValue: 1.35, duration: 110, useNativeDriver: true }),
      Animated.spring(stretch, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 10 }),
    ]).start();
  }, [highlightIndex, slot, x, stretch]);

  if (current === "sell") return null;

  const go = (index: number) => {
    const name = state.routes[index].name;
    haptic.select();
    if (state.index !== index) navigateToTab(state.routes[index].key);
    if (name === "index") setTimeout(() => emitTabPress("index"), state.index === index ? 0 : 60);
  };

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom }]}>
      <View style={[styles.shadow, { shadowColor: c.dark ? "#000" : "#1E1B4B" }]}>
        <View style={[styles.capsule, { borderColor: c.dark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.9)" }]}>
          {Platform.OS === "ios" ? <BlurView intensity={40} tint={c.dark ? "systemChromeMaterialDark" : "systemChromeMaterialLight"} style={StyleSheet.absoluteFill} /> : null}
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: Platform.OS === "ios" ? (c.dark ? "rgba(24,26,30,0.55)" : "rgba(255,255,255,0.6)") : c.dark ? "rgba(26,29,32,0.97)" : "rgba(255,255,255,0.97)" },
            ]}
          />
          {/* Hairline sheen along the top edge — the only "glass" cue on Android. */}
          <LinearGradient colors={c.dark ? ["rgba(255,255,255,0.06)", "transparent"] : ["rgba(255,255,255,0.95)", "rgba(255,255,255,0)"]} style={styles.sheen} />

          <View style={styles.row} onLayout={(e) => setRowW(e.nativeEvent.layout.width)}>
            {slot && highlightIndex >= 0 ? (
              <Animated.View
                style={[
                  styles.highlight,
                  { backgroundColor: c.accentSoftStrong, transform: [{ translateX: x }, { scaleX: stretch }] },
                ]}
              />
            ) : null}
            {state.routes.map((route, index) => {
              const focused = state.index === index;
              if (route.name === "sell") {
                return (
                  <View key={route.key} style={[styles.slot, { justifyContent: "center", paddingTop: 0 }]}>
                    <Pressable onPress={() => go(index)} accessibilityRole="button" accessibilityLabel="Sell an item" style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.92 : 1 }] }]}>
                      <LinearGradient colors={[c.accent, c.girls ? "#F472B6" : "#5C6DFF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.sell, { shadowColor: c.accent }]}>
                        <Icon name="plus" size={24} color="#fff" strokeWidth={2.6} />
                      </LinearGradient>
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
              const label = isProfile && !loggedIn ? "Log in" : meta.label;
              return (
                <Pressable
                  key={route.key}
                  onPress={() => go(index)}
                  accessibilityRole="tab"
                  accessibilityLabel={badge ? `${label}, ${badge} unread` : label}
                  accessibilityState={{ selected: focused }}
                  style={styles.slot}
                >
                  <View style={styles.dot}>
                    {showAvatar ? (
                      <View style={{ padding: 1.5, borderRadius: 14, borderWidth: focused ? 1.5 : 0, borderColor: c.accent }}>
                        <Avatar avatar={user?.avatar} name={user?.name} size={24} />
                      </View>
                    ) : (
                      <Icon name={meta.icon} size={22} color={tint} strokeWidth={focused ? 2.3 : 1.9} />
                    )}
                    {badge > 0 ? (
                      <View style={[styles.badge, { borderColor: c.dark ? "#1A1D20" : "#fff" }]}>
                        <Text style={styles.badgeText}>{badge > 99 ? "99+" : badge}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text numberOfLines={1} style={[styles.label, { color: focused ? c.text : tint }, focused ? font.bold : font.medium]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
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
  wrap: { position: "absolute", left: 14, right: 14 },
  shadow: { borderRadius: 32, shadowOpacity: 0.16, shadowRadius: 22, shadowOffset: { width: 0, height: 10 }, elevation: 14, backgroundColor: "transparent" },
  capsule: { height: TAB_BAR_HEIGHT, borderRadius: 32, overflow: "hidden", borderWidth: StyleSheet.hairlineWidth * 2 },
  sheen: { position: "absolute", left: 0, right: 0, top: 0, height: 18 },
  row: { flex: 1, flexDirection: "row", alignItems: "center" },
  slot: { flex: 1, alignItems: "center", justifyContent: "flex-start", paddingTop: 8, height: TAB_BAR_HEIGHT },
  highlight: { position: "absolute", left: 0, top: 8, width: PILL_W, height: PILL_H, borderRadius: PILL_H / 2 },
  dot: { width: PILL_W, height: PILL_H, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 10.5, letterSpacing: 0.1, marginTop: 3 },
  sell: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center", shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
  badge: { position: "absolute", top: -4, right: 10, minWidth: 17, height: 17, borderRadius: 9, paddingHorizontal: 4, backgroundColor: "#FF3B30", alignItems: "center", justifyContent: "center", borderWidth: 2 },
  badgeText: { color: "#fff", fontSize: 9.5, fontFamily: "Figtree_700Bold" },
});
