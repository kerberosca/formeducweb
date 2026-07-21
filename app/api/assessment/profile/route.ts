import { NextResponse } from "next/server";

import {
  findAssessmentByToken,
  updateAssessmentProfileByToken
} from "@/lib/assessment-store";
import { checkRateLimit } from "@/lib/rate-limit";
import { assessmentProfileSchema } from "@/lib/schemas";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const rateLimit = checkRateLimit(request, {
    bucket: "assessment-profile-patch",
    limit: 10,
    windowMs: 15 * 60 * 1000
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Trop de tentatives. Veuillez patienter avant de réessayer." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) }
      }
    );
  }

  try {
    const parsed = assessmentProfileSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Les renseignements fournis sont invalides.",
          details: parsed.error.flatten()
        },
        { status: 400 }
      );
    }

    const assessment = await findAssessmentByToken(parsed.data.accessToken);

    if (!assessment) {
      return NextResponse.json(
        { error: "Le diagnostic est introuvable." },
        { status: 404 }
      );
    }

    const updated = await updateAssessmentProfileByToken(parsed.data);

    return NextResponse.json({
      ok: true,
      contactName: updated.contactName,
      companyName: updated.companyName
    });
  } catch (error) {
    console.error("Assessment profile route error", error);
    return NextResponse.json(
      { error: "Impossible d’enregistrer ces renseignements pour le moment." },
      { status: 500 }
    );
  }
}
