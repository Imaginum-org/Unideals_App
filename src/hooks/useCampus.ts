import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { campusApi } from "@/api/user";
import { DEFAULT_CAMPUS_SLUG } from "@/lib/env";
import { useAuthStore } from "@/store/auth";
import { usePrefsStore } from "@/store/prefs";
import type { Campus } from "@/types";

export const useCampusDirectory = () =>
  useQuery({ queryKey: ["campuses"], queryFn: campusApi.list, staleTime: 10 * 60_000 });

/**
 * Which campus marketplace is active (same rules as frontend CampusContext):
 * - logged-in: the profile campus (backend scopes by req.user.campus_id);
 *   no campus → `needsGate` (onboarding picker blocks the app)
 * - guest: stored pick, else the flagship default.
 * `campusSlug` is sent as ?campus_slug on public reads (ignored server-side
 * for logged-in users) and keys every feed query.
 */
export const useCampus = () => {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const guestSlug = usePrefsStore((s) => s.guestCampusSlug);
  const { data: campuses = [], isLoading } = useCampusDirectory();

  return useMemo(() => {
    const isLoggedIn = status === "authed";
    const profile = user?.campus_id;
    let campus: Campus | null = null;
    if (isLoggedIn && profile) {
      if (typeof profile === "object") campus = profile;
      else campus = campuses.find((c) => c._id === profile || c.slug === profile) || { _id: profile, slug: "", name: "Your campus" };
    } else if (!isLoggedIn) {
      const slug = guestSlug || DEFAULT_CAMPUS_SLUG;
      campus = campuses.find((c) => c.slug === slug) || { _id: "", slug, name: "" };
    }
    return {
      campus,
      campusSlug: campus?.slug || (isLoggedIn ? undefined : guestSlug || DEFAULT_CAMPUS_SLUG),
      campuses,
      directoryLoading: isLoading,
      // Only once the profile is actually loaded: a session restored before
      // the profile arrives has user=null and must not trip the gate.
      needsGate: isLoggedIn && Boolean(user) && !profile,
      label: campus?.short_name || campus?.name || "Campus",
    };
  }, [status, user, guestSlug, campuses, isLoading]);
};
