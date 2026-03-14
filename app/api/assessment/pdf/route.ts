import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import type { ReactElement } from "react";

import { AssessmentReportPdfDocument } from "@/lib/report-pdf";
import { filenameFromCompany } from "@/lib/report-pdf-shared";
import { generateReport } from "@/lib/recommendations";
import { assessmentPayloadSchema } from "@/lib/schemas";
import { computeScore } from "@/lib/scoring";
import { getRequiredQuestionIds, getWizardData } from "@/lib/wizard";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = assessmentPayloadSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Le payload du PDF est invalide.",
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
    const fileName = filenameFromCompany(parsed.data.leadCapture.companyName);
    const document = AssessmentReportPdfDocument({
      wizard,
      leadCapture: parsed.data.leadCapture,
      scoreResult,
      report
    }) as ReactElement<DocumentProps>;
    const buffer = await renderToBuffer(document);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("Assessment PDF route error", error);

    return NextResponse.json(
      {
        error: "Une erreur est survenue pendant la génération du PDF."
      },
      { status: 500 }
    );
  }
}
