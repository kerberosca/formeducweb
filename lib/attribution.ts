export const ATTRIBUTION_STORAGE_KEY = "formeducweb-first-touch-attribution-v1";

export type AttributionPayload = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  landing_path?: string;
  referrer_host?: string;
  first_seen_at?: string;
};

function normalizeText(value: unknown) {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized ? normalized : undefined;
}

function normalizeHost(rawHost: string | null) {
  if (!rawHost) return undefined;
  return rawHost.toLowerCase().replace(/^www\./, "").trim() || undefined;
}

function parseUrlHost(rawUrl: string | null) {
  if (!rawUrl) return undefined;

  try {
    const parsed = new URL(rawUrl);
    return normalizeHost(parsed.hostname);
  } catch {
    return undefined;
  }
}

function inferOrganicSource(referrerHost: string | undefined) {
  if (!referrerHost) return null;

  if (referrerHost.includes("google.")) {
    return { utm_source: "google", utm_medium: "organic" };
  }

  if (referrerHost.includes("facebook.") || referrerHost.includes("instagram.")) {
    return { utm_source: "facebook", utm_medium: "organic-social" };
  }

  if (referrerHost.includes("linkedin.")) {
    return { utm_source: "linkedin", utm_medium: "organic-social" };
  }

  return null;
}

function sanitizeAttribution(raw: Partial<AttributionPayload> | null | undefined) {
  if (!raw) return null;

  const sanitized: AttributionPayload = {
    utm_source: normalizeText(raw.utm_source)?.toLowerCase(),
    utm_medium: normalizeText(raw.utm_medium)?.toLowerCase(),
    utm_campaign: normalizeText(raw.utm_campaign),
    utm_content: normalizeText(raw.utm_content),
    utm_term: normalizeText(raw.utm_term),
    landing_path: normalizeText(raw.landing_path),
    referrer_host: normalizeHost(raw.referrer_host || null),
    first_seen_at: normalizeText(raw.first_seen_at)
  };

  const hasAnyValue = Object.values(sanitized).some((value) => Boolean(value));
  return hasAnyValue ? sanitized : null;
}

function readAttributionFromStorage() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AttributionPayload>;
    return sanitizeAttribution(parsed);
  } catch {
    return null;
  }
}

function saveAttributionToStorage(attribution: AttributionPayload) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // Ignore storage access errors and keep attribution best-effort.
  }
}

function buildAttributionFromCurrentPage() {
  if (typeof window === "undefined") return null;

  const currentUrl = new URL(window.location.href);
  const query = currentUrl.searchParams;
  const currentHost = normalizeHost(currentUrl.hostname);
  const referrerHost = parseUrlHost(document.referrer) || undefined;
  const externalReferrerHost = referrerHost && referrerHost !== currentHost ? referrerHost : undefined;
  const inferredSource = inferOrganicSource(externalReferrerHost);

  const attribution = sanitizeAttribution({
    utm_source: normalizeText(query.get("utm_source")) || inferredSource?.utm_source || "direct",
    utm_medium: normalizeText(query.get("utm_medium")) || inferredSource?.utm_medium || "none",
    utm_campaign: normalizeText(query.get("utm_campaign")),
    utm_content: normalizeText(query.get("utm_content")),
    utm_term: normalizeText(query.get("utm_term")),
    landing_path: `${currentUrl.pathname}${currentUrl.search}`,
    referrer_host: externalReferrerHost,
    first_seen_at: new Date().toISOString()
  });

  return attribution;
}

export function ensureFirstTouchAttribution() {
  const existing = readAttributionFromStorage();
  if (existing) return existing;

  const firstTouch = buildAttributionFromCurrentPage();
  if (!firstTouch) return null;

  saveAttributionToStorage(firstTouch);
  return firstTouch;
}

export function getFirstTouchAttribution() {
  return ensureFirstTouchAttribution() || undefined;
}
