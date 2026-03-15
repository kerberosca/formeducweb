import { NextResponse } from "next/server";

import { buildIncidentRegistryCsv } from "@/lib/bonus-assets";
import { findAssessmentByToken } from "@/lib/assessment-store";
import { tokenSearchParamSchema } from "@/lib/schemas";

export const runtime = "nodejs";

export async function GET(request: Request) {
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
        error: "Le rapport complet doit être débloqué avant le téléchargement."
      },
      { status: 403 }
    );
  }

  const csv = buildIncidentRegistryCsv(assessment.companyName);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="registre-incident-loi25.csv"',
      "Cache-Control": "no-store"
    }
  });
}
