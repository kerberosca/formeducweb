import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import SiteWebServicePage from "./page";

describe("page publique des services web", () => {
  it("présente l'offre refondue, Onatchiway et le parcours de contact", () => {
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
      screen.getByRole("heading", { name: "L’Appel d’Onatchiway" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/ForméducWeb a conçu cette expérience sur mesure/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/commandite son hébergement/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Décrire mon besoin" })
    ).toHaveAttribute("href", "/contact?source=appel-service-site-web");
    expect(screen.getByRole("link", { name: /Voir la réalisation/ })).toHaveAttribute(
      "href",
      "/demoOnatchiway"
    );
    expect(document.body).not.toHaveTextContent("8 168,20 $");
    expect(document.body).not.toHaveTextContent("18 octobre 2026");
  });
});
