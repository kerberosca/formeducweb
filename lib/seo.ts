const DEFAULT_SITE_URL = "http://localhost:3000";

function normalizeUrl(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function getSiteUrl() {
  return normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || DEFAULT_SITE_URL);
}
