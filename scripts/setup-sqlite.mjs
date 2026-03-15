import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = join(scriptDir, "..");
const prismaDir = join(rootDir, "prisma");
const databasePath = join(prismaDir, "dev.db");
const migrationPath = join(prismaDir, "migrations", "20260314000000_add_low_ticket_assessment", "migration.sql");

if (!existsSync(migrationPath)) {
  console.error(`Migration introuvable: ${migrationPath}`);
  process.exit(1);
}

mkdirSync(prismaDir, { recursive: true });

const sql = readFileSync(migrationPath, "utf8");
const database = new DatabaseSync(databasePath);

database.exec(sql);
database.close();

console.log(`Base SQLite prete: ${databasePath}`);
