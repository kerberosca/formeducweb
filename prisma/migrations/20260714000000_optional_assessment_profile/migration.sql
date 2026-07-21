PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Assessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "contactName" TEXT,
    "companyName" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "consentMarketing" BOOLEAN NOT NULL DEFAULT 0,
    "assessmentType" TEXT NOT NULL DEFAULT 'loi25',
    "answers" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "level" TEXT NOT NULL,
    "reportLite" TEXT NOT NULL,
    "reportFull" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'unpaid',
    "stripeSessionId" TEXT,
    "stripePaymentIntent" TEXT,
    "accessToken" TEXT NOT NULL,
    "pdfUrl" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmContent" TEXT,
    "utmTerm" TEXT,
    "landingPath" TEXT,
    "referrerHost" TEXT,
    "firstSeenAt" DATETIME
);

INSERT INTO "new_Assessment" (
    "id", "createdAt", "updatedAt", "contactName", "companyName", "email", "phone",
    "consentMarketing", "assessmentType", "answers", "score", "level", "reportLite",
    "reportFull", "paymentStatus", "stripeSessionId", "stripePaymentIntent", "accessToken",
    "pdfUrl", "utmSource", "utmMedium", "utmCampaign", "utmContent", "utmTerm",
    "landingPath", "referrerHost", "firstSeenAt"
)
SELECT
    "id", "createdAt", "updatedAt", "contactName", "companyName", "email", "phone",
    "consentMarketing", "assessmentType", "answers", "score", "level", "reportLite",
    "reportFull", "paymentStatus", "stripeSessionId", "stripePaymentIntent", "accessToken",
    "pdfUrl", "utmSource", "utmMedium", "utmCampaign", "utmContent", "utmTerm",
    "landingPath", "referrerHost", "firstSeenAt"
FROM "Assessment";

DROP TABLE "Assessment";
ALTER TABLE "new_Assessment" RENAME TO "Assessment";

CREATE UNIQUE INDEX "Assessment_accessToken_key" ON "Assessment"("accessToken");
CREATE INDEX "Assessment_email_idx" ON "Assessment"("email");
CREATE INDEX "Assessment_assessmentType_idx" ON "Assessment"("assessmentType");
CREATE INDEX "Assessment_paymentStatus_idx" ON "Assessment"("paymentStatus");
CREATE INDEX "Assessment_stripeSessionId_idx" ON "Assessment"("stripeSessionId");

PRAGMA foreign_keys=ON;
