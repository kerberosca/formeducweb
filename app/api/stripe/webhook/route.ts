import type Stripe from "stripe";
import { NextResponse } from "next/server";

import { hydrateAssessment, markAssessmentPaid, markAssessmentRefundedByPaymentIntent } from "@/lib/assessment-store";
import { sendReportUnlockedEmails } from "@/lib/email";
import { getBaseUrl } from "@/lib/payments";
import { getStripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
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
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        const assessmentId = session.metadata?.assessmentId || session.client_reference_id;

        if (assessmentId) {
          const assessment = await markAssessmentPaid({
            assessmentId,
            stripeSessionId: session.id,
            stripePaymentIntentId:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id || null
          });

          const hydrated = hydrateAssessment(assessment);
          const reportUrl = `${getBaseUrl()}/loi-25/rapport/${assessment.accessToken}`;

          sendReportUnlockedEmails({
            assessment,
            fullReport: hydrated.fullReport,
            reportUrl
          }).catch((error) => {
            console.error("Unlocked email error", error);
          });
        }

        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId =
          typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;

        if (paymentIntentId) {
          await markAssessmentRefundedByPaymentIntent(paymentIntentId);
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

