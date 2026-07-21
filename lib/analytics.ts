"use client";

import { readCookieConsent } from "@/lib/cookie-consent";

export type AnalyticsEventName =
  | "diagnostic_start"
  | "diagnostic_section_complete"
  | "diagnostic_preview_generated"
  | "diagnostic_saved"
  | "checkout_started"
  | "purchase";

export function trackAnalyticsEvent(
  name: AnalyticsEventName,
  parameters: Record<string, string | number> = {}
) {
  if (
    typeof window === "undefined" ||
    readCookieConsent()?.analytics !== true ||
    typeof window.gtag !== "function"
  ) {
    return;
  }

  window.gtag("event", name, parameters);
}
