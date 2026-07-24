import { beforeEach, describe, expect, it } from "vitest";

import { cleanupAssessmentRetention } from "@/lib/assessment-store";
import { db } from "@/lib/db";

async function createAssessment(input: {
  id: string;
  paymentStatus: "unpaid" | "paid" | "refunded";
  createdAt: Date;
  updatedAt?: Date;
}) {
  return db.assessment.create({
    data: {
      id: input.id,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt || input.createdAt,
      email: `${input.id}@example.invalid`,
      assessmentType: "ai",
      answers: {},
      score: 70,
      level: "En progression",
      reportLite: {},
      reportFull: {},
      paymentStatus: input.paymentStatus,
      accessToken: `token-${input.id}`
    }
  });
}

describe("assessment retention", () => {
  beforeEach(async () => {
    await db.stripeEvent.deleteMany();
    await db.emailJob.deleteMany();
    await db.entitlement.deleteMany();
    await db.order.deleteMany();
    await db.assessment.deleteMany();
    process.env.ASSESSMENT_RETENTION_UNPAID_DAYS = "30";
    process.env.ASSESSMENT_RETENTION_REFUNDED_DAYS = "30";
  });

  it("supprime les anciens diagnostics non payés, mais conserve tous les rapports payés", async () => {
    const oldDate = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);
    const paidAssessment = await createAssessment({
      id: "historical-paid",
      paymentStatus: "paid",
      createdAt: oldDate
    });
    await createAssessment({
      id: "old-unpaid",
      paymentStatus: "unpaid",
      createdAt: oldDate
    });

    const order = await db.order.create({
      data: {
        publicToken: "late-purchase-order-token",
        email: paidAssessment.email,
        productCode: "ai_kit",
        amountCents: 2900,
        status: "paid",
        assessmentId: paidAssessment.id,
        paidAt: new Date(),
        accessExpiresAt: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000)
      }
    });
    await db.entitlement.create({
      data: {
        orderId: order.id,
        assessmentId: paidAssessment.id,
        ownerEmail: paidAssessment.email,
        assessmentType: "ai",
        status: "consumed",
        accessToken: "late-purchase-entitlement-token",
        expiresAt: order.accessExpiresAt as Date,
        consumedAt: new Date()
      }
    });

    await cleanupAssessmentRetention();

    await expect(
      db.assessment.findUnique({ where: { id: paidAssessment.id } })
    ).resolves.toMatchObject({ paymentStatus: "paid" });
    await expect(
      db.assessment.findUnique({ where: { id: "old-unpaid" } })
    ).resolves.toBeNull();
    await expect(
      db.entitlement.findUnique({
        where: { accessToken: "late-purchase-entitlement-token" }
      })
    ).resolves.toMatchObject({ assessmentId: paidAssessment.id });
  });
});
