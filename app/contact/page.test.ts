import { describe, expect, it } from "vitest";

import { getDefaultContactReason } from "./page";

describe("source de la page de contact", () => {
  it("présélectionne le motif des projets web", () => {
    expect(getDefaultContactReason("site-web")).toBe(
      "Site web / système sur mesure"
    );
    expect(getDefaultContactReason("site-web-onatchiway")).toBe(
      "Site web / système sur mesure"
    );
  });
});
