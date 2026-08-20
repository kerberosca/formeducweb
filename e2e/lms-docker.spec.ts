import { readFile, stat } from "node:fs/promises";

import {
  expect,
  test,
  type APIRequestContext,
  type Page
} from "@playwright/test";

const MAILPIT_API = "http://127.0.0.1:8025/api/v1";
const LOCAL_SITE = "http://localhost:3010";
const runDockerJourney = process.env.RUN_LMS_DOCKER_E2E === "1";

type MailpitMessage = {
  ID: string;
  To: Array<{ Address: string }>;
  Created: string;
};

async function requestMagicLink(page: Page, email: string) {
  await page.goto(`${LOCAL_SITE}/connexion`);
  await page.getByRole("textbox", { name: "Adresse courriel" }).fill(email);
  await page
    .getByRole("button", { name: "Recevoir mon lien de connexion" })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Si cette adresse peut être utilisée"
  );
}

async function getLatestMagicLink(request: APIRequestContext, email: string) {
  let messageId = "";
  await expect
    .poll(
      async () => {
        const response = await request.get(`${MAILPIT_API}/messages`);
        if (!response.ok()) return false;
        const body = (await response.json()) as { messages: MailpitMessage[] };
        const message = body.messages
          .filter((candidate) =>
            candidate.To.some(
              (recipient) => recipient.Address.toLowerCase() === email
            )
          )
          .sort((a, b) => b.Created.localeCompare(a.Created))[0];
        messageId = message?.ID ?? "";
        return Boolean(messageId);
      },
      { timeout: 10_000 }
    )
    .toBe(true);

  const response = await request.get(`${MAILPIT_API}/message/${messageId}`);
  expect(response.ok()).toBe(true);
  const body = (await response.json()) as { Text: string };
  const link = body.Text.match(
    /http:\/\/localhost:3010\/api\/auth\/callback\/email\?[^\s]+/
  )?.[0];
  expect(link).toBeTruthy();
  return link!;
}

test.describe("parcours LMS Docker et Mailpit", () => {
  test.skip(
    !runDockerJourney,
    "Définir RUN_LMS_DOCKER_E2E=1 pour la recette locale avec Mailpit."
  );

  test("connexion, formation, quiz, certificat, administration et ressource", async ({
    browser,
    page,
    request
  }) => {
    test.setTimeout(90_000);
    const learnerEmail = `e2e-${Date.now()}@formeducweb.local`;

    await requestMagicLink(page, learnerEmail);
    const learnerLink = await getLatestMagicLink(request, learnerEmail);
    await page.goto(learnerLink);
    await expect(page).toHaveURL(`${LOCAL_SITE}/mon-espace`);

    await page.goto(`${LOCAL_SITE}/formations/excel-essentiel`);
    await page.getByRole("button", { name: "Acheter la formation" }).click();
    await expect(
      page.getByText(
        "Le paiement Stripe n’est pas configuré sur cet environnement."
      )
    ).toBeVisible();

    await page.goto(`${LOCAL_SITE}/formations/internet-sans-stress`);
    await page.getByRole("button", { name: "S’inscrire gratuitement" }).click();
    await expect(page).toHaveURL(
      `${LOCAL_SITE}/formations/internet-sans-stress/apprendre`
    );

    for (const progress of [20, 40, 60, 80]) {
      await page.getByRole("button", { name: "Terminer et continuer" }).click();
      await expect(page.getByRole("progressbar")).toHaveAttribute(
        "aria-valuenow",
        String(progress)
      );
    }

    await page
      .getByRole("radio", { name: "Le site officiel de l’organisme" })
      .check();
    await page
      .getByRole("radio", {
        name: "Utiliser un mot de passe unique par service"
      })
      .check();
    await page
      .getByRole("radio", { name: "Vérifier la source avant de l’ouvrir" })
      .check();
    await page.getByRole("button", { name: "Remettre mes réponses" }).click();
    await expect(page.getByRole("status")).toContainText(
      "Résultat : 100 % — réussi"
    );
    await page.getByRole("button", { name: "Terminer la formation" }).click();
    await expect(page.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "100"
    );

    await page.goto(`${LOCAL_SITE}/mon-espace`);
    await expect(
      page.getByRole("region", { name: "Mes formations" })
    ).toContainText("Terminée");
    const certificateLink = page.getByRole("link", {
      name: "Voir et télécharger"
    });
    await expect(certificateLink).toBeVisible();
    await certificateLink.click();
    await expect(page.getByText("Certificat valide")).toBeVisible();

    const reusedContext = await browser.newContext();
    const reusedPage = await reusedContext.newPage();
    await reusedPage.goto(learnerLink);
    await expect(reusedPage).toHaveURL(
      `${LOCAL_SITE}/connexion?error=Verification`
    );
    await reusedContext.close();

    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    await requestMagicLink(adminPage, "admin@formeducweb.local");
    const adminLink = await getLatestMagicLink(
      request,
      "admin@formeducweb.local"
    );
    await adminPage.goto(adminLink);
    await adminPage.goto(`${LOCAL_SITE}/administration/inscriptions`);
    await expect(
      adminPage.getByRole("heading", { level: 1, name: "Inscriptions" })
    ).toBeVisible();
    await adminPage
      .getByRole("textbox", { name: "Courriel vérifié" })
      .fill(learnerEmail);
    await adminPage
      .getByRole("combobox", { name: "Formation" })
      .selectOption({ label: "Excel essentiel pour la petite entreprise" });
    await adminPage.getByRole("button", { name: "Accorder l’accès" }).click();
    await expect(
      adminPage.getByRole("row", {
        name: new RegExp(`${learnerEmail} Excel essentiel`, "i")
      })
    ).toContainText("active");

    await page.goto(`${LOCAL_SITE}/formations/excel-essentiel/apprendre`);
    const resourceLink = page.getByRole("link", {
      name: "Classeur de pratique — Excel essentiel"
    });
    await expect(resourceLink).toBeVisible();
    const resourceHref = await resourceLink.getAttribute("href");
    expect(resourceHref).toMatch(/^\/api\/lms\/resources\/.+\/download$/);

    const anonymousResponse = await request.get(
      new URL(resourceHref!, LOCAL_SITE).toString(),
      { maxRedirects: 0 }
    );
    expect(anonymousResponse.status()).toBe(401);

    const downloadPromise = page.waitForEvent("download");
    await resourceLink.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("excel-essentiel-pratique.xlsx");
    const downloadedPath = await download.path();
    expect(downloadedPath).toBeTruthy();
    expect((await stat(downloadedPath!)).size).toBeGreaterThan(5_000);
    const workbookBytes = await readFile(downloadedPath!);
    expect(workbookBytes.subarray(0, 2)).toEqual(Buffer.from([0x50, 0x4b]));

    await adminContext.close();
  });
});
