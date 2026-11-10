import { api } from "./client";
import type { AppNotification, ConversationDetail, ConversationRow, Deal, Message } from "@/types";

// All chat REST lives under /api/conversations (same as frontend chatApi.js).
const C = "/api/conversations";

export const chatApi = {
  list: (params: { role?: "all" | "buying" | "selling"; search?: string } = {}) =>
    api
      .get<{ data: ConversationRow[]; meta?: { unreadTotal?: number } }>(C, {
        params: { role: params.role || "all", search: params.search || "", limit: 50 },
      })
      .then((r) => r.data.data || []),
  unreadCount: () =>
    api.get<{ data: { unreadTotal: number } }>(`${C}/unread-count`).then((r) => Number(r.data?.data?.unreadTotal || 0)),
  start: (productId: string) => api.post<{ data: { _id: string } }>(C, { productId }).then((r) => r.data.data),
  get: (id: string) => api.get<{ data: ConversationDetail }>(`${C}/${id}`).then((r) => r.data.data),
  messages: (id: string, before?: string) =>
    api
      .get<{ data: Message[]; hasMore?: boolean }>(`${C}/${id}/messages`, {
        params: { limit: 50, ...(before ? { before } : {}) },
      })
      .then((r) => ({ messages: r.data.data || [], hasMore: Boolean(r.data.hasMore) })),
  send: (id: string, text: string, replyTo?: string) =>
    api.post<{ data: Message }>(`${C}/${id}/messages`, { text, ...(replyTo ? { replyTo } : {}) }).then((r) => r.data.data),
  markRead: (id: string, receipt = true) => api.patch(`${C}/${id}/read`, { receipt }),
  deal: (id: string) => api.get<{ data: { deal: Deal } }>(`${C}/${id}/deal`).then((r) => r.data.data?.deal),
  makeOffer: (id: string, amount: number) =>
    api.post<{ data: { deal: Deal; message: Message } }>(`${C}/${id}/offers`, { amount }).then((r) => r.data.data),
  respondOffer: (id: string, messageId: string, action: "accept" | "decline") =>
    api.post(`${C}/${id}/offers/respond`, { messageId, action }).then((r) => r.data?.data),
  confirmDeal: (id: string, amount: number) => api.post(`${C}/${id}/confirm`, { amount }).then((r) => r.data?.data),
  schedulePickup: (id: string, date: string, location: string) =>
    api.post(`${C}/${id}/pickup`, { date, location }).then((r) => r.data?.data),
  confirmPayment: (id: string) => api.post(`${C}/${id}/payment-confirm`).then((r) => r.data?.data),
  confirmReceived: (id: string) => api.post(`${C}/${id}/item-received`).then((r) => r.data?.data),
  cancel: (id: string, reason = "") => api.post(`${C}/${id}/cancel`, { reason }).then((r) => r.data?.data),
  revert: (id: string, from?: string) => api.post(`${C}/${id}/revert`, from ? { from } : {}).then((r) => r.data?.data),
};

export type OrderRow = {
  orderId: string;
  conversationId: string;
  role: "buying" | "selling";
  product: { _id?: string; title?: string; selling_price?: number; images?: { url: string }[]; status?: string };
  otherParty: { _id: string; name: string; avatar?: unknown } | null;
  dealStatus: Deal["status"];
  price: number;
  originalPrice?: number;
  pickup: { date: string; location: string } | null;
  paymentConfirmed?: boolean;
  itemReceived?: boolean;
  myRating?: { rating: number } | number | null;
  updatedAt?: string;
  createdAt?: string;
};

export const ordersApi = {
  list: (params: { role?: string; status?: string } = {}) =>
    api
      .get<{ data: OrderRow[]; counts?: Record<string, number> }>("/api/orders", {
        params: { role: params.role || "all", status: params.status || "all", limit: 50 },
      })
      .then((r) => ({ orders: r.data.data || [], counts: r.data.counts || {} })),
};

const safeActionPath = (value: unknown, fallback = "/notification") => {
  if (typeof value !== "string") return fallback;
  const v = value.trim();
  return v.startsWith("/") && !v.startsWith("//") && !v.includes("\\") ? v : fallback;
};

// Same normalisation as frontend NotificationContext.
export const normalizeNotification = (n: Record<string, any>): AppNotification => ({
  id: String(n.id || n._id),
  _id: n._id,
  title: n.title || "Notification",
  description: n.message || n.description || "",
  time: n.time,
  actionPath: safeActionPath(n.actionPath || n.action_url),
  unread: n.unread === undefined ? true : Boolean(n.unread),
  type: n.type,
  imageUrl: n.imageUrl || n.image_url,
  actionLabel: n.actionLabel || n.action_label,
  createdAt: n.createdAt,
});

export const notificationApi = {
  list: () =>
    api.get("/api/notifications").then((r) => ((r.data?.data || []) as Record<string, any>[]).map(normalizeNotification)),
  markRead: (id: string) => api.patch(`/api/notifications/${id}/read`),
  markAllRead: () => api.patch("/api/notifications/read-all"),
  trackClick: (id: string) => api.post(`/api/notifications/${id}/click`),
  dismiss: (id: string) => api.delete(`/api/notifications/${id}`),
};
