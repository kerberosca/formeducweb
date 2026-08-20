import { spawnSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";

import Database from "better-sqlite3";

export const LEGACY_MIGRATIONS = [
  "20260314000000_add_low_ticket_assessment",
  "20260419000000_add_attribution_tracking",
  "20260619000000_add_assessment_type",
  "20260714000000_optional_assessment_profile",
  "20260722000000_add_demo839",
  "20260723000000_add_low_ticket_commerce",
  "20260723010000_add_entitlement_access_ownership"
];

const DROP_DEMO839_MIGRATION = "20260820010000_drop_demo839";

const REQUIRED_LEGACY_TABLES = [
  "Assessment",
  "ContactRequest",
  "Subscriber",
  "EmailJob",
  "Order",
  "Entitlement",
  "StripeEvent"
];

function getDatabasePath() {
  const databaseUrl = (process.env.DATABASE_URL || "").trim();
  if (!databaseUrl.startsWith("file:")) {
    throw new Error(
      "La normalisation de l’historique exige un DATABASE_URL SQLite file:."
    );
  }

  const value = databaseUrl.slice("file:".length).split("?")[0];
  if (!value) throw new Error("DATABASE_URL ne contient aucun chemin SQLite.");
  return path.resolve(value);
}

function tableExists(database, tableName) {
  return Boolean(
    database
      .prepare(
        "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1"
      )
      .get(tableName)
  );
}

function appliedPrismaMigrations(database) {
  if (!tableExists(database, "_prisma_migrations")) return new Set();
  return new Set(
    database
      .prepare(
        'SELECT "migration_name" FROM "_prisma_migrations" WHERE "finished_at" IS NOT NULL AND "rolled_back_at" IS NULL'
      )
      .all()
      .map((row) => row.migration_name)
  );
}

function resolveMigration(migrationName) {
  const prismaCli = path.resolve("node_modules", "prisma", "build", "index.js");
  const result = spawnSync(
    process.execPath,
    [prismaCli, "migrate", "resolve", "--applied", migrationName],
    { cwd: process.cwd(), env: process.env, stdio: "inherit" }
  );

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `Impossible de marquer ${migrationName} comme appliquée (code ${result.status}).`
    );
  }
}

export function ensurePrismaBaseline() {
  const databasePath = getDatabasePath();
  const database = new Database(databasePath);
  let missingMigrations = [];

  try {
    const userTables = database
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'"
      )
      .all()
      .map((row) => row.name);

    if (userTables.length === 0) {
      return { status: "empty", databasePath, migrations: [] };
    }

    const alreadyApplied = appliedPrismaMigrations(database);
    const hasLegacyLedger = tableExists(database, "__local_migrations");
    if (!hasLegacyLedger) {
      return {
        status: "prisma-managed",
        databasePath,
        migrations: [...alreadyApplied]
      };
    }

    const legacyRows = database
      .prepare('SELECT "name" FROM "__local_migrations"')
      .all()
      .map((row) => row.name);
    const absentLedgerEntries = LEGACY_MIGRATIONS.filter(
      (migration) => !legacyRows.includes(migration)
    );
    const unexpectedLedgerEntries = legacyRows.filter(
      (migration) => !LEGACY_MIGRATIONS.includes(migration)
    );
    const demo839WasDropped = alreadyApplied.has(DROP_DEMO839_MIGRATION);
    const requiredLegacyTables = demo839WasDropped
      ? REQUIRED_LEGACY_TABLES
      : [...REQUIRED_LEGACY_TABLES, "admin_users"];
    const absentTables = requiredLegacyTables.filter(
      (table) => !tableExists(database, table)
    );

    if (
      absentLedgerEntries.length ||
      unexpectedLedgerEntries.length ||
      absentTables.length
    ) {
      throw new Error(
        `Historique local non reconnu; aucune migration marquée. Entrées absentes: ${absentLedgerEntries.join(", ") || "aucune"}; entrées inattendues: ${unexpectedLedgerEntries.join(", ") || "aucune"}; tables absentes: ${absentTables.join(", ") || "aucune"}.`
      );
    }

    missingMigrations = LEGACY_MIGRATIONS.filter(
      (migration) => !alreadyApplied.has(migration)
    );
  } finally {
    database.close();
  }

  for (const migration of missingMigrations) {
    resolveMigration(migration);
  }

  return {
    status: missingMigrations.length ? "baselined" : "already-baselined",
    databasePath,
    migrations: missingMigrations
  };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = ensurePrismaBaseline();
  console.log(JSON.stringify(result, null, 2));
}
