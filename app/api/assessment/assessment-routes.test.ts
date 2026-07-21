import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { POST as saveAssessment } from "@/app/api/assessment/route";
import { POST as previewAssessment } from "@/app/api/assessment/preview/route";
import { PATCH as updateProfile } from "@/app/api/assessment/profile/route";
import { POST as createCheckout } from "@/app/api/stripe/create-checkout-session/route";
import { db } from "@/lib/db";
import { getWizardData } from "@/lib/wizard";

function request(path: string, body: unknown, ip: string, method = "POST") {
  return new Request(`http://localhost${path}`, {
    method,
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body)
  });
}

function completeAnswers() {
  const wizard = getWizardData("loi25");
  return Object.fromEntries(
    wizard.questions
      .filter((question) => question.required)
      .map((question) => [question.id, question.options?.[0]?.value ?? "na"])
  );
}

describe("assessment API routes", () => {
  beforeAll(async () => {
    await db.assessment.deleteMany();
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  it("refuse les réponses obligatoires manquantes sans créer de dossier", async () => {
    const response = await previewAssessment(
      request(
        "/api/assessment/preview",
        { assessmentType: "loi25", answers: {} },
        "203.0.113.10"
      )
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.missingQuestionIds.length).toBeGreaterThan(0);
    expect(await db.assessment.count()).toBe(0);
  });

  it("produit un aperçu anonyme no-store sans persistance", async () => {
    const response = await previewAssessment(
      request(
        "/api/assessment/preview",
        { assessmentType: "loi25", answers: completeAnswers() },
        "203.0.113.11"
      )
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(payload.scoreResult.overallScore).toEqual(expect.any(Number));
    expect(payload.liteReport.topGaps.length).toBeLessThanOrEqual(3);
    expect(await db.assessment.count()).toBe(0);
  });

  it("rejette une valeur de réponse inconnue", async () => {
    const answers = completeAnswers();
    answers.A1 = "valeur-inconnue";
    const response = await previewAssessment(
      request(
        "/api/assessment/preview",
        { assessmentType: "loi25", answers },
        "203.0.113.16"
      )
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      invalidQuestionIds: ["A1"]
    });
  });

  it("sauvegarde par courriel, exige le profil, puis l’accepte avant le paiement", async () => {
    const saveResponse = await saveAssessment(
      request(
        "/api/assessment",
        {
          assessmentType: "loi25",
          email: "diagnostic@example.invalid",
          consentMarketing: false,
          answers: completeAnswers()
        },
        "203.0.113.12"
      )
    );
    const saved = await saveResponse.json();

    expect(saveResponse.status).toBe(200);
    expect(saved.accessToken).toHaveLength(48);

    const mismatchedCheckout = await createCheckout(
      request(
        "/api/stripe/create-checkout-session",
        { assessmentId: saved.assessmentId, accessToken: "b".repeat(48) },
        "203.0.113.17"
      )
    );
    expect(mismatchedCheckout.status).toBe(404);

    const blockedCheckout = await createCheckout(
      request(
        "/api/stripe/create-checkout-session",
        { assessmentId: saved.assessmentId, accessToken: saved.accessToken },
        "203.0.113.13"
      )
    );
    expect(blockedCheckout.status).toBe(409);
    await expect(blockedCheckout.json()).resolves.toMatchObject({
      code: "PROFILE_REQUIRED"
    });

    const profileResponse = await updateProfile(
      request(
        "/api/assessment/profile",
        {
          accessToken: saved.accessToken,
          contactName: "Camille Roy",
          companyName: "Exemple PME"
        },
        "203.0.113.14",
        "PATCH"
      )
    );
    expect(profileResponse.status).toBe(200);

    const checkoutWithoutExternalStripe = await createCheckout(
      request(
        "/api/stripe/create-checkout-session",
        { assessmentId: saved.assessmentId, accessToken: saved.accessToken },
        "203.0.113.15"
      )
    );
    expect(checkoutWithoutExternalStripe.status).toBe(503);
  });

  it("limite le débit de l’aperçu", async () => {
    let response: Response | undefined;
    for (let index = 0; index < 31; index += 1) {
      response = await previewAssessment(
        request(
          "/api/assessment/preview",
          { assessmentType: "loi25", answers: {} },
          "203.0.113.99"
        )
      );
    }

    expect(response?.status).toBe(429);
    expect(response?.headers.get("retry-after")).toBeTruthy();
  });
});
