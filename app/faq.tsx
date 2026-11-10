import { router } from "expo-router";
import { useMemo, useState } from "react";
import { LayoutAnimation, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, Chip, TopBar } from "@/components/ui";
import { Icon, type IconName } from "@/components/ui/Icon";
import { RichText } from "@/components/ui/RichText";
import { FAQ_CATEGORIES, FAQ_COUNT } from "@/content/faqData";
import { font, useTheme } from "@/theme";

type Cat = { id: string; title: string; icon: string; questions: { q: string; a: string }[] };
const CATS = FAQ_CATEGORIES as Cat[];
const ICONS: Record<string, IconName> = { rocket: "rocket", user: "person-outline", tag: "pricetag", bag: "bag", chat: "chatbubbles", handshake: "handshake", crown: "crown", trophy: "trophy-outline", shield: "shield-outline", flower: "flower" };

export default function Faq() {
  const { c } = useTheme();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [open, setOpen] = useState<string | null>(null);

  const results = useMemo(() => {
    const n = query.trim().toLowerCase();
    return CATS.filter((x) => cat === "all" || x.id === cat)
      .map((x) => ({ ...x, questions: x.questions.filter((q) => !n || `${q.q} ${q.a}`.toLowerCase().includes(n)) }))
      .filter((x) => x.questions.length);
  }, [query, cat]);

  const toggle = (k: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((o) => (o === k ? null : k));
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: c.barSolid }}>
      <TopBar title="FAQ" subtitle={`${FAQ_COUNT} answers`} />
      <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Text style={{ color: c.text, fontSize: 24, letterSpacing: -0.5, ...font.bold }}>How can we help?</Text>
        <Text style={{ color: c.textMuted, fontSize: 14, marginTop: 4, ...font.regular }}>Answers to what students ask most about buying, selling and staying safe.</Text>
        <View style={[styles.search, { backgroundColor: c.card, borderColor: c.border }]}>
          <Icon name="search" size={18} color={c.textMuted} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Search questions" placeholderTextColor={c.textFaint} style={{ flex: 1, color: c.text, fontSize: 15, fontFamily: "Figtree_400Regular" }} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 14 }}>
          <Chip label="All" selected={cat === "all"} onPress={() => setCat("all")} />
          {CATS.map((x) => (
            <Chip key={x.id} label={x.title} icon={ICONS[x.icon]} selected={cat === x.id} onPress={() => setCat(x.id)} />
          ))}
        </ScrollView>
        {results.map((x) => (
          <View key={x.id} style={{ marginBottom: 18 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <View style={[styles.catIcon, { backgroundColor: c.accentSoft }]}>
                <Icon name={ICONS[x.icon] || "help-circle-outline"} size={15} color={c.accentText} />
              </View>
              <Text style={{ color: c.text, fontSize: 16, ...font.semibold }}>{x.title}</Text>
            </View>
            <Card style={{ padding: 0, overflow: "hidden" }}>
              {x.questions.map((q, i) => {
                const k = `${x.id}-${i}`;
                const isOpen = open === k || Boolean(query.trim());
                return (
                  <View key={k} style={i ? { borderTopWidth: StyleSheet.hairlineWidth, borderColor: c.border } : null}>
                    <Pressable onPress={() => toggle(k)} style={({ pressed }) => [styles.q, { backgroundColor: pressed ? c.surface : "transparent" }]}>
                      <Text style={{ flex: 1, color: c.text, fontSize: 14.5, lineHeight: 20, ...font.semibold }}>{q.q}</Text>
                      <Icon name={isOpen ? "minus" : "plus"} size={17} color={c.textMuted} />
                    </Pressable>
                    {isOpen ? <RichText text={q.a} style={{ color: c.textMuted, fontSize: 14, lineHeight: 21, paddingHorizontal: 16, paddingBottom: 14, fontFamily: "Figtree_400Regular" }} boldColor={c.text} /> : null}
                  </View>
                );
              })}
            </Card>
          </View>
        ))}
        {!results.length ? <Text style={{ color: c.textMuted, textAlign: "center", marginTop: 20, ...font.medium }}>No answers match “{query}”.</Text> : null}
        <Card style={{ alignItems: "center", gap: 8, marginTop: 6 }}>
          <Text style={{ color: c.text, fontSize: 16, ...font.semibold }}>Still stuck?</Text>
          <Text style={{ color: c.textMuted, fontSize: 13.5, textAlign: "center", ...font.regular }}>Our team usually replies within a day.</Text>
          <Button title="Contact support" icon="life-buoy" full={false} onPress={() => router.push("/contact")} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  search: { flexDirection: "row", alignItems: "center", gap: 8, height: 46, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, marginTop: 16 },
  catIcon: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  q: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
});
