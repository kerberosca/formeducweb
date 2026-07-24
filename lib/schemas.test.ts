import { describe, expect, it } from "vitest";

import {
  assessmentPayloadSchema,
  assessmentPreviewPayloadSchema,
  assessmentProfileSchema,
  checkoutSessionPayloadSchema
} from "@/lib/schemas";

describe("assessment schemas", () => {
  it("accepte une sauvegarde limitée au courriel et au consentement", () => {
    const parsed = assessmentPayloadSchema.parse({
      assessmentType: "loi25",
      email: "CLIENT@EXAMPLE.COM",
      consentMarketing: false,
      answers: { A1: "pme" }
    });

    expect(parsed.email).toBe("client@example.com");
    expect(parsed).not.toHaveProperty("leadCapture");
  });

  it("rejette un aperçu sans dictionnaire de réponses", () => {
    expect(
      assessmentPreviewPayloadSchema.safeParse({ assessmentType: "loi25" })
        .success
    ).toBe(false);
  });

  it("exige un profil complet avant le paiement", () => {
    expect(
      assessmentProfileSchema.safeParse({
        accessToken: "x".repeat(24),
        contactName: "A",
        companyName: ""
      }).success
    ).toBe(false);
  });

  it("accepte les cinq produits publics et refuse un code de prix inconnu", () => {
    const accessToken = "x".repeat(48);
    const productCodes = [
      "loi25_kit",
      "cyber_kit",
      "ai_kit",
      "digital_hygiene_trio",
      "trio_upgrade"
    ];

    for (const productCode of productCodes) {
      expect(
        checkoutSessionPayloadSchema.safeParse({
          accessToken,
          productCode
        }).success
      ).toBe(true);
    }
    expect(
      checkoutSessionPayloadSchema.safeParse({
        accessToken,
        productCode: "trio_1_dollar"
      }).success
    ).toBe(false);
  });
});
