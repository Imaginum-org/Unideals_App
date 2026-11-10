import { Icon } from "@/components/ui/Icon";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Button, DateField, Input, T } from "@/components/ui";
import { useAuthStore } from "@/store/auth";
import { font, useTheme } from "@/theme";
import { ORDER_STEPS, dealBadge, dealStatusToStep, inr, shortDate } from "@/utils/format";
import type { Deal } from "@/types";

type Props = {
  deal: Deal | null;
  role: "buying" | "selling" | null;
  busy: boolean;
  defaultLocation?: string;
  rated?: boolean;
  onConfirm: (amount: number) => void;
  onSchedule: (date: string, location: string) => void;
  onPayment: () => void;
  onReceived: () => void;
  onRevert: () => void;
  onRate: () => void;
};

const UNDO: Record<string, { label: string; hint: string }> = {
  deal_confirmed: { label: "Release reservation", hint: "Back to negotiating. The item is available to others again." },
  pickup_scheduled: { label: "Clear pickup plan", hint: "Back to deal confirmed. You can set a new time." },
  payment_confirmed: { label: "Payment not received", hint: "Back to pickup scheduled." },
};

/** Collapsible deal tracker with role-specific actions (web DealProgress.jsx). */
export function DealPanel(p: Props) {
  const { c, radius } = useTheme();
  const status = p.deal?.status || "negotiating";
  const isSeller = p.role === "selling";
  const isGirl = useAuthStore((s) => s.user?.gender === "female");
  const step = dealStatusToStep(status);
  const [open, setOpen] = useState(true);
  const [amount, setAmount] = useState(String(p.deal?.current_price ?? ""));
  const [scheduling, setScheduling] = useState(false);
  const [date, setDate] = useState("");
  const [location, setLocation] = useState(p.defaultLocation || "");
  const [undoArmed, setUndoArmed] = useState(false);

  useEffect(() => setAmount(String(p.deal?.current_price ?? "")), [p.deal?.current_price]);
  useEffect(() => {
    setScheduling(false);
    setUndoArmed(false);
    if (status !== "negotiating") setOpen(true);
  }, [status]);
  useEffect(() => {
    if (!undoArmed) return undefined;
    const t = setTimeout(() => setUndoArmed(false), 4000);
    return () => clearTimeout(t);
  }, [undoArmed]);

  const badge = dealBadge(status);
  const note = (text: string) => (
    <View style={[styles.note, { backgroundColor: c.surface, borderRadius: radius.sm }]}>
      <T variant="small" muted>
        {text}
      </T>
    </View>
  );
  const pickupLoc = p.deal?.pickup?.location?.address_line || p.deal?.pickup?.location?.city || "";
  const meta =
    p.deal?.pickup?.scheduled_date || pickupLoc ? (
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14, marginBottom: 8 }}>
        {p.deal?.pickup?.scheduled_date ? (
          <Text style={{ color: c.text, fontSize: 13 }}>
            <Icon name="calendar-outline" size={13} /> {shortDate(p.deal.pickup.scheduled_date)}
          </Text>
        ) : null}
        {pickupLoc ? (
          <Text style={{ color: c.text, fontSize: 13 }}>
            <Icon name="location-outline" size={13} /> {pickupLoc}
          </Text>
        ) : null}
      </View>
    ) : null;

  const scheduleForm = (
    <View>
      <DateField label="Pickup date" value={date} onChange={setDate} minimumDate={new Date()} />
      <Input label="Meet at" value={location} onChangeText={setLocation} placeholder="e.g. Library entrance, 5 pm" maxLength={200} />
      {isGirl ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: -6, marginBottom: 10 }}>
          <Icon name="shield-checkmark-outline" size={13} color={c.pink} />
          <T variant="caption" color={c.textMuted} style={{ flex: 1 }}>
            Pick a busy, well-lit spot in daytime. Bringing a friend is always a vibe.
          </T>
        </View>
      ) : null}
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Button kind="secondary" title="Cancel" size="sm" onPress={() => setScheduling(false)} />
        </View>
        <View style={{ flex: 1 }}>
          <Button title="Save pickup" size="sm" disabled={!date || location.trim().length < 2} loading={p.busy} onPress={() => p.onSchedule(new Date(date).toISOString(), location.trim())} />
        </View>
      </View>
    </View>
  );

  let body: React.ReactNode = null;
  if (status === "negotiating" || status === "offer_accepted") {
    body = isSeller ? (
      <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
        <View style={{ flex: 1 }}>
          <Input prefix="₹" value={amount} onChangeText={(t) => setAmount(t.replace(/\D/g, ""))} keyboardType="number-pad" placeholder="Final amount" />
        </View>
        <Button title="Confirm deal" full={false} loading={p.busy} disabled={!Number(amount)} onPress={() => p.onConfirm(Number(amount))} />
      </View>
    ) : (
      note("The seller confirms the final amount here once you agree.")
    );
  } else if (status === "deal_confirmed") {
    body = isSeller ? (scheduling ? scheduleForm : <Button icon="calendar-outline" title="Schedule pickup" onPress={() => setScheduling(true)} />) : note("Deal confirmed. The seller is setting up the pickup.");
  } else if (status === "pickup_scheduled") {
    body = (
      <View>
        {meta}
        {isSeller ? (
          scheduling ? (
            scheduleForm
          ) : (
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Button icon="wallet-outline" title="Payment received" loading={p.busy} onPress={p.onPayment} />
              </View>
              <Button kind="secondary" icon="calendar-outline" title="Reschedule" full={false} onPress={() => setScheduling(true)} />
            </View>
          )
        ) : (
          note("Meet up, pay at the spot, and you're almost done.")
        )}
      </View>
    );
  } else if (status === "payment_confirmed") {
    body = (
      <View>
        {meta}
        {!isSeller ? <Button icon="cube-outline" title="I received the item" loading={p.busy} onPress={p.onReceived} /> : note("Paid ✓  Waiting for the buyer to confirm they got it.")}
      </View>
    );
  } else if (status === "completed") {
    body = !isSeller && !p.rated ? <Button kind="soft" icon="star-outline" title="Rate the seller" onPress={p.onRate} /> : note("Deal completed. Thanks for trading on Unideals!");
  } else if (status === "cancelled") {
    body = note(p.deal?.cancellation_reason ? `Cancelled: ${p.deal.cancellation_reason}` : "This deal was cancelled. Make a new offer to restart.");
  }

  const undo = isSeller && !scheduling ? UNDO[status] : null;

  return (
    <View style={[styles.wrap, { backgroundColor: c.card, borderColor: c.border }]}>
      <Pressable onPress={() => setOpen((o) => !o)} style={styles.head}>
        <Icon name="receipt-outline" size={17} color={c.accentText} />
        <Text style={{ color: c.text, fontSize: 14, ...font.semibold, flex: 1 }}>
          Deal · {inr(p.deal?.current_price)} · <Text style={{ color: c.accentText }}>{badge.label}</Text>
        </Text>
        <Icon name={open ? "chevron-up" : "chevron-down"} size={18} color={c.textMuted} />
      </Pressable>
      {open ? (
        <View style={{ paddingHorizontal: 14, paddingBottom: 12 }}>
          {status !== "cancelled" ? (
            <View style={styles.steps}>
              {ORDER_STEPS.map((label, i) => {
                const done = step >= i + 1;
                return (
                  <View key={label} style={{ flex: 1, gap: 5 }}>
                    <View style={{ height: 4, borderRadius: 2, backgroundColor: done ? c.accent : c.surfaceAlt }} />
                    <Text numberOfLines={1} style={{ fontSize: 10.5, color: done ? c.text : c.textFaint, ...(done ? font.semibold : font.regular) }}>
                      {label}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : null}
          {body}
          {undo ? (
            <View style={[styles.undo, { borderColor: c.border }]}>
              <T variant="caption" muted style={{ flex: 1 }}>
                {undoArmed ? undo.hint : "Made a mistake?"}
              </T>
              <Pressable
                disabled={p.busy}
                onPress={() => {
                  if (!undoArmed) return setUndoArmed(true);
                  setUndoArmed(false);
                  p.onRevert();
                }}
                hitSlop={6}
              >
                <Text style={{ color: undoArmed ? c.danger : c.accentText, fontSize: 13, ...font.semibold }}>{undoArmed ? "Tap again to undo" : undo.label}</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: 12, marginTop: 8, borderWidth: 1, borderRadius: 16, overflow: "hidden" },
  head: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 11 },
  steps: { flexDirection: "row", gap: 6, marginBottom: 12 },
  note: { paddingHorizontal: 12, paddingVertical: 9 },
  undo: { flexDirection: "row", alignItems: "center", gap: 8, borderTopWidth: 1, borderStyle: "dashed", marginTop: 12, paddingTop: 10 },
});
