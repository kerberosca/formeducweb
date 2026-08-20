import { isIP } from "node:net";

type Environment = Record<string, string | undefined>;
type HeaderReader = Pick<Headers, "get">;
type RequestWithHeaders = { headers: HeaderReader };

export const UNKNOWN_CLIENT_IP = "unknown";

function isEnabled(value: string | undefined) {
  const normalized = value?.trim().toLowerCase();
  return normalized === "1" || normalized === "true";
}

export function areTrustedProxyHeadersEnabled(env: Environment = process.env) {
  return isEnabled(env.TRUSTED_PROXY_HEADERS);
}

function getHeaders(source: HeaderReader | RequestWithHeaders): HeaderReader {
  return "headers" in source ? source.headers : source;
}

function validatedIp(value: string | null | undefined) {
  const candidate = value?.trim().toLowerCase();
  return candidate && isIP(candidate) ? candidate : null;
}

/**
 * Forwarding headers are attacker-controlled unless the deployment explicitly
 * guarantees that its trusted proxy overwrites them before reaching Next.js.
 */
export function resolveClientIp(
  source: HeaderReader | RequestWithHeaders,
  env: Environment = process.env
) {
  if (!areTrustedProxyHeadersEnabled(env)) return UNKNOWN_CLIENT_IP;

  const requestHeaders = getHeaders(source);
  const candidates = [
    requestHeaders.get("x-forwarded-for")?.split(",")[0],
    requestHeaders.get("x-real-ip"),
    requestHeaders.get("cf-connecting-ip")
  ];

  for (const candidate of candidates) {
    const ip = validatedIp(candidate);
    if (ip) return ip;
  }

  return UNKNOWN_CLIENT_IP;
}
