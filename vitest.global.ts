import { execFileSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";

const databasePath = path.resolve("prisma", "test.db");

export default function setup() {
  if (existsSync(databasePath)) rmSync(databasePath, { force: true });

  execFileSync(
    process.execPath,
    [
      "-e",
      "const Database=require('better-sqlite3'); const db=new Database(process.argv[1]); db.close();",
      databasePath
    ],
    { cwd: process.cwd(), stdio: "pipe" }
  );

  process.env.DATABASE_URL = "file:./prisma/test.db";
  process.env.DISABLE_EXTERNAL_SERVICES = "1";
  delete process.env.RESEND_API_KEY;
  delete process.env.RESEND_FROM;
  delete process.env.STRIPE_SECRET_KEY;

  execFileSync(
    process.execPath,
    [
      path.resolve("node_modules", "prisma", "build", "index.js"),
      "migrate",
      "deploy"
    ],
    {
      cwd: process.cwd(),
      env: process.env,
      stdio: "pipe"
    }
  );

  return () => {
    if (existsSync(databasePath)) rmSync(databasePath, { force: true });
  };
}
