import { api } from "./client";
import type { ImageRef } from "@/types";

// POST /api/chat/assistant — same contract as the website's FloatingAssistant.
export type AssistantProduct = {
  _id: string;
  slug?: string;
  title: string;
  selling_price: number;
  images?: ImageRef[];
  condition?: string;
  conditionLabel?: string;
  categoryLabel?: string;
  is_negotiable?: boolean;
  views_count?: number;
};

export type AssistantReply = {
  reply: string;
  intent?: string;
  products?: AssistantProduct[];
  suggestions?: string[];
  estimate?: { category?: string; low: number; fair: number; high: number; sampleSize?: number } | null;
  comparison?: { product1: AssistantProduct; product2: AssistantProduct } | null;
  draft?: { title?: string; description?: string; categoryLabel?: string; pricingAdvice?: string; tags?: string[] } | null;
  checklist?: { category?: string; checklist?: string[] } | string[] | null;
  bundle?: { products: AssistantProduct[]; totalCost?: number; remainingBudget?: number; budgetUsedPercent?: number } | null;
  safetyTips?: string[] | null;
};

export const assistantApi = {
  ask: (message: string, history: { sender: "user" | "assistant"; text: string }[]) =>
    api.post<{ data: AssistantReply }>("/api/chat/assistant", { message, history, attachments: [] }, { timeout: 45000 }).then((r) => r.data.data),
};
