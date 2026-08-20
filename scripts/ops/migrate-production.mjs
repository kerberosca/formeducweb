import { spawnSync } from "node:child_process";
import path from "node:path";

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
  "La normalisation de l’historique Prisma"
);
runNode([prismaCli, "migrate", "deploy"], "prisma migrate deploy");
runNode(
  ["--experimental-strip-types", "scripts/lms/import-courses.mjs"],
  "L’import LMS idempotent"
);
