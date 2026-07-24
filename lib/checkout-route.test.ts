import { readFileSync } from "node:fs";
import path from "node:path";

// @ts-expect-error better-sqlite3 does not bundle its declarations.
import Database from "better-sqlite3";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const stripeSessionCreate = vi.hoisted(() => vi.fn());

vi.mock("@/lib/stripe", () => ({
  getStripeClient: () => ({
    checkout: {
      sessions: {
        create: stripeSessionCreate
      }
    }
  })
}));

import { POST as createCheckout } from "@/app/api/stripe/create-checkout-session/route";
import { db } from "@/lib/db";

function migrationSql(name: string) {
  return readFileSync(
    path.resolve("prisma", "migrations", name, "migration.sql"),
    "utf8"
  );
}

function request(body: unknown, ip: string) {
  return new Request("http://localhost/api/stripe/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip
    },
    body: JSON.stringify(body)
  });
}

async function createAssessment(input: {
  assessmentType: string;
  email: string;
}) {
  return db.assessment.create({
    data: {
      email: input.email,
      contactName: "Alex Tremblay",
      companyName: "PME Exemple",
      assessmentType: input.assessmentType,
      answers: {},
      score: 62,
      level: "En progression",
      reportLite: {},
      reportFull: {},
      accessToken: `checkout-${crypto.randomUUID()}`,
      consentMarketing: false
    }
  });
}

describe("Stripe checkout product sessions", () => {
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
        database.exec(
          migrationSql("20260723010000_add_entitlement_access_ownership")
        );
      }
    } finally {
      database.close();
    }
  });

  beforeEach(async () => {
    process.env.DISABLE_EXTERNAL_SERVICES = "0";
    process.env.STRIPE_SECRET_KEY = "sk_test_mock";
    process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000";
    stripeSessionCreate.mockReset();
    stripeSessionCreate
      .mockResolvedValueOnce({
        id: `cs_${crypto.randomUUID()}`,
        url: "https://checkout.stripe.test/session"
      })
      .mockResolvedValueOnce({
        id: `cs_${crypto.randomUUID()}`,
        url: "https://checkout.stripe.test/upgrade"
      });

    await db.stripeEvent.deleteMany();
    await db.emailJob.deleteMany();
    await db.entitlement.deleteMany();
    await db.order.deleteMany();
    await db.subscriber.deleteMany();
    await db.assessment.deleteMany();
  });

  it("creates a 59 CAD Trio session with the selected product in both metadata layers", async () => {
    const assessment = await createAssessment({
      assessmentType: "ai",
      email: "checkout-trio@example.invalid"
    });
    const response = await createCheckout(
      request(
        {
          accessToken: assessment.accessToken,
          productCode: "digital_hygiene_trio"
        },
        "203.0.113.210"
      )
    );

    expect(response.status).toBe(200);
    const stripeInput = stripeSessionCreate.mock.calls[0][0];
    expect(stripeInput).toMatchObject({
      mode: "payment",
      customer_email: assessment.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "cad",
            unit_amount: 5900
          }
        }
      ],
      metadata: {
        assessmentId: assessment.id,
        assessmentType: "ai",
        productCode: "digital_hygiene_trio"
      },
      payment_intent_data: {
        metadata: {
          assessmentId: assessment.id,
          assessmentType: "ai",
          productCode: "digital_hygiene_trio"
        }
      },
      cancel_url: expect.stringContaining("cancel=1&offer=trio")
    });
    const order = await db.order.findFirstOrThrow({
      where: { assessmentId: assessment.id }
    });
    expect(order).toMatchObject({
      productCode: "digital_hygiene_trio",
      amountCents: 5900,
      currency: "cad",
      status: "pending"
    });
    expect(stripeInput.client_reference_id).toBe(order.id);
    expect(stripeInput.metadata.orderId).toBe(order.id);
    expect(stripeSessionCreate.mock.calls[0][1]).toEqual({
      idempotencyKey: `checkout-order-${order.id}`
    });
    await expect(response.json()).resolves.toMatchObject({
      orderToken: order.publicToken
    });
  });

  it("creates a 30 CAD upgrade only from an active paid individual order", async () => {
    const assessment = await createAssessment({
      assessmentType: "cybersecurity",
      email: "checkout-upgrade@example.invalid"
    });
    const sourceOrder = await db.order.create({
      data: {
        publicToken: `source-${crypto.randomUUID()}`,
        email: assessment.email,
        contactName: assessment.contactName,
        companyName: assessment.companyName,
        productCode: "cyber_kit",
        amountCents: 2900,
        currency: "cad",
        status: "paid",
        paidAt: new Date(),
        accessExpiresAt: new Date(Date.now() + 60_000),
        assessmentId: assessment.id
      }
    });

    const response = await createCheckout(
      request(
        {
          accessToken: assessment.accessToken,
          productCode: "trio_upgrade"
        },
        "203.0.113.211"
      )
    );

    expect(response.status).toBe(200);
    expect(stripeSessionCreate.mock.calls[0][0]).toMatchObject({
      line_items: [
        {
          price_data: {
            currency: "cad",
            unit_amount: 3000
          }
        }
      ],
      metadata: {
        productCode: "trio_upgrade"
      }
    });
    expect(
      await db.order.findFirst({
        where: {
          assessmentId: assessment.id,
          productCode: "trio_upgrade"
        }
      })
    ).toMatchObject({
      amountCents: 3000,
      upgradeFromOrderId: sourceOrder.id,
      status: "pending"
    });
    expect(stripeSessionCreate.mock.calls[0][1]).toEqual({
      idempotencyKey: expect.stringMatching(/^checkout-order-/)
    });
  });
});
