import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View, type GestureResponderEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LogoMark } from "@/components/brand/Brand";
import { revealChange } from "@/components/theme/ThemeReveal";
import { IconButton, Pressy } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { categoriesFor } from "@/constants/product";
import { useCampus } from "@/hooks/useCampus";
import { useNotifications } from "@/hooks/useRealtime";
import { haptic } from "@/lib/haptics";
import { canSeeGirls, useAuthStore } from "@/store/auth";
import { usePrefsStore } from "@/store/prefs";
import { font, useTheme, type Colors } from "@/theme";

const PINK = "#DB2777";
const HINTS = ["textbooks", "cycles", "calculators", "hostel essentials", "headphones", "lab coats"];

/** Brand gradient used by the Home header and the spotlight below it (top → bottom). */
export const brandGradient = (c: Colors): [string, string, string] =>
  c.girls
    ? c.dark
      ? ["#831843", "#9D174D", "#BE185D"]
      : ["#BE185D", "#DB2777", "#EC4899"]
    : c.dark
      ? ["#1B1B7A", "#2323A6", "#2E2EC4"]
      : ["#2B2BDB", "#3838EC", "#5B5BF5"];

const origin = (e: GestureResponderEvent) => ({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY });

/** Theme switch with the circular reveal growing out of the tap point. */
export function ThemeButton({ color }: { color?: string }) {
  const { c } = useTheme();
  const setTheme = usePrefsStore((s) => s.setTheme);
  return (
    <IconButton
      icon={c.dark ? "sun" : "moon"}
      color={color}
      onPress={(e) => {
        haptic.tap();
        const next = c.dark ? "light" : "dark";
        revealChange(origin(e), () => setTheme(next));
      }}
      accessibilityLabel={c.dark ? "Switch to light theme" : "Switch to dark theme"}
    />
  );
}

/** Zomato "Veg mode"-style switch for Girl Mode (eligible users only). */
export function GirlModeToggle({ onBrand }: { onBrand?: boolean }) {
  const { c } = useTheme();
  const on = usePrefsStore((s) => s.girlsMode);
  const setGirlsMode = usePrefsStore((s) => s.setGirlsMode);
  const v = useRef(new Animated.Value(on ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(v, { toValue: on ? 1 : 0, useNativeDriver: true, speed: 18, bounciness: 8 }).start();
  }, [on, v]);
  const offTrack = onBrand ? "rgba(255,255,255,0.22)" : c.dark ? "rgba(236,72,153,0.16)" : "#FCE7F3";
  return (
    <Pressable
      onPress={(e) => {
        haptic.select();
        revealChange(origin(e), () => setGirlsMode(!on));
      }}
      hitSlop={8}
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      accessibilityLabel="Girl Mode"
      style={styles.girlWrap}
    >
      <Text style={[styles.girlLabel, { color: onBrand ? "#fff" : on ? PINK : c.dark ? "#F9A8D4" : "#BE185D" }]}>GIRL MODE</Text>
      <View style={[styles.track, { backgroundColor: on ? PINK : offTrack, borderColor: onBrand ? "rgba(255,255,255,0.85)" : on ? PINK : c.dark ? "rgba(236,72,153,0.4)" : "#F9A8D4" }]}>
        <Animated.View style={[styles.knob, { transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, 16] }) }] }]}>
          <Animated.View style={[styles.knobDot, { opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] }) }]} />
        </Animated.View>
      </View>
    </Pressable>
  );
}

/** Cycles "Search for “textbooks”" hints like a native marketplace search. */
function RotatingHint({ color }: { color: string }) {
  const [i, setI] = useState(0);
  const y = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const t = setInterval(() => {
      Animated.timing(y, { toValue: -1, duration: 220, useNativeDriver: true }).start(() => {
        setI((n) => (n + 1) % HINTS.length);
        y.setValue(1);
        Animated.timing(y, { toValue: 0, duration: 260, useNativeDriver: true }).start();
      });
    }, 2600);
    return () => clearInterval(t);
  }, [y]);
  return (
    <View style={{ flex: 1, flexDirection: "row", alignItems: "center", overflow: "hidden", height: 22 }}>
      <Text style={{ color, fontSize: 14.5, includeFontPadding: false, ...font.regular }}>Search for </Text>
      <Animated.Text
        numberOfLines={1}
        style={{
          flex: 1,
          color,
          fontSize: 14.5,
          includeFontPadding: false,
          ...font.semibold,
          opacity: y.interpolate({ inputRange: [-1, 0, 1], outputRange: [0, 1, 0] }),
          transform: [{ translateY: y.interpolate({ inputRange: [-1, 1], outputRange: [-12, 12] }) }],
        }}
      >
        “{HINTS[i]}”
      </Animated.Text>
    </View>
  );
}

/** "All · Electronics · Study Material …" tabs on the brand header (filters the Home feed). */
function CategoryTabs({ value, onChange }: { value?: string; onChange: (v?: string) => void }) {
  const user = useAuthStore((s) => s.user);
  const girls = usePrefsStore((s) => s.girlsMode) && canSeeGirls(user);
  const tabs = [{ value: undefined as string | undefined, label: "All", icon: "grid-outline" as const }, ...categoriesFor(girls).map((c) => ({ value: c.value as string | undefined, label: c.label, icon: c.icon || ("grid-outline" as const) }))];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10 }} style={styles.tabs}>
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <Pressable
            key={t.label}
            onPress={() => {
              haptic.select();
              onChange(t.value);
            }}
            style={styles.tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Icon name={t.icon} size={19} color="#fff" strokeWidth={active ? 2.3 : 1.8} />
            <Text numberOfLines={1} style={{ color: active ? "#fff" : "rgba(255,255,255,0.78)", fontSize: 11.5, marginTop: 4, ...(active ? font.bold : font.medium) }}>
              {t.label}
            </Text>
            <View style={[styles.tabBar, { backgroundColor: active ? "#fff" : "transparent" }]} />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/**
 * Home/Explore header: logo + campus · Girl Mode · theme · alerts, then
 * search. `brand` paints it in the brand gradient (behind the status bar)
 * and adds category tabs, Zepto-style.
 */
export function HomeHeader({
  searchPlaceholder,
  brand,
  category,
  onCategory,
}: {
  searchPlaceholder?: string;
  brand?: boolean;
  category?: string;
  onCategory?: (v?: string) => void;
}) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { label, campus } = useCampus();
  const user = useAuthStore((s) => s.user);
  const loggedIn = useAuthStore((s) => s.status === "authed");
  const isAdmin = user?.role === "admin";
  const { unreadCount } = useNotifications();
  const campusLocked = loggedIn && !isAdmin; // web: logged-in campus changes live in Settings
  const subline = campus?.name && campus.name !== label ? campus.name : campus?.city || "Tap to choose your campus";

  // White status-bar icons while this brand header is on screen.
  const [focused, setFocused] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );

  const fg = brand ? "#FFFFFF" : c.text;
  const sub = brand ? "rgba(255,255,255,0.8)" : c.textMuted;

  const body = (
    <>
      <View style={styles.row}>
        <Pressable onPress={() => router.navigate("/")} hitSlop={6} accessibilityLabel="Unideals home" style={brand ? styles.logoChip : null}>
          <LogoMark size={brand ? 22 : 26} />
        </Pressable>
        <Pressy
          onPress={() => router.push(campusLocked ? "/settings" : "/campus")}
          scaleTo={0.97}
          style={styles.campus}
          accessibilityLabel={campusLocked ? `Your campus: ${label}` : `Campus: ${label}. Change campus`}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Icon name="location-outline" size={15} color={brand ? "#fff" : c.accentText} strokeWidth={2.5} />
            <Text numberOfLines={1} style={{ color: fg, fontSize: 16, letterSpacing: -0.3, flexShrink: 1, ...font.bold }}>
              {label}
            </Text>
            <Icon name="chevron-down" size={15} color={fg} strokeWidth={2.5} />
          </View>
          <Text numberOfLines={1} style={{ color: sub, fontSize: 11.5, marginTop: 1, ...font.medium }}>
            {subline}
          </Text>
        </Pressy>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
          {canSeeGirls(user) ? <GirlModeToggle onBrand={brand} /> : null}
          <ThemeButton color={brand ? "#fff" : undefined} />
          {loggedIn ? (
            <IconButton icon="notifications-outline" color={brand ? "#fff" : undefined} badge={unreadCount} onPress={() => router.push("/notifications")} accessibilityLabel="Notifications" />
          ) : null}
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, paddingBottom: brand ? 4 : 12 }}>
        <Pressy
          onPress={() => router.push("/search")}
          scaleTo={0.985}
          style={[
            styles.search,
            {
              backgroundColor: c.dark ? "#1C1F23" : "#FFFFFF",
              borderColor: brand ? "transparent" : c.dark ? "#2A2D33" : "#E4E7EC",
              shadowColor: "#0F172A",
              shadowOpacity: c.dark ? 0 : brand ? 0.14 : 0.06,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 3 },
              elevation: c.dark ? 0 : 3,
            },
          ]}
          accessibilityRole="search"
          accessibilityLabel="Search listings"
        >
          <Icon name="search" size={19} color={c.accentText} strokeWidth={2.2} />
          {searchPlaceholder ? (
            <Text numberOfLines={1} style={{ flex: 1, color: c.textMuted, fontSize: 14.5, ...font.regular }}>
              {searchPlaceholder}
            </Text>
          ) : (
            <RotatingHint color={c.textMuted} />
          )}
          <View style={[styles.divider, { backgroundColor: c.border }]} />
          <Pressable onPress={() => router.push("/assistant")} hitSlop={8} accessibilityLabel="Ask the AI assistant" style={styles.ai}>
            <Icon name="sparkles" size={18} color={c.accentText} />
          </Pressable>
        </Pressy>
      </View>
      {brand && onCategory ? <CategoryTabs value={category} onChange={onCategory} /> : null}
    </>
  );

  if (brand) {
    const g = brandGradient(c);
    return (
      <LinearGradient colors={[g[0], g[1]]} style={{ paddingTop: insets.top }}>
        {focused ? <StatusBar style="light" /> : null}
        {body}
      </LinearGradient>
    );
  }
  return (
    <View style={{ backgroundColor: c.barSolid, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: c.dark ? "#262626" : "rgba(229,231,235,0.8)" }}>{body}</View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", height: 60, paddingLeft: 16, paddingRight: 8, gap: 10 },
  logoChip: { width: 36, height: 36, borderRadius: 11, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  campus: { flex: 1, minWidth: 0, justifyContent: "center" },
  search: { flexDirection: "row", alignItems: "center", gap: 10, height: 48, borderRadius: 14, borderWidth: 1, paddingLeft: 14, paddingRight: 6 },
  divider: { width: StyleSheet.hairlineWidth * 2, height: 22 },
  ai: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  girlWrap: { alignItems: "center", justifyContent: "center", paddingHorizontal: 6, gap: 3 },
  girlLabel: { fontSize: 8, letterSpacing: 0.6, fontFamily: "Figtree_800ExtraBold" },
  track: { width: 36, height: 20, borderRadius: 10, borderWidth: 1, padding: 2, justifyContent: "center" },
  knob: { width: 14, height: 14, borderRadius: 7, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  knobDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: PINK },
  tabs: { marginTop: 10, flexGrow: 0 },
  tab: { alignItems: "center", paddingHorizontal: 10, paddingTop: 2, minWidth: 64 },
  tabBar: { height: 3, borderTopLeftRadius: 3, borderTopRightRadius: 3, alignSelf: "stretch", marginTop: 8, marginHorizontal: 4 },
});
