import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  constructEventMock,
  sendCourseAccessEmailMock,
  sendReportUnlockedEmailsMock
} = vi.hoisted(() => ({
  constructEventMock: vi.fn(),
  sendCourseAccessEmailMock: vi.fn().mockResolvedValue(undefined),
  sendReportUnlockedEmailsMock: vi.fn().mockResolvedValue(undefined)
}));

vi.mock("@/lib/stripe", () => ({
  getStripeClient: () => ({
    webhooks: { constructEvent: constructEventMock }
  })
}));

vi.mock("@/lib/email", () => ({
  sendCourseAccessEmail: sendCourseAccessEmailMock,
  sendReportUnlockedEmails: sendReportUnlockedEmailsMock
}));

// The test exercises commerce persistence. The report-email branch is kept
// out of scope so no diagnostic rendering or external communication occurs.
vi.mock("@/lib/assessment-store", () => ({
  findAssessmentById: vi.fn().mockResolvedValue(null),
  hydrateAssessment: vi.fn(),
  markAssessmentPaid: vi.fn(),
  markAssessmentRefundedByPaymentIntent: vi.fn()
}));

import { POST as stripeWebhook } from "@/app/api/stripe/webhook/route";
import { db } from "@/lib/db";

async function clearCommerceData() {
  await db.adminAuditLog.deleteMany();
  await db.lessonProgress.deleteMany();
  await db.quizAttempt.deleteMany();
  await db.certificate.deleteMany();
  await db.enrollment.deleteMany();
  await db.entitlement.deleteMany();
  await db.stripeRefundTombstone.deleteMany();
  await db.stripeEvent.deleteMany();
  await db.emailJob.deleteMany();
  await db.order.deleteMany();
  await db.quizChoice.deleteMany();
  await db.quizQuestion.deleteMany();
  await db.quiz.deleteMany();
  await db.courseResource.deleteMany();
  await db.lesson.deleteMany();
  await db.courseModule.deleteMany();
  await db.course.deleteMany();
  await db.session.deleteMany();
  await db.account.deleteMany();
  await db.user.deleteMany();
  await db.subscriber.deleteMany();
  await db.assessment.deleteMany();
}

async function createUser() {
  return db.user.create({
    data: {
      name: "Apprenant Webhook",
      email: `webhook-${crypto.randomUUID()}@example.invalid`,
      emailVerified: new Date(),
      isActive: true
    }
  });
}

async function createCourse() {
  return db.course.create({
    data: {
      slug: `excel-webhook-${crypto.randomUUID()}`,
      title: "Excel essentiel",
      shortTitle: "Excel",
      description: "Formation de validation du webhook.",
      theme: "excel",
      level: "beginner",
      offer: "paid",
      priceCents: 4_900,
      currency: "cad",
      durationMinutes: 180,
      durationLabel: "3 h",
      format: "self-paced",
      audience: "PME",
      outcomes: [],
      prerequisites: [],
      status: "published",
      isPurchasable: true,
      publishedAt: new Date()
    }
  });
}

async function createAssessment(email: string) {
  return db.assessment.create({
    data: {
      email,
      contactName: "Alex Diagnostic",
      companyName: "PME Webhook",
      assessmentType: "loi25",
      answers: {},
      score: 70,
      level: "En progression",
      reportLite: {},
      reportFull: {},
      accessToken: `webhook-assessment-${crypto.randomUUID()}`,
      paymentStatus: "unpaid"
    }
  });
}

function checkoutEvent(input: {
  eventId: string;
  sessionId: string;
  orderId: string;
  email: string;
  amountCents: number;
  paymentIntent: string;
  metadata: Record<string, string>;
}) {
  return {
    id: input.eventId,
    type: "checkout.session.completed",
    data: {
      object: {
        id: input.sessionId,
        client_reference_id: input.orderId,
        customer_email: input.email,
        customer_details: { email: input.email },
        amount_total: input.amountCents,
        currency: "cad",
        payment_intent: input.paymentIntent,
        payment_status: "paid",
        status: "complete",
        metadata: input.metadata
      }
    }
  };
}

function refundEvent(input: {
  eventId: string;
  paymentIntent: string;
  metadata?: Record<string, string>;
}) {
  return {
    id: input.eventId,
    type: "charge.refunded",
    data: {
      object: {
        id: `ch_${crypto.randomUUID()}`,
        payment_intent: input.paymentIntent,
        metadata: input.metadata ?? {}
      }
    }
  };
}

async function postEvent(event: object) {
  constructEventMock.mockReturnValueOnce(event);
  return stripeWebhook(
    new Request("http://localhost:3010/api/stripe/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": "signature_test"
      },
      body: JSON.stringify({ opaque: true })
    })
  );
}

beforeEach(async () => {
  await clearCommerceData();
  constructEventMock.mockReset();
  sendCourseAccessEmailMock.mockClear();
  sendReportUnlockedEmailsMock.mockClear();
  process.env.DISABLE_EXTERNAL_SERVICES = "0";
  process.env.STRIPE_SECRET_KEY = "sk_test_mock";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_mock";
});

describe("Stripe webhook routing from Order.kind", () => {
  it("traite un cours sans metadata.orderKind et reste idempotent", async () => {
    const [user, course] = await Promise.all([createUser(), createCourse()]);
    const sessionId = `cs_course_${crypto.randomUUID()}`;
    const order = await db.order.create({
      data: {
        publicToken: crypto.randomUUID(),
        email: user.email!,
        productCode: `course:${course.slug}`,
        amountCents: course.priceCents!,
        currency: course.currency,
        status: "pending",
        kind: "course",
        userId: user.id,
        courseId: course.id,
        stripeSessionId: sessionId
      }
    });
    const event = checkoutEvent({
      eventId: "evt_route_course_paid",
      sessionId,
      orderId: order.id,
      email: user.email!,
      amountCents: course.priceCents!,
      paymentIntent: "pi_route_course_paid",
      metadata: {
        orderId: order.id,
        userId: user.id,
        courseId: course.id,
        courseSlug: course.slug
      }
    });

    expect((await postEvent(event)).status).toBe(200);
    expect((await postEvent(event)).status).toBe(200);

    expect(
      await db.order.findUnique({ where: { id: order.id } })
    ).toMatchObject({
      kind: "course",
      status: "paid",
      stripePaymentIntent: "pi_route_course_paid"
    });
    expect(
      await db.enrollment.count({
        where: { userId: user.id, courseId: course.id, status: "active" }
      })
    ).toBe(1);
    expect(
      await db.entitlement.count({
        where: {
          orderId: order.id,
          resourceType: "course",
          courseId: course.id
        }
      })
    ).toBe(1);
    expect(await db.stripeEvent.count({ where: { eventId: event.id } })).toBe(
      1
    );
  });

  it("traite un diagnostic malgré metadata.orderKind=course et reste idempotent", async () => {
    const assessment = await createAssessment(
      `assessment-${crypto.randomUUID()}@example.invalid`
    );
    const sessionId = `cs_assessment_${crypto.randomUUID()}`;
    const order = await db.order.create({
      data: {
        publicToken: crypto.randomUUID(),
        email: assessment.email,
        productCode: "loi25_kit",
        amountCents: 2_900,
        currency: "cad",
        status: "pending",
        kind: "assessment",
        assessmentId: assessment.id,
        stripeSessionId: sessionId
      }
    });
    const event = checkoutEvent({
      eventId: "evt_route_assessment_paid",
      sessionId,
      orderId: order.id,
      email: assessment.email,
      amountCents: 2_900,
      paymentIntent: "pi_route_assessment_paid",
      metadata: {
        orderId: order.id,
        orderKind: "course",
        assessmentId: assessment.id,
        assessmentType: "loi25",
        productCode: "loi25_kit"
      }
    });

    expect((await postEvent(event)).status).toBe(200);
    expect((await postEvent(event)).status).toBe(200);

    expect(
      await db.order.findUnique({ where: { id: order.id } })
    ).toMatchObject({
      kind: "assessment",
      status: "paid",
      stripePaymentIntent: "pi_route_assessment_paid"
    });
    expect(
      await db.entitlement.count({
        where: { orderId: order.id, resourceType: "assessment" }
      })
    ).toBe(1);
    expect(await db.enrollment.count({ where: { orderId: order.id } })).toBe(0);
    expect(await db.stripeEvent.count({ where: { eventId: event.id } })).toBe(
      1
    );
  });

  it("garde un diagnostic remboursé si charge.refunded précède le checkout", async () => {
    const assessment = await createAssessment(
      `assessment-refund-first-${crypto.randomUUID()}@example.invalid`
    );
    const sessionId = `cs_assessment_refund_first_${crypto.randomUUID()}`;
    const paymentIntent = `pi_assessment_refund_first_${crypto.randomUUID()}`;
    const order = await db.order.create({
      data: {
        publicToken: crypto.randomUUID(),
        email: assessment.email,
        productCode: "loi25_kit",
        amountCents: 2_900,
        currency: "cad",
        status: "pending",
        kind: "assessment",
        assessmentId: assessment.id,
        stripeSessionId: sessionId
      }
    });
    const refund = refundEvent({
      eventId: `evt_assessment_refund_first_${crypto.randomUUID()}`,
      paymentIntent,
      metadata: { orderId: order.id }
    });
    const checkout = checkoutEvent({
      eventId: `evt_assessment_complete_late_${crypto.randomUUID()}`,
      sessionId,
      orderId: order.id,
      email: assessment.email,
      amountCents: 2_900,
      paymentIntent,
      metadata: {
        orderId: order.id,
        assessmentId: assessment.id,
        assessmentType: "loi25",
        productCode: "loi25_kit"
      }
    });

    expect((await postEvent(refund)).status).toBe(200);
    expect((await postEvent(refund)).status).toBe(200);
    expect((await postEvent(checkout)).status).toBe(200);
    expect((await postEvent(checkout)).status).toBe(200);

    expect(
      await db.order.findUnique({ where: { id: order.id } })
    ).toMatchObject({
      status: "refunded",
      stripePaymentIntent: paymentIntent,
      refundedAt: expect.any(Date)
    });
    expect(
      await db.assessment.findUnique({ where: { id: assessment.id } })
    ).not.toMatchObject({ paymentStatus: "paid" });
    expect(await db.entitlement.count({ where: { orderId: order.id } })).toBe(
      0
    );
    expect(
      await db.stripeRefundTombstone.findUnique({
        where: { paymentIntentId: paymentIntent }
      })
    ).toMatchObject({
      orderId: order.id,
      firstEventId: refund.id,
      refundedAt: expect.any(Date)
    });
    expect(await db.stripeEvent.count()).toBe(2);
  });

  it("garde un cours remboursé si le tombstone PaymentIntent précède le checkout", async () => {
    const [user, course] = await Promise.all([createUser(), createCourse()]);
    const sessionId = `cs_course_refund_first_${crypto.randomUUID()}`;
    const paymentIntent = `pi_course_refund_first_${crypto.randomUUID()}`;
    const order = await db.order.create({
      data: {
        publicToken: crypto.randomUUID(),
        email: user.email!,
        productCode: `course:${course.slug}`,
        amountCents: course.priceCents!,
        currency: course.currency,
        status: "pending",
        kind: "course",
        userId: user.id,
        courseId: course.id,
        stripeSessionId: sessionId
      }
    });
    const refund = refundEvent({
      eventId: `evt_course_refund_first_${crypto.randomUUID()}`,
      paymentIntent
    });
    const checkout = checkoutEvent({
      eventId: `evt_course_complete_late_${crypto.randomUUID()}`,
      sessionId,
      orderId: order.id,
      email: user.email!,
      amountCents: course.priceCents!,
      paymentIntent,
      metadata: {
        orderId: order.id,
        userId: user.id,
        courseId: course.id,
        courseSlug: course.slug
      }
    });

    expect((await postEvent(refund)).status).toBe(200);
    expect((await postEvent(refund)).status).toBe(200);
    expect((await postEvent(checkout)).status).toBe(200);
    expect((await postEvent(checkout)).status).toBe(200);

    expect(
      await db.order.findUnique({ where: { id: order.id } })
    ).toMatchObject({
      status: "refunded",
      stripePaymentIntent: paymentIntent,
      refundedAt: expect.any(Date)
    });
    expect(await db.entitlement.count({ where: { orderId: order.id } })).toBe(
      0
    );
    expect(await db.enrollment.count({ where: { orderId: order.id } })).toBe(0);
    expect(await db.emailJob.count({ where: { orderId: order.id } })).toBe(0);
    expect(
      await db.stripeRefundTombstone.findUnique({
        where: { paymentIntentId: paymentIntent }
      })
    ).toMatchObject({
      orderId: order.id,
      firstEventId: refund.id,
      refundedAt: expect.any(Date)
    });
    expect(await db.stripeEvent.count()).toBe(2);
  });

  it("route les remboursements d’après Order.kind malgré les metadata", async () => {
    const [user, course] = await Promise.all([createUser(), createCourse()]);
    const courseOrder = await db.order.create({
      data: {
        publicToken: crypto.randomUUID(),
        email: user.email!,
        productCode: `course:${course.slug}`,
        amountCents: 4_900,
        currency: "cad",
        status: "paid",
        kind: "course",
        userId: user.id,
        courseId: course.id,
        stripeSessionId: `cs_refund_course_${crypto.randomUUID()}`,
        stripePaymentIntent: "pi_route_refund_course",
        paidAt: new Date()
      }
    });
    await db.entitlement.create({
      data: {
        orderId: courseOrder.id,
        userId: user.id,
        courseId: course.id,
        ownerEmail: user.email!,
        resourceType: "course",
        resourceKey: course.slug,
        status: "active",
        accessToken: crypto.randomUUID(),
        ownsAssessmentAccess: false,
        expiresAt: new Date("9999-12-31T23:59:59.000Z")
      }
    });
    const enrollment = await db.enrollment.create({
      data: {
        userId: user.id,
        courseId: course.id,
        orderId: courseOrder.id,
        status: "active",
        source: "purchase"
      }
    });

    const assessment = await createAssessment(
      `refund-${crypto.randomUUID()}@example.invalid`
    );
    const assessmentOrder = await db.order.create({
      data: {
        publicToken: crypto.randomUUID(),
        email: assessment.email,
        productCode: "loi25_kit",
        amountCents: 2_900,
        currency: "cad",
        status: "paid",
        kind: "assessment",
        assessmentId: assessment.id,
        stripeSessionId: `cs_refund_assessment_${crypto.randomUUID()}`,
        stripePaymentIntent: "pi_route_refund_assessment",
        paidAt: new Date()
      }
    });
    await db.assessment.update({
      where: { id: assessment.id },
      data: {
        paymentStatus: "paid",
        stripeSessionId: assessmentOrder.stripeSessionId,
        stripePaymentIntent: assessmentOrder.stripePaymentIntent
      }
    });
    await db.entitlement.create({
      data: {
        orderId: assessmentOrder.id,
        assessmentId: assessment.id,
        ownerEmail: assessment.email,
        resourceType: "assessment",
        resourceKey: "loi25",
        assessmentType: "loi25",
        status: "consumed",
        accessToken: crypto.randomUUID(),
        ownsAssessmentAccess: true,
        consumedAt: new Date(),
        expiresAt: new Date("2030-01-01T00:00:00.000Z")
      }
    });

    const courseRefund = refundEvent({
      eventId: "evt_route_refund_course",
      paymentIntent: "pi_route_refund_course",
      metadata: { orderKind: "assessment" }
    });
    const assessmentRefund = refundEvent({
      eventId: "evt_route_refund_assessment",
      paymentIntent: "pi_route_refund_assessment",
      metadata: { orderKind: "course" }
    });

    expect((await postEvent(courseRefund)).status).toBe(200);
    expect((await postEvent(courseRefund)).status).toBe(200);
    expect((await postEvent(assessmentRefund)).status).toBe(200);
    expect((await postEvent(assessmentRefund)).status).toBe(200);

    expect(
      await db.enrollment.findUnique({ where: { id: enrollment.id } })
    ).toMatchObject({ status: "revoked", revokedAt: expect.any(Date) });
    expect(
      await db.entitlement.findFirst({ where: { orderId: courseOrder.id } })
    ).toMatchObject({ status: "revoked", revokedAt: expect.any(Date) });
    expect(
      await db.assessment.findUnique({ where: { id: assessment.id } })
    ).toMatchObject({ paymentStatus: "refunded" });
    expect(
      await db.entitlement.findFirst({ where: { orderId: assessmentOrder.id } })
    ).toMatchObject({ status: "revoked", revokedAt: expect.any(Date) });
    expect(
      await db.stripeEvent.count({
        where: {
          eventId: {
            in: [courseRefund.id, assessmentRefund.id]
          }
        }
      })
    ).toBe(2);
  });
});
