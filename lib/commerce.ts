import { randomBytes } from "node:crypto";

import type { Assessment, Order, Prisma, StripeEvent } from "@prisma/client";
import type Stripe from "stripe";

import { db } from "@/lib/db";
import {
  normalizeAssessmentType,
  type AssessmentType
} from "@/lib/diagnostics";

export const productCodes = [
  "loi25_kit",
  "cyber_kit",
  "ai_kit",
  "digital_hygiene_trio",
  "trio_upgrade"
] as const;

export type ProductCode = (typeof productCodes)[number];

type ProductDefinition = {
  code: ProductCode;
  name: string;
  description: string;
  amountCents: number;
  assessmentType?: AssessmentType;
};

export const PRODUCT_CATALOG: Record<ProductCode, ProductDefinition> = {
  loi25_kit: {
    code: "loi25_kit",
    name: "Kit d’exécution 90 jours — Loi 25",
    description:
      "Diagnostic complet et gabarits éditables pour prioriser votre conformité.",
    amountCents: 2900,
    assessmentType: "loi25"
  },
  cyber_kit: {
    code: "cyber_kit",
    name: "Kit d’exécution 90 jours — Cybersécurité",
    description:
      "Diagnostic complet et gabarits éditables pour réduire vos risques courants.",
    amountCents: 2900,
    assessmentType: "cybersecurity"
  },
  ai_kit: {
    code: "ai_kit",
    name: "Kit d’exécution 90 jours — Intelligence artificielle",
    description:
      "Diagnostic complet et gabarits éditables pour encadrer vos usages de l’IA.",
    amountCents: 2900,
    assessmentType: "ai"
  },
  digital_hygiene_trio: {
    code: "digital_hygiene_trio",
    name: "Trio Hygiène numérique",
    description:
      "Les trois diagnostics et leurs kits d’exécution 90 jours : IA, cyber et Loi 25.",
    amountCents: 5900
  },
  trio_upgrade: {
    code: "trio_upgrade",
    name: "Amélioration vers le Trio Hygiène numérique",
    description:
      "Ajoutez les deux autres diagnostics et kits à votre achat individuel.",
    amountCents: 3000
  }
};

export const ACCESS_DURATION_DAYS = 730;
export const KIT_CREDIT_DURATION_DAYS = 90;

const INDIVIDUAL_PRODUCT_CODES: ProductCode[] = [
  "loi25_kit",
  "cyber_kit",
  "ai_kit"
];
const ALL_ASSESSMENT_TYPES: AssessmentType[] = ["loi25", "cybersecurity", "ai"];

function createPublicToken() {
  return randomBytes(32).toString("hex");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function addDays(value: Date, days: number) {
  return new Date(value.getTime() + days * 24 * 60 * 60 * 1000);
}

export function isProductCode(value: unknown): value is ProductCode {
  return (
    typeof value === "string" &&
    (productCodes as readonly string[]).includes(value)
  );
}

export function getDefaultProductCode(
  assessmentType: AssessmentType
): ProductCode {
  if (assessmentType === "cybersecurity") {
    return "cyber_kit";
  }

  if (assessmentType === "ai") {
    return "ai_kit";
  }

  return "loi25_kit";
}

export function resolveProductCode(
  value: unknown,
  assessmentType: AssessmentType
) {
  return isProductCode(value) ? value : getDefaultProductCode(assessmentType);
}

export function getProduct(productCode: ProductCode) {
  return PRODUCT_CATALOG[productCode];
}

export function isIndividualProduct(productCode: ProductCode) {
  return INDIVIDUAL_PRODUCT_CODES.includes(productCode);
}

export function isEntitlementAccessible(
  entitlement: {
    status: string;
    revokedAt: Date | null;
    expiresAt: Date;
  },
  now = new Date()
) {
  return (
    ["active", "consumed"].includes(entitlement.status) &&
    !entitlement.revokedAt &&
    entitlement.expiresAt > now
  );
}

export function getEntitlementTypes(input: {
  productCode: ProductCode;
  assessmentType: AssessmentType;
}) {
  if (isIndividualProduct(input.productCode)) {
    return [input.assessmentType];
  }

  if (input.productCode === "digital_hygiene_trio") {
    return [...ALL_ASSESSMENT_TYPES];
  }

  return ALL_ASSESSMENT_TYPES.filter(
    (assessmentType) => assessmentType !== input.assessmentType
  );
}

export function validateProductForAssessment(
  productCode: ProductCode,
  assessmentType: AssessmentType
) {
  const product = getProduct(productCode);

  if (product.assessmentType && product.assessmentType !== assessmentType) {
    throw new Error("PRODUCT_ASSESSMENT_MISMATCH");
  }
}

export async function findUpgradeSource(assessment: Assessment) {
  return db.order.findFirst({
    where: {
      assessmentId: assessment.id,
      email: normalizeEmail(assessment.email),
      productCode: {
        in: INDIVIDUAL_PRODUCT_CODES
      },
      status: "paid",
      OR: [
        { accessExpiresAt: null },
        {
          accessExpiresAt: {
            gt: new Date()
          }
        }
      ]
    },
    orderBy: {
      paidAt: "desc"
    }
  });
}

export async function findUpgradeOpportunity(assessment: Assessment) {
  const sourceOrder = await findUpgradeSource(assessment);
  if (!sourceOrder) return null;

  const existingBundle = await db.order.findFirst({
    where: {
      email: normalizeEmail(assessment.email),
      status: "paid",
      productCode: {
        in: ["digital_hygiene_trio", "trio_upgrade"]
      }
    },
    select: { id: true }
  });

  return existingBundle ? null : sourceOrder;
}

export async function hasActiveAssessmentAccess(
  assessment: Pick<Assessment, "id" | "paymentStatus">,
  now = new Date()
) {
  if (assessment.paymentStatus !== "paid") return false;

  const owningEntitlements = await db.entitlement.findMany({
    where: {
      assessmentId: assessment.id,
      ownsAssessmentAccess: true
    },
    select: {
      status: true,
      consumedAt: true,
      revokedAt: true,
      expiresAt: true
    }
  });

  if (!owningEntitlements.length) {
    return true;
  }

  return owningEntitlements.some(
    (entitlement) =>
      entitlement.status === "consumed" &&
      Boolean(entitlement.consumedAt) &&
      !entitlement.revokedAt &&
      entitlement.expiresAt > now
  );
}

export async function createPendingOrder(input: {
  assessment: Assessment;
  productCode: ProductCode;
}) {
  const assessmentType = normalizeAssessmentType(
    input.assessment.assessmentType
  );
  validateProductForAssessment(input.productCode, assessmentType);
  const product = getProduct(input.productCode);
  const email = normalizeEmail(input.assessment.email);

  return db.$transaction(async (transaction) => {
    if (["digital_hygiene_trio", "trio_upgrade"].includes(input.productCode)) {
      const existingBundle = await transaction.order.findFirst({
        where: {
          email,
          productCode: {
            in: ["digital_hygiene_trio", "trio_upgrade"]
          },
          status: "paid"
        },
        select: { id: true }
      });

      if (existingBundle) {
        throw new Error("BUNDLE_ALREADY_PURCHASED");
      }

      const pendingBundle = await transaction.order.findFirst({
        where: {
          email,
          productCode: {
            in: ["digital_hygiene_trio", "trio_upgrade"]
          },
          status: "pending"
        },
        orderBy: { createdAt: "desc" }
      });

      if (pendingBundle) {
        if (
          pendingBundle.assessmentId === input.assessment.id &&
          pendingBundle.productCode === input.productCode
        ) {
          return pendingBundle;
        }

        throw new Error("BUNDLE_CHECKOUT_IN_PROGRESS");
      }
    } else {
      const existingPendingOrder = await transaction.order.findFirst({
        where: {
          assessmentId: input.assessment.id,
          email,
          productCode: input.productCode,
          status: "pending"
        },
        orderBy: { createdAt: "desc" }
      });

      if (existingPendingOrder) return existingPendingOrder;
    }

    const upgradeFromOrder =
      input.productCode === "trio_upgrade"
        ? await transaction.order.findFirst({
            where: {
              assessmentId: input.assessment.id,
              email,
              productCode: {
                in: INDIVIDUAL_PRODUCT_CODES
              },
              status: "paid",
              OR: [
                { accessExpiresAt: null },
                {
                  accessExpiresAt: {
                    gt: new Date()
                  }
                }
              ]
            },
            orderBy: { paidAt: "desc" }
          })
        : null;

    if (input.productCode === "trio_upgrade" && !upgradeFromOrder) {
      throw new Error("UPGRADE_NOT_ELIGIBLE");
    }

    return transaction.order.create({
      data: {
        publicToken: createPublicToken(),
        email,
        contactName: input.assessment.contactName,
        companyName: input.assessment.companyName,
        productCode: input.productCode,
        amountCents: product.amountCents,
        currency: "cad",
        assessmentId: input.assessment.id,
        upgradeFromOrderId: upgradeFromOrder?.id,
        utmSource: input.assessment.utmSource,
        utmMedium: input.assessment.utmMedium,
        utmCampaign: input.assessment.utmCampaign,
        utmContent: input.assessment.utmContent,
        utmTerm: input.assessment.utmTerm,
        landingPath: input.assessment.landingPath,
        referrerHost: input.assessment.referrerHost,
        firstSeenAt: input.assessment.firstSeenAt
      }
    });
  });
}

export async function attachStripeSessionToOrder(
  orderId: string,
  stripeSessionId: string
) {
  return db.order.update({
    where: { id: orderId },
    data: { stripeSessionId }
  });
}

function getSessionPaymentIntentId(session: Stripe.Checkout.Session) {
  return typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id || null;
}

function getSessionEmail(session: Stripe.Checkout.Session) {
  return session.customer_details?.email || session.customer_email || undefined;
}

async function findOrderForSession(
  transaction: Prisma.TransactionClient,
  session: Stripe.Checkout.Session
) {
  const orderId = session.metadata?.orderId;

  if (orderId) {
    return transaction.order.findUnique({
      where: { id: orderId },
      include: { assessment: true, upgradeFromOrder: true }
    });
  }

  return transaction.order.findUnique({
    where: { stripeSessionId: session.id },
    include: { assessment: true, upgradeFromOrder: true }
  });
}

async function findProcessedEvent(
  transaction: Prisma.TransactionClient,
  eventId: string
) {
  return transaction.stripeEvent.findUnique({
    where: { eventId },
    include: { order: true }
  });
}

async function recordProcessedEvent(
  transaction: Prisma.TransactionClient,
  input: {
    eventId: string;
    eventType: string;
    orderId?: string | null;
  }
) {
  return transaction.stripeEvent.create({
    data: {
      eventId: input.eventId,
      eventType: input.eventType,
      orderId: input.orderId || null
    }
  });
}

export type CommerceWebhookResult = {
  duplicate: boolean;
  order: Order | null;
  stripeEvent: StripeEvent | null;
};

export async function fulfillCheckoutSession(input: {
  eventId: string;
  eventType: string;
  session: Stripe.Checkout.Session;
}): Promise<CommerceWebhookResult> {
  return db.$transaction(async (transaction) => {
    const processedEvent = await findProcessedEvent(transaction, input.eventId);

    if (processedEvent) {
      return {
        duplicate: true,
        order: processedEvent.order,
        stripeEvent: processedEvent
      };
    }

    const order = await findOrderForSession(transaction, input.session);

    if (!order || !order.assessment) {
      const stripeEvent = await recordProcessedEvent(transaction, {
        eventId: input.eventId,
        eventType: input.eventType
      });

      return { duplicate: false, order: null, stripeEvent };
    }

    if (
      input.session.payment_status !== "paid" &&
      input.eventType !== "checkout.session.async_payment_succeeded"
    ) {
      const stripeEvent = await recordProcessedEvent(transaction, {
        eventId: input.eventId,
        eventType: input.eventType,
        orderId: order.id
      });

      return {
        duplicate: false,
        order,
        stripeEvent
      };
    }

    const sessionPaymentIntentId = getSessionPaymentIntentId(input.session);
    const isAlreadyFulfilled =
      order.status === "paid" &&
      (order.stripeSessionId === input.session.id ||
        Boolean(
          sessionPaymentIntentId &&
          order.stripePaymentIntent === sessionPaymentIntentId
        ));

    if (isAlreadyFulfilled) {
      const stripeEvent = await recordProcessedEvent(transaction, {
        eventId: input.eventId,
        eventType: input.eventType,
        orderId: order.id
      });

      return {
        duplicate: true,
        order,
        stripeEvent
      };
    }

    const stripeEmail = getSessionEmail(input.session);

    if (
      stripeEmail &&
      normalizeEmail(stripeEmail) !== normalizeEmail(order.email)
    ) {
      throw new Error("CHECKOUT_EMAIL_MISMATCH");
    }

    const productCode = isProductCode(order.productCode)
      ? order.productCode
      : resolveProductCode(
          input.session.metadata?.productCode,
          normalizeAssessmentType(order.assessment.assessmentType)
        );
    const assessmentType = normalizeAssessmentType(
      order.assessment.assessmentType
    );
    const paidAt = new Date();
    const expiresAt = addDays(paidAt, ACCESS_DURATION_DAYS);
    const existingOwningEntitlements = await transaction.entitlement.findMany({
      where: {
        assessmentId: order.assessment.id,
        ownsAssessmentAccess: true
      },
      select: {
        status: true,
        consumedAt: true,
        revokedAt: true,
        expiresAt: true
      }
    });
    const assessmentHadActiveAccess =
      order.assessment.paymentStatus === "paid" &&
      (existingOwningEntitlements.length === 0 ||
        existingOwningEntitlements.some(
          (entitlement) =>
            entitlement.status === "consumed" &&
            Boolean(entitlement.consumedAt) &&
            !entitlement.revokedAt &&
            entitlement.expiresAt > paidAt
        ));
    const entitlementTypes = getEntitlementTypes({
      productCode,
      assessmentType
    });
    const paidOrder = await transaction.order.update({
      where: { id: order.id },
      data: {
        status: "paid",
        stripeSessionId: input.session.id,
        stripePaymentIntent: getSessionPaymentIntentId(input.session),
        paidAt,
        refundedAt: null,
        accessExpiresAt: expiresAt
      }
    });

    for (const entitlementType of entitlementTypes) {
      const isCompletedAssessment = entitlementType === assessmentType;

      await transaction.entitlement.upsert({
        where: {
          orderId_assessmentType: {
            orderId: order.id,
            assessmentType: entitlementType
          }
        },
        create: {
          orderId: order.id,
          assessmentId:
            entitlementType === assessmentType ? order.assessment.id : null,
          ownerEmail: normalizeEmail(order.email),
          assessmentType: entitlementType,
          status: isCompletedAssessment ? "consumed" : "active",
          accessToken: createPublicToken(),
          ownsAssessmentAccess:
            !isCompletedAssessment || !assessmentHadActiveAccess,
          expiresAt,
          consumedAt: isCompletedAssessment ? paidAt : null
        },
        update: {
          status: isCompletedAssessment ? "consumed" : "active",
          expiresAt,
          revokedAt: null,
          consumedAt: isCompletedAssessment ? paidAt : null
        }
      });
    }

    if (productCode !== "trio_upgrade" && !assessmentHadActiveAccess) {
      await transaction.assessment.update({
        where: { id: order.assessment.id },
        data: {
          paymentStatus: "paid",
          stripeSessionId: input.session.id,
          stripePaymentIntent: getSessionPaymentIntentId(input.session)
        }
      });
    }

    if (order.assessment.consentMarketing) {
      const subscriberEmail = normalizeEmail(order.email);
      const existingSubscriber = await transaction.subscriber.findUnique({
        where: { email: subscriberEmail }
      });
      const subscriber = existingSubscriber
        ? existingSubscriber.unsubscribedAt
          ? existingSubscriber
          : await transaction.subscriber.update({
              where: { id: existingSubscriber.id },
              data: {
                consentMarketing: true,
                consentSource: existingSubscriber.consentSource || "diagnostic",
                consentedAt: existingSubscriber.consentedAt || new Date()
              }
            })
        : await transaction.subscriber.create({
            data: {
              email: subscriberEmail,
              consentMarketing: true,
              consentSource: "diagnostic",
              consentedAt: new Date()
            }
          });

      if (
        isIndividualProduct(productCode) &&
        subscriber.consentMarketing &&
        !subscriber.unsubscribedAt
      ) {
        await transaction.emailJob.upsert({
          where: {
            idempotencyKey: `${order.id}:trio_upgrade`
          },
          create: {
            subscriberId: subscriber.id,
            orderId: order.id,
            toEmail: normalizeEmail(order.email),
            kind: "trio_upgrade",
            status: "scheduled",
            scheduledAt: new Date(),
            idempotencyKey: `${order.id}:trio_upgrade`,
            payload: {
              diagnostic: assessmentType,
              productCode,
              dashboardUrl: `/trio/${paidOrder.publicToken}`
            } as Prisma.InputJsonValue
          },
          update: {}
        });
      }
    }

    const stripeEvent = await recordProcessedEvent(transaction, {
      eventId: input.eventId,
      eventType: input.eventType,
      orderId: order.id
    });

    return { duplicate: false, order: paidOrder, stripeEvent };
  });
}

export async function cancelCheckoutSession(input: {
  eventId: string;
  eventType: string;
  session: Stripe.Checkout.Session;
}): Promise<CommerceWebhookResult> {
  return db.$transaction(async (transaction) => {
    const processedEvent = await findProcessedEvent(transaction, input.eventId);

    if (processedEvent) {
      return {
        duplicate: true,
        order: processedEvent.order,
        stripeEvent: processedEvent
      };
    }

    const order = await findOrderForSession(transaction, input.session);

    if (!order) {
      const stripeEvent = await recordProcessedEvent(transaction, {
        eventId: input.eventId,
        eventType: input.eventType
      });
      return { duplicate: false, order: null, stripeEvent };
    }

    const canceledOrder =
      order.status === "pending"
        ? await transaction.order.update({
            where: { id: order.id },
            data: { status: "canceled" }
          })
        : order;
    const stripeEvent = await recordProcessedEvent(transaction, {
      eventId: input.eventId,
      eventType: input.eventType,
      orderId: order.id
    });

    return {
      duplicate: false,
      order: canceledOrder,
      stripeEvent
    };
  });
}

export async function refundOrderByPaymentIntent(input: {
  eventId: string;
  eventType: string;
  paymentIntentId: string;
}): Promise<CommerceWebhookResult> {
  return db.$transaction(async (transaction) => {
    const processedEvent = await findProcessedEvent(transaction, input.eventId);

    if (processedEvent) {
      return {
        duplicate: true,
        order: processedEvent.order,
        stripeEvent: processedEvent
      };
    }

    const order = await transaction.order.findUnique({
      where: {
        stripePaymentIntent: input.paymentIntentId
      },
      include: {
        upgrades: true,
        assessment: true
      }
    });

    if (!order) {
      const stripeEvent = await recordProcessedEvent(transaction, {
        eventId: input.eventId,
        eventType: input.eventType
      });

      return { duplicate: false, order: null, stripeEvent };
    }

    const refundedAt = new Date();
    const revokedOrderIds = [order.id];
    const refundedOrder = await transaction.order.update({
      where: { id: order.id },
      data: {
        status: "refunded",
        refundedAt
      }
    });

    await transaction.entitlement.updateMany({
      where: {
        orderId: order.id
      },
      data: {
        status: "revoked",
        revokedAt: refundedAt
      }
    });

    const refundOwnsAssessmentAccess =
      Boolean(
        order.assessment?.stripePaymentIntent &&
        order.assessment.stripePaymentIntent === order.stripePaymentIntent
      ) ||
      Boolean(
        order.assessment?.stripeSessionId &&
        order.assessment.stripeSessionId === order.stripeSessionId
      );

    const revokedEntitlements = await transaction.entitlement.findMany({
      where: {
        orderId: { in: revokedOrderIds },
        assessmentId: { not: null }
      },
      select: {
        assessmentId: true,
        ownsAssessmentAccess: true
      }
    });
    const assessmentIdsToRevoke = [
      ...new Set(
        revokedEntitlements
          .filter((entitlement) => entitlement.ownsAssessmentAccess)
          .map((entitlement) => entitlement.assessmentId)
          .filter((assessmentId): assessmentId is string => {
            if (!assessmentId) return false;
            if (
              assessmentId === order.assessmentId &&
              !refundOwnsAssessmentAccess
            ) {
              return false;
            }
            return true;
          })
      )
    ];

    if (assessmentIdsToRevoke.length) {
      await transaction.assessment.updateMany({
        where: { id: { in: assessmentIdsToRevoke } },
        data: { paymentStatus: "refunded" }
      });
    }

    await transaction.emailJob.updateMany({
      where: {
        orderId: order.id,
        status: "scheduled"
      },
      data: {
        status: "canceled",
        cancelledAt: refundedAt
      }
    });

    const stripeEvent = await recordProcessedEvent(transaction, {
      eventId: input.eventId,
      eventType: input.eventType,
      orderId: order.id
    });

    return { duplicate: false, order: refundedOrder, stripeEvent };
  });
}

export async function claimEntitlement(input: {
  accessToken: string;
  ownerEmail: string;
  assessmentId: string;
  assessmentType: AssessmentType;
}) {
  const ownerEmail = normalizeEmail(input.ownerEmail);
  const consumedAt = new Date();
  return db.$transaction(async (transaction) => {
    const claim = await transaction.entitlement.updateMany({
      where: {
        accessToken: input.accessToken,
        ownerEmail,
        assessmentType: input.assessmentType,
        status: "active",
        consumedAt: null,
        revokedAt: null,
        expiresAt: {
          gt: consumedAt
        }
      },
      data: {
        status: "consumed",
        consumedAt,
        assessmentId: input.assessmentId
      }
    });

    if (claim.count !== 1) {
      return null;
    }

    const claimedEntitlement = await transaction.entitlement.findUnique({
      where: {
        accessToken: input.accessToken
      },
      include: {
        order: true
      }
    });

    await transaction.assessment.update({
      where: { id: input.assessmentId },
      data: {
        paymentStatus: "paid",
        contactName: claimedEntitlement?.order.contactName || undefined,
        companyName: claimedEntitlement?.order.companyName || undefined
      }
    });

    return claimedEntitlement;
  });
}

export async function findOrderByStripeSessionId(stripeSessionId: string) {
  return db.order.findUnique({
    where: { stripeSessionId },
    include: {
      assessment: true,
      entitlements: {
        orderBy: {
          assessmentType: "asc"
        }
      }
    }
  });
}

export async function findOrderByPublicToken(publicToken: string) {
  const order = await db.order.findUnique({
    where: { publicToken }
  });

  if (!order || order.status !== "paid") {
    return null;
  }

  const rootOrderId = order.upgradeFromOrderId || order.id;

  return db.order.findMany({
    where: {
      OR: [{ id: rootOrderId }, { upgradeFromOrderId: rootOrderId }]
    },
    include: {
      assessment: true,
      entitlements: {
        include: {
          assessment: true
        }
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  });
}
