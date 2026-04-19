ALTER TABLE "Assessment" ADD COLUMN "utmSource" TEXT;
ALTER TABLE "Assessment" ADD COLUMN "utmMedium" TEXT;
ALTER TABLE "Assessment" ADD COLUMN "utmCampaign" TEXT;
ALTER TABLE "Assessment" ADD COLUMN "utmContent" TEXT;
ALTER TABLE "Assessment" ADD COLUMN "utmTerm" TEXT;
ALTER TABLE "Assessment" ADD COLUMN "landingPath" TEXT;
ALTER TABLE "Assessment" ADD COLUMN "referrerHost" TEXT;
ALTER TABLE "Assessment" ADD COLUMN "firstSeenAt" DATETIME;

CREATE TABLE "ContactRequest" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  "name" TEXT NOT NULL,
  "company" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "reason" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "consentMarketing" BOOLEAN NOT NULL DEFAULT 0,
  "utmSource" TEXT,
  "utmMedium" TEXT,
  "utmCampaign" TEXT,
  "utmContent" TEXT,
  "utmTerm" TEXT,
  "landingPath" TEXT,
  "referrerHost" TEXT,
  "firstSeenAt" DATETIME
);

CREATE INDEX "ContactRequest_email_idx" ON "ContactRequest"("email");
CREATE INDEX "ContactRequest_createdAt_idx" ON "ContactRequest"("createdAt");
CREATE INDEX "ContactRequest_utmSource_idx" ON "ContactRequest"("utmSource");
