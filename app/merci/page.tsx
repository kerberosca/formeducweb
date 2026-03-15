import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { findAssessmentById, findAssessmentByStripeSessionId, markAssessmentPaid } from "@/lib/assessment-store";
import { checkoutSearchParamsSchema } from "@/lib/schemas";
import { getStripeClient } from "@/lib/stripe";

type MerciPageProps = {
  searchParams?: Promise<{ session_id?: string; source?: string }>;
};

export const dynamic = "force-dynamic";

export default async function MerciPage({ searchParams }: MerciPageProps) {
  const resolved = checkoutSearchParamsSchema.parse((await searchParams) ?? {});
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
                <Link href="/loi-25/wizard">Faire mon auto-évaluation Loi 25</Link>
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
  let paymentConfirmed = false;
  let customerName = "";
  let companyName = "";

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
        paymentConfirmed = true;
        reportHref = `/loi-25/rapport/${assessment.accessToken}`;
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
          <p className="eyebrow">Merci</p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight md:text-5xl">
            {paymentConfirmed ? "Paiement confirmé" : "Votre paiement est en cours de validation"}
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
                <Link href="/contact?source=paiement-loi-25">Nous joindre</Link>
              </Button>
            )}
            <Button asChild variant="secondary">
              <Link href="/loi-25">Retour au service Loi 25</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
