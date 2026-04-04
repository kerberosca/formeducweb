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

function addDays(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

const startArg = process.argv[2] ?? "2026-03-30";
const endArg = process.argv[3] ?? "2026-04-06";

const startUtc = toUtcStart(startArg);
const endUtc = toUtcStart(endArg);

if (endUtc <= startUtc) {
  throw new Error("End date must be greater than start date.");
}

const db = new Database(getDbPath(), { readonly: true });

const completions = db
  .prepare(
    `SELECT COUNT(*) AS total
     FROM Assessment
     WHERE createdAt >= ?
       AND createdAt < ?`
  )
  .get(startUtc.toISOString(), endUtc.toISOString());

const paid = db
  .prepare(
    `SELECT COUNT(*) AS total
     FROM Assessment
     WHERE paymentStatus = 'paid'
       AND createdAt >= ?
       AND createdAt < ?`
  )
  .get(startUtc.toISOString(), endUtc.toISOString());

const result = {
  periode_debut: startArg,
  periode_fin_exclusive: endArg,
  completions_wizard: Number(completions?.total ?? 0),
  achats_rapport_29: Number(paid?.total ?? 0)
};

console.log(JSON.stringify(result, null, 2));
