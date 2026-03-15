import { NextResponse } from "next/server";

import { sendPrivacyRequestEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { privacyRequestSchema } from "@/lib/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request, {
    bucket: "privacy-request-post",
    limit: 6,
    windowMs: 15 * 60 * 1000
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Trop de tentatives. Veuillez patienter avant de renvoyer votre demande."
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
    const json = await request.json();
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

    await sendPrivacyRequestEmail(parsed.data);

    return NextResponse.json({
      ok: true
    });
  } catch (error) {
    console.error("Privacy request route error", error);
    return NextResponse.json(
      {
        error: "Impossible d'envoyer la demande pour le moment."
      },
      { status: 500 }
    );
  }
}


