import { useState } from "react";
import { Linking, View } from "react-native";
import { errorMessage } from "@/api/client";
import { userApi } from "@/api/user";
import { Button, Card, Chip, Input, Screen, T, TopBar } from "@/components/ui";
import { toast } from "@/lib/toast";
import { useAuthStore } from "@/store/auth";
import { useTheme } from "@/theme";

// Same backend sink as the website's Contact page: POST /api/report/support
// lands in the admin moderation queue.
const TYPES = [
  { value: "support", label: "Get help" },
  { value: "bug", label: "Report a bug" },
  { value: "suggestion", label: "Suggest a feature" },
];

export default function Contact() {
  const { c } = useTheme();
  const user = useAuthStore((s) => s.user);
  const [type, setType] = useState("support");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (subject.trim().length < 3) return toast.error("Add a short subject");
    if (message.trim().length < 10) return toast.error("Tell us a bit more (10+ characters)");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return toast.error("Enter an email we can reply to");
    setSending(true);
    try {
      await userApi.contactSupport({
        topic: subject.trim().slice(0, 120),
        category: subject.trim().slice(0, 120),
        description: message.trim().slice(0, 2000),
        email: email.trim(),
        name: user?.name,
        support_type: type,
        priority: type === "bug" ? "high" : "normal",
        reference: "mobile-app",
      });
      setSent(true);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <Screen padded={false} scroll header={<TopBar title="Help & contact" />}>
      <View style={{ padding: 16, gap: 14 }}>
        {sent ? (
          <Card style={{ backgroundColor: c.successSoft, borderColor: "transparent", gap: 6 }}>
            <T variant="h3" color={c.success}>
              Message received ✓
            </T>
            <T variant="small" muted>
              Our team usually replies within a day at {email}.
            </T>
            <Button kind="secondary" title="Send another" onPress={() => { setSent(false); setSubject(""); setMessage(""); }} />
          </Card>
        ) : (
          <>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              {TYPES.map((t) => (
                <Chip key={t.value} label={t.label} selected={type === t.value} onPress={() => setType(t.value)} />
              ))}
            </View>
            <Input label="Subject" value={subject} onChangeText={setSubject} maxLength={120} />
            <Input label="Message" multiline value={message} onChangeText={setMessage} maxLength={2000} placeholder="What happened, and where in the app?" />
            <Input label="Reply-to email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            <Button title="Send message" loading={sending} onPress={submit} />
          </>
        )}
        <Card>
          <T variant="h3">Staying safe</T>
          <T variant="small" muted style={{ marginTop: 4 }}>
            Meet at public campus spots, inspect before paying, and never share OTPs. Report suspicious users from the chat menu.
          </T>
        </Card>
        <Button kind="ghost" title="Email hi@unideals.in" onPress={() => Linking.openURL("mailto:hi@unideals.in")} />
      </View>
    </Screen>
  );
}
