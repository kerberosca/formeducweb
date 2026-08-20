import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Accessibility,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  CircleDollarSign,
  Eye,
  GraduationCap,
  Handshake,
  ShieldCheck,
  SlidersHorizontal,
  Target
} from "lucide-react";

import { SectionHeading } from "@/components/marketing/section-heading";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  brandCommitments,
  brandExpertise,
  brandFoundation,
  brandMethod,
  brandOrigin,
  brandValues,
  founderProfile,
  hasCompleteFounderProfile,
  trainingRole
} from "@/lib/brand";
import { buildPageMetadata, getAbsoluteUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

const pageDescription =
  "Découvrez la mission, la vision, les valeurs et la méthode de ForméducWeb pour rendre le numérique plus clair, accessible et abordable au Québec.";

const valueIconById = {
  simplicite: SlidersHorizontal,
  accessibilite: Accessibility,
  autonomie: BookOpenCheck,
  transparence: Eye,
  securite: ShieldCheck,
  pragmatisme: Target,
  education: GraduationCap,
  "accompagnement-humain": Handshake
};

export const metadata: Metadata = buildPageMetadata({
  title: "À propos | Une technologie utile et accessible",
  description: pageDescription,
  path: "/a-propos"
});

export default function AboutPage() {
  const completeFounderProfile = hasCompleteFounderProfile(founderProfile)
    ? founderProfile
    : null;
  const aboutPageSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "À propos de ForméducWeb",
    description: pageDescription,
    url: getAbsoluteUrl("/a-propos"),
    inLanguage: "fr-CA",
    mainEntity: {
      "@type": "Organization",
      name: "ForméducWeb",
      url: getAbsoluteUrl("/"),
      slogan: "Comprendre. Choisir. Agir."
    }
  };

  return (
    <>
      <JsonLd id="about-page-schema" value={aboutPageSchema} />

      <section className="container py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-7">
            <Badge variant="secondary">{siteConfig.territory}</Badge>
            <div className="space-y-5">
              <p className="eyebrow">Comprendre. Choisir. Agir.</p>
              <h1 className="max-w-4xl font-heading text-4xl font-semibold tracking-tight sm:text-5xl md:text-7xl">
                Le numérique devrait vous rendre plus capable, pas plus
                dépendant.
              </h1>
              <p className="max-w-3xl text-xl leading-9 text-muted-foreground">
                ForméducWeb aide les organisations à choisir, utiliser et faire
                évoluer leurs outils numériques avec une approche claire,
                proportionnée et tournée vers l’autonomie.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/contact?source=a-propos">
                  Parler de votre besoin
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/ressources">Explorer les ressources</Link>
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border-primary/20 bg-primary/5">
            <CardContent className="space-y-6 p-8 md:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Target className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <p className="eyebrow">Notre promesse</p>
                <p className="mt-4 font-heading text-2xl font-semibold leading-9 tracking-tight">
                  {brandFoundation.promise}
                </p>
              </div>
              <p className="border-t border-primary/15 pt-5 text-sm leading-7 text-muted-foreground">
                Une recommandation doit rester compréhensible : ce qu’elle
                règle, ce qu’elle coûte, ce qu’elle exige et ce que votre équipe
                pourra gérer elle-même.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container py-10 md:py-16">
        <div className="grid gap-8 rounded-[36px] border border-border/70 bg-white/80 p-8 md:p-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <div>
            <p className="eyebrow">Notre origine</p>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight md:text-4xl">
              {brandOrigin.title}
            </h2>
          </div>
          <div className="space-y-4 text-base leading-8 text-muted-foreground">
            {brandOrigin.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-10 md:py-16">
        <SectionHeading
          eyebrow="Fondation"
          title="Une mission et une vision qui dépassent l’outil"
          description="Le site web, l’automatisation, la formation et le soutien sont différents moyens d’atteindre le même objectif : une technologie mieux comprise et mieux utilisée."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Notre mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-8 text-muted-foreground">
                {brandFoundation.mission}
              </p>
            </CardContent>
          </Card>
          <Card className="border-orange-200 bg-orange-50/60">
            <CardHeader>
              <CardTitle>Notre vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-8 text-muted-foreground">
                {brandFoundation.vision}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container py-10 md:py-16">
        <SectionHeading
          eyebrow="Nos huit valeurs"
          title="Les repères qui guident chaque recommandation"
          description="Ces valeurs servent autant à choisir un outil qu’à concevoir une formation, structurer un site ou préparer un accompagnement."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {brandValues.map((value) => {
            const Icon = valueIconById[value.id];

            return (
              <Card key={value.id} className="h-full">
                <CardHeader>
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <CardTitle>{value.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-7 text-muted-foreground">
                  {value.description}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="container py-10 md:py-16">
        <SectionHeading
          eyebrow="Expertise et transmission"
          title="Relier la technologie au travail des personnes"
          description="Les domaines se complètent : un projet Web peut demander de la formation, une automatisation doit tenir compte des données et une décision d’affaires doit rester compréhensible par l’équipe."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <Card className="border-orange-200 bg-orange-50/60">
            <CardHeader>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-orange-800">
                <GraduationCap className="h-5 w-5" aria-hidden="true" />
              </div>
              <CardTitle>{trainingRole.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-7 text-muted-foreground">
              {trainingRole.description}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Domaines d’expertise</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3 sm:grid-cols-2">
                {brandExpertise.map((expertise) => (
                  <li
                    key={expertise}
                    className="flex gap-3 rounded-2xl border border-border/60 bg-background/75 p-4 text-sm leading-6"
                  >
                    <CheckCircle2
                      className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span>{expertise}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {completeFounderProfile ? (
        <section className="container py-10 md:py-16">
          <div className="grid gap-8 rounded-[36px] border border-primary/20 bg-primary/5 p-8 md:p-10 lg:grid-cols-[0.35fr_0.65fr] lg:items-center">
            <Image
              src={completeFounderProfile.photoSrc}
              alt={completeFounderProfile.photoAlt}
              width={560}
              height={560}
              className="aspect-square w-full rounded-[28px] object-cover"
            />
            <div>
              <p className="eyebrow">L’expertise derrière ForméducWeb</p>
              <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight">
                {completeFounderProfile.name}
              </h2>
              <p className="mt-2 font-medium text-primary">
                {completeFounderProfile.role}
              </p>
              <p className="mt-5 leading-8 text-muted-foreground">
                {completeFounderProfile.biography}
              </p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {completeFounderProfile.expertise.map((expertise) => (
                  <li
                    key={expertise}
                    className="rounded-full bg-white px-4 py-2 text-sm font-medium"
                  >
                    {expertise}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      <section className="container py-10 md:py-16">
        <div className="overflow-hidden rounded-[36px] border border-primary/20 bg-[linear-gradient(135deg,rgba(13,79,154,0.98),rgba(21,113,212,0.95))] px-7 py-10 text-white shadow-halo md:px-10 md:py-12">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                <CircleDollarSign className="h-6 w-6" aria-hidden="true" />
              </div>
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.25em] text-white/65">
                Coûts et autonomie
              </p>
              <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                La bonne solution est celle que vous pouvez comprendre, payer et
                faire vivre.
              </h2>
              <p className="mt-4 text-lg leading-8 text-white/80">
                L’objectif n’est pas d’ajouter des abonnements ou de rendre une
                équipe captive d’un fournisseur. Il est de trouver le niveau de
                service qui correspond au besoin réel.
              </p>
            </div>
            <div className="grid gap-4">
              {brandCommitments.map((commitment) => (
                <div
                  key={commitment.title}
                  className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm"
                >
                  <p className="flex gap-3 font-semibold">
                    <CheckCircle2
                      className="mt-0.5 h-5 w-5 shrink-0 text-orange-300"
                      aria-hidden="true"
                    />
                    <span>{commitment.title}</span>
                  </p>
                  <p className="mt-2 pl-8 text-sm leading-7 text-white/75">
                    {commitment.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container py-10 md:py-16">
        <SectionHeading
          eyebrow="Notre méthode"
          title="Un chemin concret, du besoin au transfert"
          description="La méthode reste la même pour une petite amélioration, un projet web, une automatisation ou une formation adaptée."
        />
        <ol className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {brandMethod.map((step) => (
            <li key={step.number} className="h-full">
              <Card className="h-full">
                <CardHeader>
                  <span className="font-heading text-4xl font-semibold text-primary/25">
                    {step.number}
                  </span>
                  <CardTitle>{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-7 text-muted-foreground">
                  {step.description}
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section className="container py-12 md:py-20">
        <div className="rounded-[36px] border border-primary/20 bg-primary/5 p-8 md:p-10">
          <div className="grid gap-7 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="eyebrow">Votre contexte compte</p>
              <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                Commençons par ce que vous voulez améliorer.
              </h2>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-muted-foreground">
                Décrivez le travail à simplifier, la compétence à développer ou
                l’outil à faire évoluer. La première étape sert à clarifier le
                besoin, pas à présumer de la solution.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/contact?source=a-propos-cta">
                Nous parler de votre projet
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
