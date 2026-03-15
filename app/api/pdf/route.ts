import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import type { ReactElement } from "react";

import { findAssessmentByToken, hydrateAssessment } from "@/lib/assessment-store";
import { AssessmentReportPdfDocument } from "@/lib/report-pdf";
import { filenameFromCompany } from "@/lib/report-pdf-shared";
import { tokenSearchParamSchema } from "@/lib/schemas";
import { getWizardData } from "@/lib/wizard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = tokenSearchParamSchema.safeParse({ token: searchParams.get("token") });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Le token d’accès est invalide."
        },
        { status: 400 }
      );
    }

    const assessment = await findAssessmentByToken(parsed.data.token);

    if (!assessment) {
      return NextResponse.json(
        {
          error: "Le rapport demandé est introuvable."
        },
        { status: 404 }
      );
    }

    if (assessment.paymentStatus !== "paid") {
      return NextResponse.json(
        {
          error: "Le rapport complet doit être débloqué avant le téléchargement PDF."
        },
        { status: 403 }
      );
    }

    const hydrated = hydrateAssessment(assessment);
    const wizard = getWizardData();
    const document = AssessmentReportPdfDocument({
      wizard,
      leadCapture: {
        contactName: assessment.contactName,
        companyName: assessment.companyName,
        email: assessment.email,
        phone: assessment.phone || "",
        consentMarketing: assessment.consentMarketing
      },
      scoreResult: hydrated.scoreResult,
      report: hydrated.fullReport
    }) as ReactElement<DocumentProps>;
    const buffer = await renderToBuffer(document);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filenameFromCompany(assessment.companyName)}"`,
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("PDF route error", error);
    return NextResponse.json(
      {
        error: "Impossible de générer le PDF pour le moment."
      },
      { status: 500 }
    );
  }
}
