import type Stripe from "stripe";
import { NextResponse } from "next/server";

import {
  findAssessmentById,
  hydrateAssessment,
  markAssessmentPaid,
  markAssessmentRefundedByPaymentIntent
} from "@/lib/assessment-store";
import {
  cancelCheckoutSession,
  fulfillCheckoutSession,
  refundOrderByPaymentIntent
} from "@/lib/commerce";
import { db } from "@/lib/db";
import { getDiagnosticConfig } from "@/lib/diagnostics";
import { sendReportUnlockedEmails } from "@/lib/email";
import { areExternalServicesDisabled } from "@/lib/external-services";
import { fulfillCourseCheckoutSession } from "@/lib/lms-commerce";
import { getBaseUrl } from "@/lib/payments";
import { getStripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

async function getCheckoutOrderKind(session: Stripe.Checkout.Session) {
  const metadataOrderId = session.metadata?.orderId || null;
  const clientReferenceId = session.client_reference_id || null;

  if (
    metadataOrderId &&
    clientReferenceId &&
    metadataOrderId !== clientReferenceId
  ) {
    throw new Error("CHECKOUT_ORDER_REFERENCE_MISMATCH");
  }

  const orderId = metadataOrderId || clientReferenceId;
  const order = orderId
    ? await db.order.findUnique({
        where: { id: orderId },
        select: { kind: true, stripeSessionId: true }
      })
    : await db.order.findUnique({
        where: { stripeSessionId: session.id },
        select: { kind: true, stripeSessionId: true }
      });

  // Preserve the historical assessment-only fallback for old Stripe sessions
  // that predate Order records. New sessions always carry an orderId.
  if (!order && !metadataOrderId) return "assessment" as const;
  if (!order) throw new Error("CHECKOUT_ORDER_NOT_FOUND");
  if (order.stripeSessionId && order.stripeSessionId !== session.id) {
    throw new Error("CHECKOUT_SESSION_ORDER_MISMATCH");
  }
  if (order.kind !== "assessment" && order.kind !== "course") {
    throw new Error("CHECKOUT_ORDER_KIND_INVALID");
  }

  return order.kind;
}

export async function POST(request: Request) {
  if (areExternalServicesDisabled()) {
    return NextResponse.json(
      { error: "Services externes désactivés sur cet environnement." },
      { status: 503 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      {
        error: "Webhook Stripe non configuré."
      },
      { status: 400 }
    );
  }

  try {
    const stripe = getStripeClient();
    const rawBody = await request.text();
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );

    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderKind = await getCheckoutOrderKind(session);
        const commerceResult =
          orderKind === "course"
            ? await fulfillCourseCheckoutSession({
                eventId: event.id,
                eventType: event.type,
                session
              })
            : await fulfillCheckoutSession({
                eventId: event.id,
                eventType: event.type,
                session
              });

        if (commerceResult.duplicate) {
          break;
        }

        if (
          session.payment_status !== "paid" &&
          event.type !== "checkout.session.async_payment_succeeded"
        ) {
          break;
        }

        const assessmentId =
          commerceResult.order?.assessmentId ||
          session.metadata?.assessmentId ||
          (!session.metadata?.orderId ? session.client_reference_id : null);

        if (assessmentId) {
          let assessment = await findAssessmentById(assessmentId);

          if (
            assessment &&
            !commerceResult.order &&
            assessment.paymentStatus !== "paid"
          ) {
            assessment = await markAssessmentPaid({
              assessmentId,
              stripeSessionId: session.id,
              stripePaymentIntentId:
                typeof session.payment_intent === "string"
                  ? session.payment_intent
                  : session.payment_intent?.id || null
            });
          }

          if (
            assessment &&
            commerceResult.order?.productCode !== "trio_upgrade"
          ) {
            const hydrated = hydrateAssessment(assessment);
            const diagnostic = getDiagnosticConfig(hydrated.assessmentType);
            const reportUrl =
              commerceResult.order?.productCode === "digital_hygiene_trio"
                ? `${getBaseUrl()}/trio/${commerceResult.order.publicToken}`
                : `${getBaseUrl()}${diagnostic.reportPath(assessment.accessToken)}`;

            sendReportUnlockedEmails({
              assessment,
              assessmentType: hydrated.assessmentType,
              fullReport: hydrated.fullReport,
              reportUrl,
              productCode: commerceResult.order?.productCode
            }).catch((error) => {
              console.error("Unlocked email error", error);
            });
          }
        }

        break;
      }
      case "checkout.session.expired": {
        await cancelCheckoutSession({
          eventId: event.id,
          eventType: event.type,
          session: event.data.object as Stripe.Checkout.Session
        });
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id;
        const metadataOrderId = charge.metadata?.orderId?.trim() || null;

        if (paymentIntentId) {
          const commerceResult = await refundOrderByPaymentIntent({
            eventId: event.id,
            eventType: event.type,
            paymentIntentId,
            orderId: metadataOrderId
          });

          if (!commerceResult.order && !commerceResult.duplicate) {
            await markAssessmentRefundedByPaymentIntent(paymentIntentId);
          }
        }

        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error", error);
    return NextResponse.json(
      {
        error: "La signature Stripe est invalide."
      },
      { status: 400 }
    );
  }
}
