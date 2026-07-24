import { readFileSync } from "node:fs";
import path from "node:path";

// @ts-expect-error better-sqlite3 does not bundle its declarations.
import Database from "better-sqlite3";
import type Stripe from "stripe";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  cancelCheckoutSession,
  claimEntitlement,
  createPendingOrder,
  findOrderByPublicToken,
  findUpgradeOpportunity,
  fulfillCheckoutSession,
  hasActiveAssessmentAccess,
  refundOrderByPaymentIntent
} from "@/lib/commerce";
import { db } from "@/lib/db";

function migrationSql(name: string) {
  return readFileSync(
    path.resolve("prisma", "migrations", name, "migration.sql"),
    "utf8"
  );
}

async function createAssessment(input?: {
  assessmentType?: string;
  email?: string;
}) {
  return db.assessment.create({
    data: {
      email: input?.email || "owner@example.invalid",
      contactName: "Alex Tremblay",
      companyName: "PME Exemple",
      assessmentType: input?.assessmentType || "loi25",
      answers: {},
      score: 62,
      level: "En progression",
      reportLite: {},
      reportFull: {},
      accessToken: `assessment-${crypto.randomUUID()}`,
      consentMarketing: false
    }
  });
}

function paidSession(input: {
  orderId: string;
  assessmentId: string;
  assessmentType: string;
  productCode: string;
  email: string;
  paymentIntent: string;
}) {
  return {
    id: `cs_${crypto.randomUUID()}`,
    client_reference_id: input.orderId,
    customer_email: input.email,
    customer_details: {
      email: input.email
    },
    metadata: {
      orderId: input.orderId,
      assessmentId: input.assessmentId,
      assessmentType: input.assessmentType,
      productCode: input.productCode
    },
    payment_intent: input.paymentIntent,
    payment_status: "paid",
    status: "complete"
  } as unknown as Stripe.Checkout.Session;
}

describe("commerce fulfillment", () => {
  beforeAll(() => {
    const database = new Database(path.resolve("prisma", "test.db"));

    try {
      const hasCommerceTables = database
        .prepare(
          "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'Order'"
        )
        .get();

      if (!hasCommerceTables) {
        database.exec(migrationSql("20260314000000_add_low_ticket_assessment"));
        database.exec(migrationSql("20260419000000_add_attribution_tracking"));
        database.exec(migrationSql("20260619000000_add_assessment_type"));
        database.exec(
          migrationSql("20260714000000_optional_assessment_profile")
        );
        database.exec(migrationSql("20260723000000_add_low_ticket_commerce"));
      }
    } finally {
      database.close();
    }
  });

  beforeEach(async () => {
    await db.stripeEvent.deleteMany();
    await db.emailJob.deleteMany();
    await db.entitlement.deleteMany();
    await db.order.deleteMany();
    await db.subscriber.deleteMany();
    await db.assessment.deleteMany();
  });

  it("activates an individual kit once and revokes it once on refund", async () => {
    const assessment = await createAssessment();
    const order = await createPendingOrder({
      assessment,
      productCode: "loi25_kit"
    });
    const session = paidSession({
      orderId: order.id,
      assessmentId: assessment.id,
      assessmentType: "loi25",
      productCode: "loi25_kit",
      email: assessment.email,
      paymentIntent: "pi_individual"
    });

    const first = await fulfillCheckoutSession({
      eventId: "evt_checkout_individual",
      eventType: "checkout.session.completed",
      session
    });
    const duplicate = await fulfillCheckoutSession({
      eventId: "evt_checkout_individual",
      eventType: "checkout.session.completed",
      session
    });

    expect(first.duplicate).toBe(false);
    expect(duplicate.duplicate).toBe(true);
    expect(
      await db.entitlement.findFirst({ where: { orderId: order.id } })
    ).toMatchObject({ status: "consumed" });
    expect(
      await db.assessment.findUnique({ where: { id: assessment.id } })
    ).toMatchObject({ paymentStatus: "paid" });
    expect(
      await hasActiveAssessmentAccess(
        await db.assessment.findUniqueOrThrow({ where: { id: assessment.id } })
      )
    ).toBe(true);
    await db.entitlement.updateMany({
      where: { orderId: order.id },
      data: { expiresAt: new Date(Date.now() - 1_000) }
    });
    expect(
      await hasActiveAssessmentAccess(
        await db.assessment.findUniqueOrThrow({ where: { id: assessment.id } })
      )
    ).toBe(false);

    const refund = await refundOrderByPaymentIntent({
      eventId: "evt_refund_individual",
      eventType: "charge.refunded",
      paymentIntentId: "pi_individual"
    });
    const duplicateRefund = await refundOrderByPaymentIntent({
      eventId: "evt_refund_individual",
      eventType: "charge.refunded",
      paymentIntentId: "pi_individual"
    });

    expect(refund.duplicate).toBe(false);
    expect(duplicateRefund.duplicate).toBe(true);
    expect(
      await db.entitlement.findFirst({ where: { orderId: order.id } })
    ).toMatchObject({ status: "revoked" });
    expect(
      await hasActiveAssessmentAccess(
        await db.assessment.findUniqueOrThrow({ where: { id: assessment.id } })
      )
    ).toBe(false);
  });

  it("creates three trio rights and only the two missing rights on upgrade", async () => {
    const trioAssessment = await createAssessment({
      assessmentType: "ai",
      email: "trio@example.invalid"
    });
    const trioOrder = await createPendingOrder({
      assessment: trioAssessment,
      productCode: "digital_hygiene_trio"
    });
    await fulfillCheckoutSession({
      eventId: "evt_checkout_trio",
      eventType: "checkout.session.completed",
      session: paidSession({
        orderId: trioOrder.id,
        assessmentId: trioAssessment.id,
        assessmentType: "ai",
        productCode: "digital_hygiene_trio",
        email: trioAssessment.email,
        paymentIntent: "pi_trio"
      })
    });

    expect(
      await db.entitlement.findMany({
        where: { orderId: trioOrder.id },
        orderBy: { assessmentType: "asc" },
        select: { assessmentType: true, status: true }
      })
    ).toEqual([
      { assessmentType: "ai", status: "consumed" },
      { assessmentType: "cybersecurity", status: "active" },
      { assessmentType: "loi25", status: "active" }
    ]);

    const individualAssessment = await createAssessment({
      assessmentType: "cybersecurity",
      email: "upgrade@example.invalid"
    });
    const individualOrder = await createPendingOrder({
      assessment: individualAssessment,
      productCode: "cyber_kit"
    });
    await fulfillCheckoutSession({
      eventId: "evt_checkout_upgrade_source",
      eventType: "checkout.session.completed",
      session: paidSession({
        orderId: individualOrder.id,
        assessmentId: individualAssessment.id,
        assessmentType: "cybersecurity",
        productCode: "cyber_kit",
        email: individualAssessment.email,
        paymentIntent: "pi_upgrade_source"
      })
    });
    expect(await findUpgradeOpportunity(individualAssessment)).toMatchObject({
      id: individualOrder.id
    });

    const upgradeOrder = await createPendingOrder({
      assessment: individualAssessment,
      productCode: "trio_upgrade"
    });
    await fulfillCheckoutSession({
      eventId: "evt_checkout_upgrade",
      eventType: "checkout.session.completed",
      session: paidSession({
        orderId: upgradeOrder.id,
        assessmentId: individualAssessment.id,
        assessmentType: "cybersecurity",
        productCode: "trio_upgrade",
        email: individualAssessment.email,
        paymentIntent: "pi_upgrade"
      })
    });
    expect(await findUpgradeOpportunity(individualAssessment)).toBeNull();

    expect(
      await db.entitlement.findMany({
        where: { orderId: upgradeOrder.id },
        orderBy: { assessmentType: "asc" },
        select: { assessmentType: true }
      })
    ).toEqual([{ assessmentType: "ai" }, { assessmentType: "loi25" }]);

    await refundOrderByPaymentIntent({
      eventId: "evt_refund_upgrade",
      eventType: "charge.refunded",
      paymentIntentId: "pi_upgrade"
    });

    expect(
      await db.order.findUnique({ where: { id: individualOrder.id } })
    ).toMatchObject({ status: "paid" });
    expect(
      await db.order.findUnique({ where: { id: upgradeOrder.id } })
    ).toMatchObject({ status: "refunded" });
    expect(
      await db.assessment.findUnique({
        where: { id: individualAssessment.id }
      })
    ).toMatchObject({ paymentStatus: "paid" });
    expect(
      await db.entitlement.findMany({
        where: { orderId: upgradeOrder.id },
        select: { status: true }
      })
    ).toEqual([{ status: "revoked" }, { status: "revoked" }]);
  });

  it("schedules an actionable Trio offer only after explicit consent", async () => {
    const assessment = await createAssessment({
      assessmentType: "ai",
      email: "consenting@example.invalid"
    });
    const consentingAssessment = await db.assessment.update({
      where: { id: assessment.id },
      data: { consentMarketing: true }
    });
    const order = await createPendingOrder({
      assessment: consentingAssessment,
      productCode: "ai_kit"
    });

    await fulfillCheckoutSession({
      eventId: "evt_checkout_consenting",
      eventType: "checkout.session.completed",
      session: paidSession({
        orderId: order.id,
        assessmentId: assessment.id,
        assessmentType: "ai",
        productCode: "ai_kit",
        email: assessment.email,
        paymentIntent: "pi_consenting"
      })
    });

    expect(
      await db.emailJob.findUnique({
        where: { idempotencyKey: `${order.id}:trio_upgrade` }
      })
    ).toMatchObject({
      status: "scheduled",
      kind: "trio_upgrade",
      payload: {
        diagnostic: "ai",
        productCode: "ai_kit",
        dashboardUrl: expect.stringMatching(/^\/trio\/[a-f0-9]{64}$/)
      }
    });
  });

  it("never revives an address that already unsubscribed", async () => {
    const unsubscribedAt = new Date("2026-07-01T12:00:00.000Z");
    const assessment = await createAssessment({
      email: "unsubscribed@example.invalid"
    });
    const consentingAssessment = await db.assessment.update({
      where: { id: assessment.id },
      data: { consentMarketing: true }
    });
    await db.subscriber.create({
      data: {
        email: assessment.email,
        consentMarketing: false,
        consentSource: "diagnostic",
        consentedAt: new Date("2026-06-01T12:00:00.000Z"),
        unsubscribedAt
      }
    });
    const order = await createPendingOrder({
      assessment: consentingAssessment,
      productCode: "loi25_kit"
    });

    await fulfillCheckoutSession({
      eventId: "evt_checkout_unsubscribed",
      eventType: "checkout.session.completed",
      session: paidSession({
        orderId: order.id,
        assessmentId: assessment.id,
        assessmentType: "loi25",
        productCode: "loi25_kit",
        email: assessment.email,
        paymentIntent: "pi_unsubscribed"
      })
    });

    expect(
      await db.subscriber.findUnique({ where: { email: assessment.email } })
    ).toMatchObject({
      consentMarketing: false,
      unsubscribedAt
    });
    expect(await db.emailJob.count({ where: { orderId: order.id } })).toBe(0);
  });

  it("cancels an expired checkout and lets the owner claim a right only once", async () => {
    const canceledAssessment = await createAssessment({
      email: "cancel@example.invalid"
    });
    const canceledOrder = await createPendingOrder({
      assessment: canceledAssessment,
      productCode: "loi25_kit"
    });
    const canceledSession = paidSession({
      orderId: canceledOrder.id,
      assessmentId: canceledAssessment.id,
      assessmentType: "loi25",
      productCode: "loi25_kit",
      email: canceledAssessment.email,
      paymentIntent: "pi_canceled"
    });
    const pendingResult = await fulfillCheckoutSession({
      eventId: "evt_checkout_pending",
      eventType: "checkout.session.completed",
      session: {
        ...canceledSession,
        payment_status: "unpaid"
      } as Stripe.Checkout.Session
    });

    expect(pendingResult.order).toMatchObject({ status: "pending" });
    expect(
      await db.entitlement.count({ where: { orderId: canceledOrder.id } })
    ).toBe(0);

    const cancelResult = await cancelCheckoutSession({
      eventId: "evt_checkout_expired",
      eventType: "checkout.session.expired",
      session: canceledSession
    });

    expect(cancelResult.order).toMatchObject({ status: "canceled" });
    expect(
      await db.entitlement.count({ where: { orderId: canceledOrder.id } })
    ).toBe(0);

    const assessment = await createAssessment({
      assessmentType: "ai",
      email: "owner-claim@example.invalid"
    });
    const order = await createPendingOrder({
      assessment,
      productCode: "digital_hygiene_trio"
    });
    await fulfillCheckoutSession({
      eventId: "evt_claim_trio",
      eventType: "checkout.session.completed",
      session: paidSession({
        orderId: order.id,
        assessmentId: assessment.id,
        assessmentType: "ai",
        productCode: "digital_hygiene_trio",
        email: assessment.email,
        paymentIntent: "pi_claim_trio"
      })
    });
    const right = await db.entitlement.findFirstOrThrow({
      where: {
        orderId: order.id,
        assessmentType: "loi25"
      }
    });
    const nextAssessment = await createAssessment({
      assessmentType: "loi25",
      email: assessment.email
    });

    expect(
      await claimEntitlement({
        accessToken: right.accessToken,
        ownerEmail: "someone-else@example.invalid",
        assessmentId: nextAssessment.id,
        assessmentType: "loi25"
      })
    ).toBeNull();
    expect(
      await claimEntitlement({
        accessToken: right.accessToken,
        ownerEmail: assessment.email,
        assessmentId: nextAssessment.id,
        assessmentType: "cybersecurity"
      })
    ).toBeNull();
    expect(
      await claimEntitlement({
        accessToken: right.accessToken,
        ownerEmail: assessment.email,
        assessmentId: nextAssessment.id,
        assessmentType: "loi25"
      })
    ).toMatchObject({
      status: "consumed",
      assessmentId: nextAssessment.id
    });
    expect(
      await claimEntitlement({
        accessToken: right.accessToken,
        ownerEmail: assessment.email,
        assessmentId: nextAssessment.id,
        assessmentType: "loi25"
      })
    ).toBeNull();

    const expiredRight = await db.entitlement.findFirstOrThrow({
      where: {
        orderId: order.id,
        assessmentType: "cybersecurity"
      }
    });
    await db.entitlement.update({
      where: { id: expiredRight.id },
      data: { expiresAt: new Date(Date.now() - 1_000) }
    });
    const cyberAssessment = await createAssessment({
      assessmentType: "cybersecurity",
      email: assessment.email
    });
    expect(
      await claimEntitlement({
        accessToken: expiredRight.accessToken,
        ownerEmail: assessment.email,
        assessmentId: cyberAssessment.id,
        assessmentType: "cybersecurity"
      })
    ).toBeNull();
  });

  it("does not reopen a consumed right when Stripe sends another event for the same payment", async () => {
    const assessment = await createAssessment({
      assessmentType: "ai",
      email: "multi-event@example.invalid"
    });
    const order = await createPendingOrder({
      assessment,
      productCode: "digital_hygiene_trio"
    });
    const session = paidSession({
      orderId: order.id,
      assessmentId: assessment.id,
      assessmentType: "ai",
      productCode: "digital_hygiene_trio",
      email: assessment.email,
      paymentIntent: "pi_multi_event"
    });
    await fulfillCheckoutSession({
      eventId: "evt_multi_event_first",
      eventType: "checkout.session.completed",
      session
    });
    const availableRight = await db.entitlement.findFirstOrThrow({
      where: { orderId: order.id, assessmentType: "loi25" }
    });
    const nextAssessment = await createAssessment({
      assessmentType: "loi25",
      email: assessment.email
    });
    await claimEntitlement({
      accessToken: availableRight.accessToken,
      ownerEmail: assessment.email,
      assessmentId: nextAssessment.id,
      assessmentType: "loi25"
    });

    await fulfillCheckoutSession({
      eventId: "evt_multi_event_second",
      eventType: "checkout.session.async_payment_succeeded",
      session
    });

    expect(
      await db.entitlement.findUnique({
        where: { accessToken: availableRight.accessToken }
      })
    ).toMatchObject({
      status: "consumed",
      assessmentId: nextAssessment.id
    });
    expect(await db.entitlement.count({ where: { orderId: order.id } })).toBe(
      3
    );
  });

  it("rolls back fulfillment when the Stripe buyer email does not match the order", async () => {
    const assessment = await createAssessment({
      email: "expected-owner@example.invalid"
    });
    const order = await createPendingOrder({
      assessment,
      productCode: "loi25_kit"
    });

    await expect(
      fulfillCheckoutSession({
        eventId: "evt_wrong_buyer",
        eventType: "checkout.session.completed",
        session: paidSession({
          orderId: order.id,
          assessmentId: assessment.id,
          assessmentType: "loi25",
          productCode: "loi25_kit",
          email: "other-buyer@example.invalid",
          paymentIntent: "pi_wrong_buyer"
        })
      })
    ).rejects.toThrow("CHECKOUT_EMAIL_MISMATCH");

    expect(
      await db.order.findUnique({ where: { id: order.id } })
    ).toMatchObject({ status: "pending", stripePaymentIntent: null });
    expect(await db.entitlement.count({ where: { orderId: order.id } })).toBe(
      0
    );
    expect(
      await db.stripeEvent.count({ where: { eventId: "evt_wrong_buyer" } })
    ).toBe(0);
  });

  it("revokes every consumed Trio report when the Trio is refunded", async () => {
    const originalAssessment = await createAssessment({
      assessmentType: "ai",
      email: "refunded-trio@example.invalid"
    });
    const order = await createPendingOrder({
      assessment: originalAssessment,
      productCode: "digital_hygiene_trio"
    });
    await fulfillCheckoutSession({
      eventId: "evt_refunded_trio_checkout",
      eventType: "checkout.session.completed",
      session: paidSession({
        orderId: order.id,
        assessmentId: originalAssessment.id,
        assessmentType: "ai",
        productCode: "digital_hygiene_trio",
        email: originalAssessment.email,
        paymentIntent: "pi_refunded_trio"
      })
    });

    const additionalAssessments = [];
    for (const assessmentType of ["loi25", "cybersecurity"] as const) {
      const entitlement = await db.entitlement.findFirstOrThrow({
        where: { orderId: order.id, assessmentType }
      });
      const assessment = await createAssessment({
        assessmentType,
        email: originalAssessment.email
      });
      additionalAssessments.push(assessment);
      await claimEntitlement({
        accessToken: entitlement.accessToken,
        ownerEmail: originalAssessment.email,
        assessmentId: assessment.id,
        assessmentType
      });
    }

    await refundOrderByPaymentIntent({
      eventId: "evt_refunded_trio_refund",
      eventType: "charge.refunded",
      paymentIntentId: "pi_refunded_trio"
    });

    expect(
      await db.assessment.findMany({
        where: {
          id: {
            in: [
              originalAssessment.id,
              ...additionalAssessments.map((assessment) => assessment.id)
            ]
          }
        },
        select: { paymentStatus: true }
      })
    ).toEqual([
      { paymentStatus: "refunded" },
      { paymentStatus: "refunded" },
      { paymentStatus: "refunded" }
    ]);
    expect(
      await db.entitlement.findMany({
        where: { orderId: order.id },
        select: { status: true }
      })
    ).toEqual([
      { status: "revoked" },
      { status: "revoked" },
      { status: "revoked" }
    ]);
  });

  it("preserves a historical paid report through a later Trio purchase and refund", async () => {
    const historicalAssessment = await createAssessment({
      assessmentType: "loi25",
      email: "historical-owner@example.invalid"
    });
    await db.assessment.update({
      where: { id: historicalAssessment.id },
      data: {
        paymentStatus: "paid",
        stripeSessionId: "cs_legacy_paid",
        stripePaymentIntent: "pi_legacy_paid"
      }
    });
    const refreshedHistoricalAssessment = await db.assessment.findUniqueOrThrow(
      {
        where: { id: historicalAssessment.id }
      }
    );
    const trioOrder = await createPendingOrder({
      assessment: refreshedHistoricalAssessment,
      productCode: "digital_hygiene_trio"
    });
    await fulfillCheckoutSession({
      eventId: "evt_historical_trio",
      eventType: "checkout.session.completed",
      session: paidSession({
        orderId: trioOrder.id,
        assessmentId: historicalAssessment.id,
        assessmentType: "loi25",
        productCode: "digital_hygiene_trio",
        email: historicalAssessment.email,
        paymentIntent: "pi_new_trio"
      })
    });

    expect(
      await db.assessment.findUnique({
        where: { id: historicalAssessment.id }
      })
    ).toMatchObject({
      paymentStatus: "paid",
      stripeSessionId: "cs_legacy_paid",
      stripePaymentIntent: "pi_legacy_paid"
    });
    expect(
      await db.entitlement.findFirst({
        where: {
          orderId: trioOrder.id,
          assessmentType: "loi25"
        }
      })
    ).toMatchObject({ ownsAssessmentAccess: false });

    const historicalTrioRight = await db.entitlement.findFirstOrThrow({
      where: {
        orderId: trioOrder.id,
        assessmentType: "cybersecurity"
      }
    });
    const claimedFromHistoricalTrio = await createAssessment({
      assessmentType: "cybersecurity",
      email: historicalAssessment.email
    });
    await claimEntitlement({
      accessToken: historicalTrioRight.accessToken,
      ownerEmail: historicalAssessment.email,
      assessmentId: claimedFromHistoricalTrio.id,
      assessmentType: "cybersecurity"
    });

    await refundOrderByPaymentIntent({
      eventId: "evt_historical_trio_refund",
      eventType: "charge.refunded",
      paymentIntentId: "pi_new_trio"
    });

    expect(
      await db.assessment.findUnique({
        where: { id: historicalAssessment.id }
      })
    ).toMatchObject({
      paymentStatus: "paid",
      stripeSessionId: "cs_legacy_paid",
      stripePaymentIntent: "pi_legacy_paid"
    });
    expect(
      await hasActiveAssessmentAccess(
        await db.assessment.findUniqueOrThrow({
          where: { id: historicalAssessment.id }
        })
      )
    ).toBe(true);
    expect(
      await db.assessment.findUnique({
        where: { id: claimedFromHistoricalTrio.id }
      })
    ).toMatchObject({ paymentStatus: "refunded" });
    expect(
      await db.entitlement.findMany({
        where: { orderId: trioOrder.id },
        select: { status: true }
      })
    ).toEqual([
      { status: "revoked" },
      { status: "revoked" },
      { status: "revoked" }
    ]);
  });

  it("exposes a dashboard only for a paid token and only for its explicit source-upgrade chain", async () => {
    const pendingAssessment = await createAssessment({
      email: "dashboard-state@example.invalid"
    });
    const pendingOrder = await createPendingOrder({
      assessment: pendingAssessment,
      productCode: "loi25_kit"
    });
    expect(await findOrderByPublicToken(pendingOrder.publicToken)).toBeNull();

    await db.order.update({
      where: { id: pendingOrder.id },
      data: { status: "canceled" }
    });
    expect(await findOrderByPublicToken(pendingOrder.publicToken)).toBeNull();

    await db.order.update({
      where: { id: pendingOrder.id },
      data: { status: "refunded" }
    });
    expect(await findOrderByPublicToken(pendingOrder.publicToken)).toBeNull();

    const sharedEmail = "dashboard-chain@example.invalid";
    const sourceAssessment = await createAssessment({
      assessmentType: "cybersecurity",
      email: sharedEmail
    });
    const sourceOrder = await createPendingOrder({
      assessment: sourceAssessment,
      productCode: "cyber_kit"
    });
    await fulfillCheckoutSession({
      eventId: "evt_dashboard_source",
      eventType: "checkout.session.completed",
      session: paidSession({
        orderId: sourceOrder.id,
        assessmentId: sourceAssessment.id,
        assessmentType: "cybersecurity",
        productCode: "cyber_kit",
        email: sharedEmail,
        paymentIntent: "pi_dashboard_source"
      })
    });
    const upgradeOrder = await createPendingOrder({
      assessment: sourceAssessment,
      productCode: "trio_upgrade"
    });
    await fulfillCheckoutSession({
      eventId: "evt_dashboard_upgrade",
      eventType: "checkout.session.completed",
      session: paidSession({
        orderId: upgradeOrder.id,
        assessmentId: sourceAssessment.id,
        assessmentType: "cybersecurity",
        productCode: "trio_upgrade",
        email: sharedEmail,
        paymentIntent: "pi_dashboard_upgrade"
      })
    });

    const independentAssessment = await createAssessment({
      assessmentType: "ai",
      email: sharedEmail
    });
    const independentOrder = await createPendingOrder({
      assessment: independentAssessment,
      productCode: "ai_kit"
    });
    await fulfillCheckoutSession({
      eventId: "evt_dashboard_independent",
      eventType: "checkout.session.completed",
      session: paidSession({
        orderId: independentOrder.id,
        assessmentId: independentAssessment.id,
        assessmentType: "ai",
        productCode: "ai_kit",
        email: sharedEmail,
        paymentIntent: "pi_dashboard_independent"
      })
    });

    const sourceChain = await findOrderByPublicToken(sourceOrder.publicToken);
    const upgradeChain = await findOrderByPublicToken(upgradeOrder.publicToken);
    const independentChain = await findOrderByPublicToken(
      independentOrder.publicToken
    );

    expect(sourceChain?.map((order) => order.id)).toEqual([
      sourceOrder.id,
      upgradeOrder.id
    ]);
    expect(upgradeChain?.map((order) => order.id)).toEqual([
      sourceOrder.id,
      upgradeOrder.id
    ]);
    expect(independentChain?.map((order) => order.id)).toEqual([
      independentOrder.id
    ]);
  });

  it("reuses an identical pending order and blocks another bundle after a paid Trio or upgrade", async () => {
    const trioAssessment = await createAssessment({
      assessmentType: "ai",
      email: "pending-trio@example.invalid"
    });
    const firstPendingTrio = await createPendingOrder({
      assessment: trioAssessment,
      productCode: "digital_hygiene_trio"
    });
    const reusedPendingTrio = await createPendingOrder({
      assessment: trioAssessment,
      productCode: "digital_hygiene_trio"
    });
    expect(reusedPendingTrio.id).toBe(firstPendingTrio.id);
    const competingAssessment = await createAssessment({
      assessmentType: "cybersecurity",
      email: trioAssessment.email
    });
    await expect(
      createPendingOrder({
        assessment: competingAssessment,
        productCode: "digital_hygiene_trio"
      })
    ).rejects.toThrow("BUNDLE_CHECKOUT_IN_PROGRESS");
    expect(
      await db.order.count({
        where: {
          assessmentId: trioAssessment.id,
          productCode: "digital_hygiene_trio"
        }
      })
    ).toBe(1);

    await fulfillCheckoutSession({
      eventId: "evt_single_paid_trio",
      eventType: "checkout.session.completed",
      session: paidSession({
        orderId: firstPendingTrio.id,
        assessmentId: trioAssessment.id,
        assessmentType: "ai",
        productCode: "digital_hygiene_trio",
        email: trioAssessment.email,
        paymentIntent: "pi_single_paid_trio"
      })
    });
    await expect(
      createPendingOrder({
        assessment: trioAssessment,
        productCode: "digital_hygiene_trio"
      })
    ).rejects.toThrow("BUNDLE_ALREADY_PURCHASED");
    await expect(
      createPendingOrder({
        assessment: trioAssessment,
        productCode: "trio_upgrade"
      })
    ).rejects.toThrow("BUNDLE_ALREADY_PURCHASED");

    const sourceAssessment = await createAssessment({
      assessmentType: "loi25",
      email: "pending-upgrade@example.invalid"
    });
    const sourceOrder = await createPendingOrder({
      assessment: sourceAssessment,
      productCode: "loi25_kit"
    });
    await fulfillCheckoutSession({
      eventId: "evt_pending_upgrade_source",
      eventType: "checkout.session.completed",
      session: paidSession({
        orderId: sourceOrder.id,
        assessmentId: sourceAssessment.id,
        assessmentType: "loi25",
        productCode: "loi25_kit",
        email: sourceAssessment.email,
        paymentIntent: "pi_pending_upgrade_source"
      })
    });
    const firstPendingUpgrade = await createPendingOrder({
      assessment: sourceAssessment,
      productCode: "trio_upgrade"
    });
    const reusedPendingUpgrade = await createPendingOrder({
      assessment: sourceAssessment,
      productCode: "trio_upgrade"
    });
    expect(reusedPendingUpgrade.id).toBe(firstPendingUpgrade.id);

    await fulfillCheckoutSession({
      eventId: "evt_single_paid_upgrade",
      eventType: "checkout.session.completed",
      session: paidSession({
        orderId: firstPendingUpgrade.id,
        assessmentId: sourceAssessment.id,
        assessmentType: "loi25",
        productCode: "trio_upgrade",
        email: sourceAssessment.email,
        paymentIntent: "pi_single_paid_upgrade"
      })
    });
    await expect(
      createPendingOrder({
        assessment: sourceAssessment,
        productCode: "trio_upgrade"
      })
    ).rejects.toThrow("BUNDLE_ALREADY_PURCHASED");
  });

  it("keeps a paid 30 CAD upgrade and its two rights active when the source kit is refunded", async () => {
    const assessment = await createAssessment({
      assessmentType: "cybersecurity",
      email: "source-refund@example.invalid"
    });
    const sourceOrder = await createPendingOrder({
      assessment,
      productCode: "cyber_kit"
    });
    await fulfillCheckoutSession({
      eventId: "evt_source_refund_source",
      eventType: "checkout.session.completed",
      session: paidSession({
        orderId: sourceOrder.id,
        assessmentId: assessment.id,
        assessmentType: "cybersecurity",
        productCode: "cyber_kit",
        email: assessment.email,
        paymentIntent: "pi_source_refund_source"
      })
    });
    const upgradeOrder = await createPendingOrder({
      assessment,
      productCode: "trio_upgrade"
    });
    await fulfillCheckoutSession({
      eventId: "evt_source_refund_upgrade",
      eventType: "checkout.session.completed",
      session: paidSession({
        orderId: upgradeOrder.id,
        assessmentId: assessment.id,
        assessmentType: "cybersecurity",
        productCode: "trio_upgrade",
        email: assessment.email,
        paymentIntent: "pi_source_refund_upgrade"
      })
    });

    await refundOrderByPaymentIntent({
      eventId: "evt_source_refund",
      eventType: "charge.refunded",
      paymentIntentId: "pi_source_refund_source"
    });

    expect(
      await db.order.findUnique({ where: { id: sourceOrder.id } })
    ).toMatchObject({ status: "refunded" });
    expect(
      await db.order.findUnique({ where: { id: upgradeOrder.id } })
    ).toMatchObject({
      status: "paid",
      amountCents: 3000,
      upgradeFromOrderId: sourceOrder.id
    });
    expect(
      await db.entitlement.findMany({
        where: { orderId: upgradeOrder.id },
        orderBy: { assessmentType: "asc" },
        select: { assessmentType: true, status: true, revokedAt: true }
      })
    ).toEqual([
      { assessmentType: "ai", status: "active", revokedAt: null },
      { assessmentType: "loi25", status: "active", revokedAt: null }
    ]);
    expect(await findOrderByPublicToken(upgradeOrder.publicToken)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: sourceOrder.id, status: "refunded" }),
        expect.objectContaining({ id: upgradeOrder.id, status: "paid" })
      ])
    );
  });

  it.each([
    ["loi25", "loi25_kit"],
    ["cybersecurity", "cyber_kit"],
    ["ai", "ai_kit"]
  ] as const)(
    "fulfills the %s individual kit with exactly one owner-bound consumed right",
    async (assessmentType, productCode) => {
      const assessment = await createAssessment({
        assessmentType,
        email: `${assessmentType}@individual.example.invalid`
      });
      const order = await createPendingOrder({
        assessment,
        productCode
      });
      await fulfillCheckoutSession({
        eventId: `evt_individual_${assessmentType}`,
        eventType: "checkout.session.completed",
        session: paidSession({
          orderId: order.id,
          assessmentId: assessment.id,
          assessmentType,
          productCode,
          email: assessment.email,
          paymentIntent: `pi_individual_${assessmentType}`
        })
      });

      expect(
        await db.entitlement.findMany({
          where: { orderId: order.id },
          select: {
            assessmentType: true,
            ownerEmail: true,
            status: true,
            assessmentId: true,
            ownsAssessmentAccess: true
          }
        })
      ).toEqual([
        {
          assessmentType,
          ownerEmail: assessment.email,
          status: "consumed",
          assessmentId: assessment.id,
          ownsAssessmentAccess: true
        }
      ]);
    }
  );
});
