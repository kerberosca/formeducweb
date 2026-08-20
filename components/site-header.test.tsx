import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SiteHeader } from "@/components/site-header";

const { usePathname } = vi.hoisted(() => ({
  usePathname: vi.fn(() => "/")
}));

vi.mock("next/navigation", () => ({ usePathname }));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("SiteHeader", () => {
  beforeEach(() => {
    usePathname.mockReturnValue("/");
  });

  it("présente la navigation principale dans l’ordre prévu", () => {
    render(<SiteHeader />);

    const navigation = screen.getByRole("navigation", {
      name: "Navigation principale"
    });
    const labels = within(navigation)
      .getAllByRole("link")
      .map((link) => link.textContent);

    expect(labels).toEqual([
      "Accueil",
      "Formations",
      "Services",
      "Boutique",
      "Ressources",
      "À propos",
      "Contact"
    ]);
  });

  it("ouvre huit services principaux et se referme avec Échap", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);

    const disclosure = screen.getByRole("button", {
      name: "Afficher les services"
    });
    await user.click(disclosure);

    const serviceNavigation = screen.getByRole("navigation", {
      name: "Services"
    });
    expect(within(serviceNavigation).getAllByRole("link")).toHaveLength(8);
    expect(
      within(serviceNavigation).queryByText("Référencement SEO")
    ).toBeNull();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(
      screen.queryByRole("navigation", { name: "Services" })
    ).not.toBeInTheDocument();
    await waitFor(() => expect(disclosure).toHaveFocus());
  });

  it("affiche Mon espace seulement lorsqu’une session réelle est disponible", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          user: {
            id: "cm0user000000000000000001",
            email: "membre@example.com"
          }
        })
      )
    );

    render(<SiteHeader />);

    expect(
      await screen.findByRole("link", { name: "Mon espace" })
    ).toHaveAttribute("href", "/mon-espace");
  });
});
