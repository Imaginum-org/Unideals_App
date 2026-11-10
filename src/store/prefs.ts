import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Device preferences (survive logout), mirroring the website's localStorage
// keys: theme, girlsMode, unideals_guest_campus_slug, recentSearches.
type Prefs = {
  theme: "system" | "light" | "dark";
  girlsMode: boolean;
  guestCampusSlug: string | null;
  recentSearches: string[];
  setTheme: (t: Prefs["theme"]) => void;
  setGirlsMode: (on: boolean) => void;
  setGuestCampusSlug: (slug: string | null) => void;
  pushRecentSearch: (q: string) => void;
  clearRecentSearches: () => void;
};

export const usePrefsStore = create<Prefs>()(
  persist(
    (set) => ({
      theme: "system",
      girlsMode: false,
      guestCampusSlug: null,
      recentSearches: [],
      setTheme: (theme) => set({ theme }),
      setGirlsMode: (girlsMode) => set({ girlsMode }),
      setGuestCampusSlug: (guestCampusSlug) => set({ guestCampusSlug }),
      pushRecentSearch: (q) =>
        set((s) => {
          const v = q.trim();
          if (!v) return s;
          return {
            recentSearches: [v, ...s.recentSearches.filter((x) => x.toLowerCase() !== v.toLowerCase())].slice(0, 8),
          };
        }),
      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: "unideals-prefs",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ theme, girlsMode, guestCampusSlug, recentSearches }) => ({
        theme,
        girlsMode,
        guestCampusSlug,
        recentSearches,
      }),
    },
  ),
);
