CREATE TABLE IF NOT EXISTS "Assessment" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  "contactName" TEXT NOT NULL,
  "companyName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "consentMarketing" BOOLEAN NOT NULL DEFAULT 0,
  "answers" TEXT NOT NULL,
  "score" INTEGER NOT NULL,
  "level" TEXT NOT NULL,
  "reportLite" TEXT NOT NULL,
  "reportFull" TEXT NOT NULL,
  "paymentStatus" TEXT NOT NULL DEFAULT 'unpaid',
  "stripeSessionId" TEXT,
  "stripePaymentIntent" TEXT,
  "accessToken" TEXT NOT NULL,
  "pdfUrl" TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS "Assessment_accessToken_key" ON "Assessment"("accessToken");
CREATE INDEX IF NOT EXISTS "Assessment_email_idx" ON "Assessment"("email");
CREATE INDEX IF NOT EXISTS "Assessment_paymentStatus_idx" ON "Assessment"("paymentStatus");
CREATE INDEX IF NOT EXISTS "Assessment_stripeSessionId_idx" ON "Assessment"("stripeSessionId");