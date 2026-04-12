import { getTrackerConfig, readCookieConsent } from "@/lib/cookie-consent";

type GoogleAdsPayloadValue = string | number | boolean | null | undefined;
export type GoogleAdsPayload = Record<string, GoogleAdsPayloadValue>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function sanitizePayload(payload?: GoogleAdsPayload) {
  if (!payload) return {};

  const entries = Object.entries(payload).filter(([, value]) => value !== undefined && value !== null);
  return entries.length ? Object.fromEntries(entries) : {};
}

function hasMarketingConsent() {
  if (typeof window === "undefined") return false;
  return readCookieConsent()?.marketing === true;
}

function getLeadSendTo() {
  const trackerConfig = getTrackerConfig();
  if (!trackerConfig.googleAdsId || !trackerConfig.googleAdsLeadLabel) {
    return "";
  }

  return `${trackerConfig.googleAdsId}/${trackerConfig.googleAdsLeadLabel}`;
}

export function trackGoogleAdsLead(payload?: GoogleAdsPayload) {
  if (!hasMarketingConsent()) return false;
  if (typeof window === "undefined" || typeof window.gtag !== "function") return false;

  const sendTo = getLeadSendTo();
  if (!sendTo) return false;

  window.gtag("event", "conversion", {
    send_to: sendTo,
    ...sanitizePayload(payload)
  });

  return true;
}
