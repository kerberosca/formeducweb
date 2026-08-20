import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ArchiveConfirmationButton } from "@/components/admin/archive-confirmation-button";

describe("ArchiveConfirmationButton", () => {
  it("demande une confirmation explicite et permet de l'annuler", async () => {
    const user = userEvent.setup();
    render(
      <form>
        <ArchiveConfirmationButton
          buttonLabel="Archiver le module"
          confirmationLabel="le module « Introduction »"
        />
      </form>
    );

    await user.click(
      screen.getByRole("button", { name: "Archiver le module" })
    );

    expect(
      screen.getByRole("group", {
        name: "Confirmer l'archivage : le module « Introduction »"
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Confirmer l'archivage" })
    ).toHaveAttribute("type", "submit");

    await user.click(screen.getByRole("button", { name: "Annuler" }));
    expect(
      screen.getByRole("button", { name: "Archiver le module" })
    ).toHaveFocus();
    expect(
      screen.queryByRole("button", { name: "Confirmer l'archivage" })
    ).not.toBeInTheDocument();
  });
});
