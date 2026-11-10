import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Easing, Text, View, type StyleProp, type TextStyle } from "react-native";
import Svg, { G, Path } from "react-native-svg";
import { font, useTheme } from "@/theme";
import { LOGO_PATHS, LOGO_VIEWBOX } from "./logoPaths";

/** The Unideals logo mark (public/logo.svg). `tint` recolours it (Girls Mode). */
export function LogoMark({ size = 32, tint }: { size?: number; tint?: string }) {
  return (
    <Svg width={size} height={(size * 520) / 430} viewBox={LOGO_VIEWBOX}>
      {LOGO_PATHS.map((p, i) => (
        <G key={i} transform={p.transform}>
          <Path d={p.d} fill={tint || p.fill} />
        </G>
      ))}
    </Svg>
  );
}

/** Header wordmark: "Unideals" in Figtree Bold (website Wordmark, 21/700/-0.5). */
export function Wordmark({ size = 21, color, style }: { size?: number; color?: string; style?: StyleProp<TextStyle> }) {
  const { c } = useTheme();
  return (
    <Text accessibilityRole="header" style={[{ fontSize: size, letterSpacing: -0.5, color: color || (c.dark ? "#FFFFFF" : "#000000"), ...font.bold }, style]}>
      Unideals
    </Text>
  );
}

/**
 * Branded loading state (website BrandLoader): pulsing logo mark. The full
 * variant puts the logo at the exact centre of the screen, wherever its
 * container sits (under a header, inside a tab…).
 */
export function BrandLoader({ label, full = true }: { label?: string; full?: boolean }) {
  const { c, girls } = useTheme();
  const v = useRef(new Animated.Value(0)).current;
  const box = useRef<{ measureInWindow: (cb: (x: number, y: number, w: number, h: number) => void) => void } | null>(null);
  const [dy, setDy] = useState(0);
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v]);
  const centre = () => {
    if (!full) return;
    box.current?.measureInWindow((_x, y, _w, h) => {
      const screenH = Dimensions.get("window").height;
      if (h > 0) setDy(Math.round(screenH / 2 - (y + h / 2)));
    });
  };
  return (
    <View
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={box as any}
      onLayout={centre}
      style={[full ? { flex: 1 } : { paddingVertical: 36 }, { alignItems: "center", justifyContent: "center", backgroundColor: full ? c.bg : undefined }]}
    >
      <View style={{ alignItems: "center", transform: [{ translateY: dy }] }}>
        <Animated.View style={{ opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] }), transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.04] }) }] }}>
          <LogoMark size={full ? 46 : 32} tint={girls ? c.accent : undefined} />
        </Animated.View>
        {/* Label hangs below without moving the logo off-centre. */}
        {label ? <Text style={{ position: "absolute", top: "100%", marginTop: 14, width: 260, textAlign: "center", color: c.textMuted, fontSize: 13, ...font.medium }}>{label}</Text> : null}
      </View>
    </View>
  );
}
