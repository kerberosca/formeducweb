import { describe, expect, it } from "vitest";

import { getContactReasonFromSource } from "@/lib/contact-options";

describe("getContactReasonFromSource", () => {
  it.each([
    ["appel-service-commerce-electronique", "Boutique en ligne"],
    ["appel-service-cybersecurite", "Cybersécurité générale"],
    ["diagnostic-cybersecurite", "Diagnostic cybersécurité"],
    ["appel-formation-sur-mesure", "Formation d’équipe ou sur mesure"],
    ["appel-soutien-ti", "Soutien informatique"]
  ] as const)("associe %s à la raison partagée", (source, expected) => {
    expect(getContactReasonFromSource(source)).toBe(expected);
  });

  it("ne force aucune raison pour une source inconnue", () => {
    expect(getContactReasonFromSource("source-inconnue")).toBeUndefined();
  });
});
