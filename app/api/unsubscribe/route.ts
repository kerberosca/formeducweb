import { NextResponse } from "next/server";
import { z } from "zod";

import { unsubscribeByToken } from "@/lib/email-automation";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const unsubscribeSchema = z.object({
  token: z.string().min(32).max(2048)
});

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request, {
    bucket: "unsubscribe-post",
    limit: 20,
    windowMs: 15 * 60 * 1000
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Trop de tentatives. Veuillez patienter." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) }
      }
    );
  }

  try {
    const parsed = unsubscribeSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Le lien de désabonnement est invalide." },
        { status: 400 }
      );
    }

    const result = await unsubscribeByToken(parsed.data.token);
    if (!result) {
      return NextResponse.json(
        { error: "Le lien de désabonnement est invalide ou expiré." },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Unsubscribe error", error);
    return NextResponse.json(
      { error: "Impossible de confirmer le désabonnement pour le moment." },
      { status: 500 }
    );
  }
}
