import { NextResponse } from "next/server";

import { sendAssessmentEmails } from "@/lib/email";
import { generateReport } from "@/lib/recommendations";
import { assessmentPayloadSchema } from "@/lib/schemas";
import { computeScore } from "@/lib/scoring";
import { getRequiredQuestionIds, getWizardData } from "@/lib/wizard";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = assessmentPayloadSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Le payload de l’évaluation est invalide.",
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

    const scoreResult = computeScore(wizard, parsed.data.answers);
    const report = generateReport(wizard, parsed.data.answers, scoreResult);

    sendAssessmentEmails({
      leadCapture: parsed.data.leadCapture,
      scoreResult,
      report
    }).catch((error) => {
      console.error("Email assessment error", error);
    });

    return NextResponse.json({
      scoreResult,
      report,
      pdfUrl: null
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

