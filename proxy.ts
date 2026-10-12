import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { areTrustedProxyHeadersEnabled } from "@/lib/client-ip";

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);
const PUBLIC_IMAGE_PATH = /\.(?:avif|gif|ico|jpe?g|png|svg|webp)$/i;

const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Content-Security-Policy":
    "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'"
};

const NO_STORE_HEADERS: Record<string, string> = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0"
};

function isSensitivePath(pathname: string) {
  return (
    pathname.startsWith("/api/auth") ||
    pathname === "/connexion" ||
    pathname.startsWith("/mon-espace") ||
    pathname.startsWith("/administration") ||
    pathname.startsWith("/api/assessment") ||
    pathname.startsWith("/api/contact") ||
    pathname.startsWith("/api/privacy-request") ||
    pathname.startsWith("/api/pdf") ||
    pathname.startsWith("/api/download/") ||
    pathname.startsWith("/api/stripe/") ||
    pathname.startsWith("/loi-25/rapport/") ||
    pathname.startsWith("/cybersecurite/rapport/") ||
    pathname.startsWith("/intelligence-artificielle/rapport/")
  );
}

function getRequestProtocol(request: NextRequest) {
  const forwardedProto = areTrustedProxyHeadersEnabled()
    ? request.headers.get("x-forwarded-proto")
    : null;

  if (forwardedProto) {
    return forwardedProto.split(",")[0]?.trim().toLowerCase() || "http";
  }

  return request.nextUrl.protocol.replace(":", "").toLowerCase();
}

function isLocalHostname(request: NextRequest) {
  const forwardedHost = areTrustedProxyHeadersEnabled()
    ? request.headers.get("x-forwarded-host")
    : null;
  const host =
    forwardedHost || request.headers.get("host") || request.nextUrl.host;
  const hostname =
    host.split(":")[0]?.trim().toLowerCase() ||
    request.nextUrl.hostname.toLowerCase();

  return LOCAL_HOSTNAMES.has(hostname);
}

function applySecurityHeaders(response: NextResponse) {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
}

function applyNoStoreHeaders(response: NextResponse) {
  Object.entries(NO_STORE_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
}

export function proxy(request: NextRequest) {
  if (!isLocalHostname(request) && getRequestProtocol(request) !== "https") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.protocol = "https:";
    return NextResponse.redirect(redirectUrl, 301);
  }

  const { pathname } = request.nextUrl;

  // L'optimiseur Next.js peut récupérer une image locale en HTTP interne.
  if (PUBLIC_IMAGE_PATH.test(pathname) && isLocalHostname(request)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  applySecurityHeaders(response);

  if (
    pathname.startsWith("/loi-25/rapport/") ||
    pathname.startsWith("/cybersecurite/rapport/") ||
    pathname.startsWith("/intelligence-artificielle/rapport/")
  ) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }

  if (isSensitivePath(pathname)) {
    applyNoStoreHeaders(response);
  }

  if (getRequestProtocol(request) === "https") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
