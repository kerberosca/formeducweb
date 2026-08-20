import { NextResponse } from "next/server";

import { sendPrivacyRequestEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { privacyRequestSchema } from "@/lib/schemas";

export const runtime = "nodejs";

export const PRIVACY_REQUEST_MAX_BODY_BYTES = 16 * 1024;

class PrivacyRequestBodyTooLargeError extends Error {}

async function readJsonBodyWithLimit(request: Request) {
  const contentLength = request.headers.get("content-length");
  if (contentLength && /^\d+$/.test(contentLength)) {
    const declaredBytes = Number(contentLength);
    if (
      Number.isSafeInteger(declaredBytes) &&
      declaredBytes > PRIVACY_REQUEST_MAX_BODY_BYTES
    ) {
      throw new PrivacyRequestBodyTooLargeError();
    }
  }

  const reader = request.body?.getReader();
  if (!reader) return JSON.parse("") as unknown;

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > PRIVACY_REQUEST_MAX_BODY_BYTES) {
      await reader.cancel().catch(() => undefined);
      throw new PrivacyRequestBodyTooLargeError();
    }
    chunks.push(value);
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return JSON.parse(
    new TextDecoder("utf-8", { fatal: true }).decode(body)
  ) as unknown;
}

function bodyTooLargeResponse() {
  return NextResponse.json(
    { error: "La demande est trop volumineuse." },
    { status: 413 }
  );
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request, {
    bucket: "privacy-request-post",
    limit: 6,
    windowMs: 15 * 60 * 1000
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error:
          "Trop de tentatives. Veuillez patienter avant de renvoyer votre demande."
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds)
        }
      }
    );
  }

  try {
    const json = await readJsonBodyWithLimit(request);
    const parsed = privacyRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "La demande est invalide.",
          details: parsed.error.flatten()
        },
        { status: 400 }
      );
    }

    // Return the same public confirmation but never email a honeypot submission.
    if (parsed.data.website) {
      return NextResponse.json({ ok: true });
    }

    await sendPrivacyRequestEmail(parsed.data);

    return NextResponse.json({
      ok: true
    });
  } catch (error) {
    if (error instanceof PrivacyRequestBodyTooLargeError) {
      return bodyTooLargeResponse();
    }
    console.error("Privacy request route error", error);
    return NextResponse.json(
      {
        error: "Impossible d'envoyer la demande pour le moment."
      },
      { status: 500 }
    );
  }
}
