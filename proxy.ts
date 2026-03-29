import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Content-Security-Policy": "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'"
};

const NO_STORE_HEADERS: Record<string, string> = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0"
};

function isSensitivePath(pathname: string) {
  return (
    pathname.startsWith("/api/assessment") ||
    pathname.startsWith("/api/contact") ||
    pathname.startsWith("/api/privacy-request") ||
    pathname.startsWith("/api/pdf") ||
    pathname.startsWith("/api/download/") ||
    pathname.startsWith("/api/stripe/") ||
    pathname.startsWith("/loi-25/rapport/")
  );
}

function getRequestProtocol(request: NextRequest) {
  const forwardedProto = request.headers.get("x-forwarded-proto");

  if (forwardedProto) {
    return forwardedProto.split(",")[0]?.trim().toLowerCase() || "http";
  }

  return request.nextUrl.protocol.replace(":", "").toLowerCase();
}

function isLocalHostname(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost || request.headers.get("host") || request.nextUrl.host;
  const hostname = host.split(":")[0]?.trim().toLowerCase() || request.nextUrl.hostname.toLowerCase();

  return LOCAL_HOSTNAMES.has(hostname);
}

export function proxy(request: NextRequest) {
  if (!isLocalHostname(request) && getRequestProtocol(request) !== "https") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.protocol = "https:";
    return NextResponse.redirect(redirectUrl, 301);
  }

  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  if (pathname.startsWith("/loi-25/rapport/")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }

  if (isSensitivePath(pathname)) {
    Object.entries(NO_STORE_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  if (request.nextUrl.protocol === "https:") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
