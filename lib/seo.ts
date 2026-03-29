const DEFAULT_SITE_URL = "http://localhost:3000";
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

function normalizeUrl(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function withProtocol(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function normalizeSiteUrl(url: string) {
  const parsedUrl = new URL(withProtocol(url.trim()));

  if (!LOCAL_HOSTNAMES.has(parsedUrl.hostname.toLowerCase())) {
    parsedUrl.protocol = "https:";
  }

  return normalizeUrl(parsedUrl.toString());
}

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || DEFAULT_SITE_URL;
  return normalizeSiteUrl(configuredUrl);
}

export function getAbsoluteUrl(path = "/") {
  const siteUrl = getSiteUrl();

  if (!path || path === "/") {
    return siteUrl;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalizedPath}`;
}
