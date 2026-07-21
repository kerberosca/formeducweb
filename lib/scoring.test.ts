import { describe, expect, it } from "vitest";

import { computeScore, getAnswerScore, type WizardData } from "@/lib/scoring";

const wizard: WizardData = {
  version: "test",
  locale: "fr-CA",
  title: "Test",
  sections: [{ id: "security", title: "Sécurité" }],
  scoring: {
    levels: [
      { min: 0, max: 49, label: "À structurer", tagline: "Agir" },
      { min: 50, max: 100, label: "En progression", tagline: "Continuer" }
    ],
    recommendationSelection: { topGapsCount: 3, threshold: 2 }
  },
  questions: [
    {
      id: "q1",
      sectionId: "security",
      title: "MFA",
      type: "single_select",
      required: true,
      weight: 10,
      options: [
        { value: "no", label: "Non" },
        { value: "yes", label: "Oui" }
      ],
      scoreMap: { no: 0, yes: 4 },
      recommendation: {
        title: "Activer le MFA",
        text: "Commencer par les comptes sensibles."
      }
    }
  ]
};

describe("scoring", () => {
  it("normalise un questionnaire complété sur 100", () => {
    expect(computeScore(wizard, { q1: "yes" }).overallScore).toBe(100);
    expect(computeScore(wizard, { q1: "no" }).gaps).toHaveLength(1);
  });

  it("borne les valeurs et traite les réponses manquantes", () => {
    expect(
      getAnswerScore({ ...wizard.questions[0], scoreMap: { high: 9 } }, "high")
    ).toBe(4);
    expect(computeScore(wizard, {}).overallScore).toBe(0);
  });
});
