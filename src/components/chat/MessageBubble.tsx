import { Icon } from "@/components/ui/Icon";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Button, T } from "@/components/ui";
import { font, useTheme } from "@/theme";
import { clockTime, inr } from "@/utils/format";
import type { Deal, Message } from "@/types";

const idOf = (v: unknown) => (typeof v === "object" && v ? String((v as { _id: string })._id) : String(v || ""));
const parseAmount = (text?: string) => {
  const m = String(text || "").replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : null;
};

type Props = {
  msg: Message;
  meId: string;
  deal: Deal | null;
  otherName: string;
  busy?: boolean;
  onAccept?: (m: Message) => void;
  onDecline?: (m: Message) => void;
  onCounter?: (m: Message) => void;
  onLongPress?: (m: Message) => void;
  onRetry?: (m: Message) => void;
};

function Bubble({ msg, meId, deal, otherName, busy, onAccept, onDecline, onCounter, onLongPress, onRetry }: Props) {
  const { c, radius } = useTheme();
  const mine = idOf(msg.sender_id) === String(meId);

  if (msg.message_type === "system") {
    return (
      <View style={styles.system}>
        <View style={[styles.systemPill, { backgroundColor: c.surface }]}>
          <T variant="caption" muted center>
            {msg.text}
          </T>
        </View>
      </View>
    );
  }

  if (msg.message_type === "offer") {
    const entry = deal?.offer_history?.find((o) => String(o.message_id) === String(msg._id));
    const status = entry?.status || "pending";
    const amount = entry?.amount ?? parseAmount(msg.text) ?? 0;
    const pending = status === "pending";
    const canRespond = !mine && pending && (deal?.status === "negotiating" || deal?.status === "offer_accepted");
    const statusLabel: Record<string, [string, string]> = {
      pending: ["Waiting for reply", c.textMuted],
      accepted: ["Accepted", c.success],
      declined: ["Declined", c.danger],
      countered: ["Countered", c.warning],
      expired: ["Replaced by a newer offer", c.textFaint],
    };
    const [label, tint] = statusLabel[status] || [status, c.textMuted];
    return (
      <View style={[styles.row, { justifyContent: mine ? "flex-end" : "flex-start" }]}>
        <View style={[styles.offer, { backgroundColor: c.card, borderColor: c.accent, borderRadius: radius.lg }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Icon name="pricetag" size={14} color={c.accentText} />
            <T variant="caption" color={c.accentText} style={font.bold}>
              {mine ? "You offered" : `${otherName} offered`}
            </T>
          </View>
          <Text style={{ color: c.text, fontSize: 26, ...font.black, marginVertical: 2 }}>{inr(amount)}</Text>
          <T variant="caption" color={tint} style={font.semibold}>
            {label}
          </T>
          {canRespond ? (
            <View style={{ flexDirection: "row", gap: 6, marginTop: 10 }}>
              <Button size="sm" title="Accept" full={false} disabled={busy} onPress={() => onAccept?.(msg)} />
              <Button size="sm" kind="secondary" title="Decline" full={false} disabled={busy} onPress={() => onDecline?.(msg)} />
              <Button size="sm" kind="soft" title="Counter" full={false} disabled={busy} onPress={() => onCounter?.(msg)} />
            </View>
          ) : null}
          <T variant="caption" faint style={{ marginTop: 6, alignSelf: "flex-end" }}>
            {clockTime(msg.createdAt)}
          </T>
        </View>
      </View>
    );
  }

  const tick =
    msg.failed ? "alert-circle" : msg.pending ? "time-outline" : msg.message_status === "read" || msg.message_status === "delivered" ? "checkmark-done" : "checkmark";
  const tickColor = msg.failed ? "#FCA5A5" : msg.message_status === "read" ? "#7DD3FC" : "rgba(255,255,255,0.75)";

  return (
    <View style={[styles.row, { justifyContent: mine ? "flex-end" : "flex-start" }]}>
      <Pressable
        onPress={msg.failed ? () => onRetry?.(msg) : undefined}
        onLongPress={() => onLongPress?.(msg)}
        delayLongPress={300}
        style={[
          styles.bubble,
          {
            backgroundColor: mine ? c.bubbleMine : c.bubbleTheirs,
            borderBottomRightRadius: mine ? 6 : 18,
            borderBottomLeftRadius: mine ? 18 : 6,
            opacity: msg.pending ? 0.75 : 1,
          },
        ]}
      >
        {msg.reply ? (
          <View style={[styles.quote, { borderLeftColor: mine ? "rgba(255,255,255,0.7)" : c.accent, backgroundColor: mine ? "rgba(255,255,255,0.14)" : c.surfaceAlt }]}>
            <Text style={{ color: mine ? "#fff" : c.accentText, fontSize: 12, ...font.bold }} numberOfLines={1}>
              {idOf(msg.reply.sender_id) === String(meId) ? "You" : msg.reply.sender_name || otherName}
            </Text>
            <Text style={{ color: mine ? "rgba(255,255,255,0.9)" : c.textMuted, fontSize: 12.5 }} numberOfLines={2}>
              {msg.reply.text}
            </Text>
          </View>
        ) : null}
        <Text selectable style={{ color: mine ? "#fff" : c.text, fontSize: 15.5, lineHeight: 21, fontStyle: msg.is_flagged ? "italic" : "normal" }}>
          {msg.text}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 3, alignSelf: "flex-end", marginTop: 2 }}>
          <Text style={{ color: mine ? "rgba(255,255,255,0.75)" : c.textFaint, fontSize: 10.5 }}>{clockTime(msg.createdAt)}</Text>
          {mine ? <Icon name={tick} size={13} color={tickColor} /> : null}
        </View>
        {msg.failed ? (
          <Text style={{ color: "#FECACA", fontSize: 11.5, marginTop: 3, fontFamily: "Figtree_600SemiBold" }}>Not sent · Tap to retry</Text>
        ) : null}
      </Pressable>
    </View>
  );
}

export const MessageBubble = memo(Bubble);

const styles = StyleSheet.create({
  row: { flexDirection: "row", paddingHorizontal: 12, marginVertical: 3 },
  bubble: { maxWidth: "80%", borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8 },
  quote: { borderLeftWidth: 3, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5, marginBottom: 6 },
  offer: { width: 250, borderWidth: 1.5, padding: 14 },
  system: { alignItems: "center", marginVertical: 8, paddingHorizontal: 24 },
  systemPill: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
});
