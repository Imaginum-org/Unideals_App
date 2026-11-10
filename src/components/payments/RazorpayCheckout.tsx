import { Linking, Modal, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { IconButton, Loader, T } from "@/components/ui";
import { useTheme } from "@/theme";
import type { PaymentOrder } from "@/api/payments";

export type RazorpaySuccess = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };

type Props = {
  order: PaymentOrder | null;
  description: string;
  prefill?: { name?: string; email?: string };
  color: string;
  onSuccess: (r: RazorpaySuccess) => void;
  onDismiss: (reason?: string) => void;
};

/**
 * Razorpay Standard Checkout inside a WebView (works in Expo Go and store
 * builds — no native SDK). The order is created server-side, so the amount
 * can't be tampered with; the signature is verified by POST /api/payments/verify.
 */
export function RazorpayCheckout({ order, description, prefill, color, onSuccess, onDismiss }: Props) {
  const { c } = useTheme();
  if (!order) return null;
  const options = {
    key: order.keyId,
    amount: order.amount,
    currency: order.currency || "INR",
    order_id: order.orderId,
    name: "Unideals",
    description,
    image: "https://app.unideals.in/logo.svg",
    prefill: { name: prefill?.name || "", email: prefill?.email || "" },
    theme: { color },
  };
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<script src="https://checkout.razorpay.com/v1/checkout.js"></script></head>
<body style="margin:0;background:${c.bg}">
<script>
  function post(m){ window.ReactNativeWebView.postMessage(JSON.stringify(m)); }
  window.onload = function(){
    try {
      var o = ${JSON.stringify(options)};
      o.handler = function(r){ post({ type: "success", data: r }); };
      o.modal = { ondismiss: function(){ post({ type: "dismiss" }); }, confirm_close: true };
      var rzp = new Razorpay(o);
      rzp.on("payment.failed", function(r){ post({ type: "failed", reason: (r && r.error && r.error.description) || "Payment failed" }); });
      rzp.open();
    } catch (e) { post({ type: "dismiss", reason: "Unable to load payment gateway" }); }
  };
</script></body></html>`;

  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      if (msg.type === "success") onSuccess(msg.data);
      else if (msg.type === "failed") onDismiss(msg.reason);
      else onDismiss(msg.reason);
    } catch {
      onDismiss();
    }
  };

  return (
    <Modal visible animationType="slide" onRequestClose={() => onDismiss()}>
      <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 6 }}>
          <IconButton icon="close" onPress={() => onDismiss()} accessibilityLabel="Close payment" />
          <T variant="h3">Secure payment</T>
        </View>
        <WebView
          originWhitelist={["*"]}
          source={{ html, baseUrl: "https://checkout.razorpay.com" }}
          onMessage={onMessage}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          renderLoading={() => <Loader label="Opening Razorpay…" />}
          setSupportMultipleWindows={false}
          // UPI / wallet apps: hand intents like upi:// or tez:// to the OS.
          onShouldStartLoadWithRequest={(req) => {
            const url = req.url || "";
            if (/^(https?|about|data|blob):/i.test(url)) return true;
            Linking.openURL(url).catch(() => {});
            return false;
          }}
        />
      </SafeAreaView>
    </Modal>
  );
}
