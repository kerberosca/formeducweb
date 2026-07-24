import Link from "next/link";
import { Check, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DiagnosticConfig } from "@/lib/diagnostics";

type OfferComparisonProps = {
  diagnostic: DiagnosticConfig;
};

const commonBenefits = [
  "Accès sécurisé pendant 730 jours",
  "Paiement unique, sans abonnement",
  "Remboursement dans les 7 jours avec révocation de l’accès"
];

export function OfferComparison({ diagnostic }: OfferComparisonProps) {
  const plans = [
    {
      name: "Diagnostic gratuit",
      price: "0 $",
      description: "Pour savoir où commencer.",
      items: diagnostic.content.freeDeliverables,
      cta: "Faire le diagnostic",
      href: diagnostic.wizardPath,
      featured: false
    },
    {
      name: "Kit d’exécution 90 jours",
      price: "29 $",
      description: "Pour passer du constat à des actions documentées.",
      items: diagnostic.content.fullReportAdditions,
      cta: "Commencer gratuitement",
      href: diagnostic.wizardPath,
      featured: false
    },
    {
      name: "Trio Hygiène numérique",
      price: "59 $",
      description: "Les trois diagnostics et leurs trois kits.",
      items: [
        "IA, cybersécurité et Loi 25 réunis dans un tableau de bord.",
        "Trois plans d’exécution 90 jours personnalisés.",
        "Tous les gabarits éditables des trois thèmes.",
        "Économie de 28 $ par rapport aux trois kits séparés."
      ],
      cta: "Découvrir le trio",
      href: "/trio-hygiene-numerique",
      featured: true
    }
  ];

  return (
    <div
      className="grid gap-5 lg:grid-cols-3"
      aria-label="Comparaison des offres"
    >
      {plans.map((plan) => (
        <Card
          key={plan.name}
          className={
            plan.featured
              ? "relative border-primary bg-primary/5 shadow-halo"
              : "border-border/80 bg-white/85"
          }
        >
          {plan.featured ? (
            <Badge className="absolute right-5 top-5">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              Meilleure valeur
            </Badge>
          ) : null}
          <CardHeader className="space-y-3">
            <CardTitle className="pr-24 text-xl">{plan.name}</CardTitle>
            <p className="font-heading text-4xl font-semibold text-foreground">
              {plan.price}
              <span className="ml-1 font-sans text-sm font-normal text-muted-foreground">
                CAD
              </span>
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              {plan.description}
            </p>
          </CardHeader>
          <CardContent className="flex h-full flex-col gap-6 p-6 pt-0">
            <ul className="flex-1 space-y-3 text-sm leading-6 text-muted-foreground">
              {plan.items.map((item) => (
                <li key={item} className="flex gap-3">
                  <Check
                    className="mt-1 h-4 w-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Button
              asChild
              variant={plan.featured ? "default" : "secondary"}
              className="w-full"
            >
              <Link href={plan.href}>{plan.cta}</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
      <div className="rounded-2xl border border-border/70 bg-background/70 p-5 text-sm leading-6 text-muted-foreground lg:col-span-3">
        <p>
          Les kits comprennent aussi un crédit de 29 $ valable 90 jours sur un
          accompagnement ForméducWeb admissible. {commonBenefits.join(" · ")}.
        </p>
      </div>
    </div>
  );
}
