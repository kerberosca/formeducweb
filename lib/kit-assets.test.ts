import { strFromU8, unzipSync } from "fflate";
import { describe, expect, it } from "vitest";

import { KIT_ASSETS, renderPersonalizedKitAsset } from "@/lib/kit-assets";

describe("personalized kit assets", () => {
  it.each(KIT_ASSETS)(
    "personalizes and preserves the Office archive for $id",
    async (asset) => {
      const rendered = await renderPersonalizedKitAsset(asset, {
        "{{COMPANY_NAME}}": "Atelier ACME & Fils",
        "{{CONTACT_NAME}}": "Alex Tremblay",
        "{{GENERATED_DATE}}": "2026-07-23",
        "{{TOP_ACTION_1}}": "Nommer un responsable et vérifier les accès."
      });
      const archive = unzipSync(rendered);
      const xml = Object.entries(archive)
        .filter(([name]) => name.endsWith(".xml") || name.endsWith(".rels"))
        .map(([, bytes]) => strFromU8(bytes))
        .join("\n");

      expect(Object.keys(archive).length).toBeGreaterThan(5);
      expect(xml).toContain("Atelier ACME &amp; Fils");
      expect(xml).not.toMatch(
        /\{\{(?:COMPANY_NAME|CONTACT_NAME|GENERATED_DATE|TOP_ACTION_1)\}\}/
      );
    }
  );
});
