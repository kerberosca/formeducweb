import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";

import {
  CURRENT_REQUIRED_TABLES,
  HISTORICAL_COUNT_TABLES,
  inspectMigrationDatabase
} from "./verify-lms-migration.mjs";

function createCurrentTables(database, omittedTable) {
  for (const tableName of CURRENT_REQUIRED_TABLES) {
    if (tableName === omittedTable) continue;

    if (tableName === "StripeRefundTombstone") {
      database.exec(`
        CREATE TABLE "StripeRefundTombstone" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "paymentIntentId" TEXT NOT NULL,
          "orderId" TEXT,
          "firstEventId" TEXT NOT NULL,
          "refundedAt" DATETIME NOT NULL
        )
      `);
      continue;
    }

    database.exec(
      `CREATE TABLE "${tableName}" ("id" TEXT NOT NULL PRIMARY KEY)`
    );
  }
}

describe("LMS migration verification", () => {
  it("requires the complete current schema without changing historical counts", () => {
    expect(CURRENT_REQUIRED_TABLES).toEqual([
      "Assessment",
      "User",
      "Account",
      "Session",
      "VerificationToken",
      "Order",
      "Entitlement",
      "Course",
      "CourseModule",
      "Lesson",
      "CourseResource",
      "Enrollment",
      "LessonProgress",
      "Quiz",
      "QuizQuestion",
      "QuizChoice",
      "QuizAttempt",
      "Certificate",
      "AdminAuditLog",
      "AuthRateLimit",
      "Subscriber",
      "EmailJob",
      "StripeEvent",
      "StripeRefundTombstone"
    ]);

    const database = new Database(":memory:");

    try {
      createCurrentTables(database);
      database
        .prepare(
          `INSERT INTO "StripeRefundTombstone"
            ("id", "paymentIntentId", "orderId", "firstEventId", "refundedAt")
           VALUES (?, ?, ?, ?, ?)`
        )
        .run("refund-1", "pi_1", "order-1", "evt_1", "2026-08-08");

      const before = inspectMigrationDatabase(database);
      expect(before.ok).toBe(true);
      expect(before.missingTables).toEqual([]);
      expect(Object.keys(before.counts)).toEqual(HISTORICAL_COUNT_TABLES);
      expect(before.counts).not.toHaveProperty("StripeRefundTombstone");
      expect(before.currentCounts).toMatchObject({
        StripeRefundTombstone: 1,
        Order: 0,
        User: 0
      });
      expect(before.fingerprints.stripeRefundTombstones).toMatch(
        /^[a-f0-9]{64}$/
      );

      database
        .prepare(
          'UPDATE "StripeRefundTombstone" SET "orderId" = ? WHERE "id" = ?'
        )
        .run("order-2", "refund-1");
      const after = inspectMigrationDatabase(database);

      expect(after.counts).toEqual(before.counts);
      expect(after.fingerprints.stripeRefundTombstones).not.toBe(
        before.fingerprints.stripeRefundTombstones
      );
    } finally {
      database.close();
    }
  });

  it("fails verification when the refund tombstone table is absent", () => {
    const database = new Database(":memory:");

    try {
      createCurrentTables(database, "StripeRefundTombstone");
      const result = inspectMigrationDatabase(database);

      expect(result.ok).toBe(false);
      expect(result.missingTables).toEqual(["StripeRefundTombstone"]);
      expect(result.currentCounts).not.toHaveProperty("StripeRefundTombstone");
      expect(result.fingerprints.stripeRefundTombstones).toBeNull();
    } finally {
      database.close();
    }
  });
});
