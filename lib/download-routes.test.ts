import { beforeEach, describe, expect, it } from "vitest";

import { GET as downloadKitAsset } from "@/app/api/download/kit-asset/route";
import { GET as downloadPdf } from "@/app/api/pdf/route";
import { db } from "@/lib/db";
import type { AssessmentType } from "@/lib/diagnostics";
import { KIT_ASSETS } from "@/lib/kit-assets";
import { generateReport } from "@/lib/recommendations";
import { toLiteReport } from "@/lib/reportFilters";
import { computeScore } from "@/lib/scoring";
import { getWizardData } from "@/lib/wizard";

async function createPaidAssessment(assessmentType: AssessmentType) {
  const wizard = getWizardData(assessmentType);
  const answers = Object.fromEntries(
    wizard.questions.map((question) => [
      question.id,
      question.options?.[0]?.value || "yes"
    ])
  );
  const scoreResult = computeScore(wizard, answers);
  const fullReport = generateReport(wizard, answers, scoreResult);

  return db.assessment.create({
    data: {
      email: `${assessmentType}@example.invalid`,
      contactName: "Alex Tremblay",
      companyName: `PME Exemple ${assessmentType}`,
      assessmentType,
      answers,
      score: scoreResult.overallScore,
      level: scoreResult.level.label,
      reportLite: toLiteReport(fullReport),
      reportFull: fullReport,
      paymentStatus: "paid",
      accessToken: `paid-${assessmentType}-${crypto.randomUUID()}`
    }
  });
}

describe("paid kit downloads", () => {
  beforeEach(async () => {
    await db.stripeEvent.deleteMany();
    await db.emailJob.deleteMany();
    await db.entitlement.deleteMany();
    await db.order.deleteMany();
    await db.assessment.deleteMany();
  });

  it.each(["loi25", "cybersecurity", "ai"] as const)(
    "génère un PDF téléchargeable pour %s",
    async (assessmentType) => {
      const assessment = await createPaidAssessment(assessmentType);
      const response = await downloadPdf(
        new Request(
          `http://localhost/api/pdf?token=${encodeURIComponent(assessment.accessToken)}`
        )
      );
      const bytes = new Uint8Array(await response.arrayBuffer());

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toBe("application/pdf");
      expect(new TextDecoder().decode(bytes.slice(0, 4))).toBe("%PDF");
      expect(bytes.byteLength).toBeGreaterThan(1_000);
    }
  );

  it.each(["loi25", "cybersecurity", "ai"] as const)(
    "sert les gabarits DOCX/XLSX personnalisés pour %s",
    async (assessmentType) => {
      const assessment = await createPaidAssessment(assessmentType);
      const assets = KIT_ASSETS.filter(
        (asset) => asset.assessmentType === assessmentType
      );

      expect(assets).toHaveLength(3);

      for (const asset of assets) {
        const response = await downloadKitAsset(
          new Request(
            `http://localhost/api/download/kit-asset?token=${encodeURIComponent(
              assessment.accessToken
            )}&asset=${encodeURIComponent(asset.id)}`
          )
        );
        const bytes = new Uint8Array(await response.arrayBuffer());

        expect(response.status).toBe(200);
        expect(response.headers.get("content-type")).toBe(asset.contentType);
        expect(Array.from(bytes.slice(0, 2))).toEqual([0x50, 0x4b]);
        expect(bytes.byteLength).toBeGreaterThan(1_000);
      }
    }
  );
});
