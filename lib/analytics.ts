"use client";

import { readCookieConsent } from "@/lib/cookie-consent";

export type AnalyticsEventName =
  | "diagnostic_start"
  | "diagnostic_section_complete"
  | "diagnostic_preview_generated"
  | "diagnostic_saved"
  | "generate_lead"
  | "checkout_started"
  | "purchase";

export type AnalyticsParameters = Record<
  string,
  string | number | boolean | undefined
>;

function cleanParameters(parameters: AnalyticsParameters) {
  return Object.fromEntries(
    Object.entries(parameters).filter(([, value]) => value !== undefined)
  ) as Record<string, string | number | boolean>;
}

export function trackAnalyticsEvent(
  name: AnalyticsEventName,
  parameters: AnalyticsParameters = {}
) {
  if (
    typeof window === "undefined" ||
    readCookieConsent()?.analytics !== true ||
    typeof window.gtag !== "function"
  ) {
    return;
  }

  window.gtag("event", name, cleanParameters(parameters));
}

export function trackAnalyticsEventOnce(
  name: AnalyticsEventName,
  uniqueKey: string,
  parameters: AnalyticsParameters = {}
) {
  if (typeof window === "undefined") return;

  const storageKey = `formeducweb-analytics-${name}-${uniqueKey}`;

  try {
    if (window.localStorage.getItem(storageKey)) return;
    trackAnalyticsEvent(name, parameters);

    if (
      readCookieConsent()?.analytics === true &&
      typeof window.gtag === "function"
    ) {
      window.localStorage.setItem(storageKey, "1");
    }
  } catch {
    trackAnalyticsEvent(name, parameters);
  }
}
