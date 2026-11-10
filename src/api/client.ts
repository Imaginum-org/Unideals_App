import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "@/lib/env";
import { clearTokens, getAccessToken, loadRefreshToken, setTokens } from "@/lib/tokens";

// Same backend as the website. The website authenticates with HttpOnly
// cookies; the app opts into the backend's mobile mode (x-client-type)
// and sends `Authorization: Bearer <access>` instead.
export const MOBILE_HEADERS = { "x-client-type": "mobile" };

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: false,
  headers: MOBILE_HEADERS,
});

// ── Session events (consumed by the auth store) ─────────────────────────
type SessionEvent = { type: "expired" } | { type: "blocked"; message: string };
const listeners = new Set<(e: SessionEvent) => void>();
export const onSessionEvent = (fn: (e: SessionEvent) => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const emit = (e: SessionEvent) => listeners.forEach((fn) => fn(e));

// ── Refresh (single flight) ─────────────────────────────────────────────
let refreshing: Promise<string | null> | null = null;

/**
 * Mint a new access token from the stored refresh token. Resolves with
 * the new token, or null when the session is dead (hard 401). Network or
 * 5xx/429 failures reject so callers never mistake a blip for a logout.
 */
export const refreshSession = (): Promise<string | null> => {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const stored = await loadRefreshToken();
    if (!stored) return null;
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/refresh-token`,
        { refreshToken: stored },
        { headers: MOBILE_HEADERS, timeout: 20000 },
      );
      const data = res.data?.data || {};
      if (!data.accessToken) return null;
      await setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      return data.accessToken as string;
    } catch (err) {
      const e = err as AxiosError<{ accountBlocked?: boolean; message?: string }>;
      if (e.response?.data?.accountBlocked) {
        await clearTokens();
        emit({ type: "blocked", message: e.response.data.message || "Your account is restricted." });
        return null;
      }
      if (e.response?.status === 401) {
        await clearTokens();
        return null;
      }
      throw err;
    }
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
};

// Auth endpoints answer credential problems with 401/403 themselves —
// never spend the refresh token on them (same rule as the website).
const isAuthEndpoint = (url = "") =>
  /\/api\/auth\/(login|register|refresh-token|google|verify-email|forgot-password|reset-password|resend-verification|check-verification)/.test(
    url,
  );

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean; _silent?: boolean };

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<{ accountBlocked?: boolean; message?: string }>) => {
    const original = error.config as RetryConfig | undefined;
    const status = error.response?.status;

    if (status === 403 && error.response?.data?.accountBlocked) {
      await clearTokens();
      emit({ type: "blocked", message: error.response.data.message || "Your account is restricted." });
      return Promise.reject(error);
    }

    if (status === 401 && original && !original._retry && !isAuthEndpoint(original.url)) {
      original._retry = true;
      let token: string | null = null;
      try {
        token = await refreshSession();
      } catch {
        // Network/5xx during refresh: keep the session, surface the error.
        return Promise.reject(error);
      }
      if (!token) {
        if (!original._silent) emit({ type: "expired" });
        return Promise.reject(error);
      }
      original.headers.Authorization = `Bearer ${token}`;
      return api(original);
    }

    return Promise.reject(error);
  },
);

/** Human-readable message from any API error (backend uses { message }). */
export const errorMessage = (err: unknown, fallback = "Something went wrong. Please try again.") => {
  const e = err as AxiosError<{ message?: string }>;
  if (e?.response?.data?.message) return String(e.response.data.message).trim();
  if (e?.code === "ECONNABORTED") return "The request timed out. Check your connection.";
  if (e?.message === "Network Error") return "Can't reach Unideals. Check your internet connection.";
  return fallback;
};

export const errorCode = (err: unknown) =>
  (err as AxiosError<{ code?: string }>)?.response?.data?.code;

export const errorStatus = (err: unknown) => (err as AxiosError)?.response?.status;

export type SilentConfig = AxiosRequestConfig & { _silent?: boolean };
