import { Text, type StyleProp, type TextStyle } from "react-native";
import { font } from "@/theme";

/** Renders **bold** segments (the legal/FAQ content convention). */
export function RichText({ text, style, boldColor }: { text: string; style?: StyleProp<TextStyle>; boldColor?: string }) {
  const parts = String(text || "").split(/(\*\*[^*]+\*\*)/g);
  return (
    <Text style={style}>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <Text key={i} style={[font.semibold, boldColor ? { color: boldColor } : null]}>
            {p.slice(2, -2)}
          </Text>
        ) : (
          p
        ),
      )}
    </Text>
  );
}
