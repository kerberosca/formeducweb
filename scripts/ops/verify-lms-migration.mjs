import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import Database from "better-sqlite3";

// Keep this list stable: existing operators compare these counts before and
// after a migration. New schema coverage belongs in currentCounts below.
export const HISTORICAL_COUNT_TABLES = Object.freeze([
  "Assessment",
  "Order",
  "Entitlement",
  "StripeEvent",
  "EmailJob",
  "User",
  "Course",
  "Enrollment",
  "LessonProgress",
  "Certificate"
]);

export const CURRENT_REQUIRED_TABLES = Object.freeze([
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

function tableExists(database, tableName) {
  return Boolean(
    database
      .prepare(
        "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1"
      )
      .get(tableName)
  );
}

function countRows(database, tableName) {
  return database.prepare(`SELECT COUNT(*) AS count FROM "${tableName}"`).get()
    .count;
}

function fingerprint(database, tableName, columns) {
  if (!tableExists(database, tableName)) return null;

  const availableColumns = new Set(
    database
      .prepare(`PRAGMA table_info("${tableName}")`)
      .all()
      .map((column) => column.name)
  );
  const selectedColumns = columns.filter((column) =>
    availableColumns.has(column)
  );
  if (!selectedColumns.length) return null;

  const rows = database
    .prepare(
      `SELECT ${selectedColumns
        .map((column) => `"${column}"`)
        .join(", ")} FROM "${tableName}" ORDER BY "id"`
    )
    .all();

  return createHash("sha256").update(JSON.stringify(rows)).digest("hex");
}

export function inspectMigrationDatabase(database) {
  const missingTables = CURRENT_REQUIRED_TABLES.filter(
    (table) => !tableExists(database, table)
  );
  const quickCheck = database.prepare("PRAGMA quick_check").all();
  const foreignKeyCheck = database.prepare("PRAGMA foreign_key_check").all();
  const counts = Object.fromEntries(
    HISTORICAL_COUNT_TABLES.filter((table) => tableExists(database, table)).map(
      (table) => [table, countRows(database, table)]
    )
  );
  const currentCounts = Object.fromEntries(
    CURRENT_REQUIRED_TABLES.filter((table) => tableExists(database, table)).map(
      (table) => [table, countRows(database, table)]
    )
  );
  const fingerprints = {
    assessments: fingerprint(database, "Assessment", [
      "id",
      "createdAt",
      "updatedAt",
      "contactName",
      "companyName",
      "email",
      "phone",
      "consentMarketing",
      "assessmentType",
      "answers",
      "score",
      "level",
      "reportLite",
      "reportFull",
      "paymentStatus",
      "accessToken",
      "stripeSessionId",
      "stripePaymentIntent",
      "pdfUrl",
      "utmSource",
      "utmMedium",
      "utmCampaign",
      "utmContent",
      "utmTerm",
      "landingPath",
      "referrerHost",
      "firstSeenAt"
    ]),
    orders: fingerprint(database, "Order", [
      "id",
      "createdAt",
      "updatedAt",
      "publicToken",
      "email",
      "contactName",
      "companyName",
      "productCode",
      "amountCents",
      "currency",
      "status",
      "assessmentId",
      "stripeSessionId",
      "stripePaymentIntent",
      "paidAt",
      "refundedAt",
      "accessExpiresAt",
      "upgradeFromOrderId",
      "utmSource",
      "utmMedium",
      "utmCampaign",
      "utmContent",
      "utmTerm",
      "landingPath",
      "referrerHost",
      "firstSeenAt"
    ]),
    entitlements: fingerprint(database, "Entitlement", [
      "id",
      "createdAt",
      "updatedAt",
      "orderId",
      "assessmentId",
      "ownerEmail",
      "accessToken",
      "assessmentType",
      "status",
      "ownsAssessmentAccess",
      "expiresAt",
      "consumedAt",
      "revokedAt"
    ]),
    stripeEvents: fingerprint(database, "StripeEvent", [
      "id",
      "eventId",
      "eventType",
      "orderId",
      "processedAt"
    ]),
    emailJobs: fingerprint(database, "EmailJob", [
      "id",
      "createdAt",
      "updatedAt",
      "subscriberId",
      "orderId",
      "toEmail",
      "kind",
      "status",
      "scheduledAt",
      "sentAt",
      "cancelledAt",
      "attempts",
      "lastError",
      "payload",
      "idempotencyKey"
    ]),
    stripeRefundTombstones: fingerprint(database, "StripeRefundTombstone", [
      "id",
      "paymentIntentId",
      "orderId",
      "firstEventId",
      "refundedAt"
    ])
  };

  return {
    ok:
      missingTables.length === 0 &&
      quickCheck.length === 1 &&
      quickCheck[0]?.quick_check === "ok" &&
      foreignKeyCheck.length === 0,
    missingTables,
    quickCheck,
    foreignKeyViolations: foreignKeyCheck,
    counts,
    currentCounts,
    fingerprints
  };
}

export function verifyLmsMigration(databasePath) {
  const absolutePath = resolve(databasePath);
  const database = new Database(absolutePath, { readonly: true });

  try {
    return {
      database: absolutePath,
      ...inspectMigrationDatabase(database)
    };
  } finally {
    database.close();
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const databasePath = process.argv[2];
  if (!databasePath) {
    throw new Error(
      "Usage: node scripts/ops/verify-lms-migration.mjs <database.sqlite>"
    );
  }

  const result = verifyLmsMigration(databasePath);
  console.log(JSON.stringify(result, null, 2));

  if (!result.ok) process.exitCode = 1;
}
