import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  FileSpreadsheet,
  Globe2,
  Network,
  Scale,
  ShieldCheck,
  Sparkles,
  Workflow
} from "lucide-react";

import { CtaBand } from "@/components/marketing/cta-band";
import { SectionHeading } from "@/components/marketing/section-heading";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { practicalResources } from "@/lib/resources";
import { buildPageMetadata, getAbsoluteUrl } from "@/lib/seo";
import { getSeoSupportPagesByTheme, seoSupportPages } from "@/lib/seo-content";

const pageDescription =
  "Guides et conseils pratiques en français pour les PME et OBNL du Québec : Excel, Word, Web, automatisation, décisions numériques, cybersécurité et IA.";

const practicalResourceIconByTopic = {
  "excel-word": FileSpreadsheet,
  web: Globe2,
  automatisation: Workflow,
  "decisions-numeriques": Scale
} as const;

const resourceCategories = [
  {
    id: "hygiene-informatique",
    title: "Hygiène informatique",
    description:
      "Relier les données, les accès, les sauvegardes et les outils à des habitudes simples qui renforcent la confiance.",
    landingPath: "/hygiene-informatique",
    landingLabel: "Voir le portrait d’ensemble",
    icon: Sparkles,
    pages: getSeoSupportPagesByTheme("hygiene")
  },
  {
    id: "loi-25",
    title: "Loi 25 et données",
    description:
      "Comprendre les renseignements personnels, les formulaires, la conservation et les demandes sans transformer le sujet en projet démesuré.",
    landingPath: "/loi-25",
    landingLabel: "Découvrir le diagnostic Loi 25",
    icon: ShieldCheck,
    pages: getSeoSupportPagesByTheme("loi25")
  },
  {
    id: "cybersecurite",
    title: "Cybersécurité",
    description:
      "Renforcer les comptes, les sauvegardes, les accès employés, les mises à jour et la capacité de réagir calmement.",
    landingPath: "/cybersecurite",
    landingLabel: "Découvrir le diagnostic cyber",
    icon: Network,
    pages: getSeoSupportPagesByTheme("cybersecurity")
  },
  {
    id: "intelligence-artificielle",
    title: "Intelligence artificielle",
    description:
      "Choisir des usages productifs, protéger les données et garder une validation humaine dans le travail quotidien.",
    landingPath: "/intelligence-artificielle",
    landingLabel: "Découvrir le diagnostic IA",
    icon: BrainCircuit,
    pages: getSeoSupportPagesByTheme("ai")
  }
] as const;

export const metadata: Metadata = buildPageMetadata({
  title: "Ressources numériques pour PME | Guides pratiques",
  description: pageDescription,
  path: "/ressources"
});

export default function ResourcesPage() {
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Ressources ForméducWeb",
    description: pageDescription,
    url: getAbsoluteUrl("/ressources"),
    inLanguage: "fr-CA",
    hasPart: [
      ...seoSupportPages.map((page) => ({
        "@type": "Article",
        name: page.title,
        url: getAbsoluteUrl(page.path)
      })),
      ...practicalResources.map((resource) => ({
        "@type": "LearningResource",
        name: resource.title,
        description: resource.description,
        url: getAbsoluteUrl(`/ressources#${resource.id}`)
      }))
    ]
  };

  return (
    <>
      <JsonLd id="resources-collection-schema" value={collectionSchema} />

      <section className="container py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="min-w-0 space-y-7">
            <Badge variant="secondary">Centre de ressources</Badge>
            <div className="space-y-5">
              <h1 className="max-w-4xl font-heading text-4xl font-semibold tracking-tight sm:text-5xl md:text-7xl">
                Des guides pratiques pour mieux décider et mieux agir.
              </h1>
              <p className="max-w-3xl text-xl leading-9 text-muted-foreground">
                Explorez des explications en français, des gestes concrets et
                des points de départ réalistes pour améliorer vos pratiques
                numériques sans vous perdre dans le jargon.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="w-full whitespace-normal text-center sm:w-auto"
              >
                <Link href="#sujets">
                  Choisir un sujet
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="w-full whitespace-normal text-center sm:w-auto"
              >
                <Link href="/hygiene-informatique">
                  Commencer par l’hygiène informatique
                </Link>
              </Button>
            </div>
          </div>

          <Card className="surface-grid border-primary/20 bg-white/85">
            <CardContent className="p-8 md:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <BookOpen className="h-6 w-6" aria-hidden="true" />
              </div>
              <p className="mt-6 font-heading text-5xl font-semibold tracking-tight text-primary">
                {seoSupportPages.length + practicalResources.length}
              </p>
              <h2 className="mt-2 font-heading text-2xl font-semibold">
                ressources déjà disponibles
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                Chaque guide présente une réponse courte, des actions utiles,
                les limites à connaître et un lien vers le bon prochain pas.
              </p>
              <nav
                aria-label="Sujets des ressources"
                className="mt-6 grid gap-2 sm:grid-cols-2"
              >
                <Link
                  href="#outils-pratiques"
                  className="rounded-2xl border border-border/70 bg-white/80 px-4 py-3 text-sm font-medium transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                >
                  Excel, Word, Web et automatisation
                </Link>
                {resourceCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={`#${category.id}`}
                    className="rounded-2xl border border-border/70 bg-white/80 px-4 py-3 text-sm font-medium transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                  >
                    {category.title}
                  </Link>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>
      </section>

      <section
        id="outils-pratiques"
        className="container scroll-mt-24 py-10 md:py-16"
        aria-labelledby="outils-pratiques-title"
      >
        <SectionHeading
          eyebrow="Fiches pratiques gratuites"
          title="Des gestes utiles à appliquer dès maintenant"
          description="Ces fiches se lisent directement ici. Elles donnent un point de départ honnête et renvoient vers une page existante pour approfondir, sans prétendre offrir un fichier ou un atelier qui n’existe pas."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {practicalResources.map((resource) => {
            const Icon = practicalResourceIconByTopic[resource.topic];

            return (
              <Card
                key={resource.id}
                id={resource.id}
                className="scroll-mt-24 overflow-hidden"
              >
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <Badge variant="secondary">{resource.formatLabel}</Badge>
                  </div>
                  <CardTitle>{resource.title}</CardTitle>
                  <p className="text-sm leading-7 text-muted-foreground">
                    {resource.description}
                  </p>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  <ol className="space-y-3">
                    {resource.steps.map((step, index) => (
                      <li key={step} className="flex gap-3 text-sm leading-7">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                  <Button asChild variant="secondary" className="self-start">
                    <Link href={resource.href}>
                      {resource.actionLabel}
                      <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 rounded-[28px] border border-primary/15 bg-primary/5 p-6">
          <p className="flex gap-3 text-sm leading-7 text-foreground/80">
            <CheckCircle2
              className="mt-1 h-5 w-5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span>
              Toutes les ressources annoncées sur cette page sont consultables
              maintenant. Les nouveaux formats seront nommés seulement
              lorsqu’ils seront réellement disponibles.
            </span>
          </p>
        </div>
      </section>

      <section id="sujets" className="container scroll-mt-24 py-10 md:py-16">
        <SectionHeading
          eyebrow="Bibliothèque"
          title="Choisissez le sujet qui correspond à votre réalité"
          description="Les guides sont regroupés par intention. Vous pouvez lire une réponse précise ou ouvrir la page du thème pour obtenir un portrait plus large."
        />

        <div className="mt-12 space-y-16">
          {resourceCategories.map((category) => {
            const Icon = category.icon;

            return (
              <section
                key={category.id}
                id={category.id}
                className="scroll-mt-24"
                aria-labelledby={`${category.id}-title`}
              >
                <div className="grid gap-6 border-b border-border/70 pb-7 md:grid-cols-[1fr_auto] md:items-end">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/70">
                        {category.pages.length} guide
                        {category.pages.length > 1 ? "s" : ""}
                      </p>
                      <h2
                        id={`${category.id}-title`}
                        className="mt-2 font-heading text-3xl font-semibold tracking-tight"
                      >
                        {category.title}
                      </h2>
                      <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <Button asChild variant="secondary">
                    <Link href={category.landingPath}>
                      {category.landingLabel}
                    </Link>
                  </Button>
                </div>

                <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {category.pages.map((page) => (
                    <Card key={page.path} className="flex h-full flex-col">
                      <CardHeader>
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                          <Clock3 className="h-4 w-4" aria-hidden="true" />
                          <span>{page.readingTime}</span>
                        </div>
                        <CardTitle>{page.shortTitle}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-1 flex-col gap-5">
                        <p className="text-sm leading-7 text-muted-foreground">
                          {page.description}
                        </p>
                        <Button
                          asChild
                          variant="link"
                          className="mt-auto justify-start"
                        >
                          <Link href={page.path}>
                            Lire le guide
                            <ArrowRight
                              className="ml-2 h-4 w-4"
                              aria-hidden="true"
                            />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      <CtaBand
        title="Vous ne savez pas par quel sujet commencer?"
        description="Commencez par le geste qui correspond à votre travail actuel, puis approfondissez avec un guide, une formation ou un accompagnement lorsque le besoin est clair."
        primaryHref="/hygiene-informatique"
        primaryLabel="Voir le portrait d’ensemble"
      />
    </>
  );
}
