import { api, type SilentConfig } from "./client";
import type { Campus, PickupSpot, Product, User } from "@/types";

export const userApi = {
  profile: (config: SilentConfig = {}) =>
    api.get<{ success: boolean; user: User }>("/api/user/userProfile", config).then((r) => r.data.user),
  updateProfile: (data: Record<string, unknown>) =>
    api.put<{ user?: User; movedListings?: number; message?: string }>("/api/user/updateProfile", data).then((r) => r.data),
  updateAvatar: (avatar: { url: string; fileId: string }) =>
    api.put<{ user?: User; data?: User }>("/api/user/updateAvatar", { avatar }).then((r) => r.data),
  removeAvatar: () => api.delete("/api/user/removeAvatar"),
  updateChatSettings: (data: Record<string, unknown>) => api.put("/api/user/chatSettings", data),
  requestGenderChange: (requestedGender: "female" | "male") =>
    api.post("/api/user/requestGenderChange", { requestedGender }),
  genderChangeStatus: () =>
    api
      .get<{ gender: string | null; genderChangeRequest: { requestedGender?: string; status?: "pending" | "approved" | "rejected" | null } | null }>(
        "/api/user/genderChangeStatus",
      )
      .then((r) => r.data),
  deleteAccount: (data: Record<string, unknown> = {}) => api.delete("/api/user/deleteAccount", { data }),
  insights: () => api.get("/api/user/insights").then((r) => r.data?.data),
  labs: () => api.get("/api/user/labs").then((r) => (r.data?.data || []) as Array<{ key: string; enabled: boolean }>),

  // NB: this endpoint answers { pickupSpots } (not { data }).
  pickupSpots: () => api.get<{ pickupSpots: PickupSpot[] }>("/api/pickup-spots").then((r) => r.data.pickupSpots || []),
  createPickupSpot: (data: { name: string; detail: string; isPrimary?: boolean }) =>
    api.post("/api/pickup-spots", data),
  updatePickupSpot: (id: string, data: { name: string; detail: string }) => api.put(`/api/pickup-spots/${id}`, data),
  deletePickupSpot: (id: string) => api.delete(`/api/pickup-spots/${id}`),
  setPrimaryPickupSpot: (id: string) => api.patch(`/api/pickup-spots/${id}/primary`),

  reportUser: (id: string, data: { reason: string; description?: string }) => api.post(`/api/report/user/${id}`, data),
  contactSupport: (data: Record<string, unknown>) => api.post("/api/report/support", data),
};

export const wishlistApi = {
  list: () =>
    api.get<{ data: Product[] }>("/api/wishlist", { params: { page: 1, limit: 50 } }).then((r) => r.data.data || []),
  toggle: (productId: string) =>
    api
      .post<{ data: { isInWishlist: boolean } }>("/api/wishlist/toggle", { productId })
      .then((r) => Boolean(r.data?.data?.isInWishlist)),
  remove: (productId: string) => api.post("/api/wishlist/remove", { productId }),
};

export const campusApi = {
  list: () => api.get<{ data: Campus[] }>("/api/campuses").then((r) => r.data.data || []),
  stats: (campus_slug?: string) =>
    api.get("/api/campuses/stats", { params: campus_slug ? { campus_slug } : {} }).then((r) => r.data?.data),
};

export type BadgeDef = { id: string; category: string; name: string; icon: string; tiers: { tier: string; xp: number; label: string }[] };
export type Gamification = {
  total_xp: number;
  level: number;
  rank_title: string;
  badges: { badge_id: string; tier?: string; category?: string; earned_at?: string }[];
  xp_to_next_level?: number;
  next_level?: number;
  progress_percent?: number;
  locked_badges?: { badge_id: string; progress?: { current: number; required: number } }[];
};

export const badgeApi = {
  config: () => api.get<{ data: BadgeDef[] }>("/api/badges/config").then((r) => r.data.data || []),
  mine: () => api.get<{ data: Gamification }>("/api/badges/me").then((r) => r.data.data),
  recompute: () => api.post("/api/badges/compute"),
  leaderboard: (limit = 20) => api.get("/api/badges/leaderboard", { params: { limit } }).then((r) => r.data?.data ?? []),
  rewards: () => api.get("/api/rewards/me").then((r) => r.data?.data),
};

export const reviewApi = {
  rateSeller: (conversationId: string, rating: number, comment = "") =>
    api.post("/api/reviews", { conversationId, rating, comment }),
  mine: () => api.get("/api/reviews/me").then((r) => r.data?.data),
};
