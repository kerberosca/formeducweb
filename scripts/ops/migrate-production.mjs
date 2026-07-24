import { spawnSync } from "node:child_process";
import path from "node:path";

import Database from "better-sqlite3";

const DEMO839_MIGRATION = "20260722000000_add_demo839";
const SAFE_PENDING_ACTION = "deactivate_seeded_admin";
const SEEDED_ADMIN_HASH =
  "eafeac6d391738e2ce5edd5cf4a76811fa47172da19c4976c87a8df6ea9b1953";
const SEEDED_ADMIN_SALT = "9a0da99a17a9e8adbbf973dea9d405a4";

function getDatabasePath() {
  const databaseUrl = (process.env.DATABASE_URL || "").trim();

  if (!databaseUrl.startsWith("file:")) {
    throw new Error(
      "La migration de production sécurisée exige un DATABASE_URL SQLite file:."
    );
  }

  const value = databaseUrl.slice("file:".length).split("?")[0];
  if (!value) throw new Error("DATABASE_URL ne contient aucun chemin SQLite.");

  return path.resolve(value);
}

function isMigrationApplied(databasePath, migrationName) {
  const database = new Database(databasePath);

  try {
    const migrationTable = database
      .prepare(
        "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = '_prisma_migrations'"
      )
      .get();
    if (!migrationTable) return false;

    return Boolean(
      database
        .prepare(
          'SELECT 1 FROM "_prisma_migrations" WHERE "migration_name" = ? AND "finished_at" IS NOT NULL AND "rolled_back_at" IS NULL'
        )
        .get(migrationName)
    );
  } finally {
    database.close();
  }
}

function runPrismaMigrations() {
  const prismaCli = path.resolve("node_modules", "prisma", "build", "index.js");
  const result = spawnSync(process.execPath, [prismaCli, "migrate", "deploy"], {
    env: process.env,
    stdio: "inherit"
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `prisma migrate deploy a quitté avec le code ${result.status}.`
    );
  }
}

function hasActiveSeededAdmin(databasePath) {
  const database = new Database(databasePath);

  try {
    const adminTable = database
      .prepare(
        "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'admin_users'"
      )
      .get();
    if (!adminTable) return false;

    return Boolean(
      database
        .prepare(
          "SELECT 1 FROM admin_users WHERE id = 1 AND is_active = 1 AND password_hash = ? AND password_salt = ?"
        )
        .get(SEEDED_ADMIN_HASH, SEEDED_ADMIN_SALT)
    );
  } finally {
    database.close();
  }
}

function deactivateSeededAdmin(databasePath) {
  const database = new Database(databasePath);

  try {
    const adminTable = database
      .prepare(
        "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'admin_users'"
      )
      .get();
    if (!adminTable) {
      throw new Error(
        "La table admin_users attendue après la migration Demo839 est absente."
      );
    }

    const result = database
      .prepare(
        "UPDATE admin_users SET is_active = 0, must_change_password = 1, updated_at = CURRENT_TIMESTAMP WHERE id = 1 AND password_hash = ? AND password_salt = ?"
      )
      .run(SEEDED_ADMIN_HASH, SEEDED_ADMIN_SALT);
    if (result.changes !== 1) {
      throw new Error(
        "Le compte administrateur initial Demo839 n’a pas pu être désactivé."
      );
    }

    database.prepare("DELETE FROM admin_sessions WHERE user_id = 1").run();
  } finally {
    database.close();
  }
}

const databasePath = getDatabasePath();
const demoMigrationWasApplied = isMigrationApplied(
  databasePath,
  DEMO839_MIGRATION
);
const activeSeededAdminBeforeMigration =
  demoMigrationWasApplied && hasActiveSeededAdmin(databasePath);
const requiresSeedHardening =
  !demoMigrationWasApplied || activeSeededAdminBeforeMigration;

if (
  requiresSeedHardening &&
  process.env.DEMO839_PENDING_MIGRATION_ACTION !== SAFE_PENDING_ACTION
) {
  throw new Error(
    `La migration ${DEMO839_MIGRATION} est en attente ou son compte initial est encore actif. Faites une sauvegarde, relisez docs/production-low-ticket.md, puis définissez DEMO839_PENDING_MIGRATION_ACTION=${SAFE_PENDING_ACTION} pour sa désactivation automatique.`
  );
}

runPrismaMigrations();

if (requiresSeedHardening) {
  deactivateSeededAdmin(databasePath);
  console.log(
    "Le compte administrateur initial Demo839 a été désactivé avant le démarrage du site."
  );
}
