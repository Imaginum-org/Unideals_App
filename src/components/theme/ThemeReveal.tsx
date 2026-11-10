import { useEffect, useRef, useState, type ReactNode } from "react";
import { Image, Platform, StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { captureRef } from "react-native-view-shot";
import { scheduleOnRN } from "react-native-worklets";
import { create } from "zustand";

/**
 * Circular theme reveal (the website's View-Transition effect): the new
 * look grows out of the button that was tapped.
 *
 * 1. snapshot the app (old look) and pin it on top,
 * 2. apply the change underneath, snapshot again (new look),
 * 3. grow a circle from the tap point that shows the new snapshot,
 * 4. drop the overlay — the live app already matches it.
 *
 * Snapshots are taken of the app root only, never the overlay itself.
 */
type Frame = { from: string; to?: string; x: number; y: number };
const useReveal = create<{ frame: Frame | null }>(() => ({ frame: null }));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let root: any = null;
let running = false;
let fromLoaded: (() => void) | null = null;

const raf = () => new Promise<void>((r) => requestAnimationFrame(() => r()));
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const snap = () => captureRef(root, { format: "jpg", quality: 0.9, result: "tmpfile" });

const finish = () => {
  useReveal.setState({ frame: null });
  running = false;
};

/** Run `apply` (a theme / Girl Mode change) behind a circular reveal from `origin` (window coords). */
export async function revealChange(origin: { x: number; y: number }, apply: () => void) {
  if (Platform.OS === "web" || !root || running) return apply();
  running = true;
  let applied = false;
  try {
    const from = await snap();
    await new Promise<void>((resolve) => {
      fromLoaded = resolve;
      useReveal.setState({ frame: { from, x: origin.x, y: origin.y } });
      setTimeout(resolve, 350); // never hang if onLoad doesn't fire
    });
    fromLoaded = null;
    await raf();
    apply();
    applied = true;
    await raf();
    await raf();
    await wait(30);
    const to = await snap();
    useReveal.setState((s) => (s.frame ? { frame: { ...s.frame, to } } : s));
  } catch {
    if (!applied) apply();
    finish();
  }
}

function Overlay() {
  const frame = useReveal((s) => s.frame);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const p = useSharedValue(0);
  const startedFor = useRef<string | null>(null);

  const x = frame?.x ?? 0;
  const y = frame?.y ?? 0;
  const maxR = Math.hypot(Math.max(x, size.w - x), Math.max(y, size.h - y)) + 8;

  useEffect(() => {
    if (!frame) {
      startedFor.current = null;
      p.value = 0;
    }
  }, [frame, p]);

  const start = () => {
    if (!frame?.to || startedFor.current === frame.to) return;
    startedFor.current = frame.to;
    p.value = 0;
    p.value = withTiming(1, { duration: 620, easing: Easing.bezier(0.45, 0, 0.15, 1) }, (done) => {
      if (done) scheduleOnRN(finish);
    });
  };

  const circle = useAnimatedStyle(() => {
    const r = Math.max(0.5, p.value * maxR);
    return { left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r };
  });
  const inner = useAnimatedStyle(() => {
    const r = Math.max(0.5, p.value * maxR);
    return { left: r - x, top: r - y };
  });

  if (!frame) return null;
  return (
    <View style={StyleSheet.absoluteFill} onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      <Image source={{ uri: frame.from }} style={StyleSheet.absoluteFill} fadeDuration={0} onLoad={() => fromLoaded?.()} />
      {frame.to && size.w ? (
        <Animated.View style={[styles.circle, circle]}>
          <Animated.Image source={{ uri: frame.to }} fadeDuration={0} onLoad={start} style={[{ position: "absolute", width: size.w, height: size.h }, inner]} />
        </Animated.View>
      ) : null}
    </View>
  );
}

/** Wrap the app once (root layout). */
export function ThemeRevealHost({ children }: { children: ReactNode }) {
  return (
    <View style={{ flex: 1 }}>
      <View
        collapsable={Platform.OS === "web" ? undefined : false}
        style={{ flex: 1 }}
        ref={(v) => {
          root = v;
        }}
      >
        {children}
      </View>
      <Overlay />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { position: "absolute", overflow: "hidden" },
});
