import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import SiteWebServicePage from "./page";

describe("page publique des services web", () => {
  it("présente l'offre refondue et le parcours de contact sans la démo retirée", () => {
    render(<SiteWebServicePage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Un site web utile, crédible et simple à faire évoluer"
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Ce qu’on peut prendre en charge" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Avancer sans sauter les étapes utiles" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Décrire mon besoin" })
    ).toHaveAttribute("href", "/contact?source=appel-service-site-web");
    expect(document.body).not.toHaveTextContent("Onatchiway");
    expect(document.querySelector('a[href^="/demoOnatchiway"]')).toBeNull();
  });
});
