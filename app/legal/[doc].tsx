import { useLocalSearchParams } from "expo-router";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Segmented, TopBar } from "@/components/ui";
import { Icon, type IconName } from "@/components/ui/Icon";
import { RichText } from "@/components/ui/RichText";
import { LEGAL_DOCS, LEGAL_EMAIL, LEGAL_UPDATED } from "@/content/legalContent";
import { router } from "expo-router";
import { font, useTheme } from "@/theme";

type Block = { p?: string; list?: (string | { label: string; text: string })[]; note?: string; tone?: "info" | "warn" };
type Doc = {
  id: string;
  title: string;
  intro: string;
  summary: { icon: string; tone: string; title: string; text: string }[];
  sections: { id: string; icon: string; title: string; short?: string; body: Block[] }[];
};
const TONES: Record<string, [string, string]> = {
  emerald: ["#ECFDF5", "#059669"],
  sky: ["#F0F9FF", "#0284C7"],
  violet: ["#F5F3FF", "#7C3AED"],
  rose: ["#FFF1F2", "#E11D48"],
  amber: ["#FFFBEB", "#D97706"],
  indigo: ["#EEF2FF", "#4F46E5"],
};

/** Native render of the website's Terms / Privacy (same content source). */
export default function Legal() {
  const { doc = "terms" } = useLocalSearchParams<{ doc: string }>();
  const { c } = useTheme();
  const d = ((LEGAL_DOCS as Record<string, Doc>)[doc] || LEGAL_DOCS.terms) as Doc;
  const body = { color: c.textMuted, fontSize: 14, lineHeight: 21, fontFamily: "Figtree_400Regular" } as const;

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: c.barSolid }}>
      <TopBar title={d.title} subtitle={`Updated ${LEGAL_UPDATED}`} />
      <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 14 }}>
        <Segmented
          value={d.id as "terms" | "privacy"}
          options={[
            { value: "terms", label: "Terms of Use" },
            { value: "privacy", label: "Privacy Policy" },
          ]}
          onChange={(v) => router.setParams({ doc: v })}
        />
        <Text style={{ color: c.text, fontSize: 24, letterSpacing: -0.5, ...font.bold }}>{d.title}</Text>
        <Text style={body}>{d.intro}</Text>
        <View style={{ gap: 10 }}>
          {d.summary.map((s) => {
            const [bg, fg] = TONES[s.tone] || TONES.indigo;
            return (
              <Card key={s.title} style={{ flexDirection: "row", gap: 12, padding: 14 }}>
                <View style={[styles.sIcon, { backgroundColor: c.dark ? "rgba(255,255,255,0.06)" : bg }]}>
                  <Icon name={(s.icon as IconName) || "info"} size={18} color={fg} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontSize: 14.5, ...font.semibold }}>{s.title}</Text>
                  <Text style={[body, { fontSize: 13 }]}>{s.text}</Text>
                </View>
              </Card>
            );
          })}
        </View>
        {d.sections.map((sec, i) => (
          <Card key={sec.id} style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={[styles.sIcon, { backgroundColor: c.accentSoft, width: 32, height: 32 }]}>
                <Icon name={(sec.icon as IconName) || "info"} size={16} color={c.accentText} />
              </View>
              <Text style={{ flex: 1, color: c.text, fontSize: 16, ...font.semibold }}>
                {i + 1}. {sec.title}
              </Text>
            </View>
            {sec.short ? (
              <View style={[styles.short, { backgroundColor: c.accentSoft }]}>
                <Text style={{ color: c.accentText, fontSize: 13, lineHeight: 19, ...font.medium }}>
                  <Text style={font.bold}>In short: </Text>
                  {sec.short}
                </Text>
              </View>
            ) : null}
            {sec.body.map((b, j) =>
              b.p ? (
                <RichText key={j} text={b.p} style={body} boldColor={c.text} />
              ) : b.list ? (
                <View key={j} style={{ gap: 6 }}>
                  {b.list.map((li, k) => (
                    <View key={k} style={{ flexDirection: "row", gap: 8 }}>
                      <Text style={[body, { color: c.accentText }]}>•</Text>
                      {typeof li === "string" ? (
                        <RichText text={li} style={[body, { flex: 1 }]} boldColor={c.text} />
                      ) : (
                        <Text style={[body, { flex: 1 }]}>
                          <Text style={{ color: c.text, ...font.semibold }}>{li.label}: </Text>
                          {li.text}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              ) : b.note ? (
                <View key={j} style={[styles.note, { backgroundColor: b.tone === "warn" ? c.warningSoft : c.surface, borderColor: b.tone === "warn" ? c.amber : c.border }]}>
                  <RichText text={b.note} style={[body, { color: b.tone === "warn" ? c.warning : c.text }]} />
                </View>
              ) : null,
            )}
          </Card>
        ))}
        <Text style={[body, { textAlign: "center" }]}>
          Questions? Email{" "}
          <Text style={{ color: c.accentText, ...font.semibold }} onPress={() => Linking.openURL(`mailto:${LEGAL_EMAIL}`)}>
            {LEGAL_EMAIL}
          </Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  short: { borderRadius: 10, padding: 10 },
  note: { borderRadius: 10, borderWidth: 1, padding: 10 },
});
