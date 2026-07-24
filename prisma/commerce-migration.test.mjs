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

describe("low-ticket commerce migration", () => {
  it("adds commerce tables without changing historical paid assessments", () => {
    const database = new Database(":memory:");

    try {
      database.exec(migrationSql("20260314000000_add_low_ticket_assessment"));
      database.exec(migrationSql("20260419000000_add_attribution_tracking"));
      database.exec(migrationSql("20260619000000_add_assessment_type"));
      database.exec(migrationSql("20260714000000_optional_assessment_profile"));
      database
        .prepare(
          `INSERT INTO "Assessment" (
            "id", "updatedAt", "email", "answers", "score", "level",
            "reportLite", "reportFull", "paymentStatus", "accessToken",
            "assessmentType"
          ) VALUES (?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          "historical-paid",
          "owner@example.invalid",
          "{}",
          70,
          "En progression",
          "{}",
          "{}",
          "paid",
          "historical-token",
          "loi25"
        );

      database.exec(migrationSql("20260723000000_add_low_ticket_commerce"));
      database.exec(
        migrationSql("20260723010000_add_entitlement_access_ownership")
      );

      const assessment = database
        .prepare(
          'SELECT "paymentStatus", "accessToken" FROM "Assessment" WHERE "id" = ?'
        )
        .get("historical-paid");
      const tableNames = database
        .prepare(
          "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name"
        )
        .all()
        .map((row) => row.name);
      const entitlementColumns = database
        .prepare('PRAGMA table_info("Entitlement")')
        .all()
        .map((row) => row.name);

      expect(assessment).toEqual({
        paymentStatus: "paid",
        accessToken: "historical-token"
      });
      expect(tableNames).toEqual(
        expect.arrayContaining([
          "Order",
          "Entitlement",
          "Subscriber",
          "EmailJob",
          "StripeEvent"
        ])
      );
      expect(entitlementColumns).toContain("ownsAssessmentAccess");
    } finally {
      database.close();
    }
  });
});
