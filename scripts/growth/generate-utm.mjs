import { fileURLToPath } from "node:url";
import path from "node:path";

export const BASE_DIAGNOSTIC_URL =
  "https://formeducweb.ca/intelligence-artificielle/wizard";
export const CAMPAIGN = "relance-low-ticket-45j";

const SOURCES = {
  linkedin: "organic-social",
  facebook: "organic-social",
  youtube: "organic-video"
};

function slug(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function buildUtmUrl({ source, week, slot, content }) {
  if (!Object.hasOwn(SOURCES, source)) {
    throw new Error(
      `Source invalide: ${source}. Utiliser linkedin, facebook ou youtube.`
    );
  }

  const weekNumber = Number(week);
  if (!Number.isInteger(weekNumber) || weekNumber < 1 || weekNumber > 6) {
    throw new Error("La semaine doit être un entier de 1 à 6.");
  }

  const normalizedSlot = slug(slot);
  if (!["lundi", "mercredi", "vendredi"].includes(normalizedSlot)) {
    throw new Error("Le créneau doit être lundi, mercredi ou vendredi.");
  }

  const normalizedContent = slug(
    content || `s${weekNumber}-${normalizedSlot}-publication`
  );
  if (!normalizedContent) {
    throw new Error("Le contenu UTM ne peut pas être vide.");
  }

  const url = new URL(BASE_DIAGNOSTIC_URL);
  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", SOURCES[source]);
  url.searchParams.set("utm_campaign", CAMPAIGN);
  url.searchParams.set("utm_content", normalizedContent);
  return url.toString();
}

function readArguments(values) {
  const options = {};
  for (let index = 0; index < values.length; index += 1) {
    const key = values[index];
    if (!key.startsWith("--")) continue;
    const name = key.slice(2);
    const next = values[index + 1];
    if (!next || next.startsWith("--")) {
      options[name] = true;
      continue;
    }
    options[name] = next;
    index += 1;
  }
  return options;
}

function printHelp() {
  process.stdout.write(
    [
      "Usage:",
      "  node scripts/growth/generate-utm.mjs --source linkedin --week 1 --slot lundi",
      "  node scripts/growth/generate-utm.mjs --source youtube --week 3 --slot vendredi --content s3-vendredi-cas-validation",
      "",
      "Le script ne fait aucun appel réseau et ne publie rien."
    ].join("\n")
  );
}

function isMainModule() {
  if (!process.argv[1]) return false;
  return path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

if (isMainModule()) {
  try {
    const options = readArguments(process.argv.slice(2));
    if (options.help) {
      printHelp();
      process.exitCode = 0;
    } else {
      const url = buildUtmUrl({
        source: options.source,
        week: options.week,
        slot: options.slot,
        content: options.content
      });
      process.stdout.write(`${url}\n`);
    }
  } catch (error) {
    process.stderr.write(
      `${error instanceof Error ? error.message : "Erreur inconnue"}\n`
    );
    process.exitCode = 1;
  }
}
