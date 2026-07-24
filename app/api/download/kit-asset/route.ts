import { NextResponse } from "next/server";

import {
  findAssessmentByToken,
  hydrateAssessment
} from "@/lib/assessment-store";
import {
  buildKitReplacements,
  getKitAsset,
  isKitAssetId,
  renderPersonalizedKitAsset
} from "@/lib/kit-assets";
import { hasActiveAssessmentAccess } from "@/lib/commerce";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const assetId = searchParams.get("asset");

  if (!token || token.length < 16 || !isKitAssetId(assetId)) {
    return NextResponse.json(
      { error: "Le lien de téléchargement est invalide." },
      { status: 400 }
    );
  }

  const assessment = await findAssessmentByToken(token);
  if (!assessment) {
    return NextResponse.json(
      { error: "Le diagnostic demandé est introuvable." },
      { status: 404 }
    );
  }

  if (!(await hasActiveAssessmentAccess(assessment))) {
    return NextResponse.json(
      { error: "Ce gabarit exige un accès actif au kit." },
      { status: 403 }
    );
  }

  const hydrated = hydrateAssessment(assessment);
  const asset = getKitAsset(assetId);
  if (asset.assessmentType !== hydrated.assessmentType) {
    return NextResponse.json(
      { error: "Ce gabarit ne correspond pas à votre diagnostic." },
      { status: 403 }
    );
  }

  try {
    const file = await renderPersonalizedKitAsset(
      asset,
      buildKitReplacements(hydrated)
    );
    return new NextResponse(file, {
      headers: {
        "Content-Type": asset.contentType,
        "Content-Disposition": `attachment; filename="${asset.downloadFilename}"`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch (error) {
    console.error("Kit asset generation error", error);
    return NextResponse.json(
      { error: "Impossible de préparer ce gabarit pour le moment." },
      { status: 500 }
    );
  }
}
