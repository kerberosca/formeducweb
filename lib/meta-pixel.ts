import { readCookieConsent } from "@/lib/cookie-consent";

export type MetaEventName =
  | "PageView"
  | "ViewContent"
  | "Lead"
  | "Contact"
  | "InitiateCheckout"
  | "Purchase";

type MetaEventPayloadValue = string | number | boolean | null | undefined;
export type MetaEventPayload = Record<string, MetaEventPayloadValue>;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function sanitizePayload(payload?: MetaEventPayload) {
  if (!payload) return undefined;

  const entries = Object.entries(payload).filter(([, value]) => value !== undefined && value !== null);
  return entries.length ? Object.fromEntries(entries) : undefined;
}

function hasMarketingConsent() {
  if (typeof window === "undefined") return false;
  return readCookieConsent()?.marketing === true;
}

export function trackMetaEvent(eventName: MetaEventName, payload?: MetaEventPayload) {
  if (!hasMarketingConsent()) return false;
  if (typeof window === "undefined" || typeof window.fbq !== "function") return false;

  const sanitized = sanitizePayload(payload);
  if (sanitized) {
    window.fbq("track", eventName, sanitized);
  } else {
    window.fbq("track", eventName);
  }

  return true;
}

export function trackMetaLead(payload?: MetaEventPayload) {
  return trackMetaEvent("Lead", payload);
}

export function trackMetaContact(payload?: MetaEventPayload) {
  return trackMetaEvent("Contact", payload);
}

export function trackMetaInitiateCheckout(payload?: MetaEventPayload) {
  return trackMetaEvent("InitiateCheckout", payload);
}

export function trackMetaPurchase(payload?: MetaEventPayload) {
  return trackMetaEvent("Purchase", payload);
}
