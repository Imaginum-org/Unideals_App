import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Product } from "@/types";

// "Recently viewed" — the minimal card fields only, newest first, max 12.
export type RecentItem = Pick<Product, "_id" | "slug" | "title" | "selling_price" | "original_price" | "images" | "category" | "condition" | "status"> & { viewedAt: number };

type State = {
  items: RecentItem[];
  push: (p: Product) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useRecentStore = create<State>()(
  persist(
    (set) => ({
      items: [],
      push: (p) =>
        set((s) => ({
          items: [
            {
              _id: p._id,
              slug: p.slug,
              title: p.title,
              selling_price: p.selling_price,
              original_price: p.original_price,
              images: (p.images || []).slice(0, 1),
              category: p.category,
              condition: p.condition,
              status: p.status,
              viewedAt: Date.now(),
            },
            ...s.items.filter((x) => x._id !== p._id),
          ].slice(0, 12),
        })),
      remove: (id) => set((s) => ({ items: s.items.filter((x) => x._id !== id) })),
      clear: () => set({ items: [] }),
    }),
    { name: "unideals-recent", storage: createJSONStorage(() => AsyncStorage) },
  ),
);
