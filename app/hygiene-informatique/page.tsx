import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Network,
  ShieldCheck,
  Sparkles
} from "lucide-react";

import { CtaBand } from "@/components/marketing/cta-band";
import { SectionHeading } from "@/components/marketing/section-heading";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildPageMetadata, getAbsoluteUrl } from "@/lib/seo";
import { getSeoSupportPagesByTheme } from "@/lib/seo-content";

const pageDescription =
  "Sécurité informatique PME au Québec: reliez Loi 25, cybersécurité, sauvegardes, accès et IA dans une démarche d'hygiène numérique positive.";

const hubUrl = getAbsoluteUrl("/hygiene-informatique");

const clusters = [
  {
    title: "Loi 25",
    description:
      "Mieux connaître les données, clarifier les formulaires et préparer les demandes de confidentialité.",
    href: "/loi-25",
    wizardHref: "/loi-25/wizard",
    icon: ShieldCheck,
    pages: getSeoSupportPagesByTheme("loi25")
  },
  {
    title: "Cybersécurité",
    description:
      "Renforcer les accès, sauvegardes, courriels, mises à jour et réflexes d'incident.",
    href: "/cybersecurite",
    wizardHref: "/cybersecurite/wizard",
    icon: Network,
    pages: getSeoSupportPagesByTheme("cybersecurity")
  },
  {
    title: "Intelligence artificielle",
    description:
      "Adopter l'IA avec des règles simples pour les données, les outils et la validation humaine.",
    href: "/intelligence-artificielle",
    wizardHref: "/intelligence-artificielle/wizard",
    icon: BrainCircuit,
    pages: getSeoSupportPagesByTheme("ai")
  }
];

const hygienePages = getSeoSupportPagesByTheme("hygiene");

export const metadata: Metadata = buildPageMetadata({
  title: "Sécurité informatique PME | Loi 25, cybersécurité et IA",
  description: pageDescription,
  path: "/hygiene-informatique"
});

export default function HygieneInformatiquePage() {
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Hygiène informatique pour PME au Québec",
    description: pageDescription,
    url: hubUrl,
    inLanguage: "fr-CA",
    hasPart: [
      ...clusters.map((cluster) => ({
        "@type": "WebPage",
        name: cluster.title,
        url: getAbsoluteUrl(cluster.href)
      })),
      ...hygienePages.map((page) => ({
        "@type": "Article",
        name: page.title,
        url: getAbsoluteUrl(page.path)
      }))
    ]
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: getAbsoluteUrl("/")
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Hygiène informatique",
        item: hubUrl
      }
    ]
  };

  return (
    <>
      <JsonLd
        id="hygiene-informatique-collection-schema"
        value={collectionSchema}
      />
      <JsonLd
        id="hygiene-informatique-breadcrumb-schema"
        value={breadcrumbSchema}
      />

      <section className="container py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-7">
            <nav
              aria-label="Fil d'Ariane"
              className="flex flex-wrap gap-2 text-sm text-muted-foreground"
            >
              <Link href="/" className="transition hover:text-primary">
                Accueil
              </Link>
              <span>/</span>
              <span className="text-foreground">Hygiène informatique</span>
            </nav>
            <Badge variant="secondary">Hygiène informatique PME</Badge>
            <div className="space-y-5">
              <h1 className="font-heading text-5xl font-semibold tracking-tight md:text-7xl">
                Sécurité informatique PME: relier Loi 25, cybersécurité et IA.
              </h1>
              <p className="max-w-2xl text-xl leading-9 text-muted-foreground">
                L'hygiène informatique relie la Loi 25, la cybersécurité et l'IA
                dans une démarche positive: mieux connaître vos données,
                protéger les accès, travailler plus clairement et adopter les
                bons outils sans improviser.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/#diagnostics">
                  Choisir un diagnostic
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/contact?source=hygiene-informatique">
                  Parler à ForméducWeb
                </Link>
              </Button>
            </div>
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <CardTitle>Réponse courte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 text-sm leading-7 text-muted-foreground">
              <p>
                Une bonne hygiène informatique, c'est l'ensemble des habitudes
                qui gardent les données, les accès, les sauvegardes, les outils
                et les usages IA sous contrôle.
              </p>
              <p>
                Pour une PME, c'est aussi un avantage: moins de confusion, moins
                de données inutiles, moins de risques courants et plus de
                confiance dans les échanges avec les clients.
              </p>
              <div className="grid gap-3">
                {[
                  "Données mieux connues",
                  "Accès mieux justifiés",
                  "IA mieux encadrée"
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-border/70 bg-white/75 p-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container py-10 md:py-16">
        <SectionHeading
          eyebrow="Les 3 piliers"
          title="Trois thèmes, une même discipline numérique"
          description="Chaque pilier mène vers un diagnostic gratuit et des contenus pratiques pour avancer dans le bon ordre."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {clusters.map((cluster) => {
            const Icon = cluster.icon;

            return (
              <Card key={cluster.title} className="flex h-full flex-col">
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle>{cluster.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-5">
                  <p className="text-sm leading-7 text-muted-foreground">
                    {cluster.description}
                  </p>
                  <div className="space-y-2">
                    {cluster.pages.slice(0, 4).map((page) => (
                      <Link
                        key={page.path}
                        href={page.path}
                        className="block rounded-2xl border border-border/70 bg-white/75 px-4 py-3 text-sm font-medium transition hover:border-primary/40 hover:bg-primary/5"
                      >
                        {page.shortTitle}
                      </Link>
                    ))}
                  </div>
                  <div className="mt-auto flex flex-col gap-3">
                    <Button asChild>
                      <Link href={cluster.wizardHref}>Faire le diagnostic</Link>
                    </Button>
                    <Button asChild variant="secondary">
                      <Link href={cluster.href}>Voir le pilier</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="container py-10 md:py-16">
        <SectionHeading
          eyebrow="Guides transversaux"
          title="Commencer par les gestes qui créent de la confiance"
          description="Ces guides relient les trois thèmes pour donner une vue d'ensemble aux dirigeants de PME et OBNL."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {hygienePages.map((page) => (
            <Card key={page.path} className="flex h-full flex-col">
              <CardHeader>
                <CardTitle>{page.shortTitle}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-5">
                <p className="text-sm leading-7 text-muted-foreground">
                  {page.description}
                </p>
                <Button asChild variant="secondary" className="mt-auto">
                  <Link href={page.path}>Lire le guide</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <CtaBand
        title="La meilleure stratégie commence par un portrait clair"
        description="Choisissez le diagnostic le plus pertinent pour votre PME: Loi 25, cybersécurité ou IA. Vous obtiendrez un score, des priorités et une prochaine étape."
      />
    </>
  );
}
