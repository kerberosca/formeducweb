import { NextResponse } from "next/server";

import {
  attachCheckoutSession,
  findAssessmentById,
  findAssessmentByToken
} from "@/lib/assessment-store";
import {
  attachStripeSessionToOrder,
  createPendingOrder,
  getProduct,
  hasActiveAssessmentAccess,
  resolveProductCode,
  validateProductForAssessment
} from "@/lib/commerce";
import {
  getDiagnosticConfig,
  normalizeAssessmentType
} from "@/lib/diagnostics";
import { getBaseUrl, isStripeConfigured } from "@/lib/payments";
import { checkRateLimit } from "@/lib/rate-limit";
import { checkoutSessionPayloadSchema } from "@/lib/schemas";
import { getStripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request, {
    bucket: "checkout-session-post",
    limit: 10,
    windowMs: 15 * 60 * 1000
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error:
          "Trop de tentatives de paiement. Veuillez patienter avant de réessayer."
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds)
        }
      }
    );
  }

  try {
    const json = await request.json();
    const parsed = checkoutSessionPayloadSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "La demande de paiement est invalide.",
          details: parsed.error.flatten()
        },
        { status: 400 }
      );
    }

    const assessment = parsed.data.assessmentId
      ? await findAssessmentById(parsed.data.assessmentId)
      : await findAssessmentByToken(parsed.data.accessToken as string);

    if (!assessment) {
      return NextResponse.json(
        {
          error: "Le rapport demandé est introuvable."
        },
        { status: 404 }
      );
    }

    if (
      parsed.data.accessToken &&
      assessment.accessToken !== parsed.data.accessToken
    ) {
      return NextResponse.json(
        {
          error: "Le rapport demandé est introuvable."
        },
        { status: 404 }
      );
    }

    if (!assessment.contactName?.trim() || !assessment.companyName?.trim()) {
      return NextResponse.json(
        {
          code: "PROFILE_REQUIRED",
          error:
            "Ajoutez votre nom et votre entreprise avant d’obtenir le Kit d’exécution 90 jours."
        },
        { status: 409 }
      );
    }

    const assessmentType = normalizeAssessmentType(assessment.assessmentType);
    const diagnostic = getDiagnosticConfig(assessmentType);
    const productCode = resolveProductCode(json.productCode, assessmentType);

    try {
      validateProductForAssessment(productCode, assessmentType);
    } catch {
      return NextResponse.json(
        {
          error:
            "Ce produit ne correspond pas au diagnostic que vous avez complété."
        },
        { status: 400 }
      );
    }

    const hasPaidAccess = await hasActiveAssessmentAccess(assessment);

    if (
      hasPaidAccess &&
      productCode !== "digital_hygiene_trio" &&
      productCode !== "trio_upgrade"
    ) {
      return NextResponse.json({
        reportUrl: `${getBaseUrl()}${diagnostic.reportPath(assessment.accessToken)}`
      });
    }

    if (!isStripeConfigured()) {
      return NextResponse.json(
        {
          error:
            "Stripe n'est pas configuré sur cet environnement. Ajoutez vos clés avant de lancer le paiement."
        },
        { status: 503 }
      );
    }

    const stripe = getStripeClient();
    let order;

    try {
      order = await createPendingOrder({
        assessment,
        productCode
      });
    } catch (error) {
      if (error instanceof Error && error.message === "UPGRADE_NOT_ELIGIBLE") {
        return NextResponse.json(
          {
            code: "UPGRADE_NOT_ELIGIBLE",
            error:
              "L’amélioration à 30 $ exige un achat individuel actif associé à ce diagnostic."
          },
          { status: 409 }
        );
      }
      if (
        error instanceof Error &&
        error.message === "BUNDLE_ALREADY_PURCHASED"
      ) {
        return NextResponse.json(
          {
            code: "BUNDLE_ALREADY_PURCHASED",
            error:
              "Un Trio actif est déjà associé à ce courriel. Utilisez son tableau de bord."
          },
          { status: 409 }
        );
      }
      if (
        error instanceof Error &&
        error.message === "BUNDLE_CHECKOUT_IN_PROGRESS"
      ) {
        return NextResponse.json(
          {
            code: "BUNDLE_CHECKOUT_IN_PROGRESS",
            error:
              "Un paiement Trio est déjà en cours pour ce courriel. Reprenez le premier parcours ou attendez l’expiration de sa session Stripe."
          },
          { status: 409 }
        );
      }

      throw error;
    }

    const product = getProduct(productCode);
    const successUrl = `${getBaseUrl()}/merci?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${getBaseUrl()}${diagnostic.reportPath(assessment.accessToken)}?cancel=1${
      productCode === "digital_hygiene_trio" ? "&offer=trio" : ""
    }`;
    const metadata = {
      orderId: order.id,
      assessmentId: assessment.id,
      accessToken: assessment.accessToken,
      assessmentType,
      productCode
    };

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
        client_reference_id: order.id,
        customer_email: assessment.email,
        locale: "fr-CA",
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "cad",
              unit_amount: product.amountCents,
              product_data: {
                name: product.name,
                description: product.description
              }
            }
          }
        ],
        metadata,
        payment_intent_data: {
          metadata
        }
      },
      {
        idempotencyKey: `checkout-order-${order.id}`
      }
    );

    if (assessment.paymentStatus !== "paid") {
      await attachCheckoutSession(assessment.id, session.id);
    }
    await attachStripeSessionToOrder(order.id, session.id);

    return NextResponse.json({
      url: session.url,
      orderToken: order.publicToken
    });
  } catch (error) {
    console.error("Stripe checkout session error", error);
    return NextResponse.json(
      {
        error: "Impossible de créer la session de paiement pour le moment."
      },
      { status: 500 }
    );
  }
}
