import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Button, Sheet } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { haptic } from "@/lib/haptics";
import { font, useTheme } from "@/theme";
import { inr } from "@/utils/format";

/** Reads "1200", "₹1,200", "rs 1200", "1200/-" as an amount (chat → offer). */
export const amountFromText = (t: string) => {
  const m = t.trim().match(/^(?:₹|rs\.?|inr)?\s*(\d{1,3}(?:,\d{2,3})+|\d{1,8})\s*(?:₹|rs\.?|\/-|rupees?)?$/i);
  if (!m) return 0;
  const n = Number(m[1].replace(/,/g, ""));
  return n >= 1 && n <= 10_000_000 ? n : 0;
};

/**
 * "Make an offer" sheet: product context, a big centred amount, one-tap
 * suggestions below the listed price. Rides on top of the keyboard.
 */
export function OfferSheet({
  visible,
  onClose,
  listed,
  title,
  image,
  initial,
  busy,
  onSend,
}: {
  visible: boolean;
  onClose: () => void;
  listed?: number;
  title?: string;
  image?: string;
  initial?: number;
  busy?: boolean;
  onSend: (amount: number) => void;
}) {
  const { c } = useTheme();
  const [value, setValue] = useState("");
  useEffect(() => {
    if (visible) setValue(initial ? String(initial) : "");
  }, [visible, initial]);

  const amount = Number(value) || 0;
  const pct = listed && amount ? Math.round(((listed - amount) / listed) * 100) : 0;
  const steps = listed ? [5, 10, 15, 20].map((p) => ({ p, v: Math.max(1, Math.round((listed * (100 - p)) / 100 / 10) * 10) })) : [];

  return (
    <Sheet visible={visible} onClose={onClose} title="Make an offer" subtitle="The seller can accept, decline or counter.">
      {title ? (
        <View style={[styles.product, { backgroundColor: c.surface }]}>
          {image ? <Image source={{ uri: image }} style={styles.thumb} contentFit="cover" /> : null}
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={{ color: c.text, fontSize: 14, ...font.semibold }}>
              {title}
            </Text>
            {listed ? <Text style={{ color: c.textMuted, fontSize: 12.5, marginTop: 1, ...font.medium }}>Listed at {inr(listed)}</Text> : null}
          </View>
        </View>
      ) : null}

      <View style={[styles.amountBox, { borderColor: amount ? c.accent : c.border, backgroundColor: c.dark ? "#1C1F23" : "#FAFAFC" }]}>
        <Text style={[styles.rupee, { color: amount ? c.text : c.textFaint }]}>₹</Text>
        <TextInput
          value={value}
          onChangeText={(t) => setValue(t.replace(/\D/g, "").slice(0, 8))}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={c.textFaint}
          autoFocus
          style={[styles.amount, { color: c.text }]}
          accessibilityLabel="Offer amount in rupees"
        />
      </View>
      <Text style={{ textAlign: "center", color: pct > 0 ? c.success : pct < 0 ? c.warning : c.textMuted, fontSize: 12.5, marginTop: 8, ...font.medium }}>
        {!amount ? "Enter the price you'd like to pay" : pct > 0 ? `${pct}% below the listed price` : pct < 0 ? "That's above the listed price" : "Same as the listed price"}
      </Text>

      {steps.length ? (
        <View style={styles.steps}>
          {steps.map(({ p, v }) => {
            const sel = amount === v;
            return (
              <Pressable
                key={p}
                onPress={() => {
                  haptic.select();
                  setValue(String(v));
                }}
                style={[styles.step, { borderColor: sel ? c.accent : c.border, backgroundColor: sel ? c.accentSoft : "transparent" }]}
              >
                <Text style={{ color: sel ? c.accentText : c.text, fontSize: 13.5, ...font.bold }}>{inr(v)}</Text>
                <Text style={{ color: c.textMuted, fontSize: 11, ...font.medium }}>−{p}%</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <Button
        title={amount ? `Send offer · ${inr(amount)}` : "Send offer"}
        icon="hand-coins"
        onPress={() => onSend(amount)}
        loading={busy}
        disabled={!amount}
        size="lg"
        style={{ marginTop: 18 }}
      />
      <View style={styles.note}>
        <Icon name="shield-checkmark-outline" size={13} color={c.textFaint} />
        <Text style={{ color: c.textFaint, fontSize: 11.5, ...font.regular }}>No payment now. You pay at pickup once you both agree.</Text>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  product: { flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderRadius: 14, marginBottom: 16 },
  thumb: { width: 42, height: 42, borderRadius: 10 },
  amountBox: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 72, borderRadius: 18, borderWidth: 1.5, paddingHorizontal: 18 },
  rupee: { fontSize: 30, marginRight: 4, includeFontPadding: false, fontFamily: "Figtree_700Bold" },
  amount: { minWidth: 60, fontSize: 36, height: 70, paddingVertical: 0, textAlign: "center", includeFontPadding: false, textAlignVertical: "center", letterSpacing: -1, fontFamily: "Figtree_800ExtraBold" },
  steps: { flexDirection: "row", gap: 8, marginTop: 16 },
  step: { flex: 1, alignItems: "center", gap: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 9 },
  note: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12 },
});
