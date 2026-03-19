/** Currency config keyed by currency code */
const CURRENCIES: Record<string, { code: string; symbol: string; locale: string }> = {
  UGX: { code: "UGX", symbol: "UGX", locale: "en-UG" },
  KES: { code: "KES", symbol: "KES", locale: "en-KE" },
  TZS: { code: "TZS", symbol: "TZS", locale: "en-TZ" },
  NGN: { code: "NGN", symbol: "₦", locale: "en-NG" },
  GHS: { code: "GHS", symbol: "GH₵", locale: "en-GH" },
  ZAR: { code: "ZAR", symbol: "R", locale: "en-ZA" },
  RWF: { code: "RWF", symbol: "RWF", locale: "en-RW" },
  ETB: { code: "ETB", symbol: "ETB", locale: "en-ET" },
  XOF: { code: "XOF", symbol: "CFA", locale: "fr-SN" },
  USD: { code: "USD", symbol: "$", locale: "en-US" },
  EUR: { code: "EUR", symbol: "€", locale: "en-IE" },
  GBP: { code: "GBP", symbol: "£", locale: "en-GB" },
};

export const CURRENCY_OPTIONS = Object.entries(CURRENCIES).map(([code, c]) => ({
  value: code,
  label: `${c.symbol} — ${code}`,
}));

export function formatPrice(amount: number, currencyCode = "UGX"): string {
  const c = CURRENCIES[currencyCode] ?? CURRENCIES.UGX;
  return `${c.symbol} ${amount.toLocaleString(c.locale, { maximumFractionDigits: 0 })}`;
}
