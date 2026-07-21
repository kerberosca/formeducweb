import { readFileSync } from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";

function migrationSql(name) {
  return readFileSync(
    path.resolve("prisma", "migrations", name, "migration.sql"),
    "utf8"
  );
}

describe("optional assessment profile migration", () => {
  it("conserve les évaluations existantes tout en rendant le profil facultatif", () => {
    const database = new Database(":memory:");

    try {
      database.exec(migrationSql("20260314000000_add_low_ticket_assessment"));
      database.exec(migrationSql("20260419000000_add_attribution_tracking"));
      database.exec(migrationSql("20260619000000_add_assessment_type"));
      database
        .prepare(
          `INSERT INTO "Assessment" (
            "id", "updatedAt", "contactName", "companyName", "email", "answers", "score",
            "level", "reportLite", "reportFull", "accessToken", "assessmentType"
          ) VALUES (?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          "legacy-assessment",
          "Camille Roy",
          "PME Exemple",
          "legacy@example.invalid",
          "{}",
          72,
          "En progression",
          "{}",
          "{}",
          "legacy-token",
          "loi25"
        );

      database.exec(migrationSql("20260714000000_optional_assessment_profile"));

      const record = database
        .prepare('SELECT * FROM "Assessment" WHERE "id" = ?')
        .get("legacy-assessment");
      const columns = database.prepare('PRAGMA table_info("Assessment")').all();

      expect(record).toMatchObject({
        contactName: "Camille Roy",
        companyName: "PME Exemple",
        score: 72
      });
      expect(
        columns.find((column) => column.name === "contactName")?.notnull
      ).toBe(0);
      expect(
        columns.find((column) => column.name === "companyName")?.notnull
      ).toBe(0);
    } finally {
      database.close();
    }
  });
});
