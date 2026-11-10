import { QueryClient } from "@tanstack/react-query";
import { errorStatus } from "@/api/client";

// Short staleness mirrors the website's requestCache TTLs (30–60s), so
// going back to a screen is instant without serving very old listings.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 45_000,
      gcTime: 10 * 60_000,
      retry: (count, err) => {
        const s = errorStatus(err);
        if (s && s >= 400 && s < 500) return false; // 4xx won't fix itself
        return count < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: { retry: false },
  },
});
