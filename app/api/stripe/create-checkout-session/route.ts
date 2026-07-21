import { NextResponse } from "next/server";

import {
  attachCheckoutSession,
  findAssessmentById,
  findAssessmentByToken
} from "@/lib/assessment-store";
import {
  getDiagnosticConfig,
  normalizeAssessmentType
} from "@/lib/diagnostics";
import {
  getBaseUrl,
  getReportUnlockPriceCents,
  getStripeCurrency,
  getStripeProductName,
  isStripeConfigured
} from "@/lib/payments";
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
            "Ajoutez votre nom et votre entreprise avant de débloquer le rapport complet."
        },
        { status: 409 }
      );
    }

    const assessmentType = normalizeAssessmentType(assessment.assessmentType);
    const diagnostic = getDiagnosticConfig(assessmentType);

    if (assessment.paymentStatus === "paid") {
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
    const successUrl = `${getBaseUrl()}/merci?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${getBaseUrl()}${diagnostic.reportPath(assessment.accessToken)}?cancel=1`;
    const metadata = {
      assessmentId: assessment.id,
      accessToken: assessment.accessToken,
      assessmentType
    };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: assessment.id,
      customer_email: assessment.email,
      locale: "fr-CA",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: getStripeCurrency(),
            unit_amount: getReportUnlockPriceCents(),
            product_data: {
              name: getStripeProductName(assessmentType),
              description: diagnostic.stripeDescription
            }
          }
        }
      ],
      metadata,
      payment_intent_data: {
        metadata
      }
    });

    await attachCheckoutSession(assessment.id, session.id);

    return NextResponse.json({
      url: session.url
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
