import { describe, expect, it } from "vitest";

import { getContactReasonFromSource } from "@/lib/contact-options";

describe("source de la page de contact", () => {
  it("présélectionne le motif des projets web", () => {
    expect(getContactReasonFromSource("site-web")).toBe(
      "Création ou refonte de site Web"
    );
    expect(getContactReasonFromSource("site-web-campagne")).toBe(
      "Création ou refonte de site Web"
    );
  });
});
