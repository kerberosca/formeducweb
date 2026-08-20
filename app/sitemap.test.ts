import { beforeEach, describe, expect, it, vi } from "vitest";

const { findMany } = vi.hoisted(() => ({
  findMany: vi.fn()
}));

vi.mock("@/lib/db", () => ({
  db: { course: { findMany } }
}));

import sitemap from "@/app/sitemap";

describe("sitemap", () => {
  beforeEach(() => {
    findMany.mockResolvedValue([
      { slug: "excel-essentiel", featured: true },
      { slug: "word-essentiel", featured: false }
    ]);
  });

  it("inclut les services et formations Prisma sans indexer la recherche", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);

    expect(urls).toContain(
      "https://formeducweb.ca/services/commerce-electronique"
    );
    expect(urls).toContain(
      "https://formeducweb.ca/services/solutions-entreprises"
    );
    expect(urls).toContain("https://formeducweb.ca/formations/excel-essentiel");
    expect(urls).toContain("https://formeducweb.ca/formations/word-essentiel");
    expect(urls).not.toContain("https://formeducweb.ca/recherche");
  });
});
