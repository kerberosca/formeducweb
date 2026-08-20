import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import ProductsPage from "@/app/produits/page";

afterEach(() => cleanup());

describe("données structurées de la boutique", () => {
  it("décrit les trois kits à 29 $ et le Trio à 59 $ comme produits CAD", () => {
    const { container } = render(<ProductsPage />);
    const script =
      container.querySelector<HTMLScriptElement>("#products-schema");

    expect(script).not.toBeNull();
    const products = JSON.parse(script!.textContent || "[]") as Array<{
      "@type": string;
      name: string;
      offers: {
        "@type": string;
        price: string;
        priceCurrency: string;
        availability: string;
      };
    }>;

    expect(products).toHaveLength(4);
    expect(products.map((product) => product["@type"])).toEqual([
      "Product",
      "Product",
      "Product",
      "Product"
    ]);
    expect(products.slice(0, 3).map((product) => product.offers.price)).toEqual(
      ["29.00", "29.00", "29.00"]
    );
    expect(products[3]?.offers.price).toBe("59.00");
    for (const product of products) {
      expect(product.offers).toMatchObject({
        "@type": "Offer",
        priceCurrency: "CAD",
        availability: "https://schema.org/InStock"
      });
    }
  });
});
