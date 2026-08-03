import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import SiteWebServicePage from "./page";

describe("page publique des services web", () => {
  it("présente les trois formats, Onatchiway et le parcours de contact", () => {
    render(<SiteWebServicePage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Du petit site efficace au système web fait sur mesure."
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Page ou petit site adapté" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Site structuré et évolutif" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Portail ou système web" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/La page du concours de la ZEC Onatchiway/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/commandite également l’hébergement/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Parler de votre projet" })
    ).toHaveAttribute("href", "/contact?source=site-web");
    expect(document.body).not.toHaveTextContent("8 168,20 $");
    expect(document.body).not.toHaveTextContent("18 octobre 2026");
  });
});
