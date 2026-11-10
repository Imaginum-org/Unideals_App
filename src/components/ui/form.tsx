import { Icon } from "@/components/ui/Icon";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Animated,
  Easing,
  FlatList,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { font, useTheme } from "@/theme";
import { T, type IconName } from "./primitives";
import type { Option } from "@/constants/product";

export function Field({ label, required, error, hint, children }: { label?: string; required?: boolean; error?: string; hint?: string; children: ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={{ marginBottom: 14 }}>
      {label ? (
        <T variant="label" style={{ marginBottom: 6 }}>
          {label}
          {required ? <Text style={{ color: c.danger }}> *</Text> : null}
        </T>
      ) : null}
      {children}
      {error ? (
        <T variant="small" color={c.danger} style={{ marginTop: 5 }}>
          {error}
        </T>
      ) : hint ? (
        <T variant="small" faint style={{ marginTop: 5 }}>
          {hint}
        </T>
      ) : null}
    </View>
  );
}

export function Input({
  label,
  required,
  error,
  hint,
  icon,
  secure,
  prefix,
  multiline,
  style,
  ...rest
}: TextInputProps & { label?: string; required?: boolean; error?: string; hint?: string; icon?: IconName; secure?: boolean; prefix?: string }) {
  const { c, radius } = useTheme();
  const [hidden, setHidden] = useState(true);
  const [focused, setFocused] = useState(false);
  return (
    <Field label={label} required={required} error={error} hint={hint}>
      <View
        style={[
          styles.inputWrap,
          {
            borderRadius: radius.md,
            backgroundColor: c.card,
            borderColor: error ? c.danger : focused ? c.accent : c.dark ? "#2A2D35" : "#E2E8F0",
            minHeight: multiline ? 110 : 48,
            alignItems: multiline ? "flex-start" : "center",
          },
        ]}
      >
        {icon ? <Icon name={icon} size={18} color={c.textFaint} style={{ marginTop: multiline ? 12 : 0 }} /> : null}
        {prefix ? <Text style={{ color: c.textMuted, fontSize: 15, ...font.semibold }}>{prefix}</Text> : null}
        <TextInput
          placeholderTextColor={c.textFaint}
          secureTextEntry={secure && hidden}
          multiline={multiline}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          style={[
            styles.input,
            { color: c.text, textAlignVertical: multiline ? "top" : "center", paddingTop: multiline ? 12 : 0, height: multiline ? undefined : 46 },
            style,
          ]}
          {...rest}
        />
        {secure ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10} accessibilityLabel={hidden ? "Show password" : "Hide password"}>
            <Icon name={hidden ? "eye-outline" : "eye-off-outline"} size={20} color={c.textMuted} />
          </Pressable>
        ) : null}
      </View>
    </Field>
  );
}

/** Tap-to-open bottom sheet list picker (native replacement for web <Select>). */
export function Select({
  label,
  required,
  error,
  value,
  options,
  onChange,
  placeholder = "Select",
  disabled,
  hint,
}: {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  value?: string | null;
  options: Option[];
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const { c, radius } = useTheme();
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  return (
    <Field label={label} required={required} error={error} hint={hint}>
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[
          styles.inputWrap,
          {
            borderRadius: radius.md,
            backgroundColor: disabled ? c.surface : c.card,
            borderColor: error ? c.danger : c.dark ? "#2A2D35" : "#E2E8F0",
            minHeight: 48,
          },
        ]}
      >
        <Text style={{ flex: 1, fontSize: 15, color: current ? c.text : c.textFaint, ...font.regular }} numberOfLines={1}>
          {current?.label || placeholder}
        </Text>
        <Icon name="chevron-down" size={18} color={c.textMuted} />
      </Pressable>
      <OptionSheet
        visible={open}
        title={label || placeholder}
        options={options}
        value={value}
        onClose={() => setOpen(false)}
        onSelect={(v) => {
          onChange(v);
          setOpen(false);
        }}
      />
    </Field>
  );
}

export function OptionSheet({
  visible,
  title,
  options,
  value,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: Option[];
  value?: string | null;
  onSelect: (v: string) => void;
  onClose: () => void;
}) {
  const { c } = useTheme();
  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      <FlatList
        data={options}
        keyExtractor={(o) => o.value}
        style={{ maxHeight: 460 }}
        renderItem={({ item }) => {
          const sel = item.value === value;
          return (
            <Pressable
              onPress={() => onSelect(item.value)}
              style={({ pressed }) => [styles.option, { backgroundColor: sel ? c.accentSoft : pressed ? c.surface : "transparent" }]}
            >
              {item.icon ? <Icon name={item.icon} size={18} color={sel ? c.accentText : c.textMuted} /> : null}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, color: sel ? c.accentText : c.text, ...(sel ? font.semibold : font.regular) }}>
                  {item.label}
                </Text>
                {item.description ? (
                  <T variant="caption" muted>
                    {item.description}
                  </T>
                ) : null}
              </View>
              {sel ? <Icon name="checkmark" size={18} color={c.accentText} /> : null}
            </Pressable>
          );
        }}
      />
    </Sheet>
  );
}

/**
 * Bottom sheet: fading scrim, spring slide-up, and it rides on top of the
 * keyboard (works whether or not the OS resized the modal window).
 */
export function Sheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const [kbOpen, setKbOpen] = useState(false);
  const slide = useRef(new Animated.Value(1)).current; // 1 = hidden
  const lift = useRef(new Animated.Value(0)).current;
  const rootH = useRef(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      slide.setValue(1);
      Animated.spring(slide, { toValue: 0, useNativeDriver: true, speed: 15, bounciness: 3 }).start();
    } else if (mounted) {
      Keyboard.dismiss();
      Animated.timing(slide, { toValue: 1, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(() => setMounted(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    if (!mounted) return;
    const ios = Platform.OS === "ios";
    const show = Keyboard.addListener(ios ? "keyboardWillShow" : "keyboardDidShow", (e) => {
      // Distance from the keyboard top to the bottom of this (full-screen) modal.
      const overlap = rootH.current ? Math.max(0, rootH.current - e.endCoordinates.screenY) : e.endCoordinates.height;
      setKbOpen(true);
      Animated.timing(lift, { toValue: -overlap, duration: ios ? e.duration || 250 : 180, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    });
    const hide = Keyboard.addListener(ios ? "keyboardWillHide" : "keyboardDidHide", (e) => {
      setKbOpen(false);
      Animated.timing(lift, { toValue: 0, duration: ios ? e?.duration || 220 : 160, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, [mounted, lift]);

  if (!mounted) return null;
  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <View style={StyleSheet.absoluteFill} onLayout={(e) => (rootH.current = e.nativeEvent.layout.height)}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: c.overlay, opacity: slide.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        </Animated.View>
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: c.dark ? "#16181B" : "#FFFFFF",
              paddingBottom: kbOpen ? 16 : insets.bottom + 16,
              transform: [{ translateY: Animated.add(slide.interpolate({ inputRange: [0, 1], outputRange: [0, 700] }), lift) }],
            },
          ]}
        >
          <View style={[styles.grabber, { backgroundColor: c.borderStrong }]} />
          {title ? (
            <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 14, gap: 10 }}>
              <View style={{ flex: 1 }}>
                <T variant="h2">{title}</T>
                {subtitle ? (
                  <T variant="small" muted style={{ marginTop: 2 }}>
                    {subtitle}
                  </T>
                ) : null}
              </View>
              <Pressable onPress={onClose} hitSlop={10} style={[styles.close, { backgroundColor: c.surface }]} accessibilityLabel="Close">
                <Icon name="close" size={16} color={c.textMuted} strokeWidth={2.4} />
              </Pressable>
            </View>
          ) : null}
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

export type SheetAction = { label: string; description?: string; icon?: IconName; destructive?: boolean; onPress: () => void };

/** Branded replacement for Alert / ActionSheetIOS menus. */
export function ActionSheet({ visible, onClose, title, subtitle, actions }: { visible: boolean; onClose: () => void; title?: string; subtitle?: string; actions: SheetAction[] }) {
  const { c } = useTheme();
  const run = (a: SheetAction) => {
    onClose();
    setTimeout(a.onPress, 220); // let the sheet close first (pickers / alerts open cleanly)
  };
  return (
    <Sheet visible={visible} onClose={onClose} title={title} subtitle={subtitle}>
      <View style={{ gap: 4 }}>
        {actions.map((a) => {
          const tint = a.destructive ? c.danger : c.text;
          return (
            <Pressable key={a.label} onPress={() => run(a)} style={({ pressed }) => [styles.action, { backgroundColor: pressed ? c.surface : "transparent" }]}>
              {a.icon ? (
                <View style={[styles.actionIcon, { backgroundColor: a.destructive ? c.dangerSoft : c.accentSoft }]}>
                  <Icon name={a.icon} size={18} color={a.destructive ? c.danger : c.accentText} />
                </View>
              ) : null}
              <View style={{ flex: 1 }}>
                <Text style={{ color: tint, fontSize: 15.5, ...font.semibold }}>{a.label}</Text>
                {a.description ? <Text style={{ color: c.textMuted, fontSize: 12.5, marginTop: 1, ...font.regular }}>{a.description}</Text> : null}
              </View>
              {a.destructive ? null : <Icon name="chevron-forward" size={16} color={c.textFaint} />}
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}

export function SwitchRow({ label, description, value, onChange, disabled }: { label: string; description?: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 }}>
      <View style={{ flex: 1 }}>
        <T variant="h3" style={{ fontSize: 15 }}>
          {label}
        </T>
        {description ? (
          <T variant="small" muted>
            {description}
          </T>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ true: c.accent, false: c.borderStrong }}
        thumbColor="#fff"
      />
    </View>
  );
}

/** Date field: native picker (Android dialog / iOS inline sheet). value = YYYY-MM-DD. */
export function DateField({
  label,
  required,
  error,
  value,
  onChange,
  minimumDate,
  maximumDate,
  hint,
}: {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  value?: string;
  onChange: (v: string) => void;
  minimumDate?: Date;
  maximumDate?: Date;
}) {
  const { c, radius } = useTheme();
  const [iosOpen, setIosOpen] = useState(false);
  const date = value ? new Date(value) : new Date();
  const toIso = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  const open = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: date,
        mode: "date",
        minimumDate,
        maximumDate,
        onChange: (e, d) => {
          if (e.type === "set" && d) onChange(toIso(d));
        },
      });
    } else {
      setIosOpen(true);
    }
  };
  return (
    <Field label={label} required={required} error={error} hint={hint}>
      <Pressable
        onPress={open}
        style={[styles.inputWrap, { alignItems: "center", borderRadius: radius.md, backgroundColor: c.card, borderColor: error ? c.danger : c.dark ? "#2A2D35" : "#E2E8F0", minHeight: 48 }]}
      >
        <Icon name="calendar-outline" size={18} color={c.textFaint} />
        <Text style={{ flex: 1, fontSize: 15, color: value ? c.text : c.textFaint, ...font.regular }}>
          {value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Pick a date"}
        </Text>
      </Pressable>
      {Platform.OS === "ios" ? (
        <Sheet visible={iosOpen} onClose={() => setIosOpen(false)} title={label}>
          <DateTimePicker
            value={date}
            mode="date"
            display="inline"
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onChange={(_e, d) => {
              if (d) onChange(toIso(d));
            }}
          />
          <Pressable onPress={() => setIosOpen(false)} style={[styles.option, { justifyContent: "center" }]}>
            <Text style={{ color: c.accentText, fontSize: 16, ...font.semibold }}>Done</Text>
          </Pressable>
        </Sheet>
      ) : null}
    </Field>
  );
}

const styles = StyleSheet.create({
  inputWrap: { flexDirection: "row", gap: 8, borderWidth: 1, paddingHorizontal: 14, borderRadius: 12 },
  // includeFontPadding:false + fixed height keeps text and placeholder
  // optically centred on Android (Figtree has tall ascenders).
  input: { flex: 1, fontSize: 15, minHeight: 46, paddingVertical: 0, includeFontPadding: false, fontFamily: "Figtree_400Regular" },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 18, paddingTop: 10, maxHeight: "90%" },
  grabber: { width: 38, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 14 },
  close: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  action: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 14 },
  actionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  option: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13, paddingHorizontal: 10, borderRadius: 12 },
});
