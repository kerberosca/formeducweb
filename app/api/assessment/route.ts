import { NextResponse } from "next/server";

import {
  cleanupAssessmentRetention,
  createAssessmentRecord
} from "@/lib/assessment-store";
import { sendAssessmentReceivedEmails } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateReport } from "@/lib/recommendations";
import { toLiteReport } from "@/lib/reportFilters";
import { assessmentPayloadSchema } from "@/lib/schemas";
import { computeScore } from "@/lib/scoring";
import { deepRepairText } from "@/lib/text";
import { getWizardData, validateWizardAnswers } from "@/lib/wizard";

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
          error: "Les données de l’évaluation sont invalides.",
          details: parsed.error.flatten()
        },
        { status: 400 }
      );
    }

    const assessmentType = parsed.data.assessmentType;
    const wizard = getWizardData(assessmentType);
    const answerIssues = validateWizardAnswers(wizard, parsed.data.answers);

    if (Object.values(answerIssues).some((ids) => ids.length)) {
      return NextResponse.json(
        {
          error: "Certaines réponses sont manquantes ou invalides.",
          ...answerIssues
        },
        { status: 400 }
      );
    }

    const scoreResult = deepRepairText(
      computeScore(wizard, parsed.data.answers)
    );
    const fullReport = deepRepairText(
      generateReport(wizard, parsed.data.answers, scoreResult)
    );
    const liteReport = toLiteReport(fullReport);
    const leadCapture = {
      contactName: "",
      companyName: "",
      email: parsed.data.email,
      phone: "",
      consentMarketing: parsed.data.consentMarketing
    };
    const assessment = await createAssessmentRecord({
      assessmentType,
      leadCapture,
      answers: parsed.data.answers,
      scoreResult,
      liteReport,
      fullReport,
      attribution: parsed.data.attribution
    });

    cleanupAssessmentRetention().catch((error) => {
      console.error("Assessment retention cleanup error", error);
    });

    sendAssessmentReceivedEmails({
      assessmentId: assessment.id,
      accessToken: assessment.accessToken,
      leadCapture,
      assessmentType,
      scoreResult,
      liteReport
    }).catch((error) => {
      console.error("Email assessment error", error);
    });

    return NextResponse.json({
      assessmentType,
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
        error: "Une erreur est survenue pendant la génération du rapport."
      },
      { status: 500 }
    );
  }
}
