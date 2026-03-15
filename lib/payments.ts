const DEFAULT_BASE_URL = "http://localhost:3000";

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_BASE_URL;
}

export function getReportUnlockPriceCents() {
  const rawValue = Number(process.env.STRIPE_PRICE_CENTS ?? "2900");
  return Number.isFinite(rawValue) && rawValue > 0 ? Math.round(rawValue) : 2900;
}

export function getReportUnlockPriceLabel() {
  return process.env.REPORT_UNLOCK_PRICE_LABEL || "29 $";
}

export function getStripeCurrency() {
  return (process.env.STRIPE_CURRENCY || "cad").toLowerCase();
}

export function getStripeProductName() {
  return "Rapport Loi 25 - Complet";
}

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
