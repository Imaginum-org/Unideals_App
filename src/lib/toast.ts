import { create } from "zustand";

export type ToastKind = "info" | "success" | "error";
type ToastItem = { id: number; text: string; kind: ToastKind };

type ToastState = { items: ToastItem[]; push: (text: string, kind?: ToastKind) => void; dismiss: (id: number) => void };

let seq = 0;
export const useToastStore = create<ToastState>((set) => ({
  items: [],
  push: (text, kind = "info") => {
    const id = ++seq;
    set((s) => ({ items: [...s.items.filter((t) => t.text !== text), { id, text, kind }].slice(-3) }));
    setTimeout(() => set((s) => ({ items: s.items.filter((t) => t.id !== id) })), kind === "error" ? 4200 : 2800);
  },
  dismiss: (id) => set((s) => ({ items: s.items.filter((t) => t.id !== id) })),
}));

const push = (text: string, kind?: ToastKind) => useToastStore.getState().push(text, kind);
export const toast = Object.assign((text: string) => push(text, "info"), {
  success: (text: string) => push(text, "success"),
  error: (text: string) => push(text, "error"),
});
