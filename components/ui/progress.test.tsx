import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Progress } from "@/components/ui/progress";

describe("Progress", () => {
  it("expose la valeur courante aux technologies d’assistance", () => {
    render(<Progress value={40} aria-label="Progression" />);

    expect(
      screen.getByRole("progressbar", { name: "Progression" })
    ).toHaveAttribute("aria-valuenow", "40");
  });
});
