import { Icon } from "@/components/ui/Icon";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View, type ScrollViewInstance } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { errorCode, errorMessage } from "@/api/client";
import { productApi } from "@/api/products";
import { deleteImage, uploadImage, type Uploaded } from "@/api/uploads";
import { userApi } from "@/api/user";
import { queueCelebration } from "@/components/home/Celebration";
import { PriceInsights } from "@/components/labs/Labs";
import { Badge, Button, Card, DateField, IconButton, Input, Loader, Select, SwitchRow, T } from "@/components/ui";
import {
  CONDITIONS,
  PAYMENT_OPTIONS,
  USAGE_DURATIONS,
  allowedUsage,
  categoryOf,
  labelOf,
  listingCategoriesFor,
  normalizeMultiline,
  rulesFor,
  usageConflict,
} from "@/constants/product";
import { toast } from "@/lib/toast";
import { canSeeGirls, useAuthStore } from "@/store/auth";
import { usePrefsStore } from "@/store/prefs";
import { font, useTheme } from "@/theme";
import { discountPct, inr } from "@/utils/format";
import type { PickupSpot, Product } from "@/types";

const DRAFT_KEY = "unideals-product-draft";
const MAX_PHOTOS = 3;
const STEPS = ["Details", "Photos", "Price & pickup", "Preview"];

type Photo = { key: string; uri: string; existing?: { url: string; fileId: string } };
type Form = {
  title: string;
  description: string;
  category: string;
  condition: string;
  usageDuration: string;
  brand: string;
  color: string;
  purchaseDate: string;
  sellingPrice: string;
  originalPrice: string;
  negotiable: boolean;
  paymentMethod: string;
  quantity: string;
  address: { name: string; detail: string } | null;
  termsAccepted: boolean;
  termsAcceptedAt: string | null;
  isGirlsOnly: boolean;
};
const EMPTY: Form = {
  title: "",
  description: "",
  category: "",
  condition: "",
  usageDuration: "",
  brand: "",
  color: "",
  purchaseDate: "",
  sellingPrice: "",
  originalPrice: "",
  negotiable: true,
  paymentMethod: "",
  quantity: "1",
  address: null,
  termsAccepted: false,
  termsAcceptedAt: null,
  isGirlsOnly: false,
};

// ── Validators (ported from frontend product/validations) ───────────────
const validateBasic = (f: Form) => {
  const e: Record<string, string> = {};
  const title = f.title.trim();
  if (!title) e.title = "Product title is required";
  else if (title.length < 3) e.title = "Title must be at least 3 characters";
  else if (title.length > 120) e.title = "Title must be under 120 characters";
  if (!f.category) e.category = "Please select a category";
  const d = normalizeMultiline(f.description);
  if (!d) e.description = "Description is required";
  else if (d.length < 10) e.description = "Description must be at least 10 characters";
  if (!f.condition) e.condition = "Please select product condition";
  if (!f.usageDuration) e.usageDuration = "Please select usage duration";
  else {
    const conflict = usageConflict(f.usageDuration, f.purchaseDate, f.condition, f.category);
    if (conflict) e.usageDuration = conflict;
  }
  if (!f.purchaseDate) e.purchaseDate = "Purchase date is required";
  else {
    const p = new Date(f.purchaseDate);
    if (Number.isNaN(p.getTime())) e.purchaseDate = "Enter a valid purchase date";
    else if (p > new Date()) e.purchaseDate = "Purchase date cannot be in the future";
    else if (p < new Date("2000-01-01")) e.purchaseDate = "Purchase date cannot be before year 2000";
  }
  return e;
};
const validatePhotos = (photos: Photo[]): Record<string, string> => (photos.length ? {} : { photos: "Add at least one photo" });
const validatePricing = (f: Form) => {
  const e: Record<string, string> = {};
  const s = Number(f.sellingPrice);
  const o = Number(f.originalPrice);
  if (!f.sellingPrice) e.sellingPrice = "Selling price is required";
  else if (!Number.isFinite(s) || s < 10) e.sellingPrice = "Enter a valid selling price of at least ₹10";
  else if (s > 10000000) e.sellingPrice = "Selling price is too large";
  if (!f.originalPrice) e.originalPrice = "Original price is required";
  else if (!Number.isFinite(o) || o <= 0) e.originalPrice = "Enter a valid original price greater than 0";
  else if (o > 10000000) e.originalPrice = "Original price is too large";
  if (!e.sellingPrice && !e.originalPrice) {
    if (s > o) e.sellingPrice = "Selling price cannot exceed original price";
    else if (s < o * 0.1) e.sellingPrice = "Discount cannot exceed 90% of original price";
  }
  const q = Number(f.quantity || 1);
  if (!Number.isInteger(q) || q < 1 || q > 99) e.quantity = "Quantity must be between 1 and 99";
  if (!f.paymentMethod) e.paymentMethod = "Select a payment method";
  if (!f.address) e.address = "Please add a pickup spot";
  if (!f.termsAccepted) e.termsAccepted = "Please accept the terms";
  return e;
};

const fromProduct = (p: Product): Form => ({
  title: p.title || "",
  description: p.description || "",
  category: p.category || "",
  condition: p.condition || "",
  usageDuration: p.attributes?.usage_duration || "",
  brand: p.attributes?.brand || "",
  color: p.attributes?.color || "",
  purchaseDate: p.attributes?.purchase_date ? String(p.attributes.purchase_date).slice(0, 10) : "",
  sellingPrice: p.selling_price != null ? String(p.selling_price) : "",
  originalPrice: p.original_price != null ? String(p.original_price) : "",
  negotiable: p.is_negotiable !== false,
  paymentMethod: p.payment_preference || "",
  quantity: String(p.quantity || 1),
  address: p.pickup_address_snapshot?.address_line
    ? { name: p.pickup_address_snapshot.address_line, detail: p.pickup_address_snapshot.city || "" }
    : null,
  termsAccepted: p.status === "draft" ? Boolean((p as any).terms_accepted_at) : true,
  termsAcceptedAt: (p as any).terms_accepted_at || null,
  isGirlsOnly: Boolean(p.isGirlsOnly),
});

export function ListingWizard({ editId }: { editId?: string }) {
  const { c, radius } = useTheme();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const girlsEligible = canSeeGirls(user);
  const girlsMode = usePrefsStore((s) => s.girlsMode) && girlsEligible;

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Form>(EMPTY);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stage, setStage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [newSpot, setNewSpot] = useState({ name: "", detail: "" });
  const scrollRef = useRef<ScrollViewInstance>(null);
  const isEdit = Boolean(editId);
  const isDraft = status === "draft";
  const busy = Boolean(stage);

  // Load the listing to edit (owner view, includes private fields).
  const existing = useQuery({
    queryKey: ["product-edit", editId],
    queryFn: () => productApi.detail(editId!, { view: "edit" }),
    enabled: isEdit,
    staleTime: 0,
  });
  useEffect(() => {
    const p = existing.data;
    if (!p) return;
    setForm(fromProduct(p));
    setStatus(p.status || null);
    setPhotos((p.images || []).map((im, i) => ({ key: im.fileId || `e${i}`, uri: im.url, existing: { url: im.url, fileId: im.fileId || "" } })));
    if (p.status === "draft") setStep(1);
  }, [existing.data]);

  // New listing: restore + autosave the text fields locally (like the web's draftStorage).
  const restored = useRef(false);
  useEffect(() => {
    if (isEdit || restored.current) return;
    restored.current = true;
    AsyncStorage.getItem(DRAFT_KEY)
      .then((raw) => raw && setForm((f) => ({ ...f, ...JSON.parse(raw) })))
      .catch(() => {});
  }, [isEdit]);
  useEffect(() => {
    if (isEdit) return undefined;
    const t = setTimeout(() => AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(form)).catch(() => {}), 800);
    return () => clearTimeout(t);
  }, [form, isEdit]);

  const spots = useQuery({ queryKey: ["pickup-spots"], queryFn: userApi.pickupSpots });
  useEffect(() => {
    // Preselect the primary spot for new listings.
    if (form.address || !spots.data?.length) return;
    const primary = spots.data.find((s) => s.isPrimary) || spots.data[0];
    setForm((f) => (f.address ? f : { ...f, address: { name: primary.name, detail: primary.detail } }));
  }, [spots.data, form.address]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  // Category-driven field rules (event passes lock condition/usage, etc.).
  const rules = rulesFor(form.category);
  useEffect(() => {
    setForm((f) => {
      const r = rulesFor(f.category);
      const next = { ...f };
      if (r.condition?.fixed) next.condition = r.condition.fixed;
      if (r.usage?.fixed) next.usageDuration = r.usage.fixed;
      if (r.color === "off") next.color = "";
      if (categoryOf(f.category)?.girlsOnly) next.isGirlsOnly = true;
      return next;
    });
  }, [form.category]);

  const usageOptions = USAGE_DURATIONS.filter((u) => allowedUsage(form.purchaseDate, form.condition, form.category).includes(u.value));
  const categories = listingCategoriesFor(girlsMode);

  const goNext = () => {
    const e = step === 1 ? validateBasic(form) : step === 2 ? validatePhotos(photos) : step === 3 ? validatePricing(form) : {};
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error(Object.values(e)[0]);
      return;
    }
    setStep((s) => Math.min(4, s + 1));
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };
  const goBack = () => (step > 1 ? setStep((s) => s - 1) : router.back());

  // ── Photos ──
  const addPhotos = async (camera: boolean) => {
    const room = MAX_PHOTOS - photos.length;
    if (room <= 0) return toast("You can add up to 3 photos");
    const perm = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", `Allow ${camera ? "camera" : "photo"} access in Settings to add pictures.`);
      return;
    }
    const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], quality: 0.9, allowsMultipleSelection: !camera, selectionLimit: room };
    const res = camera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
    if (res.canceled) return;
    const picked = res.assets.slice(0, room).map((a, i) => ({ key: `${Date.now()}-${i}`, uri: a.uri }));
    setPhotos((p) => [...p, ...picked]);
    setErrors((e) => ({ ...e, photos: "" }));
  };
  const makeCover = (key: string) => setPhotos((p) => [p.find((x) => x.key === key)!, ...p.filter((x) => x.key !== key)]);
  const removePhoto = (key: string) => setPhotos((p) => p.filter((x) => x.key !== key));

  /** Upload only new photos, all-or-nothing (rolls back on any failure). */
  const uploadNew = async (): Promise<{ url: string; fileId: string }[] | null> => {
    const fresh = photos.filter((p) => !p.existing);
    let uploads: Uploaded[] = [];
    if (fresh.length) {
      setStage("Uploading photos…");
      const results = await Promise.allSettled(fresh.map((p) => uploadImage(p.uri)));
      uploads = results.filter((r): r is PromiseFulfilledResult<Uploaded> => r.status === "fulfilled").map((r) => r.value);
      const failed = results.length - uploads.length;
      if (failed) {
        await Promise.allSettled(uploads.map((u) => deleteImage(u.fileId)));
        const firstErr = results.find((r) => r.status === "rejected") as PromiseRejectedResult | undefined;
        toast.error(`${failed} photo${failed > 1 ? "s" : ""} failed to upload. ${firstErr?.reason?.message || "Please retry."}`);
        return null;
      }
    }
    const queue = [...uploads];
    return photos.map((p) => p.existing || queue.shift()!).filter(Boolean);
  };

  const payload = (images: { url: string; fileId: string }[]) => ({
    title: form.title.trim(),
    description: normalizeMultiline(form.description),
    category: form.category,
    condition: form.condition,
    selling_price: Number(form.sellingPrice),
    original_price: Number(form.originalPrice),
    isGirlsOnly: Boolean(form.isGirlsOnly),
    is_negotiable: form.negotiable,
    payment_preference: form.paymentMethod,
    quantity: Number(form.quantity || 1),
    images,
    ...(form.address ? { pickup_address_snapshot: { address_line: form.address.name, city: form.address.detail } } : {}),
    terms_version: "v1",
    terms_accepted_at: form.termsAcceptedAt,
    attributes: {
      brand: form.brand.trim().slice(0, 100),
      color: form.color.trim().slice(0, 50),
      usage_duration: form.usageDuration,
      purchase_date: form.purchaseDate || null,
    },
  });

  const finish = async (productId?: string, message = "Saved", goHome = false) => {
    if (!isEdit) await AsyncStorage.removeItem(DRAFT_KEY).catch(() => {});
    qc.invalidateQueries({ queryKey: ["feed"] });
    qc.invalidateQueries({ queryKey: ["my-listings"] });
    qc.invalidateQueries({ queryKey: ["product"] });
    toast.success(message);
    if (!isEdit) {
      setForm(EMPTY);
      setPhotos([]);
      setStep(1);
    }
    if (goHome) router.replace("/");
    else if (productId) router.replace(`/product/${productId}`);
    else if (router.canGoBack()) router.back();
    else router.replace("/my-listings");
  };

  const handleError = (err: unknown, fallback: string) => {
    const code = errorCode(err);
    const msg = errorMessage(err, fallback);
    if (code === "LISTING_LIMIT" || code === "DRAFT_LIMIT" || /limit/i.test(msg)) {
      Alert.alert("Plan limit reached", msg, [
        { text: "Not now", style: "cancel" },
        { text: "See plans", onPress: () => router.push("/subscription") },
      ]);
    } else toast.error(msg);
  };

  const publish = async () => {
    const all = { ...validateBasic(form), ...validatePhotos(photos), ...validatePricing(form) };
    if (Object.keys(all).length) {
      setErrors(all);
      const first = Object.keys(all)[0];
      setStep(first === "photos" ? 2 : ["sellingPrice", "originalPrice", "paymentMethod", "address", "termsAccepted", "quantity"].includes(first) ? 3 : 1);
      toast.error(all[first]);
      return;
    }
    try {
      const images = await uploadNew();
      if (!images) return;
      setStage(isEdit && !isDraft ? "Saving changes…" : "Publishing listing…");
      if (isEdit) {
        const r = await productApi.update(editId!, { ...payload(images), ...(isDraft ? { status: "listed" } : {}) });
        if (r?.gamification) updateUser({ gamification: r.gamification as any });
        await finish(editId, isDraft ? "Your listing is live 🎉" : "Changes saved");
      } else {
        const r = await productApi.create(payload(images));
        if (r?.gamification) updateUser({ gamification: r.gamification as any });
        if (r.isFirstListing) {
          await queueCelebration();
          await finish(undefined, "Your first listing is live! 🎉", true);
        } else {
          await finish(r.data?._id, "Your listing is live 🎉");
        }
      }
    } catch (err) {
      handleError(err, "Failed to publish");
    } finally {
      setStage("");
    }
  };

  const saveDraft = async () => {
    if (form.title.trim().length < 3) {
      setStep(1);
      setErrors({ title: "Add a title (3+ characters) to save a draft" });
      return;
    }
    try {
      const images = await uploadNew();
      if (!images) return;
      setStage("Saving draft…");
      const body = { ...payload(images), status: "draft" };
      if (isEdit) await productApi.update(editId!, body);
      else await productApi.create(body);
      await finish(undefined, "Draft saved");
    } catch (err) {
      handleError(err, "Couldn't save the draft");
    } finally {
      setStage("");
    }
  };

  const addSpot = async () => {
    if (newSpot.name.trim().length < 2 || newSpot.detail.trim().length < 2) return toast.error("Add a spot name and a short detail");
    try {
      await userApi.createPickupSpot({ name: newSpot.name.trim(), detail: newSpot.detail.trim(), isPrimary: !spots.data?.length });
      set("address", { name: newSpot.name.trim(), detail: newSpot.detail.trim() });
      setNewSpot({ name: "", detail: "" });
      spots.refetch();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  if (isEdit && existing.isLoading) return <Loader />;

  const off = discountPct(Number(form.sellingPrice), Number(form.originalPrice));

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={styles.header}>
        <IconButton icon={step > 1 ? "chevron-back" : isEdit ? "close" : "chevron-back"} onPress={goBack} />
        <View style={{ flex: 1 }}>
          <T variant="h3">{isEdit ? (isDraft ? "Finish your draft" : "Edit listing") : "Sell an item"}</T>
          <T variant="caption" muted>
            Step {step} of 4 · {STEPS[step - 1]}
          </T>
        </View>
        {!isEdit || isDraft ? (
          <Pressable onPress={saveDraft} disabled={busy} hitSlop={8} style={{ paddingHorizontal: 10 }}>
            <Text style={{ color: c.accentText, fontSize: 14, ...font.semibold }}>Save draft</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.progress}>
        {STEPS.map((s, i) => (
          <View key={s} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < step ? c.accent : c.surfaceAlt }} />
        ))}
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {step === 1 ? (
            <>
              <Input
                label="Title"
                required
                value={form.title}
                onChangeText={(t) => set("title", t)}
                maxLength={120}
                placeholder={rules.titlePlaceholder || "e.g. Casio fx-991ES Plus calculator"}
                error={errors.title}
              />
              <Select label="Category" required value={form.category} options={categories} onChange={(v) => set("category", v)} error={errors.category} />
              <Select
                label="Condition"
                required
                value={form.condition}
                options={CONDITIONS}
                onChange={(v) => set("condition", v)}
                error={errors.condition}
                disabled={Boolean(rules.condition?.fixed)}
                hint={rules.condition?.why}
              />
              <DateField
                label="Purchase date"
                required
                value={form.purchaseDate}
                onChange={(v) => set("purchaseDate", v)}
                maximumDate={new Date()}
                minimumDate={new Date("2000-01-01")}
                error={errors.purchaseDate}
              />
              <Select
                label="How long have you used it?"
                required
                value={form.usageDuration}
                options={usageOptions}
                onChange={(v) => set("usageDuration", v)}
                error={errors.usageDuration}
                disabled={Boolean(rules.usage?.fixed)}
                hint={rules.usage?.why}
              />
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Input label="Brand" value={form.brand} onChangeText={(t) => set("brand", t)} maxLength={100} placeholder={rules.brandPlaceholder || "Optional"} />
                </View>
                {rules.color !== "off" ? (
                  <View style={{ flex: 1 }}>
                    <Input label="Colour" value={form.color} onChangeText={(t) => set("color", t)} maxLength={50} placeholder="Optional" />
                  </View>
                ) : null}
              </View>
              <Input
                label="Description"
                required
                multiline
                value={form.description}
                onChangeText={(t) => set("description", t)}
                maxLength={2000}
                placeholder="Condition details, what's included, why you're selling…"
                error={errors.description}
                hint={`${normalizeMultiline(form.description).length}/2000`}
              />
              {girlsEligible ? (
                <Card style={{ marginBottom: 10 }}>
                  <SwitchRow
                    label="🌸 Girls Corner only"
                    description={
                      categoryOf(form.category)?.girlsOnly
                        ? "This category is always girls-only."
                        : "Only verified female students can see and message this listing."
                    }
                    value={form.isGirlsOnly}
                    disabled={Boolean(categoryOf(form.category)?.girlsOnly)}
                    onChange={(v) => set("isGirlsOnly", v)}
                  />
                </Card>
              ) : null}
            </>
          ) : null}

          {step === 2 ? (
            <>
              <T variant="body" muted style={{ marginBottom: 14 }}>
                Add up to 3 clear photos. The first one is the cover buyers see in the feed.
              </T>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {photos.map((p, i) => (
                  <View key={p.key} style={[styles.photo, { borderRadius: radius.md, backgroundColor: c.surfaceAlt }]}>
                    <Image source={{ uri: p.uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
                    {i === 0 ? (
                      <View style={{ position: "absolute", left: 6, top: 6 }}>
                        <Badge label="Cover" tone="accent" />
                      </View>
                    ) : (
                      <Pressable onPress={() => makeCover(p.key)} style={styles.photoAction}>
                        <Text style={{ color: "#fff", fontSize: 11, ...font.bold }}>Make cover</Text>
                      </Pressable>
                    )}
                    <Pressable onPress={() => removePhoto(p.key)} style={styles.photoRemove} hitSlop={6} accessibilityLabel="Remove photo">
                      <Icon name="close" size={16} color="#fff" />
                    </Pressable>
                  </View>
                ))}
                {photos.length < MAX_PHOTOS ? (
                  <View style={{ gap: 10 }}>
                    <Pressable onPress={() => addPhotos(false)} style={[styles.addPhoto, { borderColor: errors.photos ? c.danger : c.borderStrong, borderRadius: radius.md }]}>
                      <Icon name="images-outline" size={24} color={c.accentText} />
                      <T variant="caption" color={c.accentText} style={font.semibold}>
                        Gallery
                      </T>
                    </Pressable>
                    <Pressable onPress={() => addPhotos(true)} style={[styles.addPhoto, { borderColor: c.borderStrong, borderRadius: radius.md }]}>
                      <Icon name="camera-outline" size={24} color={c.accentText} />
                      <T variant="caption" color={c.accentText} style={font.semibold}>
                        Camera
                      </T>
                    </Pressable>
                  </View>
                ) : null}
              </View>
              {errors.photos ? (
                <T variant="small" color={c.danger} style={{ marginTop: 8 }}>
                  {errors.photos}
                </T>
              ) : null}
              <Card style={{ marginTop: 18, backgroundColor: c.accentSoft, borderColor: "transparent" }}>
                <T variant="small" color={c.accentText}>
                  Tip: shoot in daylight on a plain background and include any scratches or wear. Honest photos sell faster.
                </T>
              </Card>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <PriceInsights category={form.category} condition={form.condition} onUsePrice={(n) => set("sellingPrice", String(n))} />
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Input label="Selling price" required prefix="₹" keyboardType="number-pad" value={form.sellingPrice} onChangeText={(t) => set("sellingPrice", t.replace(/\D/g, ""))} error={errors.sellingPrice} />
                </View>
                <View style={{ flex: 1 }}>
                  <Input label="Original price" required prefix="₹" keyboardType="number-pad" value={form.originalPrice} onChangeText={(t) => set("originalPrice", t.replace(/\D/g, ""))} error={errors.originalPrice} />
                </View>
              </View>
              {off > 0 && !errors.sellingPrice ? (
                <T variant="small" color={c.success} style={{ marginTop: -6, marginBottom: 12 }}>
                  Buyers save {off}% ({inr(Number(form.originalPrice) - Number(form.sellingPrice))})
                </T>
              ) : null}
              <Select label="Payment method" required value={form.paymentMethod} options={PAYMENT_OPTIONS} onChange={(v) => set("paymentMethod", v)} error={errors.paymentMethod} />
              <Input label="Quantity" keyboardType="number-pad" value={form.quantity} onChangeText={(t) => set("quantity", t.replace(/\D/g, "").slice(0, 2))} error={errors.quantity} hint="How many identical items you have (1–99)" />
              <Card style={{ marginBottom: 14 }}>
                <SwitchRow label="Open to offers" description="Buyers can send price offers in chat." value={form.negotiable} onChange={(v) => set("negotiable", v)} />
              </Card>

              <T variant="label" style={{ marginBottom: 8 }}>
                Pickup spot <Text style={{ color: c.danger }}>*</Text>
              </T>
              <T variant="small" muted style={{ marginBottom: 10 }}>
                Use a public campus spot (library, canteen, main gate). Never your room.
              </T>
              {(spots.data || []).map((s: PickupSpot) => {
                const sel = form.address?.name === s.name && form.address?.detail === s.detail;
                return (
                  <Pressable
                    key={s._id}
                    onPress={() => set("address", { name: s.name, detail: s.detail })}
                    style={[styles.spot, { borderColor: sel ? c.accent : c.border, backgroundColor: sel ? c.accentSoft : c.card, borderRadius: radius.md }]}
                  >
                    <Icon name={sel ? "radio-button-on" : "radio-button-off"} size={20} color={sel ? c.accent : c.textFaint} />
                    <View style={{ flex: 1 }}>
                      <T variant="h3" style={{ fontSize: 15 }}>
                        {s.name}
                      </T>
                      <T variant="small" muted>
                        {s.detail}
                      </T>
                    </View>
                    {s.isPrimary ? <Badge label="Primary" tone="accent" /> : null}
                  </Pressable>
                );
              })}
              {(spots.data?.length || 0) < 3 ? (
                <Card style={{ marginBottom: 14 }}>
                  <T variant="label" style={{ marginBottom: 8 }}>
                    Add a pickup spot
                  </T>
                  <Input placeholder="Spot name, e.g. Central Library" value={newSpot.name} onChangeText={(t) => setNewSpot((s) => ({ ...s, name: t }))} maxLength={80} />
                  <Input placeholder="Detail, e.g. Ground floor entrance" value={newSpot.detail} onChangeText={(t) => setNewSpot((s) => ({ ...s, detail: t }))} maxLength={180} />
                  <Button kind="soft" size="sm" icon="add" title="Save spot" onPress={addSpot} />
                </Card>
              ) : null}
              {errors.address ? (
                <T variant="small" color={c.danger} style={{ marginBottom: 10 }}>
                  {errors.address}
                </T>
              ) : null}

              <Pressable
                onPress={() => {
                  const v = !form.termsAccepted;
                  setForm((f) => ({ ...f, termsAccepted: v, termsAcceptedAt: v ? new Date().toISOString() : null }));
                  setErrors((e) => ({ ...e, termsAccepted: "" }));
                }}
                style={{ flexDirection: "row", gap: 10, alignItems: "flex-start", marginTop: 4 }}
              >
                <Icon name={form.termsAccepted ? "checkbox" : "square-outline"} size={22} color={form.termsAccepted ? c.accent : errors.termsAccepted ? c.danger : c.textMuted} />
                <T variant="small" muted style={{ flex: 1 }}>
                  I confirm this item is mine to sell, is described honestly, and follows the{" "}
                  <Text style={{ color: c.accentText, ...font.semibold }} onPress={() => router.push("/legal/terms")}>
                    Unideals listing terms
                  </Text>
                  .
                </T>
              </Pressable>
              {errors.termsAccepted ? (
                <T variant="small" color={c.danger} style={{ marginTop: 6 }}>
                  {errors.termsAccepted}
                </T>
              ) : null}
            </>
          ) : null}

          {step === 4 ? (
            <>
              {photos[0] ? (
                <Image source={{ uri: photos[0].uri }} style={{ width: "100%", aspectRatio: 1.2, borderRadius: radius.lg, backgroundColor: c.surfaceAlt }} contentFit="cover" />
              ) : null}
              <View style={{ gap: 8, marginTop: 14 }}>
                <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
                  {categoryOf(form.category) ? <Badge label={categoryOf(form.category)!.label} tone="accent" /> : null}
                  {form.isGirlsOnly ? <Badge label="🌸 Girls only" tone="accent" /> : null}
                  {form.negotiable ? <Badge label="Negotiable" tone="info" /> : null}
                </View>
                <T variant="h1">{form.title || "Untitled"}</T>
                <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
                  <Text style={{ color: c.text, fontSize: 26, ...font.black }}>{inr(Number(form.sellingPrice))}</Text>
                  {off > 0 ? <Text style={{ color: c.textFaint, textDecorationLine: "line-through" }}>{inr(Number(form.originalPrice))}</Text> : null}
                </View>
                <Card>
                  {[
                    ["Condition", labelOf(CONDITIONS, form.condition)],
                    ["Used for", labelOf(USAGE_DURATIONS, form.usageDuration)],
                    ["Brand", form.brand],
                    ["Colour", form.color],
                    ["Payment", labelOf(PAYMENT_OPTIONS, form.paymentMethod)],
                    ["Pickup", form.address ? `${form.address.name} · ${form.address.detail}` : ""],
                    ["Photos", `${photos.length}`],
                  ]
                    .filter(([, v]) => v)
                    .map(([k, v]) => (
                      <View key={k} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, gap: 10 }}>
                        <T variant="small" muted>
                          {k}
                        </T>
                        <T variant="small" style={{ ...font.semibold, flexShrink: 1, textAlign: "right" }}>
                          {v}
                        </T>
                      </View>
                    ))}
                </Card>
                <T variant="body" muted>
                  {normalizeMultiline(form.description)}
                </T>
              </View>
            </>
          ) : null}
        </ScrollView>

        <View style={[styles.footer, { borderColor: c.border, backgroundColor: c.bg }]}>
          {stage ? (
            <T variant="small" muted center style={{ marginBottom: 8 }}>
              {stage}
            </T>
          ) : null}
          {step < 4 ? (
            <Button title="Continue" onPress={goNext} size="lg" disabled={busy} />
          ) : (
            <Button
              title={isEdit && !isDraft ? "Save changes" : "Publish listing"}
              icon={isEdit && !isDraft ? "checkmark" : "rocket-outline"}
              onPress={publish}
              loading={busy}
              size="lg"
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 6, paddingVertical: 4 },
  progress: { flexDirection: "row", gap: 6, paddingHorizontal: 16, paddingBottom: 6 },
  photo: { width: 104, height: 104, overflow: "hidden" },
  photoAction: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.55)", paddingVertical: 4, alignItems: "center" },
  photoRemove: { position: "absolute", right: 5, top: 5, width: 24, height: 24, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center" },
  addPhoto: { width: 104, height: 47, borderWidth: 1.5, borderStyle: "dashed", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6 },
  spot: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderWidth: 1, marginBottom: 8 },
  footer: { padding: 16, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth },
});
