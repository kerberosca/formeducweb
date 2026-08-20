import { NextRequest } from "next/server";

import { handlers } from "@/auth";
import { getClientIp, normalizeAuthEmail } from "@/lib/auth-config";
import { consumeMagicLinkRateLimit } from "@/lib/auth-rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const MAGIC_LINK_REQUEST_MAX_BODY_BYTES = 16 * 1024;

export const GET = handlers.GET;

function genericVerificationResponse(request: NextRequest) {
  const verificationUrl = new URL(
    "/api/auth/verify-request?provider=email&type=email",
    request.nextUrl.origin
  );

  if (request.headers.get("x-auth-return-redirect") === "1") {
    return Response.json({ url: verificationUrl.toString() });
  }

  return Response.redirect(verificationUrl, 302);
}

async function readMagicLinkRequestBody(
  request: NextRequest
): Promise<ArrayBuffer | null> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && /^\d+$/.test(contentLength)) {
    const declaredBytes = Number(contentLength);
    if (
      Number.isSafeInteger(declaredBytes) &&
      declaredBytes > MAGIC_LINK_REQUEST_MAX_BODY_BYTES
    ) {
      return null;
    }
  }

  const reader = request.body?.getReader();
  if (!reader) return new ArrayBuffer(0);

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > MAGIC_LINK_REQUEST_MAX_BODY_BYTES) {
      await reader.cancel().catch(() => undefined);
      return null;
    }
    chunks.push(value);
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body.buffer;
}

export async function POST(request: NextRequest) {
  const isMagicLinkRequest = request.nextUrl.pathname.endsWith(
    "/api/auth/signin/email"
  );

  if (!isMagicLinkRequest) return handlers.POST(request);

  let rawBody: ArrayBuffer;
  let formData: FormData;
  try {
    const boundedBody = await readMagicLinkRequestBody(request);
    if (!boundedBody) return genericVerificationResponse(request);
    rawBody = boundedBody;

    const parsingHeaders = new Headers(request.headers);
    parsingHeaders.delete("content-length");
    formData = await new Request(request.url, {
      method: "POST",
      headers: parsingHeaders,
      body: rawBody
    }).formData();
  } catch {
    return genericVerificationResponse(request);
  }
  const submittedEmail = formData.get("email");

  if (typeof submittedEmail !== "string" || !submittedEmail.trim()) {
    return handlers.POST(request);
  }

  let normalizedEmail: string;
  try {
    normalizedEmail = normalizeAuthEmail(submittedEmail);
  } catch {
    // Invalid identifiers receive the same public response as throttled or
    // inactive accounts, without creating a token or reaching an email sink.
    return genericVerificationResponse(request);
  }

  try {
    const allowed = await consumeMagicLinkRateLimit({
      email: normalizedEmail,
      ip: getClientIp(request)
    });

    if (!allowed) return genericVerificationResponse(request);
  } catch (error) {
    console.error("Authentication rate-limit check failed", error);
    return genericVerificationResponse(request);
  }

  const headers = new Headers(request.headers);
  headers.set("x-formeduc-auth-rate-limit-checked", "1");
  headers.delete("content-length");

  return handlers.POST(
    new NextRequest(request.nextUrl, {
      method: "POST",
      headers,
      body: rawBody,
      signal: request.signal
    })
  );
}
