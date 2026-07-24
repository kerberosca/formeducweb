CREATE TABLE "Order" (
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
    CONSTRAINT "Order_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_upgradeFromOrderId_fkey" FOREIGN KEY ("upgradeFromOrderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Order_publicToken_key" ON "Order"("publicToken");
CREATE UNIQUE INDEX "Order_stripeSessionId_key" ON "Order"("stripeSessionId");
CREATE UNIQUE INDEX "Order_stripePaymentIntent_key" ON "Order"("stripePaymentIntent");
CREATE INDEX "Order_email_idx" ON "Order"("email");
CREATE INDEX "Order_productCode_idx" ON "Order"("productCode");
CREATE INDEX "Order_status_idx" ON "Order"("status");
CREATE INDEX "Order_assessmentId_idx" ON "Order"("assessmentId");
CREATE INDEX "Order_upgradeFromOrderId_idx" ON "Order"("upgradeFromOrderId");
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

CREATE TABLE "Entitlement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "orderId" TEXT NOT NULL,
    "assessmentId" TEXT,
    "ownerEmail" TEXT NOT NULL,
    "assessmentType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "accessToken" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "consumedAt" DATETIME,
    "revokedAt" DATETIME,
    CONSTRAINT "Entitlement_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Entitlement_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Entitlement_accessToken_key" ON "Entitlement"("accessToken");
CREATE UNIQUE INDEX "Entitlement_orderId_assessmentType_key" ON "Entitlement"("orderId", "assessmentType");
CREATE INDEX "Entitlement_ownerEmail_idx" ON "Entitlement"("ownerEmail");
CREATE INDEX "Entitlement_assessmentId_idx" ON "Entitlement"("assessmentId");
CREATE INDEX "Entitlement_status_idx" ON "Entitlement"("status");
CREATE INDEX "Entitlement_expiresAt_idx" ON "Entitlement"("expiresAt");

CREATE TABLE "Subscriber" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "email" TEXT NOT NULL,
    "consentMarketing" BOOLEAN NOT NULL DEFAULT false,
    "consentSource" TEXT,
    "consentedAt" DATETIME,
    "unsubscribedAt" DATETIME
);

CREATE UNIQUE INDEX "Subscriber_email_key" ON "Subscriber"("email");
CREATE INDEX "Subscriber_consentMarketing_idx" ON "Subscriber"("consentMarketing");
CREATE INDEX "Subscriber_unsubscribedAt_idx" ON "Subscriber"("unsubscribedAt");

CREATE TABLE "EmailJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "subscriberId" TEXT,
    "orderId" TEXT,
    "toEmail" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "scheduledAt" DATETIME NOT NULL,
    "sentAt" DATETIME,
    "cancelledAt" DATETIME,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "payload" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    CONSTRAINT "EmailJob_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "Subscriber" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "EmailJob_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "EmailJob_idempotencyKey_key" ON "EmailJob"("idempotencyKey");
CREATE INDEX "EmailJob_status_scheduledAt_idx" ON "EmailJob"("status", "scheduledAt");
CREATE INDEX "EmailJob_toEmail_idx" ON "EmailJob"("toEmail");
CREATE INDEX "EmailJob_subscriberId_idx" ON "EmailJob"("subscriberId");
CREATE INDEX "EmailJob_orderId_idx" ON "EmailJob"("orderId");

CREATE TABLE "StripeEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "orderId" TEXT,
    "processedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StripeEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "StripeEvent_eventId_key" ON "StripeEvent"("eventId");
CREATE INDEX "StripeEvent_orderId_idx" ON "StripeEvent"("orderId");
CREATE INDEX "StripeEvent_processedAt_idx" ON "StripeEvent"("processedAt");
