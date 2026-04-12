export const COOKIE_CONSENT_STORAGE_KEY = "formeducweb-cookie-consent-v1";
export const COOKIE_CONSENT_EVENT = "formeducweb-cookie-consent-updated";

export type CookieConsentState = {
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
  version: 1;
};

function normalizeGoogleAdsId(raw: string | undefined) {
  const trimmed = raw?.trim() || "";
  if (!trimmed) return "";
  if (/^AW-\d+$/i.test(trimmed)) {
    return `AW-${trimmed.slice(3)}`;
  }
  if (/^\d+$/.test(trimmed)) {
    return `AW-${trimmed}`;
  }
  return trimmed;
}

export function getTrackerConfig() {
  return {
    gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "",
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "",
    googleAdsId: normalizeGoogleAdsId(process.env.NEXT_PUBLIC_GOOGLE_ADS_ID),
    googleAdsLeadLabel: process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL?.trim() || ""
  };
}

export function hasOptionalTrackersConfigured() {
  const trackerConfig = getTrackerConfig();
  return Boolean(trackerConfig.gaMeasurementId || trackerConfig.metaPixelId || trackerConfig.googleAdsId);
}

export function readCookieConsent() {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
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

export function saveCookieConsent(state: Omit<CookieConsentState, "updatedAt" | "version">) {
  if (typeof window === "undefined") return;

  const payload: CookieConsentState = {
    ...state,
    updatedAt: new Date().toISOString(),
    version: 1
  };

  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: payload }));
}
