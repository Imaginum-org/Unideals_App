import { useSafeAreaInsets } from "react-native-safe-area-context";

// Floating tab bar geometry (app/(tabs)/_layout.tsx). Tab screens scroll
// underneath the glass bar, so lists pad their bottom by `tabBarSpace`.
export const TAB_BAR_HEIGHT = 64;
export const TAB_BAR_GAP = 10;

export const useTabBarSpace = () => {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 10) + TAB_BAR_GAP;
  return { bottom, space: bottom + TAB_BAR_HEIGHT + 16 };
};
