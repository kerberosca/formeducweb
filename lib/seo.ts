import type { Metadata } from "next";

const DEFAULT_SITE_URL = "https://formeducweb.ca";
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);
const SITE_NAME = "ForméducWeb";
const SOCIAL_IMAGE_PATH = "/og.png";

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
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    DEFAULT_SITE_URL;
  const normalizedUrl = normalizeSiteUrl(configuredUrl);
  const hostname = new URL(normalizedUrl).hostname.toLowerCase();

  // A local .env is useful for development, but it must never leak into a
  // production build's canonical URLs, sitemap or social metadata.
  if (process.env.NODE_ENV === "production" && LOCAL_HOSTNAMES.has(hostname)) {
    return DEFAULT_SITE_URL;
  }

  return normalizedUrl;
}

export function getAbsoluteUrl(path = "/") {
  const siteUrl = getSiteUrl();

  if (!path || path === "/") {
    return siteUrl;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalizedPath}`;
}

export function buildPageMetadata({
  title,
  description,
  path,
  index = true,
  openGraphType = "website"
}: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
  openGraphType?: "website" | "article";
}): Metadata {
  const canonical = getAbsoluteUrl(path);
  const socialTitle = title.includes(SITE_NAME)
    ? title
    : `${title} | ${SITE_NAME}`;
  const image = getAbsoluteUrl(SOCIAL_IMAGE_PATH);

  return {
    title: { absolute: socialTitle },
    description,
    alternates: { canonical },
    robots: index ? undefined : { index: false, follow: false, nocache: true },
    openGraph: {
      title: socialTitle,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "fr_CA",
      type: openGraphType,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} — diagnostics pour PME et OBNL`
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [image]
    }
  };
}
