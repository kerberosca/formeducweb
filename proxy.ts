import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

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

const DEMO_839_PATH = "/Demo839web";
const DEMO_839_USERNAME = "demo839";

function isSensitivePath(pathname: string) {
  return (
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
  const forwardedProto = request.headers.get("x-forwarded-proto");

  if (forwardedProto) {
    return forwardedProto.split(",")[0]?.trim().toLowerCase() || "http";
  }

  return request.nextUrl.protocol.replace(":", "").toLowerCase();
}

function isLocalHostname(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host =
    forwardedHost || request.headers.get("host") || request.nextUrl.host;
  const hostname =
    host.split(":")[0]?.trim().toLowerCase() ||
    request.nextUrl.hostname.toLowerCase();

  return LOCAL_HOSTNAMES.has(hostname);
}

function isDemo839Path(pathname: string) {
  return pathname === DEMO_839_PATH || pathname.startsWith(`${DEMO_839_PATH}/`);
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

function getBasicCredentials(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Basic ")) return null;

  try {
    const decoded = atob(authorization.slice(6));
    const separator = decoded.indexOf(":");

    if (separator < 0) return null;

    return {
      username: decoded.slice(0, separator),
      password: decoded.slice(separator + 1)
    };
  } catch {
    return null;
  }
}

function demo839UnauthorizedResponse() {
  const response = new NextResponse("Authentification requise.", {
    status: 401,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "WWW-Authenticate": 'Basic realm="Demo 839", charset="UTF-8"'
    }
  });

  applySecurityHeaders(response);
  applyNoStoreHeaders(response);
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");

  return response;
}

export function proxy(request: NextRequest) {
  if (!isLocalHostname(request) && getRequestProtocol(request) !== "https") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.protocol = "https:";
    return NextResponse.redirect(redirectUrl, 301);
  }

  const { pathname } = request.nextUrl;

  if (isDemo839Path(pathname) && !isLocalHostname(request)) {
    const expectedPassword = process.env.DEMO839_BASIC_AUTH_PASSWORD;
    const credentials = getBasicCredentials(request);

    if (
      !expectedPassword ||
      !credentials ||
      credentials.username !== DEMO_839_USERNAME ||
      credentials.password !== expectedPassword
    ) {
      return demo839UnauthorizedResponse();
    }
  }

  const response = NextResponse.next();

  applySecurityHeaders(response);

  if (isDemo839Path(pathname)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    applyNoStoreHeaders(response);
  }

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

  if (request.nextUrl.protocol === "https:") {
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
