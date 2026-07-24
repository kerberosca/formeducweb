import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const FORBIDDEN_COLUMNS = [
  "email",
  "e-mail",
  "courriel",
  "name",
  "nom",
  "phone",
  "telephone",
  "company",
  "entreprise",
  "contact",
  "address",
  "adresse",
  "assessment_id",
  "transaction_id",
  "user_id",
  "client_id"
];

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];

    if (character === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  if (quoted) throw new Error("CSV invalide: guillemet non fermé.");
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  if (rows.length < 2) throw new Error("Le CSV ne contient aucun événement.");

  const headers = rows[0].map((value) => value.trim().toLowerCase());
  const forbidden = headers.filter((header) =>
    FORBIDDEN_COLUMNS.includes(header)
  );
  if (forbidden.length) {
    throw new Error(
      `Colonnes interdites détectées: ${forbidden.join(", ")}. Exporter uniquement des données non personnelles.`
    );
  }
  if (!headers.includes("event")) {
    throw new Error('La colonne obligatoire "event" est absente.');
  }

  return rows
    .slice(1)
    .map((values) =>
      Object.fromEntries(
        headers.map((header, index) => [header, (values[index] || "").trim()])
      )
    );
}

function incrementGroup(groups, key, event, value) {
  const group = groups.get(key) || {
    diagnosticsCompleted: 0,
    checkouts: 0,
    purchases: 0,
    trioPurchases: 0,
    revenueCad: 0
  };
  if (
    event === "diagnostic_preview_generated" ||
    event === "diagnostic_completed"
  ) {
    group.diagnosticsCompleted += 1;
  }
  if (event === "checkout_started") group.checkouts += 1;
  if (event === "purchase") {
    group.purchases += 1;
    group.revenueCad += value;
  }
  groups.set(key, group);
}

export function decide(metrics) {
  if (metrics.purchases >= 5 && metrics.trioPurchases >= 1) {
    return {
      code: "amplify",
      message:
        "Objectif validé: conserver 29 $ / 59 $ et amplifier les formats qui ont généré les ventes."
    };
  }
  if (metrics.diagnosticsCompleted < 50) {
    return {
      code: "distribution",
      message:
        "Distribution insuffisante: poursuivre la cadence et ne pas baisser le prix."
    };
  }
  if (metrics.checkouts < 3) {
    return {
      code: "offer",
      message:
        "Retravailler l’aperçu, la preuve et la différence entre gratuit et payant."
    };
  }
  if (metrics.checkouts >= 10 && metrics.purchases < 3) {
    return {
      code: "checkout",
      message:
        "Vérifier la friction Stripe; seulement ensuite tester temporairement 19 $ / 39 $."
    };
  }
  return {
    code: "continue",
    message:
      "Signal intermédiaire: poursuivre jusqu’au jour 45 sans changer simultanément l’offre et la distribution."
  };
}

export function aggregate(rows) {
  const metrics = {
    diagnosticsStarted: 0,
    diagnosticsCompleted: 0,
    leads: 0,
    checkouts: 0,
    purchases: 0,
    trioPurchases: 0,
    revenueCad: 0
  };
  const bySource = new Map();
  const byContent = new Map();

  for (const row of rows) {
    const event = row.event;
    const value = Number.parseFloat(row.value_cad || "0");
    const safeValue = Number.isFinite(value) ? value : 0;
    if (event === "diagnostic_start") metrics.diagnosticsStarted += 1;
    if (
      event === "diagnostic_preview_generated" ||
      event === "diagnostic_completed"
    ) {
      metrics.diagnosticsCompleted += 1;
    }
    if (event === "generate_lead") metrics.leads += 1;
    if (event === "checkout_started") metrics.checkouts += 1;
    if (event === "purchase") {
      metrics.purchases += 1;
      metrics.revenueCad += safeValue;
      if (row.product === "digital_hygiene_trio") {
        metrics.trioPurchases += 1;
      }
    }

    incrementGroup(bySource, row.source || "non_attribue", event, safeValue);
    incrementGroup(byContent, row.content || "non_attribue", event, safeValue);
    if (event === "purchase" && row.product === "digital_hygiene_trio") {
      bySource.get(row.source || "non_attribue").trioPurchases += 1;
      byContent.get(row.content || "non_attribue").trioPurchases += 1;
    }
  }

  metrics.revenueCad = Number(metrics.revenueCad.toFixed(2));
  const sortGroups = (groups) =>
    [...groups.entries()]
      .map(([key, values]) => ({
        key,
        ...values,
        revenueCad: Number(values.revenueCad.toFixed(2))
      }))
      .sort(
        (left, right) =>
          right.purchases - left.purchases ||
          right.diagnosticsCompleted - left.diagnosticsCompleted ||
          left.key.localeCompare(right.key)
      );

  return {
    generatedAt: new Date().toISOString(),
    metrics,
    decision: decide(metrics),
    bySource: sortGroups(bySource),
    byContent: sortGroups(byContent)
  };
}

export function toMarkdown(report) {
  const metric = report.metrics;
  const lines = [
    "# Rapport agrégé du tunnel",
    "",
    `Généré le ${report.generatedAt}.`,
    "",
    `- Diagnostics commencés : ${metric.diagnosticsStarted}`,
    `- Diagnostics terminés : ${metric.diagnosticsCompleted}`,
    `- Leads : ${metric.leads}`,
    `- Checkouts : ${metric.checkouts}`,
    `- Achats : ${metric.purchases}`,
    `- Trios : ${metric.trioPurchases}`,
    `- Revenu : ${metric.revenueCad.toFixed(2)} $ CAD`,
    "",
    `**Décision :** ${report.decision.message}`,
    "",
    "## Résultats par source",
    "",
    "| Source | Diagnostics | Checkouts | Achats | Trios | Revenu CAD |",
    "|---|---:|---:|---:|---:|---:|"
  ];
  for (const group of report.bySource) {
    lines.push(
      `| ${group.key} | ${group.diagnosticsCompleted} | ${group.checkouts} | ${group.purchases} | ${group.trioPurchases} | ${group.revenueCad.toFixed(2)} $ |`
    );
  }
  lines.push(
    "",
    "## Meilleurs contenus",
    "",
    "| Contenu UTM | Diagnostics | Checkouts | Achats |",
    "|---|---:|---:|---:|"
  );
  for (const group of report.byContent.slice(0, 10)) {
    lines.push(
      `| ${group.key} | ${group.diagnosticsCompleted} | ${group.checkouts} | ${group.purchases} |`
    );
  }
  return `${lines.join("\n")}\n`;
}

function isMainModule() {
  if (!process.argv[1]) return false;
  return path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

if (isMainModule()) {
  try {
    const inputPath = process.argv[2];
    if (!inputPath) {
      throw new Error(
        "Usage: node scripts/growth/aggregate-funnel.mjs <evenements.csv> [--json]"
      );
    }
    const rows = parseCsv(readFileSync(path.resolve(inputPath), "utf8"));
    const report = aggregate(rows);
    process.stdout.write(
      process.argv.includes("--json")
        ? `${JSON.stringify(report, null, 2)}\n`
        : toMarkdown(report)
    );
  } catch (error) {
    process.stderr.write(
      `${error instanceof Error ? error.message : "Erreur inconnue"}\n`
    );
    process.exitCode = 1;
  }
}
