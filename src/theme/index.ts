import { useColorScheme } from "react-native";
import { usePrefsStore } from "@/store/prefs";

// Exact tokens from the website (frontend/src/styles/index.css + Tailwind
// arbitrary values): accent #3838EC, page #F7F8FA / dark #131313, cards
// white / #1A1D20, bars #16181B, Girls Mode swaps --accent to pink.
const base = {
  radius: { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 },
  space: (n: number) => n * 4,
};

const light = {
  dark: false,
  bg: "#F7F8FA", // page
  bar: "rgba(255,255,255,0.94)", // header / tab bar (white/90 + blur)
  barSolid: "#FFFFFF",
  card: "#FFFFFF", // AccountKit CARD
  surface: "#F4F5F8", // inputs / search field
  surfaceAlt: "#EEF0F4",
  productCard: "#F7F8FA",
  productBorder: "#E4E4E7", // zinc-200
  border: "#E5E7EB", // neutral-200
  borderSoft: "#EEF1F5",
  borderStrong: "#D4D4D8",
  text: "#0F172A", // slate-900
  textStrong: "#020617", // slate-950
  textMuted: "#64748B", // slate-500
  textFaint: "#94A3B8", // slate-400
  label: "#4A5565",
  accent: "#3838EC",
  accentPressed: "#2F2FD9",
  accentText: "#3838EC",
  accentSoft: "rgba(56,56,236,0.08)",
  accentSoftStrong: "rgba(56,56,236,0.14)",
  accentRing: "rgba(56,56,236,0.35)",
  onAccent: "#FFFFFF",
  success: "#059669", // emerald-600
  successSoft: "#ECFDF5",
  warning: "#B45309",
  warningSoft: "#FFFBEB",
  amber: "#F59E0B",
  danger: "#DC2626",
  dangerSoft: "#FEF2F2",
  badgeRed: "#FF3B30",
  gold: "#FACC15",
  overlay: "rgba(15,23,42,0.45)",
  bubbleMine: "#3838EC",
  bubbleTheirs: "#FFFFFF",
  thread: "#EEF0F6",
  pink: "#DB2777",
  pinkSoft: "#FCE7F3",
};

const dark: typeof light = {
  dark: true,
  bg: "#131313",
  bar: "rgba(22,24,27,0.94)",
  barSolid: "#16181B",
  card: "#1A1D20",
  surface: "#1F2226",
  surfaceAlt: "#24272C",
  productCard: "#18181B",
  productBorder: "#27272A",
  border: "#262626",
  borderSoft: "#27272A",
  borderStrong: "#3F3F46",
  text: "#FFFFFF",
  textStrong: "#FFFFFF",
  textMuted: "#A1A1AA",
  textFaint: "#71717A",
  label: "#E4E4E7",
  accent: "#3838EC",
  accentPressed: "#2F2FD9",
  accentText: "#A5B0FF",
  accentSoft: "rgba(109,109,245,0.14)",
  accentSoftStrong: "rgba(109,109,245,0.24)",
  accentRing: "rgba(109,109,245,0.45)",
  onAccent: "#FFFFFF",
  success: "#34D399",
  successSoft: "rgba(16,185,129,0.14)",
  warning: "#FBBF24",
  warningSoft: "rgba(245,158,11,0.14)",
  amber: "#F59E0B",
  danger: "#F87171",
  dangerSoft: "rgba(239,68,68,0.14)",
  badgeRed: "#FF3B30",
  gold: "#FACC15",
  overlay: "rgba(0,0,0,0.6)",
  bubbleMine: "#3838EC",
  bubbleTheirs: "#1F2226",
  thread: "#101012",
  pink: "#F472B6",
  pinkSoft: "rgba(236,72,153,0.16)",
};

const girlsLight: Partial<typeof light> = {
  accent: "#DB2777",
  accentPressed: "#BE185D",
  accentText: "#DB2777",
  accentSoft: "rgba(236,72,153,0.09)",
  accentSoftStrong: "rgba(236,72,153,0.16)",
  accentRing: "rgba(236,72,153,0.35)",
  bg: "#FDF7FA",
  productCard: "#FDF2F8",
  bubbleMine: "#DB2777",
};
const girlsDark: Partial<typeof light> = {
  accent: "#DB2777",
  accentPressed: "#BE185D",
  accentText: "#F9A8D4",
  accentSoft: "rgba(236,72,153,0.14)",
  accentSoftStrong: "rgba(236,72,153,0.24)",
  accentRing: "rgba(236,72,153,0.45)",
  bubbleMine: "#DB2777",
};

export type Colors = typeof light & { girls: boolean };
export type Theme = typeof base & { c: Colors; girls: boolean };

export const buildTheme = (scheme: "light" | "dark", girls: boolean): Theme => {
  const palette = scheme === "dark" ? dark : light;
  const c = { ...(girls ? { ...palette, ...(scheme === "dark" ? girlsDark : girlsLight) } : palette), girls };
  return { ...base, c, girls };
};

/** Resolved theme: user pref (system/light/dark) + Girls Mode accent. */
export const useTheme = (): Theme => {
  const system = useColorScheme();
  const themePref = usePrefsStore((s) => s.theme);
  const girlsMode = usePrefsStore((s) => s.girlsMode);
  const scheme = themePref === "system" ? (system === "dark" ? "dark" : "light") : themePref;
  return buildTheme(scheme, girlsMode);
};

// Figtree — the website's typeface (font-figtree). Custom families carry
// their own weight, so never combine these with fontWeight.
export const FONT_FILES = {
  regular: "Figtree_400Regular",
  medium: "Figtree_500Medium",
  semibold: "Figtree_600SemiBold",
  bold: "Figtree_700Bold",
  black: "Figtree_800ExtraBold",
} as const;

export const font = {
  regular: { fontFamily: FONT_FILES.regular },
  medium: { fontFamily: FONT_FILES.medium },
  semibold: { fontFamily: FONT_FILES.semibold },
  bold: { fontFamily: FONT_FILES.bold },
  black: { fontFamily: FONT_FILES.black },
};

/** Soft card shadow (shadow-[0_4px_18px_rgba(15,23,42,0.08)]). */
export const shadow = (dark: boolean, strength: "sm" | "md" | "lg" = "md") =>
  dark
    ? {}
    : {
        shadowColor: "#0F172A",
        shadowOpacity: strength === "sm" ? 0.04 : strength === "md" ? 0.08 : 0.14,
        shadowRadius: strength === "sm" ? 2 : strength === "md" ? 12 : 22,
        shadowOffset: { width: 0, height: strength === "sm" ? 1 : 4 },
        elevation: strength === "sm" ? 1 : strength === "md" ? 2 : 5,
      };
