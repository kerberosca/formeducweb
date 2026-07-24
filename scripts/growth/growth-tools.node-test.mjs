import assert from "node:assert/strict";
import test from "node:test";

// Kept outside Vitest because these utilities intentionally use Node's runner.
import { aggregate, decide, parseCsv } from "./aggregate-funnel.mjs";
import { buildUtmUrl } from "./generate-utm.mjs";

test("génère un seul CTA UTM canonique", () => {
  const url = new URL(
    buildUtmUrl({
      source: "linkedin",
      week: 2,
      slot: "lundi",
      content: "S2 Lundi Charte IA"
    })
  );

  assert.equal(
    `${url.origin}${url.pathname}`,
    "https://formeducweb.ca/intelligence-artificielle/wizard"
  );
  assert.equal(url.searchParams.get("utm_source"), "linkedin");
  assert.equal(url.searchParams.get("utm_medium"), "organic-social");
  assert.equal(url.searchParams.get("utm_campaign"), "relance-low-ticket-45j");
  assert.equal(url.searchParams.get("utm_content"), "s2-lundi-charte-ia");
});

test("refuse une plateforme non autorisée", () => {
  assert.throws(
    () =>
      buildUtmUrl({
        source: "instagram",
        week: 1,
        slot: "lundi"
      }),
    /Source invalide/
  );
});

test("refuse un export contenant des identifiants", () => {
  assert.throws(
    () =>
      parseCsv(
        "date,event,email\n2026-07-27,purchase,client@example.invalid\n"
      ),
    /Colonnes interdites/
  );
});

test("agrège les événements sans réémettre les lignes", () => {
  const rows = parseCsv(
    [
      "date,event,source,medium,campaign,content,product,value_cad",
      "2026-07-27,diagnostic_start,linkedin,organic-social,relance-low-ticket-45j,s1-lundi,,,",
      "2026-07-27,diagnostic_preview_generated,linkedin,organic-social,relance-low-ticket-45j,s1-lundi,,,",
      "2026-07-27,checkout_started,linkedin,organic-social,relance-low-ticket-45j,s1-lundi,ai_kit,29",
      "2026-07-27,purchase,linkedin,organic-social,relance-low-ticket-45j,s1-lundi,digital_hygiene_trio,59"
    ].join("\n")
  );
  const report = aggregate(rows);

  assert.equal(report.metrics.diagnosticsStarted, 1);
  assert.equal(report.metrics.diagnosticsCompleted, 1);
  assert.equal(report.metrics.checkouts, 1);
  assert.equal(report.metrics.purchases, 1);
  assert.equal(report.metrics.trioPurchases, 1);
  assert.equal(report.metrics.revenueCad, 59);
  assert.equal(report.bySource[0].key, "linkedin");
});

test("applique les quatre seuils de décision", () => {
  assert.equal(
    decide({
      diagnosticsCompleted: 49,
      checkouts: 12,
      purchases: 2,
      trioPurchases: 0
    }).code,
    "distribution"
  );
  assert.equal(
    decide({
      diagnosticsCompleted: 50,
      checkouts: 2,
      purchases: 0,
      trioPurchases: 0
    }).code,
    "offer"
  );
  assert.equal(
    decide({
      diagnosticsCompleted: 50,
      checkouts: 10,
      purchases: 2,
      trioPurchases: 0
    }).code,
    "checkout"
  );
  assert.equal(
    decide({
      diagnosticsCompleted: 50,
      checkouts: 10,
      purchases: 5,
      trioPurchases: 1
    }).code,
    "amplify"
  );
});
