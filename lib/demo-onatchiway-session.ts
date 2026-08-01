import { createHmac, timingSafeEqual } from "node:crypto";

export const DEMO_ONATCHIWAY_PATH = "/demoOnatchiway";
export const DEMO_ONATCHIWAY_COOKIE_NAME = "demo_onatchiway_session";
export const DEMO_ONATCHIWAY_SESSION_SECONDS = 90 * 24 * 60 * 60;

function signaturesMatch(received: string, expected: string) {
  const receivedBuffer = Buffer.from(received, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

function sign(expiresAt: string, secret: string) {
  return createHmac("sha256", secret).update(expiresAt).digest("base64url");
}

export function createDemoOnatchiwaySessionToken(
  secret: string,
  now = Date.now()
) {
  if (!secret) throw new Error("Le secret de session Onatchiway est absent.");

  const expiresAt = String(now + DEMO_ONATCHIWAY_SESSION_SECONDS * 1_000);
  return `${expiresAt}.${sign(expiresAt, secret)}`;
}

export function verifyDemoOnatchiwaySessionToken(
  token: string | undefined,
  secret: string,
  now = Date.now()
) {
  if (!token || !secret) return false;

  const [expiresAt, receivedSignature, extra] = token.split(".");
  if (!expiresAt || !receivedSignature || extra) return false;

  const expiration = Number(expiresAt);
  if (!Number.isSafeInteger(expiration) || expiration <= now) return false;

  return signaturesMatch(receivedSignature, sign(expiresAt, secret));
}
