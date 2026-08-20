-- A course entitlement must not require a diagnostic-only ownership flag.
PRAGMA foreign_keys=OFF;
BEGIN IMMEDIATE;
PRAGMA defer_foreign_keys=ON;

CREATE TABLE "new_Entitlement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "orderId" TEXT NOT NULL,
    "assessmentId" TEXT,
    "userId" TEXT,
    "courseId" TEXT,
    "ownerEmail" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL DEFAULT 'assessment',
    "resourceKey" TEXT NOT NULL DEFAULT '',
    "assessmentType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "accessToken" TEXT NOT NULL,
    "ownsAssessmentAccess" BOOLEAN,
    "expiresAt" DATETIME NOT NULL,
    "consumedAt" DATETIME,
    "revokedAt" DATETIME,
    CONSTRAINT "Entitlement_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Entitlement_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Entitlement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Entitlement_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_Entitlement" (
    "id", "createdAt", "updatedAt", "orderId", "assessmentId", "userId", "courseId",
    "ownerEmail", "resourceType", "resourceKey", "assessmentType", "status", "accessToken",
    "ownsAssessmentAccess", "expiresAt", "consumedAt", "revokedAt"
)
SELECT
    "id", "createdAt", "updatedAt", "orderId", "assessmentId", "userId", "courseId",
    "ownerEmail", "resourceType", "resourceKey", "assessmentType", "status", "accessToken",
    "ownsAssessmentAccess", "expiresAt", "consumedAt", "revokedAt"
FROM "Entitlement";

DROP TABLE "Entitlement";
ALTER TABLE "new_Entitlement" RENAME TO "Entitlement";

CREATE UNIQUE INDEX "Entitlement_accessToken_key" ON "Entitlement"("accessToken");
CREATE INDEX "Entitlement_ownerEmail_idx" ON "Entitlement"("ownerEmail");
CREATE INDEX "Entitlement_assessmentId_idx" ON "Entitlement"("assessmentId");
CREATE INDEX "Entitlement_userId_idx" ON "Entitlement"("userId");
CREATE INDEX "Entitlement_courseId_idx" ON "Entitlement"("courseId");
CREATE INDEX "Entitlement_resourceType_resourceKey_idx" ON "Entitlement"("resourceType", "resourceKey");
CREATE INDEX "Entitlement_status_idx" ON "Entitlement"("status");
CREATE INDEX "Entitlement_expiresAt_idx" ON "Entitlement"("expiresAt");
CREATE UNIQUE INDEX "Entitlement_orderId_resourceType_resourceKey_key" ON "Entitlement"("orderId", "resourceType", "resourceKey");

COMMIT;
PRAGMA foreign_keys=ON;
