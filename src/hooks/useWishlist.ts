import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { promptLogin } from "@/lib/authPrompt";
import { errorMessage } from "@/api/client";
import { wishlistApi } from "@/api/user";
import { useIsLoggedIn } from "@/store/auth";
import { toast } from "@/lib/toast";
import type { Product } from "@/types";

const KEY = ["wishlist"];
const idOf = (p: Product | string) => (typeof p === "string" ? p : p?._id);

/** Wishlist with optimistic toggle + rollback (same as WishlistContext). */
export const useWishlist = () => {
  const loggedIn = useIsLoggedIn();
  const qc = useQueryClient();
  const query = useQuery({ queryKey: KEY, queryFn: wishlistApi.list, enabled: loggedIn });
  const items = loggedIn ? query.data || [] : [];
  const ids = useMemo(() => new Set(items.map(idOf)), [items]);

  const toggle = useMutation({
    mutationFn: ({ product }: { product: Product }) => wishlistApi.toggle(product._id),
    onMutate: async ({ product }) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData<Product[]>(KEY) || [];
      const has = prev.some((p) => idOf(p) === product._id);
      qc.setQueryData<Product[]>(KEY, has ? prev.filter((p) => idOf(p) !== product._id) : [product, ...prev]);
      return { prev, added: !has };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(KEY, ctx.prev);
      toast.error(errorMessage(err, "Couldn't update your wishlist"));
    },
    onSuccess: (_isIn, _vars, ctx) => {
      toast.success(ctx?.added ? "Saved to wishlist" : "Removed from wishlist");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return {
    items,
    isLoading: query.isLoading && loggedIn,
    refetch: query.refetch,
    isSaved: (id?: string) => (id ? ids.has(id) : false),
    toggle: (product: Product) => {
      if (!loggedIn) {
        promptLogin("Log in to save items to your wishlist");
        return;
      }
      toggle.mutate({ product });
    },
  };
};
