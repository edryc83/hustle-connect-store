export const SUPPLIER_CURRENCIES = ["USD", "GBP", "AED", "EUR"];

export function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: currency === "UGX" ? 0 : 2 }).format(amount || 0);
}

export function waLink(phone?: string | null, text?: string) {
  const digits = String(phone || "").replace(/\D/g, "");
  const normalized = digits.startsWith("0") ? `256${digits.slice(1)}` : digits;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(text || "")}`;
}
