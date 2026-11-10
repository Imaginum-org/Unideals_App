import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { create } from "zustand";
import { authApi } from "@/api/auth";
import { errorStatus, onSessionEvent, refreshSession } from "@/api/client";
import { userApi } from "@/api/user";
import { clearTokens, loadRefreshToken, setTokens } from "@/lib/tokens";
import { queryClient } from "@/lib/queryClient";
import type { User } from "@/types";

// Non-sensitive profile snapshot for an instant first paint (same idea as
// the website's trimmed `cachedUserDetails`). Tokens never go here.
const CACHE_KEY = "unideals.cachedUser";
const CACHEABLE: (keyof User)[] = [
  "_id", "name", "email", "avatar", "role", "subscription", "gender",
  "campus_id", "is_email_verified", "createdAt", "gamification",
];
const toCacheable = (u: User) => {
  const out: Partial<User> = {};
  for (const k of CACHEABLE) if (u[k] !== undefined) (out as any)[k] = u[k];
  return out;
};

type Status = "booting" | "guest" | "authed";

type AuthState = {
  status: Status;
  user: User | null;
  bootstrap: () => Promise<void>;
  completeLogin: (payload: { accessToken?: string; refreshToken?: string; user?: Partial<User> }) => Promise<void>;
  refreshProfile: () => Promise<User | null>;
  updateUser: (patch: Partial<User>) => void;
  logout: (opts?: { silent?: boolean }) => Promise<void>;
};

const persistUser = (u: User | null) => {
  if (!u) return AsyncStorage.removeItem(CACHE_KEY).catch(() => {});
  return AsyncStorage.setItem(CACHE_KEY, JSON.stringify(toCacheable(u))).catch(() => {});
};

export const useAuthStore = create<AuthState>((set, get) => ({
  status: "booting",
  user: null,

  bootstrap: async () => {
    const stored = await loadRefreshToken();
    if (!stored) {
      set({ status: "guest", user: null });
      return;
    }
    // Instant paint from the cached profile, then verify with the server.
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (raw) set({ user: JSON.parse(raw) as User, status: "authed" });
    } catch {
      // ignore corrupt cache
    }
    try {
      const token = await refreshSession();
      if (!token) {
        await get().logout({ silent: true });
        return;
      }
      if (get().user) set({ status: "authed" });
      const u = await get().refreshProfile();
      if (!u) set({ status: get().user ? "authed" : "guest" });
    } catch {
      // Offline / server down: keep the cached session; requests will
      // refresh lazily once the network is back.
      if (get().user) set({ status: "authed" });
      else set({ status: "guest" });
    }
  },

  completeLogin: async ({ accessToken, refreshToken, user }) => {
    if (!accessToken || !refreshToken) {
      throw new Error("This server doesn't support app sign-in yet. Update the backend (mobile auth mode).");
    }
    await setTokens({ accessToken, refreshToken });
    queryClient.clear();
    if (user) {
      const u = { ...(user as User), _id: String(user._id || user.id) };
      set({ user: u, status: "authed" });
    } else {
      set({ status: "authed" });
    }
    await get().refreshProfile();
  },

  refreshProfile: async () => {
    try {
      const u = await userApi.profile({ _silent: true } as any);
      if (u) {
        set({ user: u, status: "authed" });
        persistUser(u);
      }
      return u;
    } catch (err) {
      if (errorStatus(err) === 401) await get().logout({ silent: true });
      return get().user;
    }
  },

  updateUser: (patch) => {
    const prev = get().user;
    if (!prev) return;
    const next = { ...prev, ...patch };
    set({ user: next });
    persistUser(next);
  },

  logout: async ({ silent } = {}) => {
    const stored = await loadRefreshToken();
    if (!silent && stored) {
      // Best effort: revoke server-side. Never block the local logout.
      authApi.logout(stored).catch(() => {});
    }
    await clearTokens();
    await persistUser(null);
    queryClient.clear();
    set({ user: null, status: "guest" });
  },
}));

// Interceptor events → state. "expired" = refresh token is dead.
onSessionEvent((e) => {
  const { status, logout } = useAuthStore.getState();
  if (e.type === "blocked") {
    logout({ silent: true });
    Alert.alert("Account restricted", e.message);
  } else if (e.type === "expired" && status === "authed") {
    logout({ silent: true });
    Alert.alert("Session expired", "Please log in again to continue.");
  }
});

// ── Selectors / helpers ────────────────────────────────────────────────
export const useUser = () => useAuthStore((s) => s.user);
export const useIsLoggedIn = () => useAuthStore((s) => s.status === "authed");

/** Girls Corner 🌸 eligibility — female accounts + admin/support (backend rule). */
export const canSeeGirls = (u: User | null | undefined) =>
  Boolean(u && (u.gender === "female" || u.role === "admin" || u.role === "support"));
