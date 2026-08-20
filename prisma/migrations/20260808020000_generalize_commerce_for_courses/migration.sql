-- Preserve every historical identifier and token while adding course commerce.
PRAGMA foreign_keys=OFF;
BEGIN IMMEDIATE;
PRAGMA defer_foreign_keys=ON;

CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "publicToken" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contactName" TEXT,
    "companyName" TEXT,
    "productCode" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'cad',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "kind" TEXT NOT NULL DEFAULT 'assessment',
    "userId" TEXT,
    "courseId" TEXT,
    "assessmentId" TEXT,
    "stripeSessionId" TEXT,
    "stripePaymentIntent" TEXT,
    "paidAt" DATETIME,
    "refundedAt" DATETIME,
    "accessExpiresAt" DATETIME,
    "upgradeFromOrderId" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmContent" TEXT,
    "utmTerm" TEXT,
    "landingPath" TEXT,
    "referrerHost" TEXT,
    "firstSeenAt" DATETIME,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_upgradeFromOrderId_fkey" FOREIGN KEY ("upgradeFromOrderId") REFERENCES "new_Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_Order" (
    "id", "createdAt", "updatedAt", "publicToken", "email", "contactName", "companyName",
    "productCode", "amountCents", "currency", "status", "kind", "assessmentId",
    "stripeSessionId", "stripePaymentIntent", "paidAt", "refundedAt", "accessExpiresAt",
    "upgradeFromOrderId", "utmSource", "utmMedium", "utmCampaign", "utmContent", "utmTerm",
    "landingPath", "referrerHost", "firstSeenAt"
)
SELECT
    "id", "createdAt", "updatedAt", "publicToken", "email", "contactName", "companyName",
    "productCode", "amountCents", "currency", "status", 'assessment', "assessmentId",
    "stripeSessionId", "stripePaymentIntent", "paidAt", "refundedAt", "accessExpiresAt",
    "upgradeFromOrderId", "utmSource", "utmMedium", "utmCampaign", "utmContent", "utmTerm",
    "landingPath", "referrerHost", "firstSeenAt"
FROM "Order";

DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";

CREATE UNIQUE INDEX "Order_publicToken_key" ON "Order"("publicToken");
CREATE UNIQUE INDEX "Order_stripeSessionId_key" ON "Order"("stripeSessionId");
CREATE UNIQUE INDEX "Order_stripePaymentIntent_key" ON "Order"("stripePaymentIntent");
CREATE INDEX "Order_email_idx" ON "Order"("email");
CREATE INDEX "Order_productCode_idx" ON "Order"("productCode");
CREATE INDEX "Order_status_idx" ON "Order"("status");
CREATE INDEX "Order_kind_idx" ON "Order"("kind");
CREATE INDEX "Order_userId_idx" ON "Order"("userId");
CREATE INDEX "Order_courseId_idx" ON "Order"("courseId");
CREATE INDEX "Order_assessmentId_idx" ON "Order"("assessmentId");
CREATE INDEX "Order_upgradeFromOrderId_idx" ON "Order"("upgradeFromOrderId");
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

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
    "resourceKey" TEXT NOT NULL,
    "assessmentType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "accessToken" TEXT,
    "ownsAssessmentAccess" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" DATETIME,
    "consumedAt" DATETIME,
    "revokedAt" DATETIME,
    CONSTRAINT "Entitlement_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Entitlement_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Entitlement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Entitlement_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_Entitlement" (
    "id", "createdAt", "updatedAt", "orderId", "assessmentId", "ownerEmail",
    "resourceType", "resourceKey", "assessmentType", "status", "accessToken",
    "ownsAssessmentAccess", "expiresAt", "consumedAt", "revokedAt"
)
SELECT
    "id", "createdAt", "updatedAt", "orderId", "assessmentId", "ownerEmail",
    'assessment', "assessmentType", "assessmentType", "status", "accessToken",
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
