import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Layers3, ShieldCheck } from "lucide-react";

import { CtaBand } from "@/components/marketing/cta-band";
import { FaqList } from "@/components/marketing/faq-list";
import { SectionHeading } from "@/components/marketing/section-heading";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { legalDisclaimers, loi25Faq, loi25Packages } from "@/lib/content";
import { getAbsoluteUrl } from "@/lib/seo";

const pageDescription =
  "Évaluez votre niveau de préparation Loi 25 et obtenez un plan d’action concret 30/90 jours. Approche claire: diagnostic, alignement, implantation.";

export const metadata: Metadata = {
  title: "Loi 25 pour PME au Québec | Diagnostic et plan d’action",
  description: pageDescription,
  alternates: {
    canonical: getAbsoluteUrl("/loi-25")
  },
  openGraph: {
    title: "Loi 25 pour PME au Québec | Diagnostic et plan d’action | ForméducWeb",
    description: pageDescription,
    url: getAbsoluteUrl("/loi-25")
  }
};

export default function Loi25Page() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: loi25Faq.map((item) => ({
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
      <JsonLd id="loi25-faq-schema" value={faqSchema} />
      <section className="container py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-6">
            <Badge>Loi 25</Badge>
            <h1 className="font-heading text-5xl font-semibold tracking-tight md:text-6xl">
              Une démarche simple pour voir clair, prioriser et implanter
            </h1>
            <p className="max-w-2xl text-xl leading-9 text-muted-foreground">
              On transforme un sujet souvent flou en diagnostic utile: collecte, formulaires, consentements,
              sauvegardes, accès, registre, gouvernance et preuves.
            </p>
            <p className="text-sm text-muted-foreground">
              Pas certain de ce que couvre exactement la loi&nbsp;?{" "}
              <Link href="/loi-25/cest-quoi" className="underline underline-offset-4">
                Voir le résumé «&nbsp;C’est quoi la Loi 25&nbsp;?&nbsp;»
              </Link>
              .
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/loi-25/wizard">Faire mon auto-évaluation Loi 25</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/contact">Parler de mon contexte</Link>
              </Button>
            </div>
          </div>

          <Card className="bg-white/85">
            <CardContent className="grid gap-4 p-8">
              {[
                {
                  icon: FileText,
                  title: "Rapport clair",
                  description: "Score global, niveau, notes et sections à renforcer."
                },
                {
                  icon: Layers3,
                  title: "Plan 30 / 90 jours",
                  description: "Des actions priorisées selon l’effort et l’impact."
                },
                {
                  icon: ShieldCheck,
                  title: "Approche réaliste",
                  description: "On parle de diagnostic, d’alignement et d’implantation. Pas de garantie de conformité."
                }
              ].map((item) => (
                <div key={item.title} className="rounded-[24px] border border-border/70 bg-background p-5">
                  <item.icon className="mb-3 h-6 w-6 text-primary" />
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container py-8 md:py-14">
        <SectionHeading
          eyebrow="Pourquoi agir"
          title="Réduire les angles morts sans tomber dans la peur"
          description="L’enjeu n’est pas de tout faire d’un coup. C’est d’identifier les zones sensibles et d’avancer avec méthode."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            "Savoir quelles données vous collectez et où elles se trouvent.",
            "Rendre vos formulaires et votre site plus transparents.",
            "Renforcer vos accès, sauvegardes et routines en cas d’incident."
          ].map((item) => (
            <Card key={item}>
              <CardContent className="p-6 text-sm leading-7 text-muted-foreground">{item}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container py-10 md:py-16">
        <SectionHeading
          eyebrow="Ce que vous obtenez"
          title="Un livrable utile dès la première étape"
          description="L’assistant prépare un rapport qui peut ensuite servir de base à un appel de lecture ou à une implantation plus complète."
        />
        <div className="mt-10 rounded-[32px] border border-border/70 bg-white/85 p-6 md:p-8">
          <Tabs defaultValue="Starter" className="w-full">
            <TabsList>
              {loi25Packages.map((pack) => (
                <TabsTrigger key={pack.name} value={pack.name}>
                  {pack.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {loi25Packages.map((pack) => (
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
                    <ul className="grid gap-3 text-sm leading-7 text-muted-foreground">
                      {pack.items.map((item) => (
                        <li key={item} className="flex gap-3">
                          <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      <section className="container py-12 md:py-18">
        <SectionHeading eyebrow="FAQ" title="Questions fréquentes" />
        <div className="mt-8 rounded-[32px] border border-border/70 bg-white/80 p-6 md:p-8">
          <FaqList items={loi25Faq} />
        </div>
      </section>

      <section className="container py-8">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="space-y-3 p-8 text-sm leading-7 text-muted-foreground">
            <p className="font-medium text-foreground">Disclaimer important</p>
            {legalDisclaimers.map((item) => (
              <p key={item}>• {item}</p>
            ))}
          </CardContent>
        </Card>
      </section>

      <CtaBand
        title="Envie d’un premier portrait avant d’investir plus loin?"
        description="L’assistant vous donne une base structurée pour discuter ensuite de vos priorités web, légales et opérationnelles."
      />
    </>
  );
}
