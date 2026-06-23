import type { Metadata } from "next";
import Link from "next/link";

import { MetaPurchaseTracker } from "@/components/analytics/meta-purchase-tracker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { findAssessmentById, findAssessmentByStripeSessionId, markAssessmentPaid } from "@/lib/assessment-store";
import { getDiagnosticConfig, normalizeAssessmentType } from "@/lib/diagnostics";
import { checkoutSearchParamsSchema } from "@/lib/schemas";
import { getStripeClient } from "@/lib/stripe";

type MerciSearchParamsInput = {
  session_id?: string | string[];
  source?: string | string[];
};

type MerciPageProps = {
  searchParams?: Promise<MerciSearchParamsInput> | MerciSearchParamsInput;
};

function normalizeMerciSearchParams(raw: MerciSearchParamsInput | undefined) {
  const pick = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

  return {
    session_id: pick(raw?.session_id),
    source: pick(raw?.source)
  };
}

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Merci",
  robots: {
    index: false,
    follow: false,
    nocache: true
  }
};

export default async function MerciPage({ searchParams }: MerciPageProps) {
  const raw = await Promise.resolve(searchParams ?? {});
  const parsed = checkoutSearchParamsSchema.safeParse(normalizeMerciSearchParams(raw));
  const resolved = parsed.success ? parsed.data : {};
  const isContact = resolved.source === "contact";

  if (isContact) {
    return (
      <section className="container py-16 md:py-24">
        <Card className="mx-auto max-w-3xl">
          <CardContent className="space-y-6 p-10 text-center">
            <p className="eyebrow">Merci</p>
            <h1 className="font-heading text-4xl font-semibold tracking-tight md:text-5xl">Votre message a bien été reçu.</h1>
            <p className="text-lg leading-8 text-muted-foreground">
              On reviendra vers vous rapidement avec une prochaine étape adaptée à votre contexte.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/services">Voir les diagnostics</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/contact">Retour au contact</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  let reportHref: string | null = null;
  let serviceHref = "/services";
  let serviceLabel = "services";
  let purchaseContentName = "Rapport complet";
  let purchaseContentCategory = "Diagnostic";
  let paymentConfirmed = false;
  let customerName = "";
  let companyName = "";
  const purchaseValueCentsRaw = Number.parseInt(process.env.STRIPE_PRICE_CENTS || "", 10);
  const purchaseValueCents = Number.isFinite(purchaseValueCentsRaw) ? purchaseValueCentsRaw : undefined;
  const purchaseCurrency = (process.env.STRIPE_CURRENCY || "cad").toUpperCase();

  if (resolved.session_id && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = getStripeClient();
      const session = await stripe.checkout.sessions.retrieve(resolved.session_id);
      const assessmentId = session.metadata?.assessmentId || session.client_reference_id || undefined;
      let assessment = assessmentId ? await findAssessmentById(assessmentId) : await findAssessmentByStripeSessionId(session.id);

      if (
        assessment &&
        (session.payment_status === "paid" || session.status === "complete") &&
        assessment.paymentStatus !== "paid"
      ) {
        assessment = await markAssessmentPaid({
          assessmentId: assessment.id,
          stripeSessionId: session.id,
          stripePaymentIntentId:
            typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id || null
        });
      }

      if (assessment && (assessment.paymentStatus === "paid" || session.payment_status === "paid")) {
        const diagnostic = getDiagnosticConfig(normalizeAssessmentType(assessment.assessmentType));
        paymentConfirmed = true;
        reportHref = diagnostic.reportPath(assessment.accessToken);
        serviceHref = diagnostic.path;
        serviceLabel = diagnostic.label;
        purchaseContentName = diagnostic.stripeProductName;
        purchaseContentCategory = diagnostic.metaContentCategory;
        customerName = assessment.contactName;
        companyName = assessment.companyName;
      }
    } catch (error) {
      console.error("Merci page Stripe error", error);
    }
  }

  return (
    <section className="container py-16 md:py-24">
      <Card className="mx-auto max-w-3xl">
        <CardContent className="space-y-6 p-10 text-center">
          {paymentConfirmed && resolved.session_id ? (
            <MetaPurchaseTracker
              sessionId={resolved.session_id}
              valueCents={purchaseValueCents}
              currency={purchaseCurrency}
              contentName={purchaseContentName}
              contentCategory={purchaseContentCategory}
            />
          ) : null}
          <p className="eyebrow">Merci</p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight md:text-5xl">
            {paymentConfirmed ? "Paiement confirme" : "Votre paiement est en cours de validation"}
          </h1>
          <p className="text-lg leading-8 text-muted-foreground">
            {paymentConfirmed
              ? `${customerName ? `${customerName}, ` : ""}votre accès complet est maintenant activé${companyName ? ` pour ${companyName}` : ""}.`
              : "Nous finalisons votre accès. Si la page ne se met pas à jour après quelques secondes, rechargez-la ou écrivez-nous."}
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            {reportHref ? (
              <Button asChild>
                <Link href={reportHref}>Voir mon rapport complet</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/contact?source=paiement-diagnostic">Nous joindre</Link>
              </Button>
            )}
            <Button asChild variant="secondary">
              <Link href={serviceHref}>Retour au service {serviceLabel}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
