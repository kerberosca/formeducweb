import path from "node:path";

import Database from "better-sqlite3";

const DROP_MIGRATION = "20260820010000_drop_demo839";
const DEMO_TABLES = [
  "admin_sessions",
  "admin_users",
  "announcements",
  "audit_log",
  "calendar_years",
  "categories",
  "events",
  "login_attempts",
  "recurring_schedules"
];

const databaseArgument = process.argv[2];
if (!databaseArgument) {
  throw new Error(
    "Usage: node scripts/ops/verify-demo839-removal.mjs <base.sqlite>"
  );
}

const databasePath = path.resolve(databaseArgument);
const database = new Database(databasePath, { readonly: true });

try {
  const integrity = database.pragma("integrity_check", { simple: true });
  const foreignKeyViolations = database.pragma("foreign_key_check");
  const placeholders = DEMO_TABLES.map(() => "?").join(", ");
  const remainingDemoTables = database
    .prepare(
      `SELECT name FROM sqlite_master WHERE type = 'table' AND name IN (${placeholders}) ORDER BY name`
    )
    .all(...DEMO_TABLES)
    .map((row) => row.name);
  const dropMigration = database
    .prepare(
      'SELECT finished_at FROM "_prisma_migrations" WHERE migration_name = ? AND rolled_back_at IS NULL'
    )
    .get(DROP_MIGRATION);

  const result = {
    databasePath,
    integrity,
    foreignKeyViolations,
    remainingDemoTables,
    dropMigrationApplied: Boolean(dropMigration?.finished_at)
  };

  console.log(JSON.stringify(result, null, 2));

  if (
    integrity !== "ok" ||
    foreignKeyViolations.length > 0 ||
    remainingDemoTables.length > 0 ||
    !result.dropMigrationApplied
  ) {
    process.exitCode = 1;
  }
} finally {
  database.close();
}
