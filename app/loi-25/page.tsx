import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Layers3, MessageCircle, ShieldCheck } from "lucide-react";

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
import { siteConfig } from "@/lib/site";

const pageDescription =
  "Loi 25 résumé pour PME du Québec: obligations clés, score de préparation et auto-évaluation gratuite pour prioriser vos actions en 30 jours.";

const freeDeliverables = [
  "Score global et niveau de préparation.",
  "3 priorités pour démarrer sans vous disperser.",
  "Plan d’action 30 jours en langage simple.",
  "Disclaimers clairs et prochaine étape recommandée."
];

const fullReportAdditions = [
  "Top 5 des écarts prioritaires, avec impact et actions proposées.",
  "Plan 90 jours détaillé pour passer de la lecture à l’implantation.",
  "PDF téléchargeable pour partager en interne.",
  "Gabarits réutilisables (procédure 1 page, texte type formulaire).",
  "Crédit applicable sur un accompagnement si vous poursuivez avec nous."
];

const notThis = [
  "Ce n’est pas une promesse de conformité garantie.",
  "Ce n’est pas un avis juridique personnalisé.",
  "Ce n’est pas un projet lourd avant d’avoir validé vos priorités."
];

const searchIntentFaq = [
  {
    question: "Qu’est-ce que la Loi 25 au Québec?",
    answer:
      "La Loi 25 encadre la collecte, l’utilisation et la protection des renseignements personnels. Pour une PME, cela touche notamment les formulaires web, les outils marketing, les accès et la documentation interne."
  },
  {
    question: "C’est quoi la Loi 25 pour une PME, concrètement?",
    answer:
      "Concrètement: désigner un responsable, clarifier les consentements, sécuriser les accès, tenir un registre d’incidents et rendre les pratiques plus transparentes pour les clients, employés et partenaires."
  },
  {
    question: "La Loi 25 couvre-t-elle les renseignements personnels du site web?",
    answer:
      "Oui. Les formulaires, pixels, outils d’analytics, CRM et pages légales font partie des zones à vérifier en priorité, parce qu’elles traitent des renseignements personnels au quotidien."
  }
];

const faqItems = [...searchIntentFaq, ...loi25Faq];

export const metadata: Metadata = {
  title: "Loi 25 résumé pour PME du Québec | Auto-évaluation gratuite",
  description: pageDescription,
  alternates: {
    canonical: getAbsoluteUrl("/loi-25")
  },
  openGraph: {
    title: "Loi 25 résumé pour PME du Québec | Auto-évaluation gratuite | ForméducWeb",
    description: pageDescription,
    url: getAbsoluteUrl("/loi-25")
  }
};

export default function Loi25Page() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
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
              Loi 25 résumé et diagnostic clair pour PME et OBNL du Québec
            </h1>
            <p className="max-w-2xl text-xl leading-9 text-muted-foreground">
              Si vous cherchez un résumé Loi 25 clair et actionnable, vous êtes au bon endroit: score, priorités et
              plan d’action, puis une suite simple si vous voulez aller plus loin.
            </p>
            <ul className="space-y-2 text-sm leading-7 text-muted-foreground">
              <li>• Pour qui: direction, marketing, opérations sans équipe conformité dédiée.</li>
              <li>• Ce qu’on obtient: gratuit d’abord, puis rapport complet à 29 $ si pertinent.</li>
              <li>• Ce qu’on fait ensuite: prioriser, implémenter, valider avec notre équipe au besoin.</li>
            </ul>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                Besoin d’un rappel simple des obligations?{" "}
                <Link href="/loi-25/cest-quoi" className="underline underline-offset-4">
                  Voir le résumé « C’est quoi la Loi 25 ? »
                </Link>
                .
              </p>
              <p>
                Liens utiles:{" "}
                <Link href="/loi-25/wizard" className="underline underline-offset-4">
                  évaluation Loi 25
                </Link>{" "}
                •{" "}
                <Link href="/contact" className="underline underline-offset-4">
                  parler à l’équipe
                </Link>{" "}
                •{" "}
                <Link href="/services/site-web" className="underline underline-offset-4">
                  mise à niveau formulaires et pages légales
                </Link>
                .
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/loi-25/wizard">Faire mon auto-évaluation Loi 25</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/contact?source=loi25-hero">Parler de mon contexte</Link>
              </Button>
            </div>
          </div>

          <Card className="bg-white/85">
            <CardHeader>
              <CardTitle>Parcours en 3 étapes</CardTitle>
              <CardDescription>Simple à comprendre, concret à exécuter.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 p-6">
              {[
                {
                  icon: FileText,
                  title: "1. Diagnostic",
                  description: "Réponses guidées pour voir clair sur vos zones sensibles."
                },
                {
                  icon: Layers3,
                  title: "2. Rapport",
                  description: "Score, priorités et plan d’action utilisable dès aujourd’hui."
                },
                {
                  icon: ShieldCheck,
                  title: "3. Implantation",
                  description: "Accompagnement progressif si vous voulez passer à l’exécution."
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
        <SectionHeading
          eyebrow="Gratuit"
          title="Ce que vous obtenez gratuitement"
          description="Un premier niveau de clarté avant de décider d’investir davantage."
        />
        <Card className="mt-8">
          <CardContent className="grid gap-6 p-8 lg:grid-cols-[1.2fr_auto] lg:items-center">
            <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
              {freeDeliverables.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button asChild>
                <Link href="/loi-25/wizard">Voir mon résumé gratuit</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/contact?source=loi25-gratuit">Question rapide</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="container py-8 md:py-14">
        <SectionHeading
          eyebrow="Rapport complet"
          title="Ce que le rapport complet ajoute (29 $)"
          description="Après le résumé gratuit, vous choisissez si vous voulez le niveau de détail complet."
        />
        <Card className="mt-8 border-primary/20 bg-primary/5">
          <CardContent className="grid gap-6 p-8 lg:grid-cols-[1.2fr_auto] lg:items-center">
            <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
              {fullReportAdditions.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-3">
              <Button asChild>
                <Link href="/loi-25/wizard">Commencer gratuitement puis débloquer à 29 $</Link>
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
          title="Pourquoi agir maintenant"
          description="L’objectif n’est pas de tout faire en même temps, mais de sécuriser l’essentiel dans le bon ordre."
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
        <div className="mt-8">
          <Button asChild variant="secondary">
            <Link href="/loi-25/wizard">Passer au diagnostic</Link>
          </Button>
        </div>
      </section>

      <section className="container py-8 md:py-14">
        <SectionHeading
          eyebrow="Cadre"
          title="Ce que cette démarche n’est pas"
          description="On garde un cadre clair pour éviter les attentes irréalistes."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {notThis.map((item) => (
            <Card key={item}>
              <CardContent className="p-6 text-sm leading-7 text-muted-foreground">{item}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container py-10 md:py-16">
        <SectionHeading
          eyebrow="Suite"
          title="Si vous voulez qu’on implante avec vous"
          description="Après le diagnostic, vous pouvez rester autonome ou passer sur un niveau d’accompagnement adapté."
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
        <SectionHeading eyebrow="FAQ" title="Questions fréquentes sur la Loi 25" />
        <div className="mt-8 rounded-[32px] border border-border/70 bg-white/80 p-6 md:p-8">
          <FaqList items={faqItems} />
        </div>
      </section>

      <section className="container py-8">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="space-y-5 p-8">
            <div className="space-y-2">
              <p className="font-medium text-foreground">Parler avec notre équipe</p>
              <p className="text-sm leading-7 text-muted-foreground">
                Si vous préférez valider vos priorités avec nous avant d’aller plus loin, on peut faire un échange de
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
                <Link href="/contact?source=loi25-humain">Écrire à ForméducWeb</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
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
        title="Prêt à faire le point sans pression?"
        description="Commencez par le diagnostic gratuit, puis décidez si le rapport complet et l’accompagnement sont utiles pour votre contexte."
      />
    </>
  );
}

