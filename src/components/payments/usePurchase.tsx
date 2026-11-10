import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { promptLogin } from "@/lib/authPrompt";
import { errorMessage } from "@/api/client";
import { paymentApi, type PaymentOrder } from "@/api/payments";
import { toast } from "@/lib/toast";
import { useAuthStore } from "@/store/auth";
import { useTheme } from "@/theme";
import { RazorpayCheckout, type RazorpaySuccess } from "./RazorpayCheckout";

/**
 * Server-created Razorpay order → checkout → server verification. Used for
 * plans ("pro" | "pro_plus") and one-off boosts ("boost_3day" | "boost_7day").
 * Render `checkout` once in the screen.
 */
export const usePurchase = () => {
  const { c } = useTheme();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const loggedIn = useAuthStore((s) => s.status === "authed");
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const [order, setOrder] = useState<(PaymentOrder & { label: string }) | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const resolver = useRef<((ok: boolean) => void) | null>(null);

  const finish = (ok: boolean) => {
    setOrder(null);
    setBusy(null);
    resolver.current?.(ok);
    resolver.current = null;
  };

  const start = useCallback(
    async (plan: string, label: string, productId?: string): Promise<boolean> => {
      if (!loggedIn) {
        promptLogin("Log in to upgrade your plan");
        return false;
      }
      setBusy(plan);
      try {
        const o = await paymentApi.createOrder(plan, productId);
        if (!o.keyId) throw new Error("Payments are unavailable right now. Please try later.");
        return await new Promise<boolean>((resolve) => {
          resolver.current = resolve;
          setOrder({ ...o, label });
        });
      } catch (err) {
        toast.error(errorMessage(err, (err as Error)?.message || "Couldn't start the payment"));
        setBusy(null);
        return false;
      }
    },
    [loggedIn],
  );

  const onSuccess = async (r: RazorpaySuccess) => {
    setOrder(null);
    try {
      await paymentApi.verify(r);
      toast.success("Payment successful. You're all set.");
      await refreshProfile();
      ["billing", "pricing", "my-listings", "feed", "boost-summary", "product"].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
      finish(true);
    } catch (err) {
      toast.error(errorMessage(err, "We couldn't confirm the payment yet. If money was debited it will reflect shortly."));
      finish(false);
    }
  };

  const checkout = (
    <RazorpayCheckout
      order={order}
      description={order?.label || "Unideals"}
      prefill={{ name: user?.name, email: user?.email }}
      color={c.accent}
      onSuccess={onSuccess}
      onDismiss={(reason) => {
        if (reason) toast.error(reason);
        finish(false);
      }}
    />
  );

  return { start, busy, checkout };
};
