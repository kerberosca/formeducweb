import { spawnSync } from "node:child_process";
import path from "node:path";

process.env.DATABASE_URL ||= "file:./prisma/dev.db";

function runNode(args, label) {
  const result = spawnSync(process.execPath, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit"
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${label} a quitté avec le code ${result.status}.`);
  }
}

const prismaCli = path.resolve("node_modules", "prisma", "build", "index.js");

runNode(
  ["scripts/ops/ensure-prisma-baseline.mjs"],
  "normalisation de l’historique Prisma"
);
runNode([prismaCli, "migrate", "deploy"], "prisma migrate deploy");
runNode(
  ["--experimental-strip-types", "scripts/lms/import-courses.mjs"],
  "l’import LMS idempotent"
);

console.log("Base SQLite locale prête et formations synchronisées.");
