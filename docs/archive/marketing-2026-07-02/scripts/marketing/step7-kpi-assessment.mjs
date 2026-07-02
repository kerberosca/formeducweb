import Database from "better-sqlite3";
import path from "node:path";

function getDbPath() {
  const url = process.env.DATABASE_URL;
  if (url && url.startsWith("file:")) {
    return path.resolve(process.cwd(), url.slice(5));
  }
  return path.resolve(process.cwd(), "prisma", "dev.db");
}

function toUtcStart(dateString) {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${dateString}. Expected YYYY-MM-DD`);
  }
  return date;
}

function tableExists(db, tableName) {
  const row = db
    .prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`)
    .get(tableName);
  return Boolean(row);
}

function hasColumns(db, tableName, requiredColumns) {
  if (!tableExists(db, tableName)) return false;
  const columns = db
    .prepare(`PRAGMA table_info("${tableName}")`)
    .all()
    .map((row) => row.name);

  return requiredColumns.every((columnName) => columns.includes(columnName));
}

function buildSourceCaseExpression(hasAttributionColumns) {
  if (!hasAttributionColumns) {
    return `'Direct'`;
  }

  return `
    CASE
      WHEN LOWER(COALESCE("utmMedium", '')) = 'cpc' AND LOWER(COALESCE("utmSource", '')) = 'google' THEN 'Google Ads'
      WHEN LOWER(COALESCE("utmMedium", '')) = 'cpc' AND LOWER(COALESCE("utmSource", '')) IN ('meta', 'facebook', 'instagram') THEN 'Meta Ads'
      WHEN LOWER(COALESCE("utmSource", '')) = 'google' THEN 'Google organique'
      WHEN LOWER(COALESCE("utmSource", '')) IN ('facebook', 'instagram') THEN 'Facebook organique'
      WHEN LOWER(COALESCE("utmSource", '')) = 'linkedin' THEN 'LinkedIn'
      WHEN LOWER(COALESCE("utmSource", '')) = 'direct' THEN 'Direct'
      WHEN LOWER(COALESCE("referrerHost", '')) LIKE '%google.%' THEN 'Google organique'
      WHEN LOWER(COALESCE("referrerHost", '')) LIKE '%facebook.%' OR LOWER(COALESCE("referrerHost", '')) LIKE '%instagram.%' THEN 'Facebook organique'
      WHEN LOWER(COALESCE("referrerHost", '')) LIKE '%linkedin.%' THEN 'LinkedIn'
      ELSE 'Direct'
    END
  `;
}

function readCountsBySource({ db, tableName, whereClause = "", params = [] }) {
  if (!tableExists(db, tableName)) {
    return [];
  }

  const hasAttribution = hasColumns(db, tableName, ["utmSource", "utmMedium", "referrerHost"]);
  const sourceCase = buildSourceCaseExpression(hasAttribution);
  const sql = `
    SELECT ${sourceCase} AS source_lead, COUNT(*) AS total
    FROM "${tableName}"
    ${whereClause}
    GROUP BY source_lead
  `;

  return db.prepare(sql).all(...params);
}

const startArg = process.argv[2] ?? "2026-03-30";
const endArg = process.argv[3] ?? "2026-04-06";

const startUtc = toUtcStart(startArg);
const endUtc = toUtcStart(endArg);

if (endUtc <= startUtc) {
  throw new Error("End date must be greater than start date.");
}

const db = new Database(getDbPath(), { readonly: true });
const rangeParams = [startUtc.toISOString(), endUtc.toISOString()];

const completionsRows = readCountsBySource({
  db,
  tableName: "Assessment",
  whereClause: `WHERE "createdAt" >= ? AND "createdAt" < ?`,
  params: rangeParams
});

const paidRows = readCountsBySource({
  db,
  tableName: "Assessment",
  whereClause: `WHERE "paymentStatus" = 'paid' AND "createdAt" >= ? AND "createdAt" < ?`,
  params: rangeParams
});

const contactsRows = readCountsBySource({
  db,
  tableName: "ContactRequest",
  whereClause: `WHERE "createdAt" >= ? AND "createdAt" < ?`,
  params: rangeParams
});

db.close();

const sources = ["Google organique", "Facebook organique", "LinkedIn", "Direct", "Google Ads", "Meta Ads"];
const bySource = Object.fromEntries(
  sources.map((source) => [
    source,
    {
      completions_wizard: 0,
      achats_rapport_29: 0,
      demandes_appel_contact: 0
    }
  ])
);

for (const row of completionsRows) {
  const source = bySource[row.source_lead] ? row.source_lead : "Direct";
  bySource[source].completions_wizard += Number(row.total ?? 0);
}

for (const row of paidRows) {
  const source = bySource[row.source_lead] ? row.source_lead : "Direct";
  bySource[source].achats_rapport_29 += Number(row.total ?? 0);
}

for (const row of contactsRows) {
  const source = bySource[row.source_lead] ? row.source_lead : "Direct";
  bySource[source].demandes_appel_contact += Number(row.total ?? 0);
}

const totals = Object.values(bySource).reduce(
  (accumulator, metrics) => {
    accumulator.completions_wizard += metrics.completions_wizard;
    accumulator.achats_rapport_29 += metrics.achats_rapport_29;
    accumulator.demandes_appel_contact += metrics.demandes_appel_contact;
    return accumulator;
  },
  {
    completions_wizard: 0,
    achats_rapport_29: 0,
    demandes_appel_contact: 0
  }
);

const result = {
  periode_debut: startArg,
  periode_fin_exclusive: endArg,
  totals,
  by_source: bySource
};

console.log(JSON.stringify(result, null, 2));
