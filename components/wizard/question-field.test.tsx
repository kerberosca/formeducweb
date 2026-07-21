import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { QuestionField } from "@/components/wizard/question-field";

const question = {
  id: "q1",
  sectionId: "a",
  title: "Avez-vous activé le MFA?",
  type: "single_select",
  required: true,
  weight: 5,
  scoreMap: { yes: 4, no: 0 },
  options: [
    { value: "yes", label: "Oui" },
    { value: "no", label: "Non" }
  ],
  helpText: "Choisissez la réponse la plus proche de votre situation."
};

describe("QuestionField", () => {
  it("associe l’aide et l’erreur, puis transmet le choix", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <QuestionField
        question={question}
        error="Réponse requise"
        onChange={onChange}
      />
    );

    const group = screen.getByRole("group", { name: question.title });
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Réponse requise");

    await user.click(screen.getByRole("radio", { name: "Oui" }));
    expect(onChange).toHaveBeenCalledWith("yes");

    rerender(
      <QuestionField question={question} value="yes" onChange={onChange} />
    );
    expect(screen.getByRole("radio", { name: "Oui" })).toBeChecked();
  });
});
