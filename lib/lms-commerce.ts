import { randomBytes } from "node:crypto";

import type { Course, Order, StripeEvent, User } from "@prisma/client";
import type Stripe from "stripe";

import { blockRefundedCheckoutFulfillment } from "@/lib/commerce";
import { db } from "@/lib/db";

const COURSE_ACCESS_EXPIRES_AT = new Date("9999-12-31T23:59:59.000Z");

function createToken() {
  return randomBytes(32).toString("hex");
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function getCourseProductCode(course: Pick<Course, "slug">) {
  return `course:${course.slug}`;
}

export async function getActiveCourseAccess(userId: string, courseId: string) {
  return db.entitlement.findFirst({
    where: {
      userId,
      courseId,
      resourceType: "course",
      status: { in: ["active", "consumed"] },
      revokedAt: null,
      expiresAt: { gt: new Date() }
    }
  });
}

export async function createPendingCourseOrder(input: {
  userId: string;
  courseId: string;
}) {
  return db.$transaction(async (transaction) => {
    const [user, course] = await Promise.all([
      transaction.user.findUnique({ where: { id: input.userId } }),
      transaction.course.findUnique({ where: { id: input.courseId } })
    ]);

    if (!user?.isActive || !user.email || !user.emailVerified) {
      throw new Error("COURSE_CHECKOUT_USER_INELIGIBLE");
    }
    if (
      !course ||
      course.status !== "published" ||
      course.offer !== "paid" ||
      !course.isPurchasable ||
      !course.priceCents ||
      course.priceCents <= 0
    ) {
      throw new Error("COURSE_NOT_PURCHASABLE");
    }

    const existingAccess = await transaction.entitlement.findFirst({
      where: {
        userId: user.id,
        courseId: course.id,
        resourceType: "course",
        status: { in: ["active", "consumed"] },
        revokedAt: null,
        expiresAt: { gt: new Date() }
      }
    });
    if (existingAccess) {
      return { alreadyOwned: true as const, order: null, user, course };
    }

    const expectedEmail = normalizeEmail(user.email);
    const expectedCurrency = course.currency.toLowerCase();
    const expectedProductCode = getCourseProductCode(course);
    const pendingOrder = await transaction.order.findFirst({
      where: {
        kind: "course",
        userId: user.id,
        courseId: course.id,
        status: "pending",
        email: expectedEmail,
        productCode: expectedProductCode,
        amountCents: course.priceCents,
        currency: expectedCurrency
      },
      orderBy: { createdAt: "desc" }
    });
    if (pendingOrder) {
      return {
        alreadyOwned: false as const,
        order: pendingOrder,
        user,
        course
      };
    }

    const order = await transaction.order.create({
      data: {
        publicToken: createToken(),
        email: expectedEmail,
        contactName: user.name,
        productCode: expectedProductCode,
        amountCents: course.priceCents,
        currency: expectedCurrency,
        status: "pending",
        kind: "course",
        userId: user.id,
        courseId: course.id
      }
    });

    return { alreadyOwned: false as const, order, user, course };
  });
}

type CourseWebhookResult = {
  duplicate: boolean;
  order: Order | null;
  stripeEvent: StripeEvent | null;
  course: Course | null;
};

function sessionPaymentIntentId(session: Stripe.Checkout.Session) {
  return typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id || null;
}

function sessionEmail(session: Stripe.Checkout.Session) {
  return session.customer_details?.email || session.customer_email || null;
}

export async function fulfillCourseCheckoutSession(input: {
  eventId: string;
  eventType: string;
  session: Stripe.Checkout.Session;
}): Promise<CourseWebhookResult> {
  const result = await db.$transaction(async (transaction) => {
    const processedEvent = await transaction.stripeEvent.findUnique({
      where: { eventId: input.eventId },
      include: { order: true }
    });
    if (processedEvent) {
      return {
        duplicate: true,
        order: processedEvent.order,
        stripeEvent: processedEvent,
        course: null
      };
    }

    const orderId = input.session.metadata?.orderId;
    const order = await transaction.order.findFirst({
      where: orderId
        ? { id: orderId, kind: "course" }
        : { stripeSessionId: input.session.id, kind: "course" },
      include: { course: true, user: true }
    });

    if (!order?.course || !order.user) {
      const stripeEvent = await transaction.stripeEvent.create({
        data: { eventId: input.eventId, eventType: input.eventType }
      });
      return {
        duplicate: false,
        order: null,
        stripeEvent,
        course: null
      };
    }

    if (
      input.session.payment_status !== "paid" &&
      input.eventType !== "checkout.session.async_payment_succeeded"
    ) {
      const stripeEvent = await transaction.stripeEvent.create({
        data: {
          eventId: input.eventId,
          eventType: input.eventType,
          orderId: order.id
        }
      });
      return {
        duplicate: false,
        order,
        stripeEvent,
        course: order.course
      };
    }

    const paidEmail = sessionEmail(input.session);
    if (
      paidEmail &&
      normalizeEmail(paidEmail) !== normalizeEmail(order.email)
    ) {
      throw new Error("COURSE_CHECKOUT_EMAIL_MISMATCH");
    }
    if (
      input.session.amount_total !== order.amountCents ||
      input.session.currency?.toLowerCase() !== order.currency.toLowerCase()
    ) {
      throw new Error("COURSE_CHECKOUT_AMOUNT_MISMATCH");
    }
    if (
      input.session.metadata?.userId !== order.userId ||
      input.session.metadata?.courseId !== order.courseId
    ) {
      throw new Error("COURSE_CHECKOUT_METADATA_MISMATCH");
    }

    const paymentIntentId = sessionPaymentIntentId(input.session);
    const refundedOrder = await blockRefundedCheckoutFulfillment(transaction, {
      order,
      paymentIntentId,
      stripeSessionId: input.session.id
    });
    if (refundedOrder) {
      const stripeEvent = await transaction.stripeEvent.create({
        data: {
          eventId: input.eventId,
          eventType: input.eventType,
          orderId: order.id
        }
      });
      return {
        duplicate: true,
        order: refundedOrder,
        stripeEvent,
        course: order.course
      };
    }

    const alreadyFulfilled =
      order.status === "paid" &&
      (order.stripeSessionId === input.session.id ||
        Boolean(
          paymentIntentId && order.stripePaymentIntent === paymentIntentId
        ));

    if (alreadyFulfilled) {
      const stripeEvent = await transaction.stripeEvent.create({
        data: {
          eventId: input.eventId,
          eventType: input.eventType,
          orderId: order.id
        }
      });
      return {
        duplicate: true,
        order,
        stripeEvent,
        course: order.course
      };
    }

    const paidAt = new Date();
    const paidOrder = await transaction.order.update({
      where: { id: order.id },
      data: {
        status: "paid",
        stripeSessionId: input.session.id,
        stripePaymentIntent: paymentIntentId,
        paidAt,
        refundedAt: null,
        accessExpiresAt: COURSE_ACCESS_EXPIRES_AT
      }
    });

    await transaction.entitlement.upsert({
      where: {
        orderId_resourceType_resourceKey: {
          orderId: order.id,
          resourceType: "course",
          resourceKey: order.course.slug
        }
      },
      create: {
        orderId: order.id,
        userId: order.user.id,
        courseId: order.course.id,
        ownerEmail: normalizeEmail(order.email),
        resourceType: "course",
        resourceKey: order.course.slug,
        assessmentType: null,
        status: "active",
        accessToken: createToken(),
        ownsAssessmentAccess: false,
        expiresAt: COURSE_ACCESS_EXPIRES_AT
      },
      update: {
        userId: order.user.id,
        courseId: order.course.id,
        status: "active",
        revokedAt: null,
        expiresAt: COURSE_ACCESS_EXPIRES_AT
      }
    });

    await transaction.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: order.user.id,
          courseId: order.course.id
        }
      },
      create: {
        userId: order.user.id,
        courseId: order.course.id,
        orderId: order.id,
        status: "active",
        source: "purchase",
        enrolledAt: paidAt
      },
      update: {
        orderId: order.id,
        status: "active",
        source: "purchase",
        revokedAt: null
      }
    });

    await transaction.emailJob.upsert({
      where: { idempotencyKey: `course-access-${order.id}` },
      create: {
        orderId: order.id,
        toEmail: normalizeEmail(order.email),
        kind: "course_access",
        status: "scheduled",
        scheduledAt: paidAt,
        idempotencyKey: `course-access-${order.id}`,
        payload: { courseTitle: order.course.title }
      },
      update: {}
    });

    const stripeEvent = await transaction.stripeEvent.create({
      data: {
        eventId: input.eventId,
        eventType: input.eventType,
        orderId: order.id
      }
    });
    return {
      duplicate: false,
      order: paidOrder,
      stripeEvent,
      course: order.course
    };
  });

  return result;
}

export async function linkHistoricalPurchasesToUser(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user?.email || !user.emailVerified)
    return { orders: 0, entitlements: 0 };

  const email = normalizeEmail(user.email);
  return db.$transaction(async (transaction) => {
    const [orders, entitlements] = await Promise.all([
      transaction.order.updateMany({
        where: { userId: null, email },
        data: { userId: user.id }
      }),
      transaction.entitlement.updateMany({
        where: { userId: null, ownerEmail: email },
        data: { userId: user.id }
      })
    ]);

    return { orders: orders.count, entitlements: entitlements.count };
  });
}

export type EligibleCourseUser = Pick<
  User,
  "id" | "email" | "emailVerified" | "isActive"
>;
