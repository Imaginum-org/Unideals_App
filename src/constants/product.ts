// Ported 1:1 from frontend/src/features/product/constants — values must
// match backend/src/config/constants.js enums exactly.

import type { IconName } from "@/components/ui/Icon";


export type Option = { value: string; label: string; description?: string; girlsOnly?: boolean; icon?: IconName };

export const CATEGORIES: Option[] = [
  { value: "electronics", label: "Electronics", description: "Laptops, tablets, calculators, headphones", icon: "laptop-outline" },
  { value: "study_material", label: "Study Material", description: "Textbooks, notes, guides, question banks", icon: "book-outline" },
  { value: "hostel_essentials", label: "Hostel Essentials", description: "Mattresses, buckets, lamps, room supplies", icon: "bed-outline" },
  { value: "clothing", label: "Clothing", description: "T-shirts, hoodies, jackets, ethnic wear", icon: "shirt-outline" },
  { value: "accessories", label: "Accessories", description: "Watches, bags, wallets, earphones", icon: "watch-outline" },
  { value: "lab_equipment", label: "Lab Equipment", description: "Lab coats, kits, instruments, records", icon: "flask-outline" },
  { value: "sports", label: "Sports", description: "Cricket bats, footballs, rackets, gear", icon: "football-outline" },
  { value: "fitness", label: "Fitness", description: "Dumbbells, resistance bands, gym equipment", icon: "barbell-outline" },
  { value: "vehicles", label: "Vehicles", description: "Bicycles, scooters, bike accessories", icon: "bicycle-outline" },
  { value: "event_passes", label: "Event Passes", description: "Concerts, fests, workshops, competitions", icon: "ticket-outline" },
  { value: "others", label: "Others", description: "Anything that doesn't fit above categories", icon: "grid-outline" },
  // Girls Corner 🌸 — only in Girls Mode
  { value: "beauty_personal_care", label: "Beauty & Personal Care", description: "Makeup, skincare, haircare, grooming essentials", girlsOnly: true, icon: "sparkles-outline" },
  { value: "womens_fashion", label: "Women's Fashion", description: "Dresses, kurtis, tops, ethnic and western wear", girlsOnly: true, icon: "woman-outline" },
  { value: "jewellery_hair_accessories", label: "Jewellery & Hair Accessories", description: "Earrings, necklaces, clips, bands, scrunchies", girlsOnly: true, icon: "diamond-outline" },
  { value: "footwear_handbags", label: "Footwear & Handbags", description: "Heels, flats, sneakers, handbags, backpacks", girlsOnly: true, icon: "bag-handle-outline" },
  { value: "room_decor", label: "Room & Hostel Decor", description: "Fairy lights, wall art, organizers, bedding, frames", girlsOnly: true, icon: "flower-outline" },
];

export const GIRLS_ONLY_CATEGORIES = CATEGORIES.filter((c) => c.girlsOnly).map((c) => c.value);

// Girls Mode curated order (frontend productOptions.js GIRLS_MODE_CATEGORY_ORDER).
export const GIRLS_MODE_CATEGORY_ORDER = [
  "womens_fashion", "beauty_personal_care", "jewellery_hair_accessories", "footwear_handbags",
  "clothing", "accessories", "room_decor", "hostel_essentials", "study_material",
  "electronics", "event_passes", "sports", "others",
];

export const categoriesFor = (girlsMode: boolean) =>
  girlsMode
    ? GIRLS_MODE_CATEGORY_ORDER.map((v) => CATEGORIES.find((c) => c.value === v)!).filter(Boolean)
    : CATEGORIES.filter((c) => !c.girlsOnly);

/** Every category a seller may list in (girls-only ones need Girls Mode). */
export const listingCategoriesFor = (girlsMode: boolean) =>
  girlsMode
    ? [...categoriesFor(true), ...CATEGORIES.filter((c) => !GIRLS_MODE_CATEGORY_ORDER.includes(c.value))]
    : CATEGORIES.filter((c) => !c.girlsOnly);

export const CONDITIONS: Option[] = [
  { value: "brand_new", label: "Brand New" },
  { value: "like_new", label: "Like New" },
  { value: "gently_used", label: "Gently Used" },
  { value: "well_used", label: "Well Used" },
  { value: "for_parts_or_not_working", label: "For Parts or Not Working" },
];

export const USAGE_DURATIONS: Option[] = [
  { value: "less_than_1_month", label: "Less than 1 month" },
  { value: "one_to_three_months", label: "1 - 3 months" },
  { value: "three_to_six_months", label: "3 - 6 months" },
  { value: "six_to_twelve_months", label: "6 - 12 months" },
  { value: "one_to_two_years", label: "1 - 2 years" },
  { value: "more_than_two_years", label: "More than 2 years" },
];

export const PAYMENT_OPTIONS: Option[] = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "both", label: "Cash or UPI" },
];

export const SORT_OPTIONS: Option[] = [
  { value: "recommended", label: "Recommended" },
  { value: "latest", label: "Newest first" },
  { value: "price_low", label: "Price: low to high" },
  { value: "price_high", label: "Price: high to low" },
];

export const REPORT_REASONS: Option[] = [
  { value: "spam_or_advertisement", label: "Spam or advertisement" },
  { value: "fake_or_misleading", label: "Fake or misleading" },
  { value: "inappropriate_content", label: "Inappropriate content" },
  { value: "fraud_or_scam", label: "Fraud or scam" },
  { value: "prohibited_item", label: "Prohibited item" },
  { value: "duplicate_listing", label: "Duplicate listing" },
  { value: "wrong_category", label: "Wrong category" },
  { value: "sold_or_unavailable", label: "Sold or unavailable" },
  { value: "other", label: "Other" },
];

export const labelOf = (opts: Option[], v?: string | null) => opts.find((o) => o.value === v)?.label || "";
export const categoryOf = (v?: string) => CATEGORIES.find((c) => c.value === v);

// ── Listing smarts (ported from frontend product/utils/listingSmarts.js) ──
type Rule = {
  color?: "off";
  condition?: { fixed: string; why: string };
  usage?: { fixed: string; why: string };
  brandPlaceholder?: string;
  titlePlaceholder?: string;
};
export const CATEGORY_RULES: Record<string, Rule> = {
  study_material: { color: "off", brandPlaceholder: "e.g. Arihant, Pearson, HC Verma", titlePlaceholder: "e.g. HC Verma Concepts of Physics Vol 1" },
  event_passes: {
    color: "off",
    condition: { fixed: "brand_new", why: "Passes are either valid or not, so condition doesn't apply." },
    usage: { fixed: "less_than_1_month", why: "Passes aren't used before the event." },
    brandPlaceholder: "e.g. Fest or organiser name",
    titlePlaceholder: "e.g. Sunburn Campus 2026 entry pass",
  },
  electronics: { brandPlaceholder: "e.g. Apple, Dell, Casio", titlePlaceholder: "e.g. Casio fx-991ES Plus calculator" },
  clothing: { brandPlaceholder: "e.g. Nike, H&M, Levi's", titlePlaceholder: "e.g. Nike hoodie, size M" },
  vehicles: { brandPlaceholder: "e.g. Hero, Btwin, Honda", titlePlaceholder: "e.g. Btwin Rockrider bicycle" },
  sports: { brandPlaceholder: "e.g. SG, Yonex, Nivia", titlePlaceholder: "e.g. SG English willow cricket bat" },
  fitness: { brandPlaceholder: "e.g. Decathlon, Kore", titlePlaceholder: "e.g. 10 kg adjustable dumbbell set" },
  hostel_essentials: { brandPlaceholder: "e.g. Prestige, Philips", titlePlaceholder: "e.g. Prestige electric kettle 1.5 L" },
  lab_equipment: { brandPlaceholder: "e.g. Omega, Camlin", titlePlaceholder: "e.g. Mini drafter + lab coat combo" },
  accessories: { brandPlaceholder: "e.g. Titan, Wildcraft", titlePlaceholder: "e.g. Wildcraft 35 L backpack" },
};
export const rulesFor = (category?: string): Rule => (category && CATEGORY_RULES[category]) || {};

const USAGE_ORDER = USAGE_DURATIONS.map((u) => u.value);
const USAGE_MAX_MONTHS = [1, 3, 6, 12, 24, Infinity];

const monthsSince = (iso?: string) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return Math.max(0, (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 30.4375));
};

/** Usage options possible given purchase date + condition (+ category lock). */
export const allowedUsage = (purchaseDate?: string, condition?: string, category?: string) => {
  const fixed = rulesFor(category).usage?.fixed;
  if (fixed) return [fixed];
  if (condition === "brand_new") return ["less_than_1_month"];
  const m = monthsSince(purchaseDate);
  if (m == null) return USAGE_ORDER;
  const i = USAGE_MAX_MONTHS.findIndex((max) => m < max);
  return USAGE_ORDER.slice(0, (i === -1 ? USAGE_ORDER.length - 1 : i) + 1);
};

export const usageConflict = (usage?: string, purchaseDate?: string, condition?: string, category?: string) => {
  if (!usage) return null;
  if (allowedUsage(purchaseDate, condition, category).includes(usage)) return null;
  if (condition === "brand_new") return "A Brand New item hasn't been used. Pick “Less than 1 month”.";
  return "That's longer than you've had it. Check the purchase date or usage.";
};

/** Same whitespace normalisation the backend applies to descriptions. */
export const normalizeMultiline = (value: string) =>
  value
    .replace(/\r\n?/g, "\n")
    .replace(/[   -   　]/g, " ")
    .replace(/[​⁠﻿]/g, "")
    .split("\n")
    .map((line) => line.replace(/[ \t\f\v]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
