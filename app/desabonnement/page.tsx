import type { Metadata } from "next";

import { UnsubscribeForm } from "@/components/forms/unsubscribe-form";
import { Card, CardContent } from "@/components/ui/card";

type PageProps = {
  searchParams?: Promise<{ token?: string | string[] }>;
};

export const metadata: Metadata = {
  title: "Désabonnement",
  robots: { index: false, follow: false }
};

export default async function UnsubscribePage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const token = Array.isArray(raw?.token) ? raw?.token[0] : raw?.token || "";

  return (
    <section className="container py-16 md:py-24">
      <Card className="mx-auto max-w-2xl">
        <CardContent className="space-y-6 p-8 md:p-10">
          <p className="eyebrow">Préférences de courriel</p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight">
            Se désabonner
          </h1>
          {token ? (
            <UnsubscribeForm token={token} />
          ) : (
            <p role="alert" className="text-muted-foreground">
              Ce lien de désabonnement est incomplet. Utilisez le lien reçu dans
              votre courriel ou écrivez à info@formeducweb.ca.
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
