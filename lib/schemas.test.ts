import { describe, expect, it } from "vitest";

import {
  assessmentPayloadSchema,
  assessmentPreviewPayloadSchema,
  assessmentProfileSchema,
  checkoutSessionPayloadSchema,
  privacyRequestSchema
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

  it("borne tous les champs texte d'une demande de confidentialité", () => {
    const valid = {
      fullName: "Marie Tremblay",
      email: "marie@example.ca",
      companyName: "PME Exemple",
      requestType: "access",
      message:
        "Je souhaite obtenir une copie de mes renseignements personnels.",
      website: ""
    };

    expect(privacyRequestSchema.safeParse(valid).success).toBe(true);
    expect(
      privacyRequestSchema.safeParse({
        ...valid,
        fullName: "x".repeat(121)
      }).success
    ).toBe(false);
    expect(
      privacyRequestSchema.safeParse({
        ...valid,
        companyName: "x".repeat(161)
      }).success
    ).toBe(false);
    expect(
      privacyRequestSchema.safeParse({
        ...valid,
        message: "x".repeat(4001)
      }).success
    ).toBe(false);
    expect(
      privacyRequestSchema.safeParse({
        ...valid,
        website: "x".repeat(201)
      }).success
    ).toBe(false);
  });
});
