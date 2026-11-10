import { Icon } from "@/components/ui/Icon";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useState, type ReactNode } from "react";
import {
  FlatList,
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
            ...(focused ? { shadowColor: c.accent, shadowOpacity: 0.18, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } } : null),
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
            { color: c.text, textAlignVertical: multiline ? "top" : "center", paddingTop: multiline ? 12 : 0 },
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

/** Bottom sheet modal. */
export function Sheet({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title?: string; children: ReactNode }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: c.overlay }]} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: c.bg, paddingBottom: insets.bottom + 16 }]}>
        <View style={[styles.grabber, { backgroundColor: c.borderStrong }]} />
        {title ? (
          <T variant="h2" style={{ marginBottom: 10 }}>
            {title}
          </T>
        ) : null}
        {children}
      </View>
    </Modal>
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
        style={[styles.inputWrap, { borderRadius: radius.md, backgroundColor: c.card, borderColor: error ? c.danger : c.dark ? "#2A2D35" : "#E2E8F0", minHeight: 48 }]}
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
  input: { flex: 1, fontSize: 15, minHeight: 46, paddingVertical: 0, fontFamily: "Figtree_400Regular" },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 16, paddingTop: 10, maxHeight: "88%" },
  grabber: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 12 },
  option: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13, paddingHorizontal: 10, borderRadius: 12 },
});
