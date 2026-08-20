import type Stripe from "stripe";
import { beforeEach, describe, expect, it } from "vitest";

import { refundOrderByPaymentIntent } from "@/lib/commerce";
import { db } from "@/lib/db";
import {
  createPendingCourseOrder,
  fulfillCourseCheckoutSession,
  linkHistoricalPurchasesToUser
} from "@/lib/lms-commerce";

async function createUser(email = "learner@example.invalid") {
  return db.user.create({
    data: {
      email,
      emailVerified: new Date(),
      isActive: true,
      role: "learner"
    }
  });
}

async function createCourse(overrides?: {
  status?: string;
  isPurchasable?: boolean;
  priceCents?: number | null;
}) {
  return db.course.create({
    data: {
      slug: `course-${crypto.randomUUID()}`,
      title: "Excel essentiel",
      shortTitle: "Excel",
      description: "Formation de test",
      theme: "excel",
      level: "beginner",
      offer: "paid",
      priceCents: overrides?.priceCents ?? 4900,
      currency: "cad",
      durationMinutes: 180,
      durationLabel: "3 h",
      format: "self-paced",
      audience: "PME",
      outcomes: [],
      prerequisites: [],
      status: overrides?.status ?? "published",
      isPurchasable: overrides?.isPurchasable ?? true
    }
  });
}

function paidCourseSession(input: {
  orderId: string;
  userId: string;
  courseId: string;
  courseSlug: string;
  email: string;
  amountCents?: number;
  paymentIntent?: string;
}) {
  return {
    id: `cs_${crypto.randomUUID()}`,
    client_reference_id: input.orderId,
    customer_email: input.email,
    customer_details: { email: input.email },
    metadata: {
      orderKind: "course",
      orderId: input.orderId,
      userId: input.userId,
      courseId: input.courseId,
      courseSlug: input.courseSlug
    },
    amount_total: input.amountCents ?? 4900,
    currency: "cad",
    payment_intent: input.paymentIntent || `pi_${crypto.randomUUID()}`,
    payment_status: "paid",
    status: "complete"
  } as unknown as Stripe.Checkout.Session;
}

describe("course commerce", () => {
  beforeEach(async () => {
    await db.stripeRefundTombstone.deleteMany();
    await db.stripeEvent.deleteMany();
    await db.lessonProgress.deleteMany();
    await db.quizAttempt.deleteMany();
    await db.certificate.deleteMany();
    await db.enrollment.deleteMany();
    await db.entitlement.deleteMany();
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
  });

  it("lit le prix exclusivement depuis la formation en base", async () => {
    const [user, course] = await Promise.all([createUser(), createCourse()]);

    const result = await createPendingCourseOrder({
      userId: user.id,
      courseId: course.id
    });

    expect(result.order?.amountCents).toBe(4900);
    expect(result.order?.currency).toBe("cad");
    expect(result.order?.kind).toBe("course");
    expect(result.order?.assessmentId).toBeNull();
  });

  it("refuse un cours fermé ou non achetable", async () => {
    const user = await createUser();
    const course = await createCourse({
      status: "preparation",
      isPurchasable: false,
      priceCents: 3900
    });

    await expect(
      createPendingCourseOrder({ userId: user.id, courseId: course.id })
    ).rejects.toThrow("COURSE_NOT_PURCHASABLE");
  });

  it("crée droit et inscription une seule fois après paiement", async () => {
    const [user, course] = await Promise.all([createUser(), createCourse()]);
    const pending = await createPendingCourseOrder({
      userId: user.id,
      courseId: course.id
    });
    const order = pending.order!;
    const session = paidCourseSession({
      orderId: order.id,
      userId: user.id,
      courseId: course.id,
      courseSlug: course.slug,
      email: user.email!
    });

    const first = await fulfillCourseCheckoutSession({
      eventId: "evt_course_paid_1",
      eventType: "checkout.session.completed",
      session
    });
    const duplicate = await fulfillCourseCheckoutSession({
      eventId: "evt_course_paid_1",
      eventType: "checkout.session.completed",
      session
    });

    expect(first.duplicate).toBe(false);
    expect(duplicate.duplicate).toBe(true);
    expect(
      await db.entitlement.count({
        where: { userId: user.id, courseId: course.id }
      })
    ).toBe(1);
    expect(
      await db.enrollment.count({
        where: { userId: user.id, courseId: course.id, status: "active" }
      })
    ).toBe(1);
    expect(
      await db.emailJob.count({
        where: {
          orderId: order.id,
          kind: "course_access",
          status: "scheduled"
        }
      })
    ).toBe(1);
  });

  it("révoque l’accès remboursé sans supprimer la progression", async () => {
    const [user, course] = await Promise.all([createUser(), createCourse()]);
    const courseModule = await db.courseModule.create({
      data: { courseId: course.id, title: "Module", position: 1 }
    });
    const lesson = await db.lesson.create({
      data: {
        moduleId: courseModule.id,
        slug: "lecon",
        title: "Leçon",
        summary: "Résumé",
        durationMinutes: 10,
        position: 1,
        content: { version: 1, blocks: [{ type: "paragraph", text: "Test" }] },
        status: "published"
      }
    });
    const pending = await createPendingCourseOrder({
      userId: user.id,
      courseId: course.id
    });
    const paymentIntent = `pi_${crypto.randomUUID()}`;
    const session = paidCourseSession({
      orderId: pending.order!.id,
      userId: user.id,
      courseId: course.id,
      courseSlug: course.slug,
      email: user.email!,
      paymentIntent
    });
    await fulfillCourseCheckoutSession({
      eventId: "evt_course_paid_refund",
      eventType: "checkout.session.completed",
      session
    });
    const enrollment = await db.enrollment.findUniqueOrThrow({
      where: { userId_courseId: { userId: user.id, courseId: course.id } }
    });
    await db.lessonProgress.create({
      data: {
        enrollmentId: enrollment.id,
        lessonId: lesson.id,
        status: "completed",
        completedAt: new Date()
      }
    });

    await refundOrderByPaymentIntent({
      eventId: "evt_course_refund",
      eventType: "charge.refunded",
      paymentIntentId: paymentIntent
    });

    expect(
      await db.enrollment.findUnique({ where: { id: enrollment.id } })
    ).toMatchObject({ status: "revoked" });
    expect(
      await db.lessonProgress.count({ where: { enrollmentId: enrollment.id } })
    ).toBe(1);
    expect(
      await db.entitlement.findFirst({ where: { orderId: pending.order!.id } })
    ).toMatchObject({ status: "revoked" });
  });

  it("rattache les achats historiques au courriel vérifié", async () => {
    const user = await createUser("legacy@example.invalid");
    const order = await db.order.create({
      data: {
        publicToken: crypto.randomUUID(),
        email: "legacy@example.invalid",
        productCode: "loi25_kit",
        amountCents: 2900
      }
    });
    await db.entitlement.create({
      data: {
        orderId: order.id,
        ownerEmail: "legacy@example.invalid",
        resourceType: "assessment",
        resourceKey: "loi25",
        assessmentType: "loi25",
        accessToken: crypto.randomUUID(),
        expiresAt: new Date("2030-01-01")
      }
    });

    const linked = await linkHistoricalPurchasesToUser(user.id);

    expect(linked).toEqual({ orders: 1, entitlements: 1 });
    expect(
      await db.order.findUnique({ where: { id: order.id } })
    ).toMatchObject({
      userId: user.id
    });
  });
});
