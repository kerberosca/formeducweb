import { beforeEach, describe, expect, it, vi } from "vitest";

const { authMock, stripeSessionCreate } = vi.hoisted(() => ({
  authMock: vi.fn(),
  stripeSessionCreate: vi.fn()
}));

vi.mock("@/auth", () => ({ auth: authMock }));

vi.mock("@/lib/stripe", () => ({
  getStripeClient: () => ({
    checkout: { sessions: { create: stripeSessionCreate } }
  })
}));

import { POST as checkoutCourse } from "@/app/api/lms/checkout/route";
import { db } from "@/lib/db";

let requestCounter = 0;

function checkoutRequest(body: unknown) {
  requestCounter += 1;
  return new Request("http://localhost:3010/api/lms/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": `203.0.113.${requestCounter}`
    },
    body: JSON.stringify(body)
  });
}

async function clearCourseCommerce() {
  await db.adminAuditLog.deleteMany();
  await db.lessonProgress.deleteMany();
  await db.quizAttempt.deleteMany();
  await db.certificate.deleteMany();
  await db.enrollment.deleteMany();
  await db.entitlement.deleteMany();
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
}

async function createUser(overrides?: {
  isActive?: boolean;
  emailVerified?: Date | null;
}) {
  return db.user.create({
    data: {
      name: "Camille Formation",
      email: `camille-${crypto.randomUUID()}@example.invalid`,
      emailVerified:
        overrides && "emailVerified" in overrides
          ? overrides.emailVerified
          : new Date(),
      isActive: overrides?.isActive ?? true,
      role: "learner"
    }
  });
}

async function createCourse(overrides?: {
  slug?: string;
  title?: string;
  status?: string;
  isPurchasable?: boolean;
  priceCents?: number | null;
  currency?: string;
}) {
  return db.course.create({
    data: {
      slug: overrides?.slug ?? `excel-essentiel-${crypto.randomUUID()}`,
      title: overrides?.title ?? "Excel essentiel",
      shortTitle: "Excel",
      description: "Formation Excel complète et pratique.",
      theme: "excel",
      level: "beginner",
      offer: "paid",
      priceCents: overrides?.priceCents ?? 4_900,
      currency: overrides?.currency ?? "cad",
      durationMinutes: 180,
      durationLabel: "3 h",
      format: "self-paced",
      audience: "Petites entreprises",
      outcomes: [],
      prerequisites: [],
      status: overrides?.status ?? "published",
      isPurchasable: overrides?.isPurchasable ?? true,
      publishedAt: new Date()
    }
  });
}

beforeEach(async () => {
  await clearCourseCommerce();
  authMock.mockReset();
  stripeSessionCreate.mockReset();
  stripeSessionCreate.mockResolvedValue({
    id: `cs_test_${crypto.randomUUID()}`,
    url: "https://checkout.stripe.test/session"
  });
  process.env.DISABLE_EXTERNAL_SERVICES = "0";
  process.env.STRIPE_SECRET_KEY = "sk_test_mock";
  process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3010";
  delete process.env.NEXT_PUBLIC_SITE_URL;
});

describe("POST /api/lms/checkout", () => {
  it("refuse une demande sans session", async () => {
    authMock.mockResolvedValue(null);

    const response = await checkoutCourse(
      checkoutRequest({ courseSlug: "excel-essentiel" })
    );

    expect(response.status).toBe(401);
    expect(stripeSessionCreate).not.toHaveBeenCalled();
  });

  it.each([
    { label: "inactif", overrides: { isActive: false } },
    { label: "non vérifié", overrides: { emailVerified: null } }
  ])("refuse un compte $label", async ({ overrides }) => {
    const user = await createUser(overrides);
    const course = await createCourse();
    authMock.mockResolvedValue({ user: { id: user.id, email: user.email } });

    const response = await checkoutCourse(
      checkoutRequest({ courseId: course.id })
    );

    expect(response.status).toBe(403);
    expect(stripeSessionCreate).not.toHaveBeenCalled();
  });

  it("refuse Word tant que la formation est en préparation", async () => {
    const user = await createUser();
    const word = await createCourse({
      slug: "word-documents-professionnels",
      title: "Word essentiel",
      status: "preparation",
      isPurchasable: false,
      priceCents: 3_900
    });
    authMock.mockResolvedValue({ user: { id: user.id, email: user.email } });

    const response = await checkoutCourse(
      checkoutRequest({ courseSlug: word.slug })
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      code: "COURSE_NOT_PURCHASABLE"
    });
    expect(stripeSessionCreate).not.toHaveBeenCalled();
  });

  it.each([
    {
      label: "clé Stripe absente",
      configure: () => {
        process.env.DISABLE_EXTERNAL_SERVICES = "0";
        delete process.env.STRIPE_SECRET_KEY;
      }
    },
    {
      label: "services externes désactivés",
      configure: () => {
        process.env.DISABLE_EXTERNAL_SERVICES = "1";
        process.env.STRIPE_SECRET_KEY = "sk_test_mock";
      }
    }
  ])("retourne 503 lorsque $label", async ({ configure }) => {
    const user = await createUser();
    const course = await createCourse();
    authMock.mockResolvedValue({ user: { id: user.id, email: user.email } });
    configure();

    const response = await checkoutCourse(
      checkoutRequest({ courseId: course.id })
    );

    expect(response.status).toBe(503);
    expect(stripeSessionCreate).not.toHaveBeenCalled();
    expect(await db.order.count()).toBe(0);
  });

  it("ignore les valeurs commerciales du client et utilise celles d’Excel en base", async () => {
    const user = await createUser();
    const course = await createCourse({
      slug: "excel-essentiel",
      priceCents: 4_900,
      currency: "CAD"
    });
    authMock.mockResolvedValue({ user: { id: user.id, email: user.email } });

    const response = await checkoutCourse(
      checkoutRequest({
        courseSlug: course.slug,
        amountCents: 1,
        currency: "usd",
        email: "attaquant@example.invalid",
        successUrl: "https://evil.example/success",
        cancelUrl: "https://evil.example/cancel"
      })
    );

    expect(response.status).toBe(200);
    const order = await db.order.findFirstOrThrow({
      where: { userId: user.id, courseId: course.id }
    });
    expect(order).toMatchObject({
      kind: "course",
      email: user.email,
      amountCents: 4_900,
      currency: "cad",
      productCode: "course:excel-essentiel",
      status: "pending"
    });

    expect(stripeSessionCreate).toHaveBeenCalledTimes(1);
    const [stripeInput, stripeOptions] = stripeSessionCreate.mock.calls[0];
    expect(stripeInput).toMatchObject({
      mode: "payment",
      customer_email: user.email,
      client_reference_id: order.id,
      success_url: "http://localhost:3010/mon-espace?paiement=confirme",
      cancel_url:
        "http://localhost:3010/formations/excel-essentiel?paiement=annule",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "cad",
            unit_amount: 4_900,
            product_data: {
              name: course.title,
              description: course.description
            }
          }
        }
      ],
      metadata: {
        orderKind: "course",
        orderId: order.id,
        userId: user.id,
        courseId: course.id,
        courseSlug: course.slug
      },
      payment_intent_data: {
        metadata: { orderId: order.id, courseId: course.id }
      }
    });
    expect(stripeOptions).toEqual({
      idempotencyKey: `checkout-course-order-${order.id}`
    });
    expect(order.stripeSessionId).toMatch(/^cs_test_/);
    await expect(response.json()).resolves.toMatchObject({
      url: "https://checkout.stripe.test/session",
      orderToken: order.publicToken
    });
  });

  it("ne réutilise pas une commande pending devenue incohérente", async () => {
    const user = await createUser();
    const course = await createCourse({
      slug: "excel-essentiel",
      priceCents: 4_900,
      currency: "cad"
    });
    const stale = await db.order.create({
      data: {
        publicToken: `stale-${crypto.randomUUID()}`,
        email: "ancienne-adresse@example.invalid",
        productCode: "course:ancien-excel",
        amountCents: 3_900,
        currency: "usd",
        status: "pending",
        kind: "course",
        userId: user.id,
        courseId: course.id
      }
    });
    authMock.mockResolvedValue({ user: { id: user.id, email: user.email } });

    const response = await checkoutCourse(
      checkoutRequest({ courseId: course.id })
    );

    expect(response.status).toBe(200);
    const orders = await db.order.findMany({
      where: { userId: user.id, courseId: course.id }
    });
    expect(orders).toHaveLength(2);
    const preservedStale = orders.find((order) => order.id === stale.id);
    const fresh = orders.find((order) => order.id !== stale.id)!;
    expect(preservedStale).toMatchObject({
      amountCents: 3_900,
      currency: "usd",
      status: "pending"
    });
    expect(fresh).toMatchObject({
      email: user.email,
      productCode: "course:excel-essentiel",
      amountCents: 4_900,
      currency: "cad",
      status: "pending"
    });
    expect(stripeSessionCreate.mock.calls[0][0]).toMatchObject({
      client_reference_id: fresh.id,
      line_items: [{ price_data: { currency: "cad", unit_amount: 4_900 } }]
    });
    expect(stripeSessionCreate.mock.calls[0][1]).toEqual({
      idempotencyKey: `checkout-course-order-${fresh.id}`
    });
  });
});
