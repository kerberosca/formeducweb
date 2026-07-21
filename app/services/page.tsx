import type { Metadata } from "next";
import Link from "next/link";
import {
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Network,
  ShieldCheck
} from "lucide-react";

import { SectionHeading } from "@/components/marketing/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { diagnosticList } from "@/lib/diagnostics";
import { getReportUnlockPriceLabel } from "@/lib/payments";
import { buildPageMetadata } from "@/lib/seo";
import { getWizardData } from "@/lib/wizard";

const pageDescription =
  "Comparez les diagnostics Loi 25, cybersécurité et IA pour PME au Québec: durée, questions, résultat gratuit et rapport complet.";

const iconByType = {
  loi25: ShieldCheck,
  cybersecurity: Network,
  ai: BrainCircuit
};

export const metadata: Metadata = buildPageMetadata({
  title: "Comparer les diagnostics Loi 25, cybersécurité et IA",
  description: pageDescription,
  path: "/services"
});

export default function ServicesPage() {
  const priceLabel = getReportUnlockPriceLabel();

  return (
    <section className="container py-16 md:py-24">
      <SectionHeading
        eyebrow="Comparer les diagnostics"
        title="Choisissez le diagnostic qui répond à votre priorité actuelle"
        description="Les trois parcours donnent un score immédiat, 3 priorités et un plan de 30 jours sans exiger de courriel. Le rapport complet reste toujours optionnel."
        titleLevel="h1"
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {diagnosticList.map((diagnostic) => {
          const Icon = iconByType[diagnostic.type];
          const questionCount = getWizardData(diagnostic.type).questions.length;

          return (
            <Card
              key={diagnostic.type}
              className="flex h-full flex-col overflow-hidden"
            >
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </span>
                  <Badge variant="secondary">Gratuit pour commencer</Badge>
                </div>
                <CardTitle>{diagnostic.label}</CardTitle>
                <p className="text-sm leading-7 text-muted-foreground">
                  {diagnostic.content.description}
                </p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-6">
                <dl className="grid gap-3 rounded-2xl border border-border/70 bg-muted/25 p-4 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="flex items-center gap-2 text-muted-foreground">
                      <Clock3 className="h-4 w-4" /> Durée
                    </dt>
                    <dd className="font-medium">Environ 10 min</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">Questions</dt>
                    <dd className="font-medium">{questionCount}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">Rapport complet</dt>
                    <dd className="font-medium">{priceLabel}</dd>
                  </div>
                </dl>

                <div>
                  <p className="mb-3 text-sm font-semibold">Pour qui</p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {diagnostic.content.audience}
                  </p>
                </div>

                <div>
                  <p className="mb-3 text-sm font-semibold">Résultat gratuit</p>
                  <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                    {diagnostic.content.freeDeliverables
                      .slice(0, 4)
                      .map((item) => (
                        <li key={item} className="flex gap-2">
                          <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" />
                          <span>{item}</span>
                        </li>
                      ))}
                  </ul>
                </div>

                <div className="mt-auto grid gap-3">
                  <Button asChild>
                    <Link href={diagnostic.wizardPath}>
                      Commencer gratuitement
                    </Link>
                  </Button>
                  <Button asChild variant="secondary">
                    <Link href={diagnostic.path}>Voir les détails</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
