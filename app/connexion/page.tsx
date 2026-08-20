import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Clock3, MailCheck, ShieldCheck } from "lucide-react";

import { auth } from "@/auth";
import { MagicLinkForm } from "@/components/auth/magic-link-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { getSafeAuthCallbackPath } from "@/lib/auth-config";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Connexion à mon espace",
  description:
    "Recevez un lien à usage unique pour accéder à vos formations, achats et certificats FormeducWeb.",
  path: "/connexion",
  index: false
});

type SearchParams = {
  callbackUrl?: string | string[];
  verification?: string | string[];
  error?: string | string[];
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ConnectionPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const callbackUrl = getSafeAuthCallbackPath(first(params.callbackUrl));
  const session = await auth();

  if (session?.user?.id) redirect(callbackUrl);

  const verificationRequested = first(params.verification) === "envoyee";
  const authError = first(params.error);

  return (
    <section className="px-4 py-16 sm:px-6 lg:py-24">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div className="space-y-7">
          <div className="space-y-4">
            <p className="eyebrow">Mon espace</p>
            <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
              Une connexion simple, sans mot de passe
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              Entrez votre adresse courriel. Vous recevrez un lien personnel et
              temporaire pour poursuivre votre formation exactement où vous
              l’avez laissée.
            </p>
          </div>

          <ul className="grid gap-4 text-sm leading-6 text-muted-foreground sm:grid-cols-3 lg:grid-cols-1">
            <li className="flex gap-3">
              <MailCheck
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-primary"
              />
              Aucun mot de passe à mémoriser ou à réutiliser.
            </li>
            <li className="flex gap-3">
              <Clock3
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-primary"
              />
              Le lien est valable 15 minutes et ne fonctionne qu’une fois.
            </li>
            <li className="flex gap-3">
              <ShieldCheck
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-primary"
              />
              Votre progression et vos achats restent liés à votre compte.
            </li>
          </ul>
        </div>

        <Card className="border-primary/20 bg-card/95">
          <CardHeader className="space-y-3 p-7 pb-5 sm:p-8 sm:pb-5">
            <CardTitle className="text-2xl">Recevoir mon lien</CardTitle>
            <CardDescription>
              Utilisez l’adresse associée à vos formations ou à vos achats.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 p-7 pt-0 sm:p-8 sm:pt-0">
            {verificationRequested ? (
              <div
                className="rounded-2xl border border-primary/25 bg-primary/5 p-4 text-sm leading-6"
                role="status"
              >
                Si cette adresse peut être utilisée, un lien de connexion vient
                d’être préparé. Consultez votre boîte de réception.
              </div>
            ) : null}

            {authError ? (
              <div
                className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm leading-6 text-orange-950"
                role="alert"
              >
                Ce lien n’est plus valide. Demandez-en un nouveau ci-dessous.
              </div>
            ) : null}

            <MagicLinkForm callbackUrl={callbackUrl} />
            <p className="text-xs leading-5 text-muted-foreground">
              En demandant un lien, vous acceptez que FormeducWeb utilise cette
              adresse uniquement pour sécuriser l’accès à votre espace et vous
              transmettre les messages liés à vos formations.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
