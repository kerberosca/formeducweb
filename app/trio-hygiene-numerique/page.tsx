import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Network,
  ShieldCheck
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Trio Hygiène numérique — IA, cyber et Loi 25",
  description:
    "Trois diagnostics et trois Kits d’exécution 90 jours pour 59 $ CAD : intelligence artificielle, cybersécurité et Loi 25.",
  path: "/trio-hygiene-numerique"
});

const diagnostics = [
  {
    icon: BrainCircuit,
    name: "Intelligence artificielle",
    description: "Usages, données sensibles, validation humaine et charte IA.",
    href: "/intelligence-artificielle/wizard?offer=trio"
  },
  {
    icon: Network,
    name: "Cybersécurité",
    description: "Accès, sauvegardes, courriels et réflexes d’incident.",
    href: "/cybersecurite/wizard?offer=trio"
  },
  {
    icon: ShieldCheck,
    name: "Loi 25",
    description: "Inventaire des données, incidents, demandes et formulaires.",
    href: "/loi-25/wizard?offer=trio"
  }
];

export default function DigitalHygieneTrioPage() {
  return (
    <main>
      <section className="container py-14 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <Badge>Trio Hygiène numérique</Badge>
          <h1 className="mt-6 font-heading text-5xl font-semibold tracking-tight md:text-7xl">
            Les trois sujets du moment. Un seul plan de travail.
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-xl leading-9 text-muted-foreground">
            Regroupez l’IA, la cybersécurité et la Loi 25 dans un tableau de
            bord. Complétez chaque diagnostic à votre rythme et obtenez les
            trois Kits d’exécution 90 jours pour 59 $ CAD.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/intelligence-artificielle/wizard?offer=trio">
                Commencer par l’IA
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/exemples/intelligence-artificielle">
                Voir un exemple fictif
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container py-10 md:py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {diagnostics.map((diagnostic) => (
            <Card key={diagnostic.name}>
              <CardHeader>
                <diagnostic.icon
                  className="mb-3 h-7 w-7 text-primary"
                  aria-hidden="true"
                />
                <CardTitle>{diagnostic.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-sm leading-7 text-muted-foreground">
                  {diagnostic.description}
                </p>
                <Button asChild variant="secondary" className="w-full">
                  <Link href={diagnostic.href}>Voir le diagnostic</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container pb-16 pt-8 md:pb-24">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="grid gap-8 p-8 md:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="font-heading text-3xl font-semibold">
                59 $ CAD au lieu de 87 $
              </h2>
              <ul className="mt-5 grid gap-3 text-sm leading-6 text-muted-foreground sm:grid-cols-2">
                {[
                  "Trois diagnostics à compléter une fois chacun",
                  "Trois plans 90 jours personnalisés",
                  "Tous les gabarits DOCX, XLSX et PDF",
                  "Accès pendant 730 jours",
                  "Crédit de 29 $ valable 90 jours",
                  "Remboursement sous 7 jours avec révocation de l’accès"
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <CheckCircle2
                      className="mt-1 h-4 w-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Button asChild size="lg">
              <Link href="/intelligence-artificielle/wizard?offer=trio">
                Démarrer gratuitement
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
