import { existsSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { getServiceBySlug, serviceNavigation, services } from "@/lib/services";

describe("catalogue de services", () => {
  it("conserve neuf services documentés et huit entrées principales", () => {
    expect(services).toHaveLength(9);
    expect(serviceNavigation).toHaveLength(8);
    expect(new Set(services.map((service) => service.slug)).size).toBe(9);
    expect(new Set(serviceNavigation.map((service) => service.slug)).size).toBe(
      8
    );
  });

  it("publie les deux nouveaux services sans retirer les routes historiques", () => {
    const expectedSlugs = [
      "site-web",
      "commerce-electronique",
      "automatisation-ia",
      "soutien-ti",
      "formation-sur-mesure",
      "seo",
      "cybersecurite",
      "soutien-industriel",
      "solutions-entreprises"
    ];

    for (const slug of expectedSlugs) {
      const service = getServiceBySlug(slug);
      expect(service?.href).toBe(`/services/${slug}`);
      expect(
        existsSync(path.resolve("app", "services", slug, "page.tsx")),
        `La page du service ${slug} doit exister.`
      ).toBe(true);
    }
  });
});
