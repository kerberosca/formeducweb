import { NextResponse } from "next/server";

import { buildProcedureOnePager } from "@/lib/bonus-assets";
import { findAssessmentByToken, hydrateAssessment } from "@/lib/assessment-store";
import { getDiagnosticConfig } from "@/lib/diagnostics";
import { tokenSearchParamSchema } from "@/lib/schemas";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = tokenSearchParamSchema.safeParse({ token: searchParams.get("token") });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Le token d'accès est invalide."
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
        error: "Le rapport complet doit être débloqué avant le téléchargement."
      },
      { status: 403 }
    );
  }

  const hydrated = hydrateAssessment(assessment);
  const diagnostic = getDiagnosticConfig(hydrated.assessmentType);
  const procedureText = buildProcedureOnePager(assessment.companyName, hydrated.assessmentType);

  return new NextResponse(procedureText, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${diagnostic.bonusAssets.procedureFilename}"`,
      "Cache-Control": "no-store"
    }
  });
}
