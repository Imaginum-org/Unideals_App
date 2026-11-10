import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Alert,
  Animated,
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  type ScrollViewInstance,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { errorCode, errorMessage } from "@/api/client";
import { productApi } from "@/api/products";
import { deleteImage, uploadImage, type Uploaded } from "@/api/uploads";
import { userApi } from "@/api/user";
import { queueCelebration } from "@/components/home/Celebration";
import { PriceInsights } from "@/components/labs/Labs";
import { CategoryIcon } from "@/components/product/CategoryIcon";
import { ProductCard } from "@/components/product/ProductCard";
import { ActionSheet, Button, DateField, IconButton, Loader, Pressy } from "@/components/ui";
import { LinearGradient } from "expo-linear-gradient";
import { Icon, type IconName } from "@/components/ui/Icon";
import { CONDITIONS, PAYMENT_OPTIONS, USAGE_DURATIONS, allowedUsage, categoryOf, labelOf, listingCategoriesFor, normalizeMultiline, rulesFor, usageConflict } from "@/constants/product";
import { draftDescription, guessFromTitle, purchaseDateShortcuts, suggestPrice } from "@/content/listingSmarts";
import { haptic } from "@/lib/haptics";
import { toast } from "@/lib/toast";
import { canSeeGirls, useAuthStore } from "@/store/auth";
import { usePrefsStore } from "@/store/prefs";
import { font, shadow, useTheme } from "@/theme";
import { discountPct, inr } from "@/utils/format";
import type { PickupSpot, Product } from "@/types";

const DRAFT_KEY = "unideals-product-draft";
const MAX_PHOTOS = 3;
const STEPS = ["Details", "Photos", "Price", "Review"];
const CONDITION_HINT: Record<string, string> = {
  brand_new: "Unused — sealed, or tags still on",
  like_new: "Used a few times, no visible wear",
  gently_used: "Light signs of use, works perfectly",
  well_used: "Visible wear, still does the job",
  for_parts_or_not_working: "Needs repair, or sold for parts",
};
const PAYMENT_ICON: Record<string, IconName> = { cash: "wallet-outline", upi: "zap", both: "handshake" };

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

// ── Validators (same rules as frontend product/validations) ─────────────
const validateBasic = (f: Form) => {
  const e: Record<string, string> = {};
  const title = f.title.trim();
  if (!title) e.title = "Give your item a title";
  else if (title.length < 3) e.title = "Title must be at least 3 characters";
  else if (title.length > 120) e.title = "Title must be under 120 characters";
  if (!f.category) e.category = "Pick a category";
  if (!f.condition) e.condition = "Pick the condition";
  if (!f.purchaseDate) e.purchaseDate = "Add roughly when you bought it";
  else {
    const p = new Date(f.purchaseDate);
    if (Number.isNaN(p.getTime())) e.purchaseDate = "Enter a valid purchase date";
    else if (p > new Date()) e.purchaseDate = "Purchase date cannot be in the future";
    else if (p < new Date("2000-01-01")) e.purchaseDate = "Purchase date cannot be before year 2000";
  }
  if (!f.usageDuration) e.usageDuration = "How long have you used it?";
  else {
    const conflict = usageConflict(f.usageDuration, f.purchaseDate, f.condition, f.category);
    if (conflict) e.usageDuration = conflict;
  }
  const d = normalizeMultiline(f.description);
  if (!d) e.description = "Add a short description";
  else if (d.length < 10) e.description = "Description must be at least 10 characters";
  return e;
};
const validatePhotos = (photos: Photo[]): Record<string, string> => (photos.length ? {} : { photos: "Add at least one photo" });
const validatePricing = (f: Form) => {
  const e: Record<string, string> = {};
  const s = Number(f.sellingPrice);
  const o = Number(f.originalPrice);
  if (!f.sellingPrice) e.sellingPrice = "Set your price";
  else if (!Number.isFinite(s) || s < 10) e.sellingPrice = "Price must be at least ₹10";
  else if (s > 10000000) e.sellingPrice = "Selling price is too large";
  if (!f.originalPrice) e.originalPrice = "Add what it cost new";
  else if (!Number.isFinite(o) || o <= 0) e.originalPrice = "Enter a valid original price";
  else if (o > 10000000) e.originalPrice = "Original price is too large";
  if (!e.sellingPrice && !e.originalPrice) {
    if (s > o) e.sellingPrice = "Your price can't be more than the original price";
    else if (s < o * 0.1) e.sellingPrice = "Discount cannot exceed 90% of original price";
  }
  const q = Number(f.quantity || 1);
  if (!Number.isInteger(q) || q < 1 || q > 99) e.quantity = "Quantity must be between 1 and 99";
  if (!f.paymentMethod) e.paymentMethod = "Choose how you'll accept payment";
  if (!f.address) e.address = "Add a pickup spot";
  if (!f.termsAccepted) e.termsAccepted = "Please confirm the listing terms";
  return e;
};
const STEP_OF: Record<string, number> = {
  title: 1, category: 1, condition: 1, purchaseDate: 1, usageDuration: 1, description: 1,
  photos: 2,
  sellingPrice: 3, originalPrice: 3, paymentMethod: 3, quantity: 3, address: 3, termsAccepted: 3,
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
  address: p.pickup_address_snapshot?.address_line ? { name: p.pickup_address_snapshot.address_line, detail: p.pickup_address_snapshot.city || "" } : null,
  termsAccepted: p.status === "draft" ? Boolean((p as any).terms_accepted_at) : true,
  termsAcceptedAt: (p as any).terms_accepted_at || null,
  isGirlsOnly: Boolean(p.isGirlsOnly),
});

// ── Building blocks ─────────────────────────────────────────────────────
function Block({ title, hint, required, error, children, right }: { title: string; hint?: string; required?: boolean; error?: string; children: ReactNode; right?: ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={{ marginBottom: 24 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-end", marginBottom: 10, gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: c.text, fontSize: 15, ...font.semibold }}>
            {title}
            {required ? <Text style={{ color: c.danger }}> *</Text> : null}
          </Text>
          {hint ? <Text style={{ color: c.textMuted, fontSize: 12.5, marginTop: 2, ...font.regular }}>{hint}</Text> : null}
        </View>
        {right}
      </View>
      {children}
      {error ? <ErrorLine text={error} /> : null}
    </View>
  );
}

function ErrorLine({ text }: { text: string }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 7 }}>
      <Icon name="alert-circle" size={13} color={c.danger} />
      <Text style={{ color: c.danger, fontSize: 12.5, flex: 1, ...font.medium }}>{text}</Text>
    </View>
  );
}

function Field(p: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
  keyboardType?: "default" | "number-pad";
  error?: boolean;
  prefix?: string;
  big?: boolean;
  strong?: boolean;
}) {
  const { c } = useTheme();
  const [focus, setFocus] = useState(false);
  return (
    <View
      style={[
        styles.field,
        {
          backgroundColor: c.card,
          borderColor: p.error ? c.danger : focus ? c.accent : c.dark ? "#2A2D35" : "#E2E8F0",
          minHeight: p.multiline ? 128 : p.big ? 58 : 50,
          alignItems: p.multiline ? "flex-start" : "center",
        },
      ]}
    >
      {p.prefix ? <Text style={{ color: c.textMuted, fontSize: p.big ? 22 : 16, includeFontPadding: false, ...font.semibold }}>{p.prefix}</Text> : null}
      <TextInput
        value={p.value}
        onChangeText={p.onChangeText}
        placeholder={p.placeholder}
        placeholderTextColor={c.textFaint}
        multiline={p.multiline}
        maxLength={p.maxLength}
        keyboardType={p.keyboardType}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          flex: 1,
          color: c.text,
          fontSize: p.big ? 22 : 15.5,
          fontFamily: p.strong ? "Figtree_700Bold" : p.big ? "Figtree_500Medium" : "Figtree_400Regular",
          textAlignVertical: p.multiline ? "top" : "center",
          includeFontPadding: false,
          paddingVertical: 0,
          paddingTop: p.multiline ? 12 : 0,
          // A fixed single-line height centres text + placeholder on Android.
          height: p.multiline ? undefined : p.big ? 56 : 48,
          minHeight: p.multiline ? 116 : undefined,
        }}
      />
    </View>
  );
}

function OptionCard({ selected, onPress, title, hint, icon, disabled }: { selected: boolean; onPress: () => void; title: string; hint?: string; icon?: IconName; disabled?: boolean }) {
  const { c } = useTheme();
  return (
    <Pressy
      disabled={disabled}
      onPress={() => {
        haptic.select();
        onPress();
      }}
      scaleTo={0.98}
      style={[styles.option, { backgroundColor: selected ? c.accentSoft : c.card, borderColor: selected ? c.accent : c.dark ? "#2A2D35" : "#E2E8F0", opacity: disabled ? 0.5 : 1 }]}
      accessibilityState={{ selected }}
    >
      {icon ? (
        <View style={[styles.optionIcon, { backgroundColor: selected ? c.accent : c.surface }]}>
          <Icon name={icon} size={16} color={selected ? "#fff" : c.textMuted} />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={{ color: c.text, fontSize: 14.5, ...font.semibold }}>{title}</Text>
        {hint ? <Text style={{ color: c.textMuted, fontSize: 12.5, marginTop: 1, ...font.regular }}>{hint}</Text> : null}
      </View>
      <View style={[styles.radio, { borderColor: selected ? c.accent : c.borderStrong }]}>{selected ? <View style={[styles.radioDot, { backgroundColor: c.accent }]} /> : null}</View>
    </Pressy>
  );
}

function Pill({ label, selected, onPress, disabled }: { label: string; selected: boolean; onPress: () => void; disabled?: boolean }) {
  const { c } = useTheme();
  return (
    <Pressy
      disabled={disabled}
      onPress={() => {
        haptic.select();
        onPress();
      }}
      scaleTo={0.94}
      style={[styles.pill, { backgroundColor: selected ? c.accent : c.card, borderColor: selected ? c.accent : c.dark ? "#2A2D35" : "#E2E8F0", opacity: disabled ? 0.4 : 1 }]}
      accessibilityState={{ selected, disabled }}
    >
      <Text style={{ color: selected ? "#fff" : c.text, fontSize: 13, includeFontPadding: false, ...font.semibold }}>{label}</Text>
    </Pressy>
  );
}

function PhotoSlot({ photo, label, big, cover, onAdd, onRemove, onMakeCover, error, disabled }: { photo?: Photo; label: string; big?: boolean; cover?: boolean; onAdd: () => void; onRemove: () => void; onMakeCover?: () => void; error?: boolean; disabled?: boolean }) {
  const { c } = useTheme();
  const ratio = big ? 0.82 : 1.25;
  if (photo) {
    return (
      <View style={[styles.slot, { aspectRatio: ratio, backgroundColor: c.surfaceAlt }]}>
        <Image source={{ uri: photo.uri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
        {cover ? (
          <View style={styles.coverTag}>
            <Icon name="star" size={11} color="#FACC15" filled />
            <Text style={{ color: "#fff", fontSize: 11, ...font.bold }}>Cover</Text>
          </View>
        ) : onMakeCover ? (
          <Pressable onPress={onMakeCover} style={styles.makeCover} hitSlop={6} accessibilityLabel="Make this the cover photo">
            <Icon name="star" size={13} color="#fff" />
          </Pressable>
        ) : null}
        <Pressable onPress={onRemove} style={styles.remove} hitSlop={6} accessibilityLabel="Remove photo">
          <Icon name="close" size={14} color="#fff" strokeWidth={2.6} />
        </Pressable>
      </View>
    );
  }
  return (
    <Pressy
      onPress={onAdd}
      disabled={disabled}
      scaleTo={0.97}
      style={[
        styles.slot,
        styles.emptySlot,
        { aspectRatio: ratio, borderColor: error ? c.danger : disabled ? c.border : c.accentSoftStrong, backgroundColor: disabled ? c.surface : c.accentSoft, opacity: disabled ? 0.55 : 1 },
      ]}
      accessibilityLabel={label || "Photo slot"}
    >
      <View style={[styles.camCircle, { backgroundColor: disabled ? c.surfaceAlt : c.card, width: big ? 52 : 36, height: big ? 52 : 36 }]}>
        <Icon name="camera-outline" size={big ? 24 : 17} color={disabled ? c.textFaint : c.accentText} />
      </View>
      {label ? <Text style={{ color: disabled ? c.textFaint : c.accentText, fontSize: big ? 13.5 : 11.5, ...font.semibold }}>{label}</Text> : null}
      {big ? <Text style={{ color: c.textMuted, fontSize: 11.5, ...font.regular }}>Camera or gallery</Text> : null}
    </Pressy>
  );
}

// ── Wizard ──────────────────────────────────────────────────────────────
export function ListingWizard({ editId }: { editId?: string }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
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
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [newSpot, setNewSpot] = useState({ name: "", detail: "" });
  const [photoSheet, setPhotoSheet] = useState(false);
  const [addingSpot, setAddingSpot] = useState(false);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const bar = useRef(new Animated.Value(0.25)).current;
  const isEdit = Boolean(editId);
  const isDraft = status === "draft";
  const busy = Boolean(stage);

  useEffect(() => {
    Animated.spring(bar, { toValue: step / 4, useNativeDriver: false, speed: 14, bounciness: 4 }).start();
  }, [step, bar]);

  const existing = useQuery({ queryKey: ["product-edit", editId], queryFn: () => productApi.detail(editId!, { view: "edit" }), enabled: isEdit, staleTime: 0 });
  useEffect(() => {
    const p = existing.data;
    if (!p) return;
    setForm(fromProduct(p));
    setStatus(p.status || null);
    setPhotos((p.images || []).map((im, i) => ({ key: im.fileId || `e${i}`, uri: im.url, existing: { url: im.url, fileId: im.fileId || "" } })));
  }, [existing.data]);

  // New listing: restore + autosave text fields (photos aren't kept, same as web).
  const restoredOnce = useRef(false);
  useEffect(() => {
    if (isEdit || restoredOnce.current) return;
    restoredOnce.current = true;
    AsyncStorage.getItem(DRAFT_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw) as Partial<Form>;
        if (saved.title || saved.description || saved.category) {
          setForm((f) => ({ ...f, ...saved }));
          setRestored(true);
        }
      })
      .catch(() => {});
  }, [isEdit]);
  useEffect(() => {
    if (isEdit) return undefined;
    const t = setTimeout(() => AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(form)).catch(() => {}), 700);
    return () => clearTimeout(t);
  }, [form, isEdit]);

  const spots = useQuery({ queryKey: ["pickup-spots"], queryFn: userApi.pickupSpots });
  useEffect(() => {
    if (form.address || !spots.data?.length) return;
    const primary = spots.data.find((s) => s.isPrimary) || spots.data[0];
    setForm((f) => (f.address ? f : { ...f, address: { name: primary.name, detail: primary.detail } }));
  }, [spots.data, form.address]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => (e[k as string] ? { ...e, [k]: "" } : e));
    setDirty(true);
  };

  // Category rules: event passes lock condition/usage, books have no colour…
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

  const categories = listingCategoriesFor(girlsMode);
  const allowed = allowedUsage(form.purchaseDate, form.condition, form.category);
  const guess = useMemo(
    () => guessFromTitle(form.title, { allowedCategories: categories.map((x) => x.value) }) as { category?: string; brand?: string },
    [form.title, categories],
  );
  const suggestion = !form.category && guess.category ? categoryOf(guess.category) : null;
  const priceTip = suggestPrice({ originalPrice: Number(form.originalPrice), condition: form.condition, purchaseDate: form.purchaseDate }) as number | null;

  // Android back steps backwards inside the flow.
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (busy) return true;
      if (step > 1) {
        setStep((s) => s - 1);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [step, busy]);

  const scrollTop = () => scrollRef.current?.scrollTo({ y: 0, animated: true });
  const goNext = () => {
    const e = step === 1 ? validateBasic(form) : step === 2 ? validatePhotos(photos) : step === 3 ? validatePricing(form) : {};
    setErrors(e);
    if (Object.keys(e).length) {
      haptic.error();
      toast.error(Object.values(e)[0]);
      return;
    }
    haptic.tap();
    setStep((s) => Math.min(4, s + 1));
    scrollTop();
  };
  const leave = () => (router.canGoBack() ? router.back() : router.replace("/"));
  const goBack = () => {
    if (step > 1) {
      setStep((s) => s - 1);
      scrollTop();
      return;
    }
    if (isEdit && dirty) {
      Alert.alert("Discard changes?", "Your edits to this listing haven't been saved.", [
        { text: "Keep editing", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: leave },
      ]);
    } else leave();
  };
  const jumpTo = (n: number) => {
    if (n < step) {
      setStep(n);
      scrollTop();
    }
  };

  // ── Photos ──
  const pick = async (camera: boolean) => {
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
    haptic.success();
    setPhotos((p) => [...p, ...res.assets.slice(0, room).map((a, i) => ({ key: `${Date.now()}-${i}`, uri: a.uri }))]);
    setErrors((e) => ({ ...e, photos: "" }));
    setDirty(true);
  };
  const addPhoto = () => {
    if (photos.length >= MAX_PHOTOS) return toast("You can add up to 3 photos");
    haptic.tap();
    setPhotoSheet(true);
  };
  const makeCover = (key: string) => {
    haptic.select();
    setPhotos((p) => [p.find((x) => x.key === key)!, ...p.filter((x) => x.key !== key)]);
  };
  const removePhoto = (key: string) => {
    haptic.tap();
    setPhotos((p) => p.filter((x) => x.key !== key));
    setDirty(true);
  };

  /** Upload new photos one at a time (visible progress), all-or-nothing. */
  const uploadNew = async (): Promise<{ url: string; fileId: string }[] | null> => {
    const fresh = photos.filter((p) => !p.existing);
    const uploads: Uploaded[] = [];
    for (let i = 0; i < fresh.length; i++) {
      setStage(`Uploading photo ${i + 1} of ${fresh.length}…`);
      setProgress(i / Math.max(1, fresh.length));
      try {
        uploads.push(await uploadImage(fresh[i].uri));
      } catch (err) {
        await Promise.allSettled(uploads.map((u) => deleteImage(u.fileId)));
        haptic.error();
        toast.error(`Photo ${i + 1} failed to upload. ${(err as Error)?.message || "Please retry."}`);
        return null;
      }
    }
    setProgress(1);
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
    attributes: { brand: form.brand.trim().slice(0, 100), color: form.color.trim().slice(0, 50), usage_duration: form.usageDuration, purchase_date: form.purchaseDate || null },
  });

  const finish = async (productId?: string, message = "Saved", goHome = false) => {
    if (!isEdit) await AsyncStorage.removeItem(DRAFT_KEY).catch(() => {});
    ["feed", "my-listings", "product", "boost-summary"].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
    haptic.success();
    toast.success(message);
    if (!isEdit) {
      setForm(EMPTY);
      setPhotos([]);
      setStep(1);
      setDirty(false);
      setRestored(false);
    }
    if (goHome) router.replace("/");
    else if (productId) router.replace(`/product/${productId}`);
    else if (router.canGoBack()) router.back();
    else router.replace("/my-listings");
  };

  const handleError = (err: unknown, fallback: string) => {
    haptic.error();
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
      setStep(STEP_OF[first] || 1);
      haptic.error();
      toast.error(all[first]);
      return;
    }
    try {
      const images = await uploadNew();
      if (!images) return;
      setStage(isEdit && !isDraft ? "Saving changes…" : "Publishing your listing…");
      if (isEdit) {
        const r = await productApi.update(editId!, { ...payload(images), ...(isDraft ? { status: "listed" } : {}) });
        if (r?.gamification) updateUser({ gamification: r.gamification as any });
        await finish(editId, isDraft ? "Your listing is live. Let the DMs roll in." : "Changes saved");
      } else {
        const r = await productApi.create(payload(images));
        if (r?.gamification) updateUser({ gamification: r.gamification as any });
        if (r.isFirstListing) {
          await queueCelebration();
          await finish(undefined, "Your first listing is live. Main character move.", true);
        } else await finish(r.data?._id, "Your listing is live. Let the DMs roll in.");
      }
    } catch (err) {
      handleError(err, "Failed to publish");
    } finally {
      setStage("");
      setProgress(0);
    }
  };

  const saveDraft = async () => {
    if (form.title.trim().length < 3) {
      setStep(1);
      setErrors({ title: "Add a title (3+ characters) to save a draft" });
      haptic.error();
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
      setProgress(0);
    }
  };

  const startFresh = () => {
    setForm(EMPTY);
    setRestored(false);
    setErrors({});
    AsyncStorage.removeItem(DRAFT_KEY).catch(() => {});
  };

  const addSpot = async () => {
    if (newSpot.name.trim().length < 2 || newSpot.detail.trim().length < 2) return toast.error("Add a spot name and a short detail");
    try {
      await userApi.createPickupSpot({ name: newSpot.name.trim(), detail: newSpot.detail.trim(), isPrimary: !spots.data?.length });
      set("address", { name: newSpot.name.trim(), detail: newSpot.detail.trim() });
      setNewSpot({ name: "", detail: "" });
      setAddingSpot(false);
      haptic.success();
      spots.refetch();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  if (isEdit && existing.isLoading) return <Loader label="Opening your listing…" />;

  const off = discountPct(Number(form.sellingPrice), Number(form.originalPrice));
  const tile = Math.floor((width - 32 - 24) / 4);
  const preview: Product = {
    _id: "preview",
    title: form.title || "Your item title",
    category: form.category || "others",
    condition: form.condition,
    images: photos[0] ? [{ url: photos[0].uri }] : [],
    selling_price: Number(form.sellingPrice) || 0,
    original_price: Number(form.originalPrice) || undefined,
    isGirlsOnly: form.isGirlsOnly,
    seller: user ? { _id: user._id, name: user.name, avatar: user.avatar, subscription: user.subscription, role: user.role } : undefined,
  };
  const stepTitle = { color: c.text, fontSize: 24, letterSpacing: -0.5, ...font.bold };
  const stepSub = { color: c.textMuted, fontSize: 14, marginTop: 4, marginBottom: 20, ...font.regular };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: c.barSolid }}>
      <ActionSheet
        visible={photoSheet}
        onClose={() => setPhotoSheet(false)}
        title="Add a photo"
        subtitle="Daylight + a plain background sells faster."
        actions={[
          { label: "Take a photo", description: "Open the camera", icon: "camera-outline", onPress: () => pick(true) },
          { label: "Choose from gallery", description: `Pick up to ${MAX_PHOTOS - photos.length} photo${MAX_PHOTOS - photos.length === 1 ? "" : "s"}`, icon: "image-plus", onPress: () => pick(false) },
        ]}
      />
      {/* Header + stepper */}
      <View style={[styles.header, { borderColor: c.border }]}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <IconButton icon={step > 1 ? "chevron-back" : "close"} onPress={goBack} accessibilityLabel={step > 1 ? "Previous step" : "Close"} />
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ color: c.text, fontSize: 16, ...font.semibold }}>{isEdit ? (isDraft ? "Finish your draft" : "Edit listing") : "Sell an item"}</Text>
          </View>
          {!isEdit || isDraft ? (
            <Pressable onPress={saveDraft} disabled={busy} hitSlop={8} style={[styles.draftBtn, { borderColor: c.border }]}>
              <Text style={{ color: c.text, fontSize: 12.5, ...font.semibold }}>Save draft</Text>
            </Pressable>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>
        <View style={styles.steps}>
          {STEPS.map((label, i) => {
            const n = i + 1;
            const done = n < step;
            const active = n === step;
            return (
              <Pressable key={label} onPress={() => jumpTo(n)} disabled={n >= step} style={{ flex: 1, alignItems: "center", gap: 4 }} accessibilityLabel={`Step ${n}: ${label}`}>
                <View style={[styles.stepDot, { backgroundColor: done || active ? c.accent : c.surfaceAlt }]}>
                  {done ? <Icon name="checkmark" size={11} color="#fff" strokeWidth={3} /> : <Text style={{ color: active ? "#fff" : c.textFaint, fontSize: 11, ...font.bold }}>{n}</Text>}
                </View>
                <Text style={{ color: active ? c.text : c.textFaint, fontSize: 11, ...(active ? font.semibold : font.medium) }}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={[styles.track, { backgroundColor: c.surfaceAlt }]}>
          <Animated.View style={[styles.trackFill, { backgroundColor: c.accent, width: bar.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) }]} />
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.bg }} behavior="padding">
        <ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          {restored && step === 1 ? (
            <View style={[styles.note, { backgroundColor: c.accentSoft }]}>
              <Icon name="refresh" size={15} color={c.accentText} />
              <Text style={{ flex: 1, color: c.accentText, fontSize: 13, ...font.medium }}>We restored your unfinished listing.</Text>
              <Pressable onPress={startFresh} hitSlop={8}>
                <Text style={{ color: c.accentText, fontSize: 13, ...font.bold }}>Start fresh</Text>
              </Pressable>
            </View>
          ) : null}

          {step === 1 ? (
            <>
              <Text style={stepTitle}>What are you selling?</Text>
              <Text style={stepSub}>Clear details help buyers find you and reply faster.</Text>

              <Block title="Title" required error={errors.title} right={<Text style={{ color: c.textFaint, fontSize: 11.5, ...font.medium }}>{form.title.length}/120</Text>}>
                <Field value={form.title} onChangeText={(t) => set("title", t)} maxLength={120} placeholder={rules.titlePlaceholder || "e.g. Casio fx-991ES Plus calculator"} error={Boolean(errors.title)} />
                {suggestion ? (
                  <Pressy
                    onPress={() => {
                      haptic.select();
                      set("category", suggestion.value);
                      if (!form.brand && guess.brand) set("brand", guess.brand);
                    }}
                    style={[styles.suggest, { borderColor: c.accentSoftStrong, backgroundColor: c.accentSoft }]}
                  >
                    <Icon name="sparkles" size={14} color={c.accentText} />
                    <Text style={{ color: c.accentText, fontSize: 13, flex: 1, ...font.medium }}>
                      Looks like <Text style={font.bold}>{suggestion.label}</Text>
                      {guess.brand ? ` · ${guess.brand}` : ""}
                    </Text>
                    <Text style={{ color: c.accentText, fontSize: 13, ...font.bold }}>Use</Text>
                  </Pressy>
                ) : null}
              </Block>

              <Block title="Category" required error={errors.category}>
                <View style={styles.grid}>
                  {categories.map((cat) => {
                    const sel = form.category === cat.value;
                    return (
                      <Pressy
                        key={cat.value}
                        onPress={() => {
                          haptic.select();
                          set("category", cat.value);
                        }}
                        scaleTo={0.95}
                        style={[styles.catTile, { width: tile, backgroundColor: sel ? c.accentSoft : c.card, borderColor: sel ? c.accent : c.dark ? "#2A2D35" : "#E2E8F0" }]}
                        accessibilityLabel={cat.label}
                        accessibilityState={{ selected: sel }}
                      >
                        <CategoryIcon value={cat.value} size={28} />
                        <Text numberOfLines={2} style={{ color: sel ? c.accentText : c.text, fontSize: 10.5, lineHeight: 13, textAlign: "center", ...font.semibold }}>
                          {cat.label}
                        </Text>
                        {sel ? (
                          <View style={[styles.catCheck, { backgroundColor: c.accent }]}>
                            <Icon name="checkmark" size={10} color="#fff" strokeWidth={3.2} />
                          </View>
                        ) : null}
                      </Pressy>
                    );
                  })}
                </View>
              </Block>

              <Block title="Condition" required error={errors.condition} hint={rules.condition?.why}>
                <View style={styles.wrapRow}>
                  {CONDITIONS.map((o) => (
                    <Pill
                      key={o.value}
                      label={o.value === "for_parts_or_not_working" ? "For parts" : o.label}
                      selected={form.condition === o.value}
                      disabled={Boolean(rules.condition?.fixed) && form.condition !== o.value}
                      onPress={() => set("condition", o.value)}
                    />
                  ))}
                </View>
                {form.condition ? (
                  <View style={[styles.condHint, { backgroundColor: c.surface }]}>
                    <Icon name="information-circle" size={14} color={c.textMuted} />
                    <Text style={{ flex: 1, color: c.textMuted, fontSize: 12.5, ...font.medium }}>{CONDITION_HINT[form.condition]}</Text>
                  </View>
                ) : null}
              </Block>

              <Block title="When did you buy it?" required error={errors.purchaseDate}>
                <DateField value={form.purchaseDate} onChange={(v) => set("purchaseDate", v)} maximumDate={new Date()} minimumDate={new Date("2000-01-01")} />
                <View style={[styles.wrapRow, { marginTop: -4 }]}>
                  {(purchaseDateShortcuts() as { label: string; value: string }[]).map((s) => (
                    <Pill key={s.label} label={s.label} selected={form.purchaseDate === s.value} onPress={() => set("purchaseDate", s.value)} />
                  ))}
                </View>
              </Block>

              <Block title="How long have you used it?" required error={errors.usageDuration} hint={rules.usage?.why || (form.purchaseDate ? "Options match your purchase date." : undefined)}>
                <View style={styles.wrapRow}>
                  {USAGE_DURATIONS.map((u) => (
                    <Pill key={u.value} label={u.label} selected={form.usageDuration === u.value} disabled={!allowed.includes(u.value)} onPress={() => set("usageDuration", u.value)} />
                  ))}
                </View>
              </Block>

              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Block title="Brand" hint="Optional">
                    <Field value={form.brand} onChangeText={(t) => set("brand", t)} maxLength={100} placeholder={rules.brandPlaceholder || "e.g. Casio"} />
                  </Block>
                </View>
                {rules.color !== "off" ? (
                  <View style={{ flex: 1 }}>
                    <Block title="Colour" hint="Optional">
                      <Field value={form.color} onChangeText={(t) => set("color", t)} maxLength={50} placeholder="e.g. Black" />
                    </Block>
                  </View>
                ) : null}
              </View>

              <Block
                title="Description"
                required
                error={errors.description}
                hint="What's included, any flaws, why you're selling."
                right={
                  form.title.trim().length >= 3 ? (
                    <Pressable
                      onPress={() => {
                        const text = draftDescription({ ...form }, labelOf(USAGE_DURATIONS, form.usageDuration)) as string;
                        if (text) {
                          haptic.success();
                          set("description", text);
                        }
                      }}
                      hitSlop={8}
                      style={[styles.writeBtn, { backgroundColor: c.accentSoft }]}
                    >
                      <Icon name="sparkles" size={12} color={c.accentText} />
                      <Text style={{ color: c.accentText, fontSize: 12, ...font.semibold }}>Write it for me</Text>
                    </Pressable>
                  ) : undefined
                }
              >
                <Field
                  value={form.description}
                  onChangeText={(t) => set("description", t)}
                  multiline
                  maxLength={2000}
                  placeholder="e.g. Bought for 2nd sem, used one semester. Comes with the original box. Small scratch on the back."
                  error={Boolean(errors.description)}
                />
                <Text style={{ color: c.textFaint, fontSize: 11.5, alignSelf: "flex-end", marginTop: 4, ...font.medium }}>{normalizeMultiline(form.description).length}/2000</Text>
              </Block>

              {girlsEligible ? (
                <View style={[styles.girlCard, { backgroundColor: c.card, borderColor: form.isGirlsOnly ? "#F472B6" : c.dark ? "#4A1D35" : "#FBCFE8" }, shadow(c.dark, "sm")]}>
                  <LinearGradient colors={["#F472B6", "#DB2777"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.girlBadge}>
                    <Icon name="flower-outline" size={22} color="#fff" strokeWidth={2.2} />
                  </LinearGradient>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: c.text, fontSize: 15, ...font.bold }}>Girls Corner only</Text>
                    <Text style={{ color: c.textMuted, fontSize: 12.5, ...font.regular }}>
                      {categoryOf(form.category)?.girlsOnly ? "This category is always girls-only." : "Only verified female students can see and message you."}
                    </Text>
                  </View>
                  <Switch value={form.isGirlsOnly} disabled={Boolean(categoryOf(form.category)?.girlsOnly)} onValueChange={(v) => set("isGirlsOnly", v)} trackColor={{ true: "#DB2777", false: c.borderStrong }} thumbColor="#fff" />
                </View>
              ) : null}
            </>
          ) : null}

          {step === 2 ? (
            <>
              <Text style={stepTitle}>Add photos</Text>
              <Text style={stepSub}>Up to 3. The first is your cover — it's what buyers see in the feed.</Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 3 }}>
                  <PhotoSlot photo={photos[0]} label="Add cover photo" big cover onAdd={addPhoto} onRemove={() => photos[0] && removePhoto(photos[0].key)} error={Boolean(errors.photos)} />
                </View>
                <View style={{ flex: 2, gap: 10 }}>
                  {[1, 2].map((i) => (
                    <PhotoSlot
                      key={i}
                      photo={photos[i]}
                      label={photos.length >= i ? "Add photo" : ""}
                      onAdd={addPhoto}
                      onRemove={() => photos[i] && removePhoto(photos[i].key)}
                      onMakeCover={() => photos[i] && makeCover(photos[i].key)}
                      disabled={photos.length < i}
                    />
                  ))}
                </View>
              </View>
              {errors.photos ? <ErrorLine text={errors.photos} /> : null}
              <Text style={{ color: c.textMuted, fontSize: 12.5, marginTop: 10, ...font.medium }}>{photos.length}/3 added{photos.length > 1 ? " · tap ★ on a photo to make it the cover" : ""}</Text>

              <View style={[styles.tips, { backgroundColor: c.card, borderColor: c.border }]}>
                <Text style={{ color: c.text, fontSize: 14.5, marginBottom: 12, ...font.semibold }}>Photos that sell faster</Text>
                {(
                  [
                    ["sun", "Shoot in daylight", "Near a window beats any flash."],
                    ["grid-outline", "Plain background", "A desk or bedsheet keeps the focus on the item."],
                    ["eye-outline", "Show any flaws", "Honest photos mean fewer back-and-forths."],
                  ] as [IconName, string, string][]
                ).map(([icon, t, d]) => (
                  <View key={t} style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
                    <View style={[styles.tipIcon, { backgroundColor: c.accentSoft }]}>
                      <Icon name={icon} size={16} color={c.accentText} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: c.text, fontSize: 13.5, ...font.semibold }}>{t}</Text>
                      <Text style={{ color: c.textMuted, fontSize: 12.5, ...font.regular }}>{d}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <Text style={stepTitle}>Set your price</Text>
              <Text style={stepSub}>Students compare prices — a fair one sells in days.</Text>

              <PriceInsights category={form.category} condition={form.condition} onUsePrice={(n) => set("sellingPrice", String(n))} />

              <View style={[styles.priceCard, { backgroundColor: c.card, borderColor: c.border }, shadow(c.dark, "sm")]}>
                <Text style={[styles.caps, { color: c.textMuted }]}>Your price</Text>
                <Field big strong prefix="₹" value={form.sellingPrice} onChangeText={(t) => set("sellingPrice", t.replace(/\D/g, ""))} keyboardType="number-pad" placeholder="0" error={Boolean(errors.sellingPrice)} />
                {errors.sellingPrice ? <ErrorLine text={errors.sellingPrice} /> : null}
                <Text style={[styles.caps, { color: c.textMuted, marginTop: 16 }]}>Original price (when new)</Text>
                <Field big prefix="₹" value={form.originalPrice} onChangeText={(t) => set("originalPrice", t.replace(/\D/g, ""))} keyboardType="number-pad" placeholder="0" error={Boolean(errors.originalPrice)} />
                {errors.originalPrice ? <ErrorLine text={errors.originalPrice} /> : null}
                {off > 0 && !errors.sellingPrice ? (
                  <View style={[styles.saveRow, { backgroundColor: c.successSoft }]}>
                    <Icon name="trending-up" size={14} color={c.success} />
                    <Text style={{ color: c.success, fontSize: 13, ...font.semibold }}>
                      {off}% below new · buyers save {inr(Number(form.originalPrice) - Number(form.sellingPrice))}
                    </Text>
                  </View>
                ) : null}
                {priceTip && !form.sellingPrice ? (
                  <Pressable onPress={() => set("sellingPrice", String(priceTip))} style={[styles.saveRow, { backgroundColor: c.accentSoft }]}>
                    <Icon name="sparkles" size={14} color={c.accentText} />
                    <Text style={{ color: c.accentText, fontSize: 13, flex: 1, ...font.medium }}>
                      Typical for this condition: <Text style={font.bold}>{inr(priceTip)}</Text>
                    </Text>
                    <Text style={{ color: c.accentText, fontSize: 13, ...font.bold }}>Use</Text>
                  </Pressable>
                ) : null}
              </View>

              <View style={[styles.toggleCard, { backgroundColor: c.card, borderColor: c.border, marginTop: 14, marginBottom: 22 }]}>
                <View style={[styles.optionIcon, { backgroundColor: c.accentSoft }]}>
                  <Icon name="chatbubbles-outline" size={16} color={c.accentText} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontSize: 14.5, ...font.semibold }}>Open to offers</Text>
                  <Text style={{ color: c.textMuted, fontSize: 12.5, ...font.regular }}>Buyers can send price offers in chat.</Text>
                </View>
                <Switch
                  value={form.negotiable}
                  onValueChange={(v) => {
                    haptic.select();
                    set("negotiable", v);
                  }}
                  trackColor={{ true: c.accent, false: c.borderStrong }}
                  thumbColor="#fff"
                />
              </View>

              <Block title="How will you get paid?" required error={errors.paymentMethod}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {PAYMENT_OPTIONS.map((o) => {
                    const sel = form.paymentMethod === o.value;
                    return (
                      <Pressy
                        key={o.value}
                        onPress={() => {
                          haptic.select();
                          set("paymentMethod", o.value);
                        }}
                        scaleTo={0.95}
                        style={[styles.payCard, { backgroundColor: sel ? c.accentSoft : c.card, borderColor: sel ? c.accent : c.dark ? "#2A2D35" : "#E2E8F0" }]}
                        accessibilityState={{ selected: sel }}
                      >
                        <Icon name={PAYMENT_ICON[o.value]} size={20} color={sel ? c.accentText : c.textMuted} />
                        <Text style={{ color: sel ? c.accentText : c.text, fontSize: 13, ...font.semibold }}>{o.label}</Text>
                      </Pressy>
                    );
                  })}
                </View>
              </Block>

              <Block title="Quantity" hint="Identical items you have (1–99)" error={errors.quantity}>
                <View style={[styles.stepper, { backgroundColor: c.card, borderColor: c.dark ? "#2A2D35" : "#E2E8F0" }]}>
                  <Pressable
                    onPress={() => {
                      haptic.select();
                      set("quantity", String(Math.max(1, Number(form.quantity || 1) - 1)));
                    }}
                    style={styles.stepBtn}
                    accessibilityLabel="Decrease quantity"
                  >
                    <Icon name="minus" size={18} color={Number(form.quantity) <= 1 ? c.textFaint : c.text} />
                  </Pressable>
                  <Text style={{ color: c.text, fontSize: 18, minWidth: 40, textAlign: "center", ...font.bold }}>{form.quantity || 1}</Text>
                  <Pressable
                    onPress={() => {
                      haptic.select();
                      set("quantity", String(Math.min(99, Number(form.quantity || 1) + 1)));
                    }}
                    style={styles.stepBtn}
                    accessibilityLabel="Increase quantity"
                  >
                    <Icon name="plus" size={18} color={Number(form.quantity) >= 99 ? c.textFaint : c.text} />
                  </Pressable>
                </View>
              </Block>

              <Block title="Pickup spot" required error={errors.address} hint="A public campus spot — library, canteen, main gate. Never your room.">
                <View style={{ gap: 8 }}>
                  {(spots.data || []).map((s: PickupSpot) => (
                    <OptionCard
                      key={s._id}
                      icon="location-outline"
                      selected={form.address?.name === s.name && form.address?.detail === s.detail}
                      title={s.name}
                      hint={s.detail + (s.isPrimary ? " · Primary" : "")}
                      onPress={() => set("address", { name: s.name, detail: s.detail })}
                    />
                  ))}
                  {(spots.data?.length || 0) < 3 ? (
                    addingSpot || !spots.data?.length ? (
                      <View style={[styles.addSpot, { backgroundColor: c.card, borderColor: c.border }]}>
                        <Field value={newSpot.name} onChangeText={(t) => setNewSpot((x) => ({ ...x, name: t }))} maxLength={80} placeholder="Spot name, e.g. Central Library" />
                        <View style={{ height: 8 }} />
                        <Field value={newSpot.detail} onChangeText={(t) => setNewSpot((x) => ({ ...x, detail: t }))} maxLength={180} placeholder="Detail, e.g. Ground floor entrance" />
                        <View style={{ height: 10 }} />
                        <Button size="sm" icon="plus" title="Save spot" onPress={addSpot} />
                      </View>
                    ) : (
                      <Pressable onPress={() => setAddingSpot(true)} style={[styles.addSpotBtn, { borderColor: c.borderStrong }]}>
                        <Icon name="plus" size={16} color={c.accentText} />
                        <Text style={{ color: c.accentText, fontSize: 13.5, ...font.semibold }}>Add another spot</Text>
                      </Pressable>
                    )
                  ) : null}
                </View>
              </Block>

              <Pressable
                onPress={() => {
                  const v = !form.termsAccepted;
                  haptic.select();
                  setForm((f) => ({ ...f, termsAccepted: v, termsAcceptedAt: v ? new Date().toISOString() : null }));
                  setErrors((e) => ({ ...e, termsAccepted: "" }));
                }}
                style={[styles.terms, { backgroundColor: c.card, borderColor: errors.termsAccepted ? c.danger : c.border }]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: form.termsAccepted }}
              >
                <View style={[styles.check, { backgroundColor: form.termsAccepted ? c.accent : "transparent", borderColor: form.termsAccepted ? c.accent : c.borderStrong }]}>
                  {form.termsAccepted ? <Icon name="checkmark" size={13} color="#fff" strokeWidth={3} /> : null}
                </View>
                <Text style={{ flex: 1, color: c.textMuted, fontSize: 13, lineHeight: 19, ...font.regular }}>
                  This item is mine to sell, described honestly, and follows the{" "}
                  <Text style={{ color: c.accentText, ...font.semibold }} onPress={() => router.push("/legal/terms")}>
                    Unideals listing terms
                  </Text>
                  .
                </Text>
              </Pressable>
            </>
          ) : null}

          {step === 4 ? (
            <>
              <Text style={stepTitle}>Looks good?</Text>
              <Text style={stepSub}>This is exactly how your listing appears in the feed.</Text>
              <View style={{ alignItems: "center", marginBottom: 18 }} pointerEvents="none">
                <ProductCard product={preview} width={Math.min(240, Math.round(width * 0.58))} />
              </View>
              <View style={[styles.reviewCard, { backgroundColor: c.card, borderColor: c.border }]}>
                {(
                  [
                    [1, "Details", [categoryOf(form.category)?.label, labelOf(CONDITIONS, form.condition), labelOf(USAGE_DURATIONS, form.usageDuration)].filter(Boolean).join(" · ")],
                    [2, "Photos", `${photos.length} photo${photos.length === 1 ? "" : "s"}`],
                    [3, "Price", `${inr(Number(form.sellingPrice))}${off > 0 ? ` · ${off}% off` : ""} · ${form.negotiable ? "Open to offers" : "Fixed"}`],
                    [3, "Payment", labelOf(PAYMENT_OPTIONS, form.paymentMethod)],
                    [3, "Pickup", form.address ? `${form.address.name} · ${form.address.detail}` : "—"],
                  ] as [number, string, string][]
                ).map(([n, k, v], i) => (
                  <Pressable key={k} onPress={() => jumpTo(n)} style={[styles.reviewRow, i ? { borderTopWidth: StyleSheet.hairlineWidth, borderColor: c.border } : null]}>
                    <Text style={{ color: c.textMuted, fontSize: 13, width: 70, ...font.medium }}>{k}</Text>
                    <Text numberOfLines={2} style={{ flex: 1, color: c.text, fontSize: 13.5, ...font.semibold }}>
                      {v || "—"}
                    </Text>
                    <Text style={{ color: c.accentText, fontSize: 12.5, ...font.semibold }}>Edit</Text>
                  </Pressable>
                ))}
              </View>
              <View style={[styles.note, { backgroundColor: c.surface, marginTop: 14 }]}>
                <Icon name="shield-checkmark-outline" size={16} color={c.textMuted} />
                <Text style={{ flex: 1, color: c.textMuted, fontSize: 12.5, ...font.regular }}>Your phone number is never shown. Buyers reach you in Unideals chat.</Text>
              </View>
            </>
          ) : null}
        </ScrollView>

        {/* Sticky footer */}
        <View style={[styles.footer, { backgroundColor: c.barSolid, borderColor: c.border, paddingBottom: Math.max(insets.bottom, 12) }]}>
          {busy ? (
            <View style={{ marginBottom: 10 }}>
              <Text style={{ color: c.textMuted, fontSize: 12.5, marginBottom: 6, ...font.medium }}>{stage}</Text>
              <View style={[styles.track, { backgroundColor: c.surfaceAlt, marginHorizontal: 0, marginTop: 0 }]}>
                <View style={[styles.trackFill, { backgroundColor: c.accent, width: `${Math.max(8, progress * 100)}%` }]} />
              </View>
            </View>
          ) : null}
          <View style={{ flexDirection: "row", gap: 10 }}>
            {step > 1 ? (
              <View style={{ width: 108 }}>
                <Button kind="secondary" title="Back" size="lg" onPress={goBack} disabled={busy} />
              </View>
            ) : null}
            <View style={{ flex: 1 }}>
              {step < 4 ? (
                <Button title="Continue" iconRight="arrow-forward" size="lg" onPress={goNext} disabled={busy} />
              ) : (
                <Button title={isEdit && !isDraft ? "Save changes" : "Publish listing"} icon={isEdit && !isDraft ? "checkmark" : "rocket-outline"} size="lg" onPress={publish} loading={busy} />
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 6, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  draftBtn: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  steps: { flexDirection: "row", paddingHorizontal: 10, marginTop: 6 },
  stepDot: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  track: { height: 4, borderRadius: 2, marginHorizontal: 16, marginTop: 10, overflow: "hidden" },
  trackFill: { height: 4, borderRadius: 2 },
  note: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, padding: 12, marginBottom: 16 },
  field: { flexDirection: "row", gap: 6, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14 },
  suggest: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginTop: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catTile: { aspectRatio: 0.95, borderRadius: 14, borderWidth: 1.5, alignItems: "center", justifyContent: "center", gap: 6, padding: 4 },
  catCheck: { position: "absolute", top: 6, right: 6, width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  option: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1.5, borderRadius: 14, padding: 13 },
  optionIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  pill: { borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8 },
  wrapRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  writeBtn: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  toggleCard: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderRadius: 16, padding: 14 },
  girlCard: { flexDirection: "row", alignItems: "center", gap: 14, minHeight: 80, borderWidth: 1.5, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 14 },
  girlBadge: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  condHint: { flexDirection: "row", alignItems: "center", gap: 7, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, marginTop: 10 },
  slot: { width: "100%", borderRadius: 18, overflow: "hidden" },
  emptySlot: { borderWidth: 1.5, borderStyle: "dashed", alignItems: "center", justifyContent: "center", gap: 6 },
  camCircle: { borderRadius: 999, alignItems: "center", justifyContent: "center" },
  coverTag: { position: "absolute", left: 8, bottom: 8, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(15,23,42,0.72)", borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4 },
  makeCover: { position: "absolute", left: 6, bottom: 6, width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(15,23,42,0.6)", alignItems: "center", justifyContent: "center" },
  remove: { position: "absolute", right: 6, top: 6, width: 26, height: 26, borderRadius: 13, backgroundColor: "rgba(15,23,42,0.65)", alignItems: "center", justifyContent: "center" },
  tips: { borderWidth: 1, borderRadius: 18, padding: 16, marginTop: 20 },
  tipIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  priceCard: { borderWidth: 1, borderRadius: 18, padding: 16 },
  caps: { fontSize: 11.5, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 8, fontFamily: "Figtree_600SemiBold" },
  saveRow: { flexDirection: "row", alignItems: "center", gap: 7, borderRadius: 10, paddingHorizontal: 11, paddingVertical: 9, marginTop: 12 },
  payCard: { flex: 1, alignItems: "center", gap: 6, borderWidth: 1.5, borderRadius: 14, paddingVertical: 14 },
  stepper: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", borderWidth: 1, borderRadius: 14, padding: 4 },
  stepBtn: { width: 42, height: 42, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  addSpot: { borderWidth: 1, borderRadius: 14, padding: 12 },
  addSpotBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderWidth: 1.5, borderStyle: "dashed", borderRadius: 14, paddingVertical: 13 },
  terms: { flexDirection: "row", gap: 12, alignItems: "flex-start", borderWidth: 1, borderRadius: 14, padding: 14 },
  check: { width: 22, height: 22, borderRadius: 7, borderWidth: 2, alignItems: "center", justifyContent: "center", marginTop: 1 },
  reviewCard: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 14 },
  reviewRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 13 },
  footer: { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, paddingTop: 12 },
});
