import { NextResponse } from "next/server";

import { cleanupAssessmentRetention, createAssessmentRecord } from "@/lib/assessment-store";
import { sendAssessmentReceivedEmails } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateReport } from "@/lib/recommendations";
import { toLiteReport } from "@/lib/reportFilters";
import { assessmentPayloadSchema } from "@/lib/schemas";
import { computeScore } from "@/lib/scoring";
import { deepRepairText } from "@/lib/text";
import { getRequiredQuestionIds, getWizardData } from "@/lib/wizard";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request, {
    bucket: "assessment-post",
    limit: 15,
    windowMs: 15 * 60 * 1000
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Trop de tentatives. Veuillez patienter avant de recommencer."
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
    const parsed = assessmentPayloadSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Le payload de l'evaluation est invalide.",
          details: parsed.error.flatten()
        },
        { status: 400 }
      );
    }

    const wizard = getWizardData();
    const missingRequired = getRequiredQuestionIds(wizard).filter((id) => !parsed.data.answers[id]);

    if (missingRequired.length) {
      return NextResponse.json(
        {
          error: "Certaines réponses obligatoires sont manquantes.",
          missingQuestionIds: missingRequired
        },
        { status: 400 }
      );
    }

    const scoreResult = deepRepairText(computeScore(wizard, parsed.data.answers));
    const fullReport = deepRepairText(generateReport(wizard, parsed.data.answers, scoreResult));
    const liteReport = toLiteReport(fullReport);
    const assessment = await createAssessmentRecord({
      leadCapture: parsed.data.leadCapture,
      answers: parsed.data.answers,
      scoreResult,
      liteReport,
      fullReport
    });

    cleanupAssessmentRetention().catch((error) => {
      console.error("Assessment retention cleanup error", error);
    });

    sendAssessmentReceivedEmails({
      assessmentId: assessment.id,
      accessToken: assessment.accessToken,
      leadCapture: parsed.data.leadCapture,
      scoreResult,
      liteReport
    }).catch((error) => {
      console.error("Email assessment error", error);
    });

    return NextResponse.json({
      assessmentId: assessment.id,
      accessToken: assessment.accessToken,
      paymentStatus: assessment.paymentStatus,
      scoreResult,
      liteReport
    });
  } catch (error) {
    console.error("Assessment route error", error);
    return NextResponse.json(
      {
        error: "Une erreur est survenue pendant la generation du rapport."
      },
      { status: 500 }
    );
  }
}


