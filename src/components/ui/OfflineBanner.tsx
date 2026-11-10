import NetInfo from "@react-native-community/netinfo";
import { onlineManager } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { reconnectSocket } from "@/lib/socket";
import { font } from "@/theme";
import { Icon } from "./Icon";

// React Query follows the device's connectivity: queries pause offline and
// refetch the moment the network returns (registered once at import).
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((s) => setOnline(Boolean(s.isConnected) && s.isInternetReachable !== false)),
);

/** Slim top banner while offline; a brief "Back online" when it returns. */
export function OfflineBanner() {
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<"online" | "offline" | "back">("online");
  const y = useRef(new Animated.Value(-80)).current;
  const wasOffline = useRef(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const unsub = NetInfo.addEventListener((s) => {
      const online = Boolean(s.isConnected) && s.isInternetReachable !== false;
      if (!online) {
        wasOffline.current = true;
        setState("offline");
      } else if (wasOffline.current) {
        wasOffline.current = false;
        setState("back");
        reconnectSocket();
        t = setTimeout(() => setState("online"), 2200);
      }
    });
    return () => {
      unsub();
      if (t) clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    Animated.spring(y, { toValue: state === "online" ? -80 : 0, useNativeDriver: true, speed: 14, bounciness: 4 }).start();
  }, [state, y]);

  const offline = state === "offline";
  return (
    <Animated.View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={[styles.bar, { paddingTop: insets.top + 6, backgroundColor: offline ? "#0F172A" : "#059669", transform: [{ translateY: y }] }]}
    >
      <Icon name={offline ? "cloud-offline-outline" : "checkmark-circle"} size={15} color="#fff" />
      <Text style={{ color: "#fff", fontSize: 13, ...font.semibold }}>{offline ? "You're offline · showing saved results" : "Back online"}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 50, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, paddingBottom: 8 },
});
