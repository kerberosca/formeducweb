export const COOKIE_CONSENT_STORAGE_KEY = "formeducweb-cookie-consent-v1";
export const COOKIE_CONSENT_EVENT = "formeducweb-cookie-consent-updated";

export type CookieConsentState = {
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
  version: 1;
};

export function getTrackerConfig() {
  return {
    gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || ""
  };
}

export function hasOptionalTrackersConfigured() {
  const trackerConfig = getTrackerConfig();
  return Boolean(trackerConfig.gaMeasurementId);
}

export function readCookieConsentRaw() {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function parseCookieConsent(raw: string | null) {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as CookieConsentState;
    if (typeof parsed?.analytics !== "boolean" || typeof parsed?.marketing !== "boolean") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function readCookieConsent() {
  return parseCookieConsent(readCookieConsentRaw());
}

export function saveCookieConsent(state: Omit<CookieConsentState, "updatedAt" | "version">) {
  if (typeof window === "undefined") return;

  const payload: CookieConsentState = {
    ...state,
    updatedAt: new Date().toISOString(),
    version: 1
  };

  try {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    return;
  }

  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: payload }));
}

export function clearCookieConsent() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
  } catch {
    return;
  }

  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT));
}
