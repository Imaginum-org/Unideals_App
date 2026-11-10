import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

// Light, consistent tactile feedback. Never throws, no-ops on web.
const safe = (fn: () => Promise<void>) => {
  if (Platform.OS === "web") return;
  fn().catch(() => {});
};

export const haptic = {
  /** Taps on primary controls, tab switches. */
  tap: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  /** Selection changes (chips, toggles, steppers). */
  select: () => safe(() => Haptics.selectionAsync()),
  /** Completed actions: published, paid, saved. */
  success: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  /** Validation errors, failed actions. */
  error: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};
