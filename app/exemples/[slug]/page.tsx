import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CheckCircle2 } from "lucide-react";

import { KitPreview } from "@/components/diagnostics/kit-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { diagnosticList, getDiagnosticConfigBySlug } from "@/lib/diagnostics";
import { buildPageMetadata } from "@/lib/seo";

type ExamplePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return diagnosticList.map((diagnostic) => ({ slug: diagnostic.slug }));
}

export async function generateMetadata({
  params
}: ExamplePageProps): Promise<Metadata> {
  const { slug } = await params;
  const diagnostic = getDiagnosticConfigBySlug(slug);
  if (!diagnostic) return {};

  return buildPageMetadata({
    title: `Exemple du Kit d’exécution 90 jours — ${diagnostic.label}`,
    description: `Aperçu fictif du Kit d’exécution 90 jours ${diagnostic.label} de ForméducWeb.`,
    path: `/exemples/${diagnostic.slug}`
  });
}

export default async function ExamplePage({ params }: ExamplePageProps) {
  const { slug } = await params;
  const diagnostic = getDiagnosticConfigBySlug(slug);
  if (!diagnostic) notFound();

  const samplePdfPath = `/exemples/kit-${diagnostic.slug}-exemple.pdf`;

  return (
    <main className="container py-14 md:py-20">
      <div className="mx-auto max-w-5xl">
        <Button asChild variant="link">
          <Link href={diagnostic.path}>
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Retour au diagnostic {diagnostic.shortLabel}
          </Link>
        </Button>

        <div className="mt-8 space-y-6">
          <Badge variant="secondary">
            Exemple fictif — aucune donnée réelle
          </Badge>
          <h1 className="max-w-4xl font-heading text-4xl font-semibold tracking-tight md:text-6xl">
            Aperçu du Kit d’exécution 90 jours — {diagnostic.label}
          </h1>
          <p className="max-w-3xl text-xl leading-9 text-muted-foreground">
            Cet aperçu montre la structure et le niveau de détail du kit. Les
            noms, réponses, scores et situations sont fictifs. Après votre
            diagnostic, le kit est personnalisé avec votre entreprise et vos
            réponses pertinentes.
          </p>
        </div>

        <Card className="mt-10 border-orange-200 bg-orange-50/70">
          <CardContent className="space-y-3 p-6 text-sm leading-7 text-orange-950">
            <p className="font-semibold">
              Ce que cet exemple permet de vérifier
            </p>
            {[
              "La différence entre le résultat gratuit et le plan 90 jours.",
              "Le format des actions, responsables et échéances proposés.",
              "Le type de gabarits éditables inclus dans le kit."
            ].map((item) => (
              <p key={item} className="flex gap-3">
                <CheckCircle2
                  className="mt-1 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </p>
            ))}
          </CardContent>
        </Card>

        <div className="mt-10">
          <KitPreview diagnostic={diagnostic} />
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href={diagnostic.wizardPath}>
              Faire mon diagnostic gratuit
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href={samplePdfPath} target="_blank">
              Voir les 2 pages en PDF
              <ArrowUpRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <p className="mt-6 text-sm leading-6 text-muted-foreground">
          Le diagnostic ne constitue pas un avis juridique, un audit certifié ni
          une garantie de conformité. Le paiement du kit est unique; l’accès est
          offert pendant 730 jours. Un remboursement peut être demandé dans les
          7 jours, avec révocation de l’accès.
        </p>
      </div>
    </main>
  );
}
