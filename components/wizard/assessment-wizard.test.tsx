import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AssessmentWizard } from "@/components/wizard/assessment-wizard";
import type { WizardDataset } from "@/lib/wizard";

const wizard: WizardDataset = {
  version: "test",
  locale: "fr-CA",
  title: "Diagnostic test",
  disclaimer: "Résultat indicatif.",
  sections: [{ id: "a", title: "Pratiques" }],
  scoring: {
    levels: [{ min: 0, max: 100, label: "Test", tagline: "Test" }],
    recommendationSelection: { topGapsCount: 3, threshold: 2 }
  },
  leadCapture: {
    fields: [],
    consent: {
      id: "consentMarketing",
      label: "Consentement",
      defaultChecked: false
    }
  },
  questions: [
    {
      id: "q1",
      sectionId: "a",
      title: "Une pratique est-elle en place?",
      type: "single_select",
      required: true,
      weight: 5,
      options: [{ value: "yes", label: "Oui" }],
      scoreMap: { yes: 4 }
    }
  ]
};

describe("AssessmentWizard", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    window.localStorage.clear();
  });

  it("annonce une erreur réseau au lieu de perdre les réponses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Réseau indisponible"))
    );
    const user = userEvent.setup();
    render(
      <AssessmentWizard
        assessmentType="loi25"
        wizard={wizard}
        reportUnlockPriceLabel="29 $"
      />
    );

    await user.click(screen.getByRole("radio", { name: "Oui" }));
    await user.click(
      screen.getByRole("button", { name: "Voir mon score gratuit" })
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Réseau indisponible"
    );
    expect(screen.getByRole("radio", { name: "Oui" })).toBeChecked();
  });
});
