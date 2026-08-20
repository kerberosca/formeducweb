import { describe, expect, it } from "vitest";

import {
  normalizeSearchText,
  searchCategories,
  searchSite,
  siteSearchDocuments
} from "@/lib/search";

describe("recherche globale", () => {
  it("normalise les accents, la casse et la ponctuation", () => {
    expect(normalizeSearchText("  Cybersécurité — L’IA  ")).toBe(
      "cybersecurite l ia"
    );
  });

  it("indexe chaque famille de contenu annoncée", () => {
    const indexedCategories = new Set(
      siteSearchDocuments.map((document) => document.category)
    );

    expect([...indexedCategories].sort()).toEqual([...searchCategories].sort());
  });

  it("trouve un contenu sans exiger les accents", () => {
    const results = searchSite("cybersecurite");

    expect(results.length).toBeGreaterThan(0);
    expect(
      results.some((result) =>
        normalizeSearchText(result.title).includes("cybersecurite")
      )
    ).toBe(true);
  });

  it("classe un titre exact avant les mentions secondaires", () => {
    const results = searchSite("Escadron 839 Lions de Chibougamau");

    expect(results[0]).toMatchObject({
      category: "Réalisation",
      title: "Escadron 839 Lions de Chibougamau"
    });
  });

  it("retourne aussi les ressources pratiques et les FAQ", () => {
    expect(searchSite("structurer liste Excel")[0]?.category).toBe("Ressource");
    expect(searchSite("audit de cybersécurité complet")[0]?.category).toBe(
      "FAQ"
    );
  });

  it("ne retourne rien pour une requête vide", () => {
    expect(searchSite("   ")).toEqual([]);
  });
});
