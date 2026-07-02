import Link from "next/link";
import { ArrowRight, BrainCircuit, FileText, Layers3, MessageCircle, Network, ShieldCheck } from "lucide-react";

import { FaqList } from "@/components/marketing/faq-list";
import { SectionHeading } from "@/components/marketing/section-heading";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDiagnosticConfig, type AssessmentType } from "@/lib/diagnostics";
import { getReportUnlockPriceLabel } from "@/lib/payments";
import { getSeoSupportPagesByTheme, pillarSeoContent } from "@/lib/seo-content";
import { siteConfig } from "@/lib/site";

type DiagnosticLandingPageProps = {
  assessmentType: AssessmentType;
};

function HeroDiagnosticIcon({ assessmentType }: { assessmentType: AssessmentType }) {
  if (assessmentType === "cybersecurity") return <Network className="h-6 w-6" />;
  if (assessmentType === "ai") return <BrainCircuit className="h-6 w-6" />;
  return <ShieldCheck className="h-6 w-6" />;
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function DiagnosticLandingPage({ assessmentType }: DiagnosticLandingPageProps) {
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

      <section className="container py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-6">
            <Badge>{content.badge}</Badge>
            <h1 className="font-heading text-5xl font-semibold tracking-tight md:text-6xl">{content.title}</h1>
            <p className="max-w-2xl text-xl leading-9 text-muted-foreground">{content.description}</p>
            <div className="space-y-2 text-sm leading-7 text-muted-foreground">
              <p>Pour qui: {content.audience}</p>
              <p>
                Démarche: résumé gratuit, rapport complet à {getReportUnlockPriceLabel()} si pertinent, puis accompagnement
                selon vos priorités.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={diagnostic.wizardPath}>Faire mon auto-évaluation</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href={`/contact?source=${diagnostic.leadSource}`}>Parler de mon contexte</Link>
              </Button>
            </div>
          </div>

          <Card className="bg-white/85">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <HeroDiagnosticIcon assessmentType={assessmentType} />
              </div>
              <CardTitle>Parcours en 3 étapes</CardTitle>
              <CardDescription>Simple à comprendre, concret à exécuter.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 p-6">
              {[
                {
                  icon: FileText,
                  title: "1. Diagnostic",
                  description: "Réponses guidées pour faire ressortir vos forces et vos angles morts."
                },
                {
                  icon: Layers3,
                  title: "2. Rapport",
                  description: "Score, priorités et plan d'action utilisable dès aujourd'hui."
                },
                {
                  icon: ShieldCheck,
                  title: "3. Implantation",
                  description: "Accompagnement progressif si vous voulez passer à l'exécution."
                }
              ].map((item) => (
                <div key={item.title} className="rounded-[20px] border border-border/70 bg-background p-5">
                  <item.icon className="mb-3 h-5 w-5 text-primary" />
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container py-8 md:py-14">
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
                  Voir l'approche hygiène informatique
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Guides pratiques liés</CardTitle>
              <CardDescription>Des réponses courtes pour approfondir sans quitter le parcours.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {supportPages.slice(0, 5).map((page) => (
                <Link
                  key={page.path}
                  href={page.path}
                  className="group rounded-2xl border border-border/70 bg-white/75 p-4 transition hover:border-primary/40 hover:bg-primary/5"
                >
                  <span className="block text-sm font-medium text-foreground">{page.shortTitle}</span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">{page.description}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container py-8 md:py-14">
        <SectionHeading
          eyebrow="Gratuit"
          title="Ce que vous obtenez gratuitement"
          description="Un premier niveau de clarté avant de décider d'investir davantage."
        />
        <Card className="mt-8">
          <CardContent className="grid gap-6 p-8 lg:grid-cols-[1.2fr_auto] lg:items-center">
            <BulletList items={content.freeDeliverables} />
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button asChild>
                <Link href={diagnostic.wizardPath}>Voir mon résumé gratuit</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href={`/contact?source=${diagnostic.leadSource}-gratuit`}>Question rapide</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="container py-8 md:py-14">
        <SectionHeading
          eyebrow="Rapport complet"
          title={`Ce que le rapport complet ajoute (${getReportUnlockPriceLabel()})`}
          description="Après le résumé gratuit, vous choisissez si vous voulez le niveau de détail complet."
        />
        <Card className="mt-8 border-primary/20 bg-primary/5">
          <CardContent className="grid gap-6 p-8 lg:grid-cols-[1.2fr_auto] lg:items-center">
            <BulletList items={content.fullReportAdditions} />
            <div className="space-y-3">
              <Button asChild>
                <Link href={diagnostic.wizardPath}>Commencer gratuitement</Link>
              </Button>
              <p className="text-xs leading-5 text-muted-foreground">
                Paiement unique, accès immédiat. Toujours sans promesse exagérée.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="container py-8 md:py-14">
        <SectionHeading
          eyebrow="Pourquoi agir"
          title="Pourquoi faire le point maintenant"
          description="L'objectif n'est pas de tout faire en même temps, mais de sécuriser l'essentiel dans le bon ordre."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {content.reasonsToAct.map((item) => (
            <Card key={item}>
              <CardContent className="p-6 text-sm leading-7 text-muted-foreground">{item}</CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8">
          <Button asChild variant="secondary">
            <Link href={diagnostic.wizardPath}>Passer au diagnostic</Link>
          </Button>
        </div>
      </section>

      <section className="container py-8 md:py-14">
        <SectionHeading
          eyebrow="Cadre"
          title="Ce que cette démarche n'est pas"
          description="On garde un cadre clair pour éviter les attentes irréalistes."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {content.notThis.map((item) => (
            <Card key={item}>
              <CardContent className="p-6 text-sm leading-7 text-muted-foreground">{item}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container py-10 md:py-16">
        <SectionHeading
          eyebrow="Suite"
          title="Si vous voulez qu'on implante avec vous"
          description="Après le diagnostic, vous pouvez rester autonome ou passer sur un niveau d'accompagnement adapté."
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
                      <span className="text-base text-primary">{pack.price}</span>
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

      <section className="container py-12 md:py-18">
        <SectionHeading eyebrow="FAQ" title={`Questions fréquentes - ${diagnostic.label}`} />
        <div className="mt-8 rounded-[32px] border border-border/70 bg-white/80 p-6 md:p-8">
          <FaqList items={content.faq} />
        </div>
      </section>

      <section className="container py-8">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="space-y-5 p-8">
            <div className="space-y-2">
              <p className="font-medium text-foreground">Parler avec notre équipe</p>
              <p className="text-sm leading-7 text-muted-foreground">
                Si vous préférez valider vos priorités avec nous avant d'aller plus loin, on peut faire un échange de
                20 minutes orienté actions.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <a href={siteConfig.bookingUrl}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Planifier un appel 20 min
                </a>
              </Button>
              <Button asChild variant="secondary">
                <Link href={`/contact?source=${diagnostic.leadSource}-humain`}>Écrire à ForméducWeb</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
