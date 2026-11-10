import axios from "axios";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { Platform } from "react-native";
import { api } from "./client";
import { IMAGEKIT_PUBLIC_KEY } from "@/lib/env";

// Mirrors frontend/src/utils/imageUpload.js: the backend signs an upload
// (GET /api/imagekit/auth, bound to folder unideals/{userId}) and the
// device uploads straight to ImageKit — the API never proxies bytes.
const UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";

export type Uploaded = { url: string; fileId: string };

/** Downscale + JPEG-compress a picked photo (≈ browser-image-compression on web). */
export const compressPhoto = async (uri: string, { maxSide = 1600, quality = 0.75 } = {}) => {
  const original = await ImageManipulator.manipulate(uri).renderAsync();
  const ctx = ImageManipulator.manipulate(uri);
  // Downscale only, along the longer side (never upscale small photos).
  if (original.width > maxSide || original.height > maxSide) {
    ctx.resize(original.width >= original.height ? { width: maxSide } : { height: maxSide });
  }
  const image = await ctx.renderAsync();
  const result = await image.saveAsync({ compress: quality, format: SaveFormat.JPEG });
  return result.uri;
};

export const uploadImage = async (localUri: string, folder: "Products" | "Avatars" = "Products"): Promise<Uploaded> => {
  if (!IMAGEKIT_PUBLIC_KEY) throw new Error("Image uploads aren't configured (EXPO_PUBLIC_IMAGEKIT_PUBLIC_KEY).");

  const compressed = await compressPhoto(localUri, folder === "Avatars" ? { maxSide: 512, quality: 0.85 } : undefined);
  const { data: auth } = await api.get("/api/imagekit/auth");
  if (!auth?.signature || !auth?.token || !auth?.expire) throw new Error("Image service unavailable");

  const form = new FormData();
  // Native: RN networking (XHR) streams { uri } parts. Expo's global fetch
  // does not ("Unsupported FormDataPart implementation"), so upload via axios.
  if (Platform.OS === "web") form.append("file", await (await fetch(compressed)).blob(), `${Date.now()}.jpg`);
  else form.append("file", { uri: compressed, name: `${Date.now()}.jpg`, type: "image/jpeg" } as unknown as Blob);
  form.append("fileName", `${Date.now()}_unideals.jpg`);
  form.append("publicKey", IMAGEKIT_PUBLIC_KEY);
  form.append("signature", String(auth.signature));
  form.append("expire", String(auth.expire));
  form.append("token", String(auth.token));
  form.append("folder", String(auth.folder || folder));
  form.append("useUniqueFileName", "true");

  try {
    const { data: json } = await axios.post(UPLOAD_URL, form, {
      timeout: 60000,
      headers: { "Content-Type": "multipart/form-data", Accept: "application/json" },
      transformRequest: (d) => d, // keep FormData as-is
    });
    if (!json?.url || !json?.fileId) throw new Error("Image upload failed");
    return { url: json.url, fileId: json.fileId };
  } catch (err) {
    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
    throw new Error(msg || (err as Error)?.message || "Image upload failed");
  }
};

/** Best-effort orphan cleanup (never throws), same as the website. */
export const deleteImage = async (fileId?: string) => {
  if (!fileId) return false;
  try {
    await api.delete(`/api/imagekit/${encodeURIComponent(fileId)}`);
    return true;
  } catch {
    try {
      await api.delete("/api/imagekit/file", { data: { fileId } });
      return true;
    } catch {
      return false;
    }
  }
};
