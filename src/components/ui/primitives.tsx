import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useRef, type ReactNode } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type ScrollViewProps,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets, type Edge } from "react-native-safe-area-context";
import { font, shadow, useTheme } from "@/theme";
import { avatarUrl, initials } from "@/utils/format";
import { ikThumb } from "@/utils/image";
import type { Avatar as AvatarT } from "@/types";
import { haptic } from "@/lib/haptics";
import { Icon, type IconName } from "./Icon";

export type { IconName } from "./Icon";

// ── Text (Figtree, website type scale) ──────────────────────────────────
type Variant = "display" | "title" | "h1" | "h2" | "h3" | "body" | "small" | "caption" | "label" | "eyebrow";
const sizes: Record<Variant, TextStyle> = {
  display: { fontSize: 32, lineHeight: 34, letterSpacing: -1.1, ...font.bold },
  title: { fontSize: 26, lineHeight: 31, letterSpacing: -0.6, ...font.bold },
  h1: { fontSize: 22, lineHeight: 28, letterSpacing: -0.4, ...font.bold },
  h2: { fontSize: 18, lineHeight: 24, letterSpacing: -0.3, ...font.semibold },
  h3: { fontSize: 15.5, lineHeight: 21, ...font.semibold },
  body: { fontSize: 15, lineHeight: 22, ...font.regular },
  small: { fontSize: 13, lineHeight: 18, ...font.regular },
  caption: { fontSize: 11.5, lineHeight: 15, ...font.medium },
  label: { fontSize: 13, lineHeight: 18, ...font.semibold },
  eyebrow: { fontSize: 11.5, lineHeight: 15, letterSpacing: 0.2, ...font.semibold },
};

export function T({
  variant = "body",
  color,
  muted,
  faint,
  center,
  style,
  ...rest
}: TextProps & { variant?: Variant; color?: string; muted?: boolean; faint?: boolean; center?: boolean }) {
  const { c } = useTheme();
  return (
    <Text
      {...rest}
      style={[sizes[variant], { color: color || (faint ? c.textFaint : muted ? c.textMuted : c.text) }, center && { textAlign: "center" }, style]}
    />
  );
}

// ── Screen ──────────────────────────────────────────────────────────────
export function Screen({
  children,
  scroll,
  edges = ["top"],
  padded = true,
  style,
  contentStyle,
  scrollProps,
  bg,
  header,
}: {
  header?: ReactNode;
  children: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  scrollProps?: ScrollViewProps;
  bg?: string;
}) {
  const { c } = useTheme();
  const pad = padded ? { paddingHorizontal: 16 } : null;
  return (
    <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor: header ? c.barSolid : bg || c.bg }, style]}>
      {header}
      {scroll ? (
        <ScrollView style={{ backgroundColor: bg || c.bg }} keyboardShouldPersistTaps="handled" contentContainerStyle={[pad, { paddingBottom: 40 }, contentStyle]} {...scrollProps}>
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1, backgroundColor: bg || c.bg }, pad, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

/**
 * Pushed-screen app bar (website MobileAppBar): back button, centered
 * title + subtitle, optional action, white bar with hairline border.
 */
export function TopBar({
  title,
  subtitle,
  right,
  onBack,
  close,
  border = true,
}: {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  onBack?: () => void;
  close?: boolean;
  border?: boolean;
}) {
  const { c } = useTheme();
  return (
    <View style={[styles.topBar, { backgroundColor: c.barSolid }, border && { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: c.border }]}>
      <View style={{ width: 52, alignItems: "flex-start" }}>
        <IconButton
          icon={close ? "close" : "chevron-back"}
          size={23}
          onPress={onBack || (() => (router.canGoBack() ? router.back() : router.replace("/")))}
          accessibilityLabel={close ? "Close" : "Go back"}
        />
      </View>
      <View style={{ flex: 1, alignItems: "center" }}>
        {title ? (
          <Text numberOfLines={1} style={{ color: c.text, fontSize: 16, ...font.semibold }}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text numberOfLines={1} style={{ color: c.textMuted, fontSize: 11.5, ...font.medium }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={{ minWidth: 52, alignItems: "flex-end", paddingRight: 6 }}>{right}</View>
    </View>
  );
}

// ── Pressy: spring press + optional haptic (used by every tappable) ───────
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
export function Pressy({
  children,
  style,
  scaleTo = 0.97,
  haptics,
  onPress,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}: Omit<PressableProps, "style" | "children"> & { children?: ReactNode; style?: StyleProp<ViewStyle>; scaleTo?: number; haptics?: boolean }) {
  const v = useRef(new Animated.Value(1)).current;
  const to = (x: number) => Animated.spring(v, { toValue: x, useNativeDriver: true, speed: 50, bounciness: x === 1 ? 7 : 0 }).start();
  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={(e) => {
        if (!disabled) to(scaleTo);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        to(1);
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptics) haptic.tap();
        onPress?.(e);
      }}
      style={[style, { transform: [{ scale: v }] }]}
    >
      {children}
    </AnimatedPressable>
  );
}

// ── Buttons ─────────────────────────────────────────────────────────────
type BtnKind = "primary" | "secondary" | "ghost" | "danger" | "soft" | "dark" | "white";
export function Button({
  title,
  onPress,
  kind = "primary",
  loading,
  disabled,
  icon,
  iconRight,
  size = "md",
  style,
  full = true,
}: {
  title: string;
  onPress?: () => void;
  kind?: BtnKind;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  iconRight?: IconName;
  size?: "sm" | "md" | "lg";
  style?: StyleProp<ViewStyle>;
  full?: boolean;
}) {
  const { c } = useTheme();
  const palette: Record<BtnKind, { bg: string; fg: string; border?: string }> = {
    primary: { bg: c.accent, fg: c.onAccent },
    secondary: { bg: c.card, fg: c.dark ? "#E4E4E7" : "#334155", border: c.border },
    ghost: { bg: "transparent", fg: c.accentText },
    danger: { bg: c.dark ? "rgba(239,68,68,0.15)" : "#FEF2F2", fg: c.danger, border: c.dark ? "rgba(239,68,68,0.3)" : "#FECACA" },
    soft: { bg: c.accentSoft, fg: c.accentText },
    dark: { bg: "#0F172A", fg: "#FFFFFF" },
    white: { bg: "#FFFFFF", fg: "#0F172A" },
  };
  const p = palette[kind];
  const h = size === "sm" ? 36 : size === "lg" ? 50 : 44;
  const off = disabled || loading;
  return (
    <Pressy
      accessibilityRole="button"
      accessibilityState={{ disabled: off, busy: loading }}
      disabled={off}
      onPress={onPress}
      haptics
      style={[
        {
          height: h,
          borderRadius: size === "lg" ? 12 : 10,
          backgroundColor: p.bg,
          borderWidth: p.border ? 1 : 0,
          borderColor: p.border,
          paddingHorizontal: size === "sm" ? 12 : 16,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 7,
          alignSelf: full ? "stretch" : "flex-start",
          opacity: off ? 0.55 : 1,
        },
        kind === "primary" && !off ? { shadowColor: c.accent, shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 } : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={size === "sm" ? 15 : 17} color={p.fg} /> : null}
          <Text style={{ color: p.fg, fontSize: size === "sm" ? 13.5 : size === "lg" ? 15.5 : 14.5, ...font.semibold }}>{title}</Text>
          {iconRight ? <Icon name={iconRight} size={size === "sm" ? 15 : 17} color={p.fg} /> : null}
        </>
      )}
    </Pressy>
  );
}

export function IconButton({
  icon,
  onPress,
  size = 22,
  color,
  badge,
  style,
  filled,
  ...rest
}: Omit<PressableProps, "style"> & { icon: IconName; size?: number; color?: string; badge?: number; filled?: boolean; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  return (
    <Pressy hitSlop={6} onPress={onPress} scaleTo={0.88} style={[styles.iconBtn, style]} {...rest}>
      <Icon name={icon} size={size} color={color || (c.dark ? "#D4D4D8" : "#090A0B")} filled={filled} strokeWidth={1.8} />
      {badge ? (
        <View style={[styles.badgeDot, { backgroundColor: c.badgeRed, borderColor: c.barSolid }]}>
          <Text style={styles.badgeText}>{badge > 99 ? "99+" : badge}</Text>
        </View>
      ) : null}
    </Pressy>
  );
}

// ── Surfaces ────────────────────────────────────────────────────────────
export function Card({ children, style, onPress, flat }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; flat?: boolean }) {
  const { c } = useTheme();
  const base: ViewStyle = { backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.border, padding: 16, ...(flat ? {} : shadow(c.dark, "sm")) };
  if (!onPress) return <View style={[base, style]}>{children}</View>;
  return (
    <Pressy onPress={onPress} scaleTo={0.985} style={[base, style]}>
      {children}
    </Pressy>
  );
}

export function Row({
  icon,
  title,
  subtitle,
  right,
  onPress,
  danger,
  chevron = true,
  badge,
}: {
  icon?: IconName;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onPress?: () => void;
  danger?: boolean;
  chevron?: boolean;
  badge?: number;
}) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [styles.row, { backgroundColor: pressed ? (c.dark ? "rgba(255,255,255,0.04)" : "#F8FAFC") : "transparent" }]}>
      {icon ? (
        <View style={[styles.rowIcon, { backgroundColor: danger ? c.dangerSoft : c.dark ? "rgba(255,255,255,0.06)" : "#F1F5F9" }]}>
          <Icon name={icon} size={18} color={danger ? c.danger : c.dark ? "#D4D4D8" : "#334155"} strokeWidth={1.9} />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={{ color: danger ? c.danger : c.text, fontSize: 14.5, ...font.semibold }}>{title}</Text>
        {subtitle ? (
          <Text numberOfLines={2} style={{ color: c.textMuted, fontSize: 12.5, marginTop: 1, ...font.regular }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {badge ? (
        <View style={[styles.pillBadge, { backgroundColor: c.badgeRed }]}>
          <Text style={styles.badgeText}>{badge > 99 ? "99+" : badge}</Text>
        </View>
      ) : null}
      {right}
      {onPress && chevron ? <Icon name="chevron-forward" size={18} color={c.textFaint} /> : null}
    </Pressable>
  );
}

export function Divider({ style, inset }: { style?: StyleProp<ViewStyle>; inset?: number }) {
  const { c } = useTheme();
  return <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: c.border, marginLeft: inset }, style]} />;
}

export function Chip({ label, selected, onPress, icon, count }: { label: string; selected?: boolean; onPress?: () => void; icon?: IconName; count?: number }) {
  const { c } = useTheme();
  const fgSel = c.dark ? "#0F172A" : "#FFFFFF";
  return (
    <Pressy
      onPress={() => {
        haptic.select();
        onPress?.();
      }}
      scaleTo={0.94}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? (c.dark ? "#FFFFFF" : "#0F172A") : c.card,
          borderColor: selected ? (c.dark ? "#FFFFFF" : "#0F172A") : c.border,
        },
      ]}
    >
      {icon ? <Icon name={icon} size={14} color={selected ? fgSel : c.textMuted} /> : null}
      <Text style={{ fontSize: 13, ...font.semibold, color: selected ? fgSel : c.dark ? "#E4E4E7" : "#334155" }}>{label}</Text>
      {count !== undefined ? <Text style={{ fontSize: 12, ...font.semibold, color: selected ? (c.dark ? "#475569" : "rgba(255,255,255,0.7)") : c.textFaint }}>{count}</Text> : null}
    </Pressy>
  );
}

/** Segmented control (website tab pills). */
export function Segmented<V extends string>({ value, options, onChange }: { value: V; options: { value: V; label: string; count?: number }[]; onChange: (v: V) => void }) {
  const { c } = useTheme();
  return (
    <View style={[styles.segment, { backgroundColor: c.dark ? "#1F2226" : "#EEF0F4" }]}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable key={o.value} onPress={() => { if (o.value !== value) haptic.select(); onChange(o.value); }} style={[styles.segmentBtn, active && { backgroundColor: c.card, ...shadow(c.dark, "sm") }]}>
            <Text numberOfLines={1} style={{ color: active ? c.text : c.textMuted, fontSize: 13, ...font.semibold }}>
              {o.label}
              {o.count !== undefined ? <Text style={{ color: c.textFaint }}>{`  ${o.count}`}</Text> : null}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

type Tone = "neutral" | "accent" | "warning" | "info" | "success" | "danger" | "gold" | "pink" | "dark";
export function Badge({ label, tone = "neutral", icon }: { label: string; tone?: Tone; icon?: IconName }) {
  const { c } = useTheme();
  const map: Record<Tone, [string, string]> = {
    neutral: [c.dark ? "rgba(255,255,255,0.08)" : "#F1F5F9", c.dark ? "#D4D4D8" : "#475569"],
    accent: [c.accentSoft, c.accentText],
    warning: [c.dark ? "rgba(245,158,11,0.15)" : "#FFF4E5", c.dark ? "#FBBF24" : "#D97706"],
    info: [c.dark ? "rgba(59,130,246,0.15)" : "#EFF6FF", c.dark ? "#93C5FD" : "#2563EB"],
    success: [c.dark ? "rgba(16,185,129,0.15)" : "#E6FFEB", c.dark ? "#34D399" : "#008526"],
    danger: [c.dark ? "rgba(239,68,68,0.15)" : "#FFECEC", c.dark ? "#F87171" : "#D12929"],
    gold: ["#FFF7D6", "#946200"],
    pink: [c.dark ? "rgba(236,72,153,0.2)" : "#FCE7F3", c.dark ? "#FBCFE8" : "#BE185D"],
    dark: ["#0F172A", "#FFFFFF"],
  };
  const [bg, fg] = map[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {icon ? <Icon name={icon} size={11} color={fg} strokeWidth={2.4} /> : null}
      <Text style={{ color: fg, fontSize: 11, ...font.semibold }}>{label}</Text>
    </View>
  );
}

// Website AvatarComponent: deterministic initials colour + Pro/Pro+/Admin ring.
const stringToColor = (s?: string) => {
  if (!s) return "#364EF2";
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
  let color = "#";
  for (let i = 0; i < 3; i++) color += `00${((hash >> (i * 8)) & 0xff).toString(16)}`.slice(-2);
  return color;
};
const RING: Record<string, [string, string, string]> = {
  admin: ["#111827", "#4B5563", "#111827"],
  pro_plus: ["#FFD700", "#FDB931", "#FF8C00"],
  pro: ["#3838EC", "#5C6DFF", "#3838EC"],
};

export function Avatar({
  avatar,
  name,
  size = 40,
  plan,
  role,
  showBadge,
}: {
  avatar?: AvatarT;
  name?: string;
  size?: number;
  plan?: string;
  role?: string;
  showBadge?: boolean;
}) {
  const { c } = useTheme();
  const url = avatarUrl(avatar);
  const isAdmin = role === "admin" || role === "support";
  const ringKey = isAdmin ? "admin" : plan === "pro_plus" ? "pro_plus" : plan === "pro" ? "pro" : null;
  const inner = ringKey ? size - 8 : size;
  const face = url ? (
    <Image source={{ uri: ikThumb(url, Math.round(size * 3)) }} style={{ width: inner, height: inner, borderRadius: inner / 2, backgroundColor: c.surfaceAlt }} contentFit="cover" transition={150} />
  ) : (
    <View style={{ width: inner, height: inner, borderRadius: inner / 2, backgroundColor: stringToColor(name), alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#fff", fontSize: Math.max(9, inner * 0.38), ...font.semibold }}>{initials(name)}</Text>
    </View>
  );
  const label = isAdmin ? "ADMIN" : plan === "pro_plus" ? "PRO+" : plan === "pro" ? "PRO" : null;
  return (
    <View style={{ width: size, height: size }}>
      {ringKey ? (
        <LinearGradient colors={RING[ringKey]} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={{ width: size, height: size, borderRadius: size / 2, alignItems: "center", justifyContent: "center" }}>
          <View style={{ padding: 2, borderRadius: size / 2, backgroundColor: c.dark ? "#131313" : "#FFFFFF" }}>{face}</View>
        </LinearGradient>
      ) : (
        face
      )}
      {showBadge && label && size >= 28 ? (
        <LinearGradient
          colors={ringKey === "pro_plus" ? ["#FFD700", "#FF8C00"] : ringKey === "admin" ? ["#111827", "#4B5563"] : ["#3838EC", "#5C6DFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.planBadge, { borderColor: c.dark ? "#131313" : "#FFFFFF" }]}
        >
          <Text style={{ color: ringKey === "pro_plus" ? "#000" : "#fff", fontSize: 7.5, ...font.black }}>{label}</Text>
        </LinearGradient>
      ) : null}
    </View>
  );
}

/** Website section heading: Figtree 18 semibold + 13px subtitle + link. */
export function SectionHeader({
  title,
  subtitle,
  action,
  onAction,
  right,
  style,
}: {
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { c } = useTheme();
  return (
    <View style={[styles.sectionHeader, style]}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: c.text, fontSize: 18, letterSpacing: -0.3, ...font.semibold }}>{title}</Text>
        {subtitle ? (
          <Text numberOfLines={1} style={{ color: c.textMuted, fontSize: 13, marginTop: 1, ...font.regular }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
      {action ? (
        <Pressable onPress={onAction} hitSlop={8} style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
          <Text style={{ color: c.accentText, fontSize: 13, ...font.semibold }}>{action}</Text>
          <Icon name="arrow-forward" size={14} color={c.accentText} />
        </Pressable>
      ) : null}
    </View>
  );
}

/** Shimmer skeleton block (website .browse-shimmer). */
export function Skeleton({ width, height, radius = 10, style }: { width?: number | `${number}%`; height: number; radius?: number; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(v, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [v]);
  const translateX = v.interpolate({ inputRange: [0, 1], outputRange: [-220, 220] });
  return (
    <View style={[{ width: width ?? "100%", height, borderRadius: radius, overflow: "hidden", backgroundColor: c.dark ? "#1F2226" : "#E9ECF1" }, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}>
        <LinearGradient
          colors={c.dark ? ["transparent", "rgba(255,255,255,0.05)", "transparent"] : ["transparent", "rgba(255,255,255,0.65)", "transparent"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ flex: 1, width: 220 }}
        />
      </Animated.View>
    </View>
  );
}

/** Bottom inset spacer for content that scrolls to the screen edge. */
export function BottomSpace({ extra = 0 }: { extra?: number }) {
  const insets = useSafeAreaInsets();
  return <View style={{ height: insets.bottom + extra }} />;
}

const styles = StyleSheet.create({
  topBar: { flexDirection: "row", alignItems: "center", height: 50, paddingHorizontal: 4 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  badgeDot: { position: "absolute", top: 3, right: 2, minWidth: 17, height: 17, borderRadius: 9, paddingHorizontal: 4, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  pillBadge: { minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 5, alignItems: "center", justifyContent: "center" },
  badgeText: { color: "#fff", fontSize: 9.5, fontFamily: "Figtree_700Bold" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11, paddingHorizontal: 12, borderRadius: 12 },
  rowIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 13, height: 34, borderRadius: 999, borderWidth: 1 },
  segment: { flexDirection: "row", borderRadius: 12, padding: 3 },
  segmentBtn: { flex: 1, height: 34, borderRadius: 9, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
  badge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, alignSelf: "flex-start" },
  sectionHeader: { flexDirection: "row", alignItems: "flex-end", gap: 10, marginTop: 24, marginBottom: 12 },
  planBadge: { position: "absolute", right: -3, bottom: -2, paddingHorizontal: 4, paddingVertical: 1.5, borderRadius: 999, borderWidth: 1 },
});
