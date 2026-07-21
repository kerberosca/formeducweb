import type { Metadata } from "next";
import {
  CheckCircle2,
  ClipboardCheck,
  ListChecks,
  ShieldCheck
} from "lucide-react";

import { CtaBand } from "@/components/marketing/cta-band";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { aboutValues } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

const description =
  "Découvrez l’approche ForméducWeb: des diagnostics clairs pour aider les PME et OBNL du Québec à prioriser leurs pratiques Loi 25, cybersécurité et IA.";

export const metadata: Metadata = buildPageMetadata({
  title: "À propos de ForméducWeb",
  description,
  path: "/a-propos"
});

const method = [
  {
    icon: ClipboardCheck,
    title: "1. Observer",
    description:
      "Un diagnostic structuré transforme les pratiques actuelles en un portrait compréhensible."
  },
  {
    icon: ListChecks,
    title: "2. Prioriser",
    description:
      "Les écarts sont classés pour faire ressortir les gestes qui ont le plus d’impact maintenant."
  },
  {
    icon: ShieldCheck,
    title: "3. Agir",
    description:
      "Un plan de 30 jours aide à avancer progressivement, seul ou avec un accompagnement humain."
  }
];

export default function AboutPage() {
  return (
    <>
      <section className="container py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-start">
          <div className="space-y-6">
            <Badge variant="secondary">Basé au Québec</Badge>
            <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              Rendre les décisions numériques plus simples à comprendre et à
              appliquer.
            </h1>
            <p className="max-w-2xl text-xl leading-9 text-muted-foreground">
              ForméducWeb aide les PME et OBNL à faire le point sur la Loi 25,
              la cybersécurité et l’intelligence artificielle sans les noyer
              dans le jargon ni leur promettre une conformité magique.
            </p>
          </div>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="space-y-4 p-8 text-sm leading-7 text-muted-foreground">
              <p className="font-medium text-foreground">
                Une approche volontairement sobre
              </p>
              <p>
                Les diagnostics fournissent un portrait indicatif, des priorités
                et un plan d’action. Ils ne remplacent ni un avis juridique, ni
                un audit de sécurité approfondi, ni une certification.
              </p>
              <p>
                {siteConfig.territory} · {siteConfig.email}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container py-10 md:py-16">
        <SectionHeading
          eyebrow="Méthode"
          title="Observer, prioriser, agir"
          description="Le même fil conducteur est utilisé dans les trois diagnostics pour rendre les résultats comparables et actionnables."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {method.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <item.icon className="mb-3 h-6 w-6 text-primary" />
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-muted-foreground">
                {item.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container py-10 md:py-16">
        <SectionHeading
          eyebrow="Engagements"
          title="Comment ForméducWeb travaille"
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {aboutValues.map((value) => (
            <Card key={value.title}>
              <CardHeader>
                <CardTitle>{value.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-muted-foreground">
                {value.description}
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="mt-6">
          <CardContent className="grid gap-4 p-8 text-sm leading-7 text-muted-foreground md:grid-cols-2">
            {[
              "Aucune preuve, certification ou garantie n’est inventée.",
              "Les limites du diagnostic sont affichées avant et après le questionnaire.",
              "Le résultat gratuit est visible avant de demander un courriel.",
              "L’accompagnement reste facultatif et adapté au contexte réel."
            ].map((item) => (
              <p key={item} className="flex gap-3">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" />
                {item}
              </p>
            ))}
          </CardContent>
        </Card>
      </section>

      <CtaBand
        title="Vous voulez une lecture claire de votre situation?"
        description="Commencez par un diagnostic gratuit ou écrivez-nous pour expliquer votre contexte."
      />
    </>
  );
}
