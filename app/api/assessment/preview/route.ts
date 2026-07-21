import { NextResponse } from "next/server";

import { checkRateLimit } from "@/lib/rate-limit";
import { generateReport } from "@/lib/recommendations";
import { toLiteReport } from "@/lib/reportFilters";
import { assessmentPreviewPayloadSchema } from "@/lib/schemas";
import { computeScore } from "@/lib/scoring";
import { deepRepairText } from "@/lib/text";
import { getWizardData, validateWizardAnswers } from "@/lib/wizard";

export const runtime = "nodejs";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache"
};

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request, {
    bucket: "assessment-preview-post",
    limit: 30,
    windowMs: 15 * 60 * 1000
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Trop de tentatives. Veuillez patienter avant de recommencer." },
      {
        status: 429,
        headers: {
          ...NO_STORE_HEADERS,
          "Retry-After": String(rateLimit.retryAfterSeconds)
        }
      }
    );
  }

  try {
    const parsed = assessmentPreviewPayloadSchema.safeParse(
      await request.json()
    );

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Les réponses du diagnostic sont invalides.",
          details: parsed.error.flatten()
        },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const wizard = getWizardData(parsed.data.assessmentType);
    const answerIssues = validateWizardAnswers(wizard, parsed.data.answers);

    if (Object.values(answerIssues).some((ids) => ids.length)) {
      return NextResponse.json(
        {
          error: "Certaines réponses sont manquantes ou invalides.",
          ...answerIssues
        },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const scoreResult = deepRepairText(
      computeScore(wizard, parsed.data.answers)
    );
    const fullReport = deepRepairText(
      generateReport(wizard, parsed.data.answers, scoreResult)
    );

    return NextResponse.json(
      {
        assessmentType: parsed.data.assessmentType,
        scoreResult,
        liteReport: toLiteReport(fullReport)
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("Assessment preview route error", error);
    return NextResponse.json(
      { error: "Impossible de calculer votre résultat pour le moment." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
