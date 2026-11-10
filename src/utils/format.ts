import type { Avatar, DealStatus } from "@/types";

export const inr = (n?: number | null) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export const discountPct = (selling?: number, original?: number) =>
  original && selling && original > selling ? Math.round(((original - selling) / original) * 100) : 0;

/** "KAMAL SINHA" -> "Kamal Sinha" (frontend chat/utils/display.js). */
export const formatName = (name?: string | null) => {
  const s = String(name || "").trim().replace(/\s+/g, " ");
  if (!s) return "User";
  return s
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
};

export const initials = (name?: string | null) =>
  formatName(name)
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export const avatarUrl = (a: Avatar) => (!a ? null : typeof a === "string" ? a || null : a.url || null);

export const timeAgo = (iso?: string | Date | null) => {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const s = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export const clockTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }) : "";

export const shortDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

export const tierLabel = (t?: string) => (t === "pro_plus" ? "Pro+" : t === "pro" ? "Pro" : "Free");

export const isHot = (hot_until?: string) => Boolean(hot_until && new Date(hot_until).getTime() > Date.now());
export const isBoostLive = (p: { is_boosted?: boolean; boost_expires_at?: string }) =>
  Boolean(p.is_boosted && (!p.boost_expires_at || new Date(p.boost_expires_at).getTime() > Date.now()));

// ── Deal stages (single source of truth, frontend chat/utils/dealStage.js) ──
export const ORDER_STEPS = ["Order placed", "Confirmed", "Meeting scheduled", "Completed"];

export const dealStatusToStep = (s?: DealStatus | string) => {
  switch (s) {
    case "negotiating":
    case "offer_accepted":
      return 1;
    case "deal_confirmed":
      return 2;
    case "pickup_scheduled":
    case "payment_confirmed":
      return 3;
    case "completed":
      return 4;
    default:
      return 0;
  }
};

export const isActiveDeal = (s?: string) =>
  ["negotiating", "offer_accepted", "deal_confirmed", "pickup_scheduled", "payment_confirmed"].includes(String(s));

export type BadgeTone = "neutral" | "accent" | "warning" | "info" | "success" | "danger";
export const dealBadge = (s?: string): { label: string; tone: BadgeTone } => {
  switch (s) {
    case "negotiating":
      return { label: "Negotiating", tone: "neutral" };
    case "offer_accepted":
      return { label: "Offer accepted", tone: "accent" };
    case "deal_confirmed":
      return { label: "Reserved", tone: "warning" };
    case "pickup_scheduled":
      return { label: "Pickup scheduled", tone: "info" };
    case "payment_confirmed":
      return { label: "Payment confirmed", tone: "success" };
    case "completed":
      return { label: "Completed", tone: "success" };
    case "cancelled":
      return { label: "Cancelled", tone: "danger" };
    default:
      return { label: s || "Unknown", tone: "neutral" };
  }
};

/** Password strength (frontend auth/utils/passwordStrength.js rules). */
export const passwordChecks = (pw: string) => [
  { label: "At least 8 characters", ok: pw.length >= 8 },
  { label: "An uppercase letter", ok: /[A-Z]/.test(pw) },
  { label: "A lowercase letter", ok: /[a-z]/.test(pw) },
  { label: "A number", ok: /\d/.test(pw) },
  { label: "A special character", ok: /[^A-Za-z0-9]/.test(pw) },
];
