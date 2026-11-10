import { useEffect, useRef } from "react";

// Tab bar → screen signal: tapping a tab (e.g. Home) asks that screen to
// scroll back to the top and reload.
type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();

export const emitTabPress = (tab: string) => listeners.get(tab)?.forEach((fn) => fn());

export const useTabPress = (tab: string, fn: Listener) => {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    const cb = () => ref.current();
    const set = listeners.get(tab) ?? new Set<Listener>();
    set.add(cb);
    listeners.set(tab, set);
    return () => {
      set.delete(cb);
    };
  }, [tab]);
};
