import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { attachStripeSessionToOrder } from "@/lib/commerce";
import { db } from "@/lib/db";
import {
  createPendingCourseOrder,
  getActiveCourseAccess
} from "@/lib/lms-commerce";
import { getBaseUrl, isStripeConfigured } from "@/lib/payments";
import { checkRateLimit } from "@/lib/rate-limit";
import { getStripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

const checkoutSchema = z
  .object({
    courseId: z.string().cuid().optional(),
    courseSlug: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional()
  })
  // Values such as amount, currency and customer email are intentionally
  // discarded: those authoritative fields are always read from the database.
  .strip()
  .refine((value) => Boolean(value.courseId) !== Boolean(value.courseSlug), {
    message: "Fournissez un seul identifiant de formation."
  });

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request, {
    bucket: "lms-course-checkout",
    limit: 8,
    windowMs: 15 * 60 * 1000
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez dans quelques minutes." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) }
      }
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const parsed = checkoutSchema.safeParse(
    await request.json().catch(() => null)
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "La demande de paiement est invalide." },
      { status: 400 }
    );
  }

  const [user, course] = await Promise.all([
    db.user.findUnique({ where: { id: session.user.id } }),
    parsed.data.courseId
      ? db.course.findUnique({ where: { id: parsed.data.courseId } })
      : db.course.findUnique({ where: { slug: parsed.data.courseSlug } })
  ]);

  if (!user?.isActive || !user.email || !user.emailVerified) {
    return NextResponse.json(
      { error: "Ce compte ne peut pas effectuer cet achat." },
      { status: 403 }
    );
  }
  if (!course) {
    return NextResponse.json(
      { error: "Formation introuvable." },
      { status: 404 }
    );
  }
  if (
    course.status !== "published" ||
    course.offer !== "paid" ||
    !course.isPurchasable ||
    !course.priceCents ||
    course.priceCents <= 0
  ) {
    return NextResponse.json(
      {
        code: "COURSE_NOT_PURCHASABLE",
        error: "Cette formation n’est pas encore offerte à l’achat."
      },
      { status: 409 }
    );
  }

  if (await getActiveCourseAccess(user.id, course.id)) {
    return NextResponse.json({
      alreadyOwned: true,
      url: `${getBaseUrl()}/mon-espace`
    });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        error: "Le paiement Stripe n’est pas configuré sur cet environnement."
      },
      { status: 503 }
    );
  }

  try {
    const pending = await createPendingCourseOrder({
      userId: user.id,
      courseId: course.id
    });
    if (pending.alreadyOwned || !pending.order) {
      return NextResponse.json({
        alreadyOwned: true,
        url: `${getBaseUrl()}/mon-espace`
      });
    }

    const metadata = {
      orderKind: "course",
      orderId: pending.order.id,
      userId: user.id,
      courseId: course.id,
      courseSlug: course.slug
    };
    const stripe = getStripeClient();
    const checkoutSession = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        success_url: `${getBaseUrl()}/mon-espace?paiement=confirme`,
        cancel_url: `${getBaseUrl()}/formations/${course.slug}?paiement=annule`,
        client_reference_id: pending.order.id,
        customer_email: user.email,
        locale: "fr-CA",
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: course.currency.toLowerCase(),
              unit_amount: course.priceCents,
              product_data: {
                name: course.title,
                description: course.description
              }
            }
          }
        ],
        metadata,
        payment_intent_data: { metadata }
      },
      { idempotencyKey: `checkout-course-order-${pending.order.id}` }
    );

    await attachStripeSessionToOrder(pending.order.id, checkoutSession.id);

    return NextResponse.json({
      url: checkoutSession.url,
      orderToken: pending.order.publicToken
    });
  } catch (error) {
    console.error("LMS course checkout error", error);
    return NextResponse.json(
      { error: "Impossible de créer la session de paiement." },
      { status: 500 }
    );
  }
}
