import { useQuery } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { authApi } from "@/api/auth";
import { errorMessage } from "@/api/client";
import { deleteImage, uploadImage } from "@/api/uploads";
import { userApi } from "@/api/user";
import { Avatar, Badge, Button, Card, Chip, Divider, Input, Row, Screen, Sheet, SwitchRow, T, TopBar } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { ChatWallpaper, WALLPAPERS } from "@/components/chat/Wallpaper";
import { BrandFooter } from "@/components/brand/BrandFooter";
import { useCampus } from "@/hooks/useCampus";
import { toast } from "@/lib/toast";
import { canSeeGirls, useAuthStore } from "@/store/auth";
import { usePrefsStore } from "@/store/prefs";
import { font, useTheme } from "@/theme";
import { avatarUrl, formatName } from "@/utils/format";

export default function Settings() {
  const { c } = useTheme();
  const user = useAuthStore((s) => s.user);
  const loggedIn = useAuthStore((s) => s.status === "authed");
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const updateUser = useAuthStore((s) => s.updateUser);
  const logout = useAuthStore((s) => s.logout);
  const theme = usePrefsStore((s) => s.theme);
  const setTheme = usePrefsStore((s) => s.setTheme);
  const girlsMode = usePrefsStore((s) => s.girlsMode);
  const setGirlsMode = usePrefsStore((s) => s.setGirlsMode);
  const { label } = useCampus();

  const [mobile, setMobile] = useState(user?.mobile ? String(user.mobile) : "");
  const [savingMobile, setSavingMobile] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePw, setDeletePw] = useState("");
  const [deleting, setDeleting] = useState(false);

  const genderStatus = useQuery({ queryKey: ["gender-status"], queryFn: userApi.genderChangeStatus, enabled: loggedIn && Boolean(user?.gender) });
  const chat = (user?.chat_settings || {}) as { read_receipts?: boolean; typing_indicators?: boolean };

  const changeAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert("Permission needed", "Allow photo access to change your picture.");
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.9 });
    if (res.canceled) return;
    setAvatarBusy(true);
    let uploaded: { url: string; fileId: string } | null = null;
    try {
      uploaded = await uploadImage(res.assets[0].uri, "Avatars");
      await userApi.updateAvatar(uploaded);
      await refreshProfile();
      toast.success("Profile photo updated");
    } catch (err) {
      if (uploaded) deleteImage(uploaded.fileId);
      toast.error(errorMessage(err, (err as Error)?.message || "Couldn't update photo"));
    } finally {
      setAvatarBusy(false);
    }
  };
  const removeAvatar = async () => {
    setAvatarBusy(true);
    try {
      await userApi.removeAvatar();
      updateUser({ avatar: null });
      toast.success("Photo removed");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setAvatarBusy(false);
    }
  };

  const saveMobile = async () => {
    if (!/^\d{10}$/.test(mobile)) return toast.error("Enter a 10-digit mobile number");
    setSavingMobile(true);
    try {
      const r = await userApi.updateProfile({ mobile });
      if (r.user) updateUser(r.user);
      toast.success("Mobile number saved");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSavingMobile(false);
    }
  };

  const setGender = (g: "female" | "male") => {
    const first = !user?.gender;
    Alert.alert(
      first ? "Set gender" : "Request a change",
      first
        ? `Set your gender to ${g}? Changing it later needs a review by our team.`
        : `Ask our team to change your gender to ${g}? Girls Corner access updates once approved.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              if (first) {
                const r = await userApi.updateProfile({ gender: g });
                if (r.user) updateUser(r.user);
                else await refreshProfile();
                toast.success("Saved");
              } else {
                await userApi.requestGenderChange(g);
                genderStatus.refetch();
                toast.success("Request sent for review");
              }
            } catch (err) {
              toast.error(errorMessage(err));
            }
          },
        },
      ],
    );
  };

  const setWallpaper = async (id: string) => {
    const prev = (chat as { wallpaper?: string }).wallpaper;
    updateUser({ chat_settings: { ...chat, wallpaper: id } });
    try {
      await userApi.updateChatSettings({ wallpaper: id });
    } catch (err) {
      updateUser({ chat_settings: { ...chat, wallpaper: prev } });
      toast.error(errorMessage(err));
    }
  };

  const toggleChat = async (key: "read_receipts" | "typing_indicators", v: boolean) => {
    updateUser({ chat_settings: { ...chat, [key]: v } });
    try {
      await userApi.updateChatSettings({ [key]: v });
    } catch (err) {
      updateUser({ chat_settings: { ...chat, [key]: !v } });
      toast.error(errorMessage(err));
    }
  };

  const sendReset = async () => {
    if (!user?.email) return;
    try {
      const { data } = await authApi.forgotPassword(user.email);
      toast.success(data.message || "Reset link sent to your email");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const confirmDelete = async () => {
    if (!deletePw) return toast.error("Enter your password to confirm");
    setDeleting(true);
    try {
      await userApi.deleteAccount({ password: deletePw });
      setDeleteOpen(false);
      await logout({ silent: true });
      toast.success("Your account was deleted");
      router.replace("/");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const pending = genderStatus.data?.genderChangeRequest?.status === "pending";

  return (
    <Screen padded={false} scroll header={<TopBar title="Settings" />}>
      <View style={{ padding: 16, gap: 16 }}>
        {loggedIn && user ? (
          <>
            <Card>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                <Avatar avatar={user.avatar} name={user.name} size={64} />
                <View style={{ flex: 1, gap: 6 }}>
                  <T variant="h3">{formatName(user.name)}</T>
                  <T variant="small" muted>
                    {user.email}
                  </T>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <Button size="sm" kind="soft" full={false} title={avatarUrl(user.avatar) ? "Change photo" : "Add photo"} loading={avatarBusy} onPress={changeAvatar} />
                    {avatarUrl(user.avatar) ? <Button size="sm" kind="ghost" full={false} title="Remove" disabled={avatarBusy} onPress={removeAvatar} /> : null}
                  </View>
                </View>
              </View>
            </Card>

            <Card style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Icon name={user.is_email_verified ? "verified" : "mail-outline"} size={22} color={user.is_email_verified ? c.success : c.warning} />
              <View style={{ flex: 1 }}>
                <T variant="h3">Email verification</T>
                <T variant="small" muted>
                  {user.is_email_verified ? `Verified · ${user.email}` : `Not verified yet · ${user.email}`}
                </T>
              </View>
              {user.is_email_verified ? <Badge label="Verified" tone="success" icon="checkmark" /> : null}
            </Card>

            <Card>
              <T variant="h3" style={{ marginBottom: 10 }}>
                Contact
              </T>
              <Input label="Mobile number" prefix="+91" keyboardType="number-pad" maxLength={10} value={mobile} onChangeText={(t) => setMobile(t.replace(/\D/g, ""))} hint="Only shared with buyers once you confirm a deal." />
              <Button size="sm" title="Save number" onPress={saveMobile} loading={savingMobile} disabled={mobile === String(user.mobile || "")} />
            </Card>

            <Card>
              <Row icon="school-outline" title="Campus" subtitle={label} onPress={() => router.push("/campus")} />
              <Divider />
              <Row icon="location-outline" title="Pickup spots" subtitle="Up to 3 public meeting points" onPress={() => router.push("/pickup-spots")} />
            </Card>

            <Card>
              <T variant="h3">Gender</T>
              <T variant="small" muted style={{ marginTop: 2, marginBottom: 10 }}>
                Used for Girls Corner 🌸, a private space for verified female students.
              </T>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {(["female", "male"] as const).map((g) => (
                  <Chip key={g} label={g === "female" ? "Female" : "Male"} selected={user.gender === g} onPress={() => user.gender !== g && !pending && setGender(g)} />
                ))}
              </View>
              {pending ? (
                <T variant="small" color={c.warning} style={{ marginTop: 8 }}>
                  A change request is under review.
                </T>
              ) : null}
            </Card>

            <Card>
              <T variant="h3">Chat</T>
              <SwitchRow label="Read receipts" description="Let others see when you've read their messages." value={chat.read_receipts !== false} onChange={(v) => toggleChat("read_receipts", v)} />
              <SwitchRow label="Typing indicator" description="Show when you're typing." value={chat.typing_indicators !== false} onChange={(v) => toggleChat("typing_indicators", v)} />
              <T variant="label" style={{ marginTop: 8, marginBottom: 8 }}>
                Wallpaper
              </T>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {WALLPAPERS.map((w) => {
                  const sel = ((chat as { wallpaper?: string }).wallpaper || "default") === w.id;
                  return (
                    <Pressable key={w.id} onPress={() => setWallpaper(w.id)} style={{ width: 92, gap: 6 }} accessibilityLabel={`${w.name} wallpaper`}>
                      <View style={{ height: 64, borderRadius: 12, overflow: "hidden", borderWidth: sel ? 2 : 1, borderColor: sel ? c.accent : c.border }}>
                        <ChatWallpaper id={w.id} />
                      </View>
                      <Text style={{ color: sel ? c.accentText : c.textMuted, fontSize: 12, textAlign: "center", fontFamily: sel ? "Figtree_600SemiBold" : "Figtree_500Medium" }}>{w.name}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </Card>
          </>
        ) : null}

        <Card>
          <T variant="h3" style={{ marginBottom: 10 }}>
            Appearance
          </T>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {(["system", "light", "dark"] as const).map((t) => (
              <Chip key={t} label={t === "system" ? "System" : t === "light" ? "Light" : "Dark"} selected={theme === t} onPress={() => setTheme(t)} />
            ))}
          </View>
          {canSeeGirls(user) ? <SwitchRow label="🌸 Girls Mode" description="Pink theme + Girls Corner feed." value={girlsMode} onChange={setGirlsMode} /> : null}
        </Card>

        {loggedIn && user ? (
          <Card>
            <T variant="h3">Security</T>
            <Row icon="key-outline" title="Change password" subtitle="We'll email you a secure reset link" onPress={sendReset} />
            <Divider />
            <Row icon="trash-outline" title="Delete account" subtitle="Permanently remove your account and listings" danger onPress={() => setDeleteOpen(true)} />
          </Card>
        ) : null}
      </View>
      <BrandFooter />

      <Sheet visible={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete account">
        <T variant="small" muted style={{ marginBottom: 12 }}>
          This removes your profile, listings and chats. It can't be undone. Signed up with Google? Set a password via “Change password” first.
        </T>
        <Input label="Password" secure value={deletePw} onChangeText={setDeletePw} />
        <Button kind="danger" title="Delete my account" loading={deleting} onPress={confirmDelete} />
        <Pressable onPress={() => setDeleteOpen(false)} style={{ alignItems: "center", padding: 12 }}>
          <Text style={{ color: c.textMuted, ...font.semibold }}>Keep my account</Text>
        </Pressable>
      </Sheet>
    </Screen>
  );
}
