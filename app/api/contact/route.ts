import { NextResponse } from "next/server";

import { sendContactEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { contactFormSchema } from "@/lib/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request, {
    bucket: "contact-post",
    limit: 10,
    windowMs: 15 * 60 * 1000
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Trop de tentatives. Veuillez patienter avant de renvoyer votre message."
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
    const parsed = contactFormSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Le formulaire de contact est invalide.",
          details: parsed.error.flatten()
        },
        { status: 400 }
      );
    }

    await sendContactEmail(parsed.data);

    return NextResponse.json({
      ok: true
    });
  } catch (error) {
    console.error("Contact route error", error);
    return NextResponse.json(
      {
        error: "Impossible d'envoyer votre message pour le moment."
      },
      { status: 500 }
    );
  }
}

