import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

// Same receipt content as frontend/src/features/payment/utils/receiptPdf.js,
// rendered as HTML → PDF on device, then handed to the share sheet.
type Payment = {
  _id?: string;
  plan?: string;
  amount?: number; // paise
  status?: string;
  receipt?: string;
  createdAt?: string;
  verified_at?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
};

const esc = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch] as string);
const inr = (r: number) => `₹${Number(r || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—");
const PLAN: Record<string, string> = { pro: "Pro", pro_plus: "Pro Plus", boost_3day: "3-Day Listing Boost", boost_7day: "7-Day Listing Boost" };

export async function shareReceipt({ payment, customer, validity }: { payment: Payment; customer: { name?: string; email?: string }; validity?: string }) {
  const rupees = (payment.amount || 0) / 100;
  const isPaid = ["paid", "captured", "verified", "success"].includes(String(payment.status || "").toLowerCase());
  const planName = PLAN[payment.plan || ""] || payment.plan || "Plan";
  const receiptNo = payment.receipt || (payment._id ? `UD-${String(payment._id).slice(-8).toUpperCase()}` : "UD-RECEIPT");
  const details: [string, string | undefined][] = [
    ["Razorpay order", payment.razorpay_order_id],
    ["Razorpay payment", payment.razorpay_payment_id],
    ["Status", payment.status],
  ];
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    *{box-sizing:border-box}body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;margin:40px}
    .top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #3838ec;padding-bottom:18px}
    .brand{font-size:26px;font-weight:800;color:#3838ec}.muted{color:#64748b;font-size:12px}.h{font-size:11px;letter-spacing:1px;color:#94a3b8;font-weight:700}
    .grid{display:flex;justify-content:space-between;margin:26px 0}.pill{display:inline-block;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700;background:${isPaid ? "#e6ffeb;color:#008526" : "#fff4e5;color:#b45309"}}
    table{width:100%;border-collapse:collapse;margin-top:8px}th{background:#f7f8fa;text-align:left;font-size:11px;letter-spacing:1px;color:#64748b;padding:10px 14px}
    td{padding:14px;border-bottom:1px solid #eef1f5;font-size:14px}.r{text-align:right}.total{font-size:18px;font-weight:800}
    .foot{margin-top:40px;color:#94a3b8;font-size:11px;line-height:1.7}
  </style></head><body>
    <div class="top"><div><div class="brand">Unideals</div><div class="muted">Campus marketplace for students</div></div>
    <div style="text-align:right"><div class="h">PAYMENT RECEIPT</div><div class="muted">Receipt no. ${esc(receiptNo)}</div><div class="muted">Issued ${esc(fmt(new Date().toISOString()))}</div></div></div>
    <div class="grid"><div><div class="h">BILLED TO</div><div style="font-weight:700;margin-top:6px">${esc(customer.name || "Unideals member")}</div><div class="muted">${esc(customer.email || "")}</div></div>
    <div><div class="h">PAYMENT DATE</div><div style="font-weight:700;margin-top:6px">${esc(fmt(payment.verified_at || payment.createdAt))}</div></div>
    <div><span class="pill">${isPaid ? "PAID" : esc(String(payment.status || "PENDING").toUpperCase())}</span></div></div>
    <table><tr><th>DESCRIPTION</th><th>VALIDITY</th><th class="r">AMOUNT</th></tr>
    <tr><td><b>Unideals ${esc(planName)}${PLAN[payment.plan || ""]?.includes("Boost") ? "" : " plan"}</b><div class="muted">One-time payment. Does not renew automatically.</div></td><td>${esc(validity || "As per plan")}</td><td class="r">${esc(inr(rupees))}</td></tr>
    <tr><td></td><td class="total">${isPaid ? "Total paid" : "Total"}</td><td class="r total">${esc(inr(rupees))}</td></tr></table>
    <div style="margin-top:28px"><div class="h">PAYMENT DETAILS</div><table>${details
      .filter(([, v]) => v)
      .map(([k, v]) => `<tr><td class="muted">${esc(k)}</td><td class="r">${esc(v)}</td></tr>`)
      .join("")}</table></div>
    <div class="foot">This is a computer-generated receipt and does not need a signature.<br/>Payments are processed securely by Razorpay. Unideals never sees your card or UPI details.<br/>Questions about this payment? Write to hi@unideals.in</div>
  </body></html>`;
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Unideals receipt", UTI: "com.adobe.pdf" });
  }
  return uri;
}
