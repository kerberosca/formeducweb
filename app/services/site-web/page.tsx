import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  FileText,
  Globe2,
  Settings2,
  ShieldCheck
} from "lucide-react";

import { JsonLd } from "@/components/seo/json-ld";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildPageMetadata, getAbsoluteUrl } from "@/lib/seo";

const pageDescription =
  "Création de pages ciblées, sites complets et systèmes web sur mesure au Québec, avec une approche d’hygiène informatique intégrée.";

export const metadata: Metadata = buildPageMetadata({
  title: "Création de sites et systèmes web sur mesure",
  description: pageDescription,
  path: "/services/site-web"
});

const serviceLevels = [
  {
    icon: FileText,
    label: "Format ciblé",
    title: "Page ou petit site adapté",
    description:
      "Une présence claire pour un concours, une campagne, un événement, un service ou une organisation qui veut aller droit au but.",
    includes: [
      "Contenu et parcours centrés sur un seul objectif",
      "Affichage mobile, accessibilité et appels à l’action",
      "Hébergement et entretien adaptés au contexte"
    ]
  },
  {
    icon: Globe2,
    label: "Présence complète",
    title: "Site structuré et évolutif",
    description:
      "Un site multipage pour présenter vos services, publier du contenu et recevoir des demandes sans multiplier les outils.",
    includes: [
      "Architecture, contenus, formulaires et administration",
      "Référencement de base et mesure sobre",
      "Formation et documentation pour votre équipe"
    ]
  },
  {
    icon: Settings2,
    label: "Sur mesure",
    title: "Portail ou système web",
    description:
      "Une application adaptée à vos processus lorsqu’un site standard ne suffit plus : espace privé, tableaux de bord ou automatisations.",
    includes: [
      "Cadrage des rôles, données et parcours",
      "Intégrations et fonctions propres à vos opérations",
      "Déploiement progressif et plan d’évolution"
    ]
  }
] as const;

const hygienePractices = [
  "Collecter seulement les renseignements réellement utiles",
  "Prévoir des accès maîtrisés et des responsabilités claires",
  "Intégrer formulaires, consentement et pages légales proprement",
  "Planifier mises à jour, sauvegardes et entretien dès le départ",
  "Limiter les outils et les traceurs qui n’apportent pas de valeur",
  "Documenter le fonctionnement pour réduire la dépendance"
] as const;

const processSteps = [
  {
    number: "01",
    title: "Comprendre",
    description:
      "On clarifie le public, l’objectif, les contenus, les opérations et les contraintes du projet."
  },
  {
    number: "02",
    title: "Concevoir",
    description:
      "On prépare le parcours et une direction visuelle concrète avant d’intégrer les fonctions."
  },
  {
    number: "03",
    title: "Livrer et faire évoluer",
    description:
      "On valide, met en ligne, documente l’essentiel et prévoit les prochaines améliorations utiles."
  }
] as const;

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Création de sites et systèmes web sur mesure",
  description: pageDescription,
  url: getAbsoluteUrl("/services/site-web"),
  areaServed: {
    "@type": "AdministrativeArea",
    name: "Québec"
  },
  provider: {
    "@type": "Organization",
    name: "ForméducWeb",
    url: getAbsoluteUrl("/")
  }
};

export default function SiteWebServicePage() {
  return (
    <>
      <JsonLd id="site-web-service-schema" value={serviceSchema} />

      <section className="container py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-7">
            <Badge variant="secondary">Conception web au Québec</Badge>
            <h1 className="max-w-4xl font-heading text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              Du petit site efficace au système web fait sur mesure.
            </h1>
            <p className="max-w-3xl text-xl leading-9 text-muted-foreground">
              ForméducWeb conçoit des expériences numériques adaptées au besoin
              réel : une page ciblée, un site complet ou un outil qui soutient
              directement vos opérations.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/contact?source=site-web">
                  Parler de votre projet
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/hygiene-informatique">
                  Voir l’approche d’hygiène informatique
                </Link>
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border-primary/25 bg-[linear-gradient(145deg,rgba(13,79,154,0.98),rgba(21,113,212,0.92))] text-white shadow-halo">
            <CardContent className="space-y-6 p-8 md:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/65">
                Une réalisation ForméducWeb
              </p>
              <div className="space-y-3">
                <p className="font-heading text-3xl font-semibold tracking-tight">
                  L’Appel d’Onatchiway
                </p>
                <p className="leading-7 text-white/80">
                  La page du concours de la ZEC Onatchiway présentée sur
                  FormeducWeb.ca a été conçue sur mesure par ForméducWeb.
                </p>
              </div>
              <div className="border-t border-white/20 pt-5 text-sm leading-7 text-white/70">
                Une identité distincte, une information structurée et un
                parcours adapté au projet, dans le respect des renseignements
                qui doivent demeurer privés.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container py-10 md:py-16">
        <SectionHeading
          eyebrow="Une solution proportionnée"
          title="Le bon format, sans vous enfermer dans un modèle unique"
          description="Le projet peut commencer petit et évoluer. La structure, les outils et le niveau d’accompagnement suivent votre réalité."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {serviceLevels.map((service) => {
            const Icon = service.icon;

            return (
              <Card key={service.title} className="h-full">
                <CardHeader className="space-y-5">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/70">
                      {service.label}
                    </p>
                    <CardTitle>{service.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-sm leading-7 text-muted-foreground">
                    {service.description}
                  </p>
                  <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
                    {service.includes.map((item) => (
                      <li key={item} className="flex gap-3">
                        <CheckCircle2
                          className="mt-1 h-4 w-4 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="container py-10 md:py-16">
        <div className="grid overflow-hidden rounded-[36px] border border-primary/20 bg-[#0D4F9A] text-white shadow-halo lg:grid-cols-[0.8fr_1.2fr]">
          <div className="flex flex-col justify-between gap-8 border-b border-white/15 p-8 md:p-12 lg:border-b-0 lg:border-r">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
              <ShieldCheck className="h-7 w-7" aria-hidden="true" />
            </span>
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/60">
                Hygiène informatique intégrée
              </p>
              <h2 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                Un site utile doit aussi être sain à exploiter.
              </h2>
              <p className="leading-8 text-white/80">
                L’hygiène informatique n’est pas une couche ajoutée à la fin.
                Elle guide les choix de données, d’accès, d’outils et
                d’entretien pendant toute la conception.
              </p>
            </div>
          </div>
          <div className="grid gap-4 p-8 sm:grid-cols-2 md:p-12">
            {hygienePractices.map((practice) => (
              <p
                key={practice}
                className="flex gap-3 rounded-2xl border border-white/15 bg-white/[0.06] p-4 text-sm leading-6 text-white/80"
              >
                <CheckCircle2
                  className="mt-1 h-4 w-4 shrink-0 text-white"
                  aria-hidden="true"
                />
                <span>{practice}</span>
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-10 md:py-16">
        <SectionHeading
          eyebrow="Une démarche claire"
          title="Comprendre avant de construire"
          description="Chaque mandat commence par le contexte d’affaires et les personnes qui utiliseront réellement le site ou le système."
        />
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {processSteps.map((step) => (
            <li key={step.number} className="border-t border-border pt-6">
              <span className="font-heading text-sm font-semibold tracking-[0.2em] text-primary">
                {step.number}
              </span>
              <h3 className="mt-4 font-heading text-2xl font-semibold">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container py-12 md:py-20">
        <div className="grid gap-8 rounded-[36px] border border-primary/20 bg-primary/5 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-12">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/70">
              Votre projet
            </p>
            <h2 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
              Commençons par définir la solution la plus simple qui répond au
              besoin.
            </h2>
            <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
              Décrivez votre contexte. ForméducWeb vous proposera une prochaine
              étape réaliste, sans prix artificiel ni promesse de résultat.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/contact?source=site-web">Parler à ForméducWeb</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
