import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Globe2,
  GraduationCap,
  Headphones,
  Lightbulb,
  Search,
  ShieldCheck,
  Sparkles,
  Workflow
} from "lucide-react";

import { SectionHeading } from "@/components/marketing/section-heading";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listPublicCourses } from "@/app/formations/course-data";
import { brandFoundation, brandMethod, brandValues } from "@/lib/brand";
import { diagnosticList } from "@/lib/diagnostics";
import { getReportUnlockPriceLabel } from "@/lib/payments";
import { practicalResources } from "@/lib/resources";
import { buildPageMetadata, getAbsoluteUrl } from "@/lib/seo";
import { serviceNavigation } from "@/lib/services";
import {
  getTrainingOfferLabel,
  getTrainingThemeLabel,
  type TrainingOffer,
  type TrainingTheme
} from "@/lib/training";

const pageDescription =
  "ForméducWeb vous aide à apprendre, créer, automatiser et mieux utiliser les technologies grâce à des formations, des services Web et un accompagnement adapté.";

export const metadata: Metadata = buildPageMetadata({
  title: "Le numérique, simplement",
  description: pageDescription,
  path: "/"
});

export const dynamic = "force-dynamic";

const paths = [
  {
    icon: GraduationCap,
    title: "Je veux apprendre",
    description:
      "Des formations accessibles pour débuter, se perfectionner ou avancer en équipe.",
    href: "/formations"
  },
  {
    icon: Globe2,
    title: "Je veux créer ou améliorer mon site Web",
    description:
      "Un site clair, crédible et proportionné à votre façon de travailler.",
    href: "/services/site-web"
  },
  {
    icon: Workflow,
    title: "Je veux automatiser mon travail",
    description:
      "Moins de doubles saisies et de suivis manuels, avec des validations humaines.",
    href: "/services/automatisation-ia"
  },
  {
    icon: Headphones,
    title: "J’ai besoin de soutien informatique",
    description:
      "Une aide compréhensible pour résoudre, organiser et documenter l’essentiel.",
    href: "/services/soutien-ti"
  }
] as const;

const customTrainingExamples = [
  "Intégration de nouvelles personnes",
  "Procédures propres à l’entreprise",
  "Formation sur un logiciel ou un outil bureautique",
  "Cybersécurité et utilisation responsable de l’IA",
  "Procédures industrielles et environnement de travail précis",
  "Documentation et transfert de connaissances"
] as const;

const featuredCourseSlugs = [
  "internet-sans-stress",
  "ia-au-travail",
  "excel-essentiel"
] as const;

export default async function HomePage() {
  const trainingCourses = await listPublicCourses();
  const featuredCourses = featuredCourseSlugs
    .map((slug) => trainingCourses.find((course) => course.slug === slug))
    .filter((course): course is NonNullable<typeof course> => Boolean(course));
  const featuredResources = practicalResources.slice(0, 4);

  const portalSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Portail ForméducWeb",
    itemListElement: [
      ["Formations", "/formations"],
      ["Services numériques", "/services"],
      ["Boutique", "/produits"],
      ["Ressources gratuites", "/ressources"]
    ].map(([name, path], index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
      url: getAbsoluteUrl(path)
    }))
  };

  return (
    <>
      <JsonLd id="home-portal-schema" value={portalSchema} />

      <section
        data-home-section="hero"
        className="container py-14 md:py-20 lg:py-24"
      >
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-7">
            <Badge variant="secondary">
              Formation · solutions numériques · accompagnement
            </Badge>
            <div className="space-y-5">
              <h1 className="max-w-4xl font-heading text-5xl font-semibold tracking-[-0.045em] sm:text-6xl md:text-7xl">
                Le numérique, <span className="gradient-text">simplement.</span>
              </h1>
              <p className="max-w-2xl text-xl leading-9 text-muted-foreground">
                ForméducWeb vous aide à apprendre, créer, automatiser et mieux
                utiliser les technologies. Découvrez des formations accessibles,
                des services Web, des solutions d’intelligence artificielle et
                un accompagnement adapté à vos besoins.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild size="lg">
                <Link href="/formations">
                  Explorer les formations
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/contact?source=accueil-hero">
                  Parler de mon projet
                </Link>
              </Button>
              <Button asChild size="lg" variant="link">
                <Link href="/services">Découvrir les services</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium text-foreground/70">
              {["Besoin d’abord", "Coûts expliqués", "Autonomie transmise"].map(
                (item) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    <CheckCircle2
                      className="h-4 w-4 text-primary"
                      aria-hidden="true"
                    />
                    {item}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="portal-panel relative overflow-hidden rounded-[42px] border border-white/80 p-4 md:p-6">
            <div className="dot-pattern absolute -right-10 -top-10 h-48 w-48 opacity-50" />
            <div className="relative rounded-[30px] border border-border/70 bg-white/95 p-5 shadow-sm md:p-7">
              <div className="mb-5 overflow-hidden rounded-[22px] border border-border/60">
                <Image
                  src="/hero-apprentissage-formeducweb.png"
                  alt="Des adultes apprennent ensemble à utiliser des outils numériques, accompagnés par une formatrice."
                  width={1730}
                  height={909}
                  priority
                  sizes="(min-width: 1024px) 42vw, 92vw"
                  className="aspect-[1.9/1] w-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between border-b border-border/60 pb-5">
                <div className="flex items-center gap-3">
                  <Image
                    src="/FWLogo.png"
                    alt=""
                    width={1024}
                    height={1024}
                    className="h-12 w-12 rounded-xl object-contain"
                  />
                  <div>
                    <p className="font-heading font-semibold">ForméducWeb</p>
                    <p className="text-xs text-muted-foreground">
                      Comprendre · choisir · agir
                    </p>
                  </div>
                </div>
                <Sparkles
                  className="h-5 w-5 text-[#fd8417]"
                  aria-hidden="true"
                />
              </div>

              <form
                action="/recherche"
                method="get"
                role="search"
                className="py-6"
              >
                <label
                  htmlFor="home-search"
                  className="mb-3 block text-sm font-semibold text-foreground/70"
                >
                  Qu’aimeriez-vous accomplir?
                </label>
                <div className="flex items-center gap-2 rounded-full border-2 border-primary/15 bg-background p-2 pl-5 shadow-sm focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10">
                  <Search className="h-5 w-5 text-primary" aria-hidden="true" />
                  <input
                    id="home-search"
                    name="q"
                    type="search"
                    minLength={2}
                    maxLength={120}
                    required
                    placeholder="Ex. former mon équipe sur Excel"
                    className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <Button type="submit" size="sm" className="rounded-full">
                    Rechercher
                  </Button>
                </div>
              </form>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {[
                  { icon: GraduationCap, label: "Apprendre" },
                  { icon: Workflow, label: "Simplifier" },
                  { icon: ShieldCheck, label: "Protéger" }
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-border/60 bg-white p-4 text-center"
                  >
                    <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <item.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <p className="mt-2 text-sm font-semibold">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl bg-[#092f5d] px-5 py-4 text-white">
                <p className="flex gap-3 text-sm leading-6 text-white/85">
                  <Lightbulb
                    className="mt-0.5 h-5 w-5 shrink-0 text-[#fdad62]"
                    aria-hidden="true"
                  />
                  <span>
                    Si la réponse n’existe pas encore, nous pouvons la définir
                    et la construire avec vous.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="chemins"
        data-home-section="chemins"
        className="container scroll-mt-24 py-12 md:py-20"
      >
        <SectionHeading
          eyebrow="Quatre chemins simples"
          title="Commencez par ce que vous voulez accomplir"
          description="Chaque chemin mène directement vers la partie du portail qui correspond à votre besoin."
          align="center"
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {paths.map((path) => (
            <Link
              key={path.title}
              href={path.href}
              className="group rounded-[28px] border border-border/70 bg-white/85 p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-halo"
            >
              <div className="flex items-start gap-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
                  <path.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-heading text-xl font-semibold">
                    {path.title}
                  </span>
                  <span className="mt-2 block text-sm leading-7 text-muted-foreground">
                    {path.description}
                  </span>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    Suivre ce chemin
                    <ArrowRight
                      className="h-4 w-4 transition group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section data-home-section="mission" className="container py-12 md:py-20">
        <div className="ink-panel overflow-hidden rounded-[40px] p-8 text-white md:p-12 lg:p-14">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.23em] text-[#8dc1ff]">
              Mission, vision et promesse
            </p>
            <h2 className="mt-4 font-heading text-4xl font-semibold tracking-tight md:text-5xl">
              Une technologie mieux comprise et mieux choisie
            </h2>
          </div>
          <div className="mt-9 grid gap-4 lg:grid-cols-3">
            {[
              { title: "Notre mission", text: brandFoundation.mission },
              { title: "Notre vision", text: brandFoundation.vision },
              { title: "Notre promesse", text: brandFoundation.promise }
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm"
              >
                <h3 className="font-heading text-xl font-semibold">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-white/75">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
          <Button
            asChild
            variant="secondary"
            className="mt-8 border-white/25 bg-white/10 text-white hover:bg-white hover:text-[#0d4f9a]"
          >
            <Link href="/a-propos">Découvrir ForméducWeb</Link>
          </Button>
        </div>
      </section>

      <section
        data-home-section="formations"
        className="container py-12 md:py-20"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Formations en vedette"
            title="Apprendre juste ce qu’il faut pour avancer"
            description="Des parcours courts et concrets, gratuits ou à prix raisonnable, pour apprendre à son rythme ou préparer une formation d’équipe."
          />
          <Button asChild variant="secondary">
            <Link href="/formations">
              Voir le catalogue
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {featuredCourses.map((course, index) => (
            <Card
              key={course.slug}
              className="group flex h-full flex-col overflow-hidden"
            >
              <div
                className={`h-2 ${index === 1 ? "bg-[#fd8417]" : "bg-primary"}`}
              />
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="secondary">
                    {getTrainingThemeLabel(course.theme as TrainingTheme)}
                  </Badge>
                  <span className="text-sm font-semibold text-primary">
                    {course.priceLabel}
                  </span>
                </div>
                <CardTitle>{course.shortTitle}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-5">
                <p className="text-sm leading-7 text-muted-foreground">
                  {course.description}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-muted/60 px-3 py-1.5">
                    {getTrainingOfferLabel(course.offer as TrainingOffer)}
                  </span>
                  <span className="rounded-full bg-muted/60 px-3 py-1.5">
                    {course.durationLabel}
                  </span>
                </div>
                <Button asChild variant="secondary" className="mt-auto">
                  <Link href={`/formations/${course.slug}`}>
                    Voir la formation
                    <ArrowRight
                      className="ml-2 h-4 w-4 transition group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section
        data-home-section="services"
        className="container py-12 md:py-20"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Services"
            title="Une expertise qui s’adapte à votre réalité"
            description="Web, commerce électronique, automatisation, soutien, cybersécurité, formation et solutions d’entreprise peuvent être combinés sans transformer le mandat en projet démesuré."
          />
          <Button asChild variant="secondary">
            <Link href="/services">Tous les services</Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {serviceNavigation.map((service) => (
            <Link
              key={service.slug}
              href={service.href}
              className="group flex h-full flex-col rounded-[26px] border border-border/70 bg-white/85 p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-halo"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <service.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-heading text-xl font-semibold">
                {service.shortTitle}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">
                {service.summary}
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Découvrir
                <ArrowRight
                  className="h-4 w-4 transition group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section
        data-home-section="formation-sur-mesure"
        className="container py-12 md:py-20"
      >
        <div className="relative overflow-hidden rounded-[40px] border border-[#fd8417]/25 bg-accent/60 p-8 md:p-12">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#fd8417]/15 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
            <div>
              <Badge variant="secondary">Formation sur mesure</Badge>
              <h2 className="mt-5 font-heading text-3xl font-semibold tracking-tight md:text-5xl">
                Si la formation n’existe pas encore, construisons-la autour du
                travail réel.
              </h2>
              <p className="mt-4 text-lg leading-8 text-foreground/70">
                Le contenu, les exemples et les exercices peuvent être adaptés à
                vos outils, à vos procédures, aux différents niveaux de l’équipe
                et à votre environnement de travail.
              </p>
              <Button asChild size="lg" className="mt-7">
                <Link href="/contact?source=accueil-formation-sur-mesure">
                  Demander une formation sur mesure
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {customTrainingExamples.map((example) => (
                <li
                  key={example}
                  className="flex gap-3 rounded-2xl border border-white/70 bg-white/75 p-4 text-sm leading-6"
                >
                  <BookOpenCheck
                    className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span>{example}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section
        data-home-section="produits"
        className="container py-12 md:py-20"
      >
        <div className="grid gap-10 rounded-[36px] border border-border/70 bg-white/80 p-8 md:p-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <Badge variant="secondary">Outils pratiques</Badge>
            <h2 className="mt-5 font-heading text-3xl font-semibold tracking-tight md:text-4xl">
              Trois diagnostics pour obtenir un premier portrait à votre rythme
            </h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              Loi 25, cybersécurité et IA : commencez gratuitement avec un
              score, trois priorités et un plan de 30 jours. Le Kit complet à
              {` ${getReportUnlockPriceLabel()}`} demeure optionnel. Les pages,
              prix et parcours actuels sont conservés.
            </p>
            <Button asChild className="mt-6">
              <Link href="/produits">Voir la boutique</Link>
            </Button>
          </div>

          <div className="grid gap-3">
            {diagnosticList.map((diagnostic) => (
              <Link
                key={diagnostic.type}
                href={diagnostic.path}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-background/80 p-4 transition hover:border-primary/35 hover:bg-primary/5"
              >
                <span>
                  <span className="block font-semibold">
                    Diagnostic {diagnostic.label}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {diagnostic.themeLabel} · gratuit pour commencer
                  </span>
                </span>
                <ArrowRight
                  className="h-4 w-4 text-primary transition group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        data-home-section="approche"
        className="container py-12 md:py-20"
      >
        <SectionHeading
          eyebrow="Notre approche"
          title="Un chemin concret, du besoin au transfert"
          description="Chaque étape produit une décision ou un résultat compréhensible avant de poursuivre."
        />
        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {brandMethod.map((step) => (
            <li
              key={step.number}
              className="relative overflow-hidden rounded-[26px] border border-border/70 bg-white/80 p-6"
            >
              <span className="font-heading text-4xl font-semibold text-primary/20">
                {step.number}
              </span>
              <h3 className="mt-4 font-heading text-lg font-semibold">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section
        data-home-section="valeurs"
        className="border-y border-border/60 bg-white/55"
      >
        <div className="container py-14 md:py-20">
          <SectionHeading
            eyebrow="Nos huit valeurs"
            title="Des repères simples pour guider les décisions"
            description="Ces valeurs s’appliquent à une formation, à un projet Web, à une automatisation comme à un accompagnement technique."
            align="center"
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {brandValues.map((value, index) => (
              <div
                key={value.id}
                className="rounded-[24px] border border-border/70 bg-background/85 p-5"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-heading text-lg font-semibold">
                  {value.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        data-home-section="ressources"
        className="container py-12 md:py-20"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Ressources gratuites"
            title="Des conseils à consulter avant d’acheter un outil"
            description="Guides, fiches pratiques et introductions pour Excel, Word, le Web, l’automatisation, la cybersécurité et l’intelligence artificielle."
          />
          <Button asChild variant="secondary">
            <Link href="/ressources">
              Voir toutes les ressources
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featuredResources.map((resource) => (
            <Link
              key={resource.id}
              href={`/ressources#${resource.id}`}
              className="group flex h-full flex-col rounded-[26px] border border-border/70 bg-white/85 p-6 transition hover:-translate-y-1 hover:border-primary/35"
            >
              <Badge variant="secondary" className="self-start">
                {resource.formatLabel}
              </Badge>
              <h3 className="mt-5 font-heading text-xl font-semibold">
                {resource.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">
                {resource.description}
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Lire les trois repères
                <ArrowRight
                  className="h-4 w-4 transition group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          {[
            ["Conseils de cybersécurité", "/ressources#cybersecurite"],
            ["Introductions à l’IA", "/ressources#intelligence-artificielle"],
            ["Hygiène informatique", "/hygiene-informatique"]
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="rounded-full border border-border/70 bg-white px-4 py-2 text-sm font-medium transition hover:border-primary/35 hover:text-primary"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      <section
        data-home-section="appel-final"
        className="container pb-16 pt-12 md:pb-24 md:pt-20"
      >
        <div className="overflow-hidden rounded-[40px] bg-[linear-gradient(135deg,rgba(8,45,92,0.99),rgba(21,113,212,0.96))] p-8 text-white shadow-halo md:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.23em] text-[#8dc1ff]">
                Un point de départ humain
              </p>
              <h2 className="mt-4 max-w-4xl font-heading text-3xl font-semibold tracking-tight md:text-5xl">
                Vous ne savez pas par où commencer?
              </h2>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-white/75">
                Expliquez-nous votre besoin. Nous vous aiderons à trouver une
                solution simple et adaptée, sans présumer de l’outil ni du
                mandat.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90"
            >
              <Link href="/contact?source=accueil-cta-final">
                Discuter de mon besoin
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
