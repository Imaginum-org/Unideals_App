import type { Product } from "@/types";

// Card → detail hand-off: the feed row is cached at tap time so the product
// screen paints instantly (title, photos, price) while the full record loads.
const cache = new Map<string, Product>();

export const rememberProduct = (p: Product) => {
  if (!p?._id) return;
  cache.set(p._id, p);
  if (p.slug) cache.set(p.slug, p);
  if (cache.size > 200) cache.delete(cache.keys().next().value as string);
};

export const previewProduct = (idOrSlug?: string) => (idOrSlug ? cache.get(idOrSlug) : undefined);
