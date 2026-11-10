import { api } from "./client";

export type Billing = {
  tier: "base_user" | "pro" | "pro_plus" | string;
  status?: string;
  isLifetime?: boolean;
  expiresAt?: string;
  startedAt?: string;
  limits?: { activeListings?: number | null; wishlist?: number | null };
  usage?: {
    activeListings?: number;
    wishlist?: number;
    boost?: { monthlyUsed?: number; monthlyRemaining?: number | null };
  };
  payments?: Array<{ _id: string; amount: number; plan?: string; status?: string; createdAt?: string; razorpay_payment_id?: string }>;
};

export type PlanPricing = {
  offer?: string | null;
  plans?: Record<string, { amount: number; baseAmount: number }>;
};

export type PaymentOrder = {
  orderId: string;
  amount: number;
  currency: string;
  plan: string;
  keyId?: string;
  productId?: string;
};

export const paymentApi = {
  billing: () => api.get<{ data: Billing }>("/api/payments/me").then((r) => r.data.data),
  pricing: () => api.get<{ data: PlanPricing }>("/api/payments/plans").then((r) => r.data.data),
  /** plan: "pro" | "pro_plus" | boost add-on id; productId for add-ons. */
  createOrder: (plan: string, productId?: string) =>
    api
      .post<{ data: PaymentOrder; message?: string }>("/api/payments/orders", { plan, ...(productId ? { productId } : {}) })
      .then((r) => r.data.data),
  verify: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
    api.post<{ message?: string; data?: unknown }>("/api/payments/verify", data).then((r) => r.data),
};
