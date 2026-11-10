import { api } from "./client";
import type { FeedResponse, Pagination, Product } from "@/types";

export type FeedParams = {
  page?: number;
  limit?: number;
  category?: string;
  condition?: string;
  min_price?: number;
  max_price?: number;
  sort?: "recommended" | "latest" | "price_low" | "price_high";
  audience?: "girls_only";
  posted_within?: string;
  negotiable?: "true";
  search?: string;
  campus_slug?: string;
};

const clean = <T extends Record<string, unknown>>(p: T) =>
  Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined && v !== null && v !== "")) as T;

export const productApi = {
  feed: (params: FeedParams) => api.get<FeedResponse>("/api/product", { params: clean(params) }).then((r) => r.data),
  boosted: (params: { campus_slug?: string; audience?: string; limit?: number }) =>
    api.get<{ data: Product[] }>("/api/product/boosted", { params: clean(params) }).then((r) => r.data.data || []),
  trending: (params: { campus_slug?: string }) =>
    api.get<{ data: Product[] }>("/api/product/trending", { params: clean(params) }).then((r) => r.data.data || []),
  search: (params: FeedParams & { q: string }) =>
    api
      .get<{ products: Product[]; pagination: Pagination }>("/api/product/search", { params: clean(params) })
      .then((r) => r.data),
  suggestions: (q: string, campus_slug?: string) =>
    api
      .get<{ data: Array<{ _id: string; title: string; slug?: string; category?: string }> }>(
        "/api/product/search-suggestions",
        { params: clean({ q, campus_slug }) },
      )
      .then((r) => r.data.data || []),
  detail: (id: string, params: { campus_slug?: string; view?: "edit" } = {}) =>
    api.get<{ data: Product }>(`/api/product/${encodeURIComponent(id)}`, { params: clean(params) }).then((r) => r.data.data),
  recordView: (id: string, campus_slug?: string) =>
    api.post(`/api/product/${encodeURIComponent(id)}/view`, null, { params: clean({ campus_slug }) }),
  mine: () => api.get<{ data: Product[] }>("/api/product/user/my-products").then((r) => r.data.data || []),
  drafts: () => api.get<{ data: Product[] }>("/api/product/user/drafts").then((r) => r.data.data || []),
  create: (payload: Record<string, unknown>) =>
    api.post<{ data: Product; isFirstListing?: boolean; gamification?: unknown }>("/api/product", payload).then((r) => r.data),
  update: (id: string, payload: Record<string, unknown>) =>
    api.patch<{ data: Product; gamification?: unknown }>(`/api/product/${id}`, payload).then((r) => r.data),
  remove: (id: string) => api.delete(`/api/product/${id}`),
  unlist: (id: string) => api.patch(`/api/product/${id}/unlist`),
  relist: (id: string) => api.patch(`/api/product/${id}/relist`),
  markSold: (id: string) => api.patch(`/api/product/${id}/sold`),
  boost: (id: string) => api.post<{ message?: string }>(`/api/boost/products/${id}`),
  boostSummary: () => api.get("/api/boost/me/summary").then((r) => r.data?.data),
  reportProduct: (id: string, data: { reason: string; description?: string }) =>
    api.post(`/api/report/product/${id}`, data),
};
