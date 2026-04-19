import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = join(scriptDir, "..");
const prismaDir = join(rootDir, "prisma");
const databasePath = join(prismaDir, "dev.db");
const migrationsDir = join(prismaDir, "migrations");

if (!existsSync(migrationsDir)) {
  console.error(`Dossier migrations introuvable: ${migrationsDir}`);
  process.exit(1);
}

mkdirSync(prismaDir, { recursive: true });

const database = new DatabaseSync(databasePath);

database.exec(`
  CREATE TABLE IF NOT EXISTS "__local_migrations" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const migrationNames = readdirSync(migrationsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b));

const isAppliedStmt = database.prepare(`SELECT 1 FROM "__local_migrations" WHERE "name" = ?`);
const markAppliedStmt = database.prepare(`INSERT INTO "__local_migrations" ("name") VALUES (?)`);

for (const migrationName of migrationNames) {
  const migrationPath = join(migrationsDir, migrationName, "migration.sql");
  if (!existsSync(migrationPath)) {
    continue;
  }

  const alreadyApplied = Boolean(isAppliedStmt.get(migrationName));
  if (alreadyApplied) {
    continue;
  }

  const sql = readFileSync(migrationPath, "utf8");
  database.exec("BEGIN");

  try {
    database.exec(sql);
    markAppliedStmt.run(migrationName);
    database.exec("COMMIT");
    console.log(`Migration appliquee: ${migrationName}`);
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

database.close();

console.log(`Base SQLite prete: ${databasePath}`);
