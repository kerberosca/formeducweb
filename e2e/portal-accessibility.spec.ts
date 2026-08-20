import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const viewports = [
  { name: "mobile-320", width: 320, height: 760 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 1000 }
] as const;

const publicRoutes = [
  { path: "/", heading: /Le numérique/i },
  { path: "/formations", heading: /autonomie numérique|formations/i },
  { path: "/services", heading: /faire plus avec le numérique/i },
  { path: "/ressources", heading: /guides pratiques/i },
  { path: "/contact", heading: /besoin numérique|besoin/i },
  { path: "/produits", heading: /outils|boutique|produits/i },
  { path: "/realisations", heading: /solution pensée/i }
] as const;

for (const viewport of viewports) {
  test.describe(viewport.name, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewport);
    });

    for (const route of publicRoutes) {
      test(`${route.path} est lisible et accessible`, async ({ page }) => {
        const response = await page.goto(route.path, {
          waitUntil: "domcontentloaded"
        });

        expect(response?.status()).toBeLessThan(400);
        await expect(page.getByRole("main")).toBeVisible();
        await expect(
          page.getByRole("heading", { level: 1, name: route.heading })
        ).toBeVisible();

        const hasHorizontalOverflow = await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth + 1
        );
        expect(hasHorizontalOverflow).toBe(false);

        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa"])
          .analyze();
        const blocking = results.violations.filter((violation) =>
          ["serious", "critical"].includes(violation.impact || "")
        );
        expect(blocking).toEqual([]);
      });
    }

    test("la recherche globale trouve une formation", async ({ page }) => {
      await page.goto("/recherche?q=Excel");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(
        page.getByRole("link", { name: /Excel essentiel/i })
      ).toBeVisible();
    });

    if (viewport.width < 1440) {
      test("le menu mobile et ses services sont utilisables", async ({
        page
      }) => {
        await page.goto("/");
        await page.getByRole("button", { name: "Ouvrir le menu" }).click();
        const mobileNavigation = page.getByRole("navigation", {
          name: "Navigation mobile"
        });
        await expect(mobileNavigation).toBeVisible();
        await mobileNavigation
          .getByRole("button", { name: "Afficher les services" })
          .click();
        await expect(
          mobileNavigation.getByRole("link", { name: /Commerce électronique/i })
        ).toBeVisible();
      });
    }
  });
}

test("le sous-menu Services fonctionne au clavier", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Afficher les services" });
  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  await expect(
    page.getByRole("navigation", { name: "Services" })
  ).toBeVisible();
  await expect(page.locator(":focus")).toHaveAttribute("href", /\/services\//);
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});
