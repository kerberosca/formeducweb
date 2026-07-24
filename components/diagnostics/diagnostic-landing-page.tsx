import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  FileText,
  Layers3,
  MessageCircle,
  Network,
  ShieldCheck
} from "lucide-react";

import { KitPreview } from "@/components/diagnostics/kit-preview";
import { MobileDiagnosticCta } from "@/components/diagnostics/mobile-diagnostic-cta";
import { OfferComparison } from "@/components/diagnostics/offer-comparison";
import { FaqList } from "@/components/marketing/faq-list";
import { SectionHeading } from "@/components/marketing/section-heading";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDiagnosticConfig, type AssessmentType } from "@/lib/diagnostics";
import { getSeoSupportPagesByTheme, pillarSeoContent } from "@/lib/seo-content";

type DiagnosticLandingPageProps = {
  assessmentType: AssessmentType;
};

function HeroDiagnosticIcon({
  assessmentType
}: {
  assessmentType: AssessmentType;
}) {
  if (assessmentType === "cybersecurity")
    return <Network className="h-6 w-6" aria-hidden="true" />;
  if (assessmentType === "ai")
    return <BrainCircuit className="h-6 w-6" aria-hidden="true" />;
  return <ShieldCheck className="h-6 w-6" aria-hidden="true" />;
}

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <CheckCircle2
            className="mt-1 h-4 w-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function DiagnosticLandingPage({
  assessmentType
}: DiagnosticLandingPageProps) {
  const diagnostic = getDiagnosticConfig(assessmentType);
  const content = diagnostic.content;
  const pillarSeo = pillarSeoContent[assessmentType];
  const supportPages = getSeoSupportPagesByTheme(pillarSeo.supportTheme);
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };

  return (
    <>
      <JsonLd id={`${diagnostic.slug}-faq-schema`} value={faqSchema} />

      <section className="container py-14 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="space-y-6">
            <Badge>{content.badge}</Badge>
            <h1 className="font-heading text-5xl font-semibold tracking-tight md:text-6xl">
              {content.title}
            </h1>
            <p className="max-w-2xl text-xl leading-9 text-muted-foreground">
              {content.description}
            </p>
            <div className="grid gap-2 text-sm leading-7 text-muted-foreground">
              <p>
                <strong className="font-semibold text-foreground">
                  Pour qui :
                </strong>{" "}
                {content.audience}
              </p>
              <p>
                Environ 10 minutes · résultat immédiat · aucun courriel requis.
              </p>
              <p>
                Le diagnostic reste gratuit. Le Kit d’exécution 90 jours est
                offert ensuite à 29 $ CAD, seulement si vous le voulez.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={diagnostic.wizardPath}>
                  Faire mon diagnostic gratuit
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href={`/exemples/${diagnostic.slug}`}>
                  Voir un exemple fictif
                </Link>
              </Button>
            </div>
          </div>

          <Card className="bg-white/90">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <HeroDiagnosticIcon assessmentType={assessmentType} />
              </div>
              <CardTitle>Une décision utile en 10 minutes</CardTitle>
              <CardDescription>
                Voyez vos priorités avant de payer quoi que ce soit.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6 pt-0">
              {[
                "Un score simple, sans jargon.",
                "Trois priorités adaptées à vos réponses.",
                "Un premier plan de 30 jours à l’écran.",
                "La liberté de rester au gratuit ou de passer à l’exécution."
              ].map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-2xl border border-border/70 bg-background p-4 text-sm leading-6"
                >
                  <CheckCircle2
                    className="mt-1 h-4 w-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="offres" className="container scroll-mt-24 py-10 md:py-16">
        <SectionHeading
          eyebrow="Choisissez votre niveau"
          title="Gratuit pour comprendre. Payant pour exécuter."
          description="La différence est concrète : le gratuit vous oriente; le kit vous remet un plan personnalisé et des documents éditables; le trio réunit les trois sujets."
        />
        <div className="mt-10">
          <OfferComparison diagnostic={diagnostic} />
        </div>
      </section>

      <section className="container py-10 md:py-16">
        <SectionHeading
          eyebrow="Aperçu avant achat"
          title="Pas de boîte noire : regardez les livrables"
          description="Les aperçus utilisent une entreprise fictive. Votre kit sera personnalisé avec le nom de votre entreprise et les réponses pertinentes de votre diagnostic."
        />
        <div className="mt-10">
          <KitPreview diagnostic={diagnostic} />
        </div>
      </section>

      <section className="container py-8 md:py-12">
        <Card className="overflow-hidden border-primary bg-primary text-primary-foreground">
          <CardContent className="grid gap-6 p-8 md:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="font-heading text-3xl font-semibold">
                Commencez par le diagnostic gratuit
              </p>
              <p className="mt-3 max-w-2xl leading-7 text-primary-foreground/80">
                Votre résultat apparaît immédiatement. Vous déciderez ensuite si
                le Kit d’exécution 90 jours à 29 $ ou le trio à 59 $ vous est
                utile.
              </p>
            </div>
            <Button asChild size="lg" variant="secondary">
              <Link href={diagnostic.wizardPath}>
                Voir mes priorités
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="container py-10 md:py-16">
        <SectionHeading
          eyebrow="Méthode"
          title="Du diagnostic aux documents prêts à adapter"
          description="Une progression courte, pensée pour une petite équipe qui veut avancer sans lancer un projet lourd."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            {
              icon: FileText,
              title: "1. Diagnostiquer",
              description:
                "Répondez à des questions guidées pour faire ressortir vos forces et vos angles morts."
            },
            {
              icon: Layers3,
              title: "2. Prioriser",
              description:
                "Recevez un plan 30 jours gratuit, puis un plan 90 jours personnalisé dans le kit."
            },
            {
              icon: ShieldCheck,
              title: "3. Exécuter",
              description:
                "Adaptez les gabarits éditables, attribuez les actions et conservez une trace du travail."
            }
          ].map((item) => (
            <Card key={item.title}>
              <CardContent className="p-6">
                <item.icon
                  className="mb-4 h-6 w-6 text-primary"
                  aria-hidden="true"
                />
                <h2 className="font-heading text-xl font-semibold">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container py-10 md:py-16">
        <SectionHeading
          eyebrow="Preuve interne"
          title="ForméducWeb passe aussi son propre diagnostic"
          description="Nous appliquons la même méthode à nos pratiques. Nous décrivons les actions de processus, sans publier de détails qui pourraient réduire notre sécurité."
        />
        <Card className="mt-10 border-primary/20 bg-primary/5">
          <CardContent className="grid gap-6 p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <BulletList
              items={[
                "Nous avons limité l’IA aux sources officielles autorisées, sans données client, avec approbation humaine avant publication.",
                "Chaque droit du trio est lié à son acheteur, à un seul diagnostic et à une seule utilisation; les événements Stripe sont idempotents.",
                "Nous avons séparé les courriels transactionnels et commerciaux, puis rendu le désabonnement immédiat sur les tâches futures."
              ]}
            />
            <Button asChild variant="secondary">
              <Link href="/formeducweb-passe-son-diagnostic">
                Lire le cas ForméducWeb
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="container py-10 md:py-16">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardDescription className="font-semibold uppercase tracking-[0.25em] text-primary/70">
                {pillarSeo.eyebrow}
              </CardDescription>
              <CardTitle>{pillarSeo.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-6 pt-0 text-sm leading-7 text-muted-foreground">
              <p>{pillarSeo.answer}</p>
              <BulletList items={pillarSeo.bullets} />
              <Button asChild variant="secondary">
                <Link href="/hygiene-informatique">
                  Voir l’approche hygiène informatique
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Guides pratiques liés</CardTitle>
              <CardDescription>
                Des réponses plus détaillées, avec un retour direct vers le
                diagnostic.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {supportPages.slice(0, 5).map((page) => (
                <Link
                  key={page.path}
                  href={page.path}
                  className="group rounded-2xl border border-border/70 bg-white/75 p-4 transition hover:border-primary/40 hover:bg-primary/5"
                >
                  <span className="block text-sm font-medium text-foreground">
                    {page.shortTitle}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    {page.description}
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container py-10 md:py-16">
        <SectionHeading
          eyebrow="Cadre clair"
          title="Ce que cette démarche n’est pas"
          description="Le diagnostic aide à prioriser et à documenter. Il ne remplace pas les expertises spécialisées dont votre situation pourrait avoir besoin."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {content.notThis.map((item) => (
            <Card key={item}>
              <CardContent className="p-6 text-sm leading-7 text-muted-foreground">
                {item}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container py-10 md:py-16">
        <SectionHeading
          eyebrow="Option humaine"
          title="L’accompagnement reste facultatif"
          description="Le kit est conçu pour être utilisé en autonomie. Si vous voulez de l’aide, votre crédit de 29 $ demeure valable 90 jours sur un accompagnement admissible."
        />
        <div className="mt-10 rounded-[32px] border border-border/70 bg-white/85 p-6 md:p-8">
          <Tabs defaultValue={content.packages[0]?.name} className="w-full">
            <TabsList>
              {content.packages.map((pack) => (
                <TabsTrigger key={pack.name} value={pack.name}>
                  {pack.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {content.packages.map((pack) => (
              <TabsContent key={pack.name} value={pack.name}>
                <Card className="border-none shadow-none">
                  <CardHeader className="px-0">
                    <CardTitle className="flex items-center justify-between gap-3">
                      <span>{pack.name}</span>
                      <span className="text-base text-primary">
                        {pack.price}
                      </span>
                    </CardTitle>
                    <CardDescription>{pack.summary}</CardDescription>
                  </CardHeader>
                  <CardContent className="px-0">
                    <BulletList items={pack.items} />
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      <section className="container py-12 md:py-16">
        <SectionHeading
          eyebrow="FAQ"
          title={`Questions fréquentes — ${diagnostic.label}`}
        />
        <div className="mt-8 rounded-[32px] border border-border/70 bg-white/80 p-6 md:p-8">
          <FaqList items={content.faq} />
        </div>
      </section>

      <section className="container pb-28 pt-8 md:pb-12">
        <Card>
          <CardContent className="flex flex-col gap-5 p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-foreground">
                Une question avant de commencer?
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Écrivez à ForméducWeb. Le contact humain est disponible, jamais
                obligatoire pour voir votre résultat.
              </p>
            </div>
            <Button asChild variant="secondary">
              <Link href={`/contact?source=${diagnostic.leadSource}-humain`}>
                <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                Écrire à ForméducWeb
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <MobileDiagnosticCta href={diagnostic.wizardPath} />
    </>
  );
}
