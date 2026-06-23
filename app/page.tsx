import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BrainCircuit, CheckCircle2, Network, ShieldCheck } from "lucide-react";

import { SectionHeading } from "@/components/marketing/section-heading";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { diagnosticList } from "@/lib/diagnostics";
import { getAbsoluteUrl } from "@/lib/seo";

const pageDescription =
  "ForméducWeb aide les PME et OBNL du Québec à diagnostiquer et prioriser la Loi 25, la cybersécurité et l'IA en entreprise.";

const iconByType = {
  loi25: ShieldCheck,
  cybersecurity: Network,
  ai: BrainCircuit
};

const proofPoints = [
  "Auto-évaluation gratuite",
  "Score et priorités",
  "Rapport complet optionnel",
  "Accompagnement si utile"
];

const howItWorks = [
  {
    title: "Répondez au diagnostic",
    description: "Un questionnaire guidé par thème pour faire ressortir vos forces et vos angles morts."
  },
  {
    title: "Recevez votre résumé",
    description: "Score global, 3 priorités et plan 30 jours avant de décider si le rapport complet est utile."
  },
  {
    title: "Passez à l'action",
    description: "Vous pouvez rester autonome, acheter le rapport complet ou demander un accompagnement."
  }
];

export const metadata: Metadata = {
  title: "Diagnostics Loi 25, cybersécurité et IA pour PME",
  description: pageDescription,
  alternates: {
    canonical: getAbsoluteUrl("/")
  },
  openGraph: {
    title: "Diagnostics Loi 25, cybersécurité et IA pour PME | ForméducWeb",
    description: pageDescription,
    url: getAbsoluteUrl("/")
  }
};

export default function HomePage() {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: diagnosticList.map((diagnostic, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: diagnostic.label,
      url: getAbsoluteUrl(diagnostic.path)
    }))
  };

  return (
    <>
      <JsonLd id="home-diagnostics-schema" value={serviceSchema} />

      <section className="container py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-7">
            <Badge variant="secondary">Diagnostics pour PME et OBNL du Québec</Badge>
            <div className="space-y-5">
              <h1 className="font-heading text-5xl font-semibold tracking-tight md:text-7xl">
                Voyez clair sur vos risques numériques avant d'investir partout.
              </h1>
              <p className="max-w-2xl text-xl leading-9 text-muted-foreground">
                ForméducWeb transforme trois sujets souvent flous - Loi 25, cybersécurité et IA - en diagnostics simples,
                priorités concrètes et plans d'action utilisables.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="#diagnostics">Choisir un diagnostic</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/contact">Parler à ForméducWeb</Link>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {proofPoints.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-white/70 p-4">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-grid relative overflow-hidden rounded-[40px] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(245,248,255,0.92))] p-8 shadow-halo">
            <div className="absolute right-6 top-6 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              3 offres
            </div>
            <div className="space-y-5">
              <p className="eyebrow">Même démarche, trois angles</p>
              <h2 className="font-heading text-3xl font-semibold tracking-tight">Un questionnaire, un score, un plan</h2>
              <div className="grid gap-4">
                {diagnosticList.map((diagnostic) => {
                  const Icon = iconByType[diagnostic.type];

                  return (
                    <Link
                      key={diagnostic.type}
                      href={diagnostic.path}
                      className="group flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-white/85 px-4 py-4 transition hover:border-primary/40 hover:bg-primary/5"
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span>
                          <span className="block font-medium">{diagnostic.label}</span>
                          <span className="text-sm text-muted-foreground">{diagnostic.themeLabel}</span>
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
                    </Link>
                  );
                })}
              </div>
              <p className="text-sm leading-7 text-muted-foreground">
                Les diagnostics produisent un portrait indicatif. Ils ne remplacent pas un avis professionnel personnalisé
                ou une certification.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="diagnostics" className="container scroll-mt-24 py-10 md:py-14">
        <SectionHeading
          eyebrow="Services"
          title="Trois diagnostics pour avancer dans le bon ordre"
          description="Chaque offre suit la même logique: clarifier, prioriser, puis implanter seulement ce qui compte."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {diagnosticList.map((diagnostic) => {
            const Icon = iconByType[diagnostic.type];

            return (
              <Card key={diagnostic.type} className="flex h-full flex-col">
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle>{diagnostic.label}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-5">
                  <p className="text-sm leading-7 text-muted-foreground">{diagnostic.content.description}</p>
                  <div className="mt-auto flex flex-col gap-3">
                    <Button asChild>
                      <Link href={diagnostic.wizardPath}>Faire l'auto-évaluation</Link>
                    </Button>
                    <Button asChild variant="secondary">
                      <Link href={diagnostic.path}>Voir le service</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="container py-12 md:py-20">
        <SectionHeading
          eyebrow="Comment ca marche"
          title="Un parcours simple en 3 étapes"
          description="Pas besoin d'avoir déjà tout documenté pour commencer."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {howItWorks.map((item, index) => (
            <Card key={item.title}>
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                  {index + 1}
                </div>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-muted-foreground">{item.description}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container py-12 md:py-20">
        <div className="rounded-[32px] border border-primary/20 bg-primary/5 p-8 md:p-10">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="eyebrow">Prochaine étape</p>
              <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                Commencez par le sujet le plus pressant.
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                Si vous hésitez entre les trois, on peut vous aider à choisir le bon point d'entrée en quelques minutes.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
              <Button asChild>
                <Link href="#diagnostics">Voir les diagnostics</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/contact?source=home-choix-diagnostic">Demander conseil</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
