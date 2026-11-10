// ImageKit on-the-fly transforms (frontend/src/utils/imageTransform.js):
// uploads are stored full-res, every display requests a sized variant.
import type { ImageRef } from "@/types";

const isImageKit = (url?: string) => typeof url === "string" && /imagekit\.(io|net)/i.test(url);

export const ik = (url?: string, { w, h, q = 70 }: { w?: number; h?: number; q?: number } = {}) => {
  if (!url || !isImageKit(url) || !w || /[?&]tr=/.test(url)) return url;
  const tr = [`w-${w}`, h ? `h-${h}` : null, "c-at_max", `q-${q}`, "f-auto"].filter(Boolean).join(",");
  return `${url}${url.includes("?") ? "&" : "?"}tr=${tr}`;
};

export const ikThumb = (url?: string, size = 200) => ik(url, { w: size, h: size, q: 60 });
export const ikCard = (url?: string) => ik(url, { w: 600, q: 70 });
export const ikFull = (url?: string) => ik(url, { w: 1600, q: 80 });

export const firstImage = (images?: (ImageRef | string)[]) => {
  const e = images?.[0];
  return typeof e === "string" ? e : e?.url;
};
