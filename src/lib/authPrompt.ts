import { router, type Href } from "expo-router";
import { toast } from "./toast";

// Account-only routes (website ProtectedLayout). Logged-out visitors are
// sent to Login and returned here afterwards. Tabs (Chats, Sell, Profile)
// keep their own friendly logged-out screens instead.
export const PROTECTED_ROOTS = new Set([
  "orders",
  "wishlist",
  "notifications",
  "achievements",
  "settings",
  "my-listings",
  "pickup-spots",
  "edit-listing",
  "chat",
]);

/** Send a guest to Login with a short reason, then back to `next`. */
export const promptLogin = (message = "Please log in to continue", next?: string) => {
  toast(message);
  router.push(next ? { pathname: "/login", params: { next } } : "/login");
};

/** Only same-app paths are allowed as a post-login destination. */
export const safeNext = (next?: string | string[]) => {
  const v = Array.isArray(next) ? next[0] : next;
  return typeof v === "string" && v.startsWith("/") && !v.startsWith("//") ? v : null;
};

/** After login/signup: close the auth screens and land on Home (or `next` when a protected page sent us here). */
export const finishAuth = (next?: string | string[]) => {
  const to = safeNext(next);
  if (router.canDismiss()) router.dismissAll();
  if (to) router.push(to as Href);
  else router.navigate("/");
};
