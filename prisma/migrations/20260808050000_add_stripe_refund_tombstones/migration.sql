-- Persist refunds independently of webhook delivery order without rewriting historical commerce rows.
BEGIN IMMEDIATE;

CREATE TABLE "StripeRefundTombstone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "paymentIntentId" TEXT NOT NULL,
    "orderId" TEXT,
    "firstEventId" TEXT NOT NULL,
    "refundedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StripeRefundTombstone_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "StripeRefundTombstone_paymentIntentId_key" ON "StripeRefundTombstone"("paymentIntentId");
CREATE INDEX "StripeRefundTombstone_orderId_idx" ON "StripeRefundTombstone"("orderId");
CREATE INDEX "StripeRefundTombstone_refundedAt_idx" ON "StripeRefundTombstone"("refundedAt");

COMMIT;
