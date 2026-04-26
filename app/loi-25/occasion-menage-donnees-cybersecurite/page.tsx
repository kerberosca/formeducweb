import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ClipboardCheck, Database, ShieldCheck } from "lucide-react";

import { CtaBand } from "@/components/marketing/cta-band";
import { SectionHeading } from "@/components/marketing/section-heading";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAbsoluteUrl } from "@/lib/seo";

const pageDescription =
  "La Loi 25 peut devenir une occasion de revoir vos données, vos outils et votre cybersécurité. Commencez par une auto-évaluation simple et avancez par priorités.";

const articleUrl = getAbsoluteUrl("/loi-25/occasion-menage-donnees-cybersecurite");

const selfAssessmentQuestions = [
  "Quelles données personnelles collectons-nous vraiment?",
  "Par quels moyens les collectons-nous?",
  "Dans quels outils sont-elles conservées?",
  "Qui y a accès?",
  "Est-ce que ces accès sont encore justifiés?",
  "Est-ce que nos sauvegardes fonctionnent vraiment?",
  "Est-ce qu'on saurait quoi faire en cas d'incident?"
];

const securityActions = [
  "activer l'authentification à deux facteurs sur les comptes importants;",
  "revoir les accès aux dossiers clients et aux outils administratifs;",
  "supprimer ou archiver les données qui ne servent plus;",
  "mettre à jour les logiciels et retirer les outils dépassés;",
  "vérifier que les sauvegardes existent et peuvent être restaurées;",
  "documenter quoi faire si un incident survient."
];

const steps = [
  {
    title: "Se situer",
    description: "Faire une auto-évaluation pour obtenir un premier portrait clair."
  },
  {
    title: "Prioriser",
    description: "Choisir quelques actions qui ont un vrai impact, au lieu d'ouvrir trop de chantiers."
  },
  {
    title: "Corriger",
    description: "Ajuster ce qui peut l'être rapidement: textes, accès, vieux outils, procédures minimales."
  },
  {
    title: "Demander de l'aide",
    description: "Obtenir un coup de main ponctuel quand le sujet devient trop technique ou trop flou."
  }
];

export const metadata: Metadata = {
  title: "Loi 25 pour PME : une occasion de faire le ménage dans vos données",
  description: pageDescription,
  alternates: {
    canonical: articleUrl
  },
  openGraph: {
    title: "Loi 25 pour PME : une occasion de faire le ménage dans vos données | ForméducWeb",
    description: pageDescription,
    url: articleUrl,
    type: "article"
  }
};

export default function Loi25OpportunityArticlePage() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Loi 25 : et si c'était l'occasion de faire le ménage dans vos données?",
    description: pageDescription,
    author: {
      "@type": "Organization",
      name: "ForméducWeb"
    },
    publisher: {
      "@type": "Organization",
      name: "ForméducWeb"
    },
    mainEntityOfPage: articleUrl
  };

  return (
    <>
      <JsonLd id="loi25-opportunity-article-schema" value={articleSchema} />

      <article className="container py-16 md:py-24">
        <div className="max-w-4xl space-y-10">
          <div className="space-y-6">
            <Badge>Loi 25</Badge>
            <SectionHeading
              eyebrow="Perspective PME"
              title="Loi 25 : et si c'était l'occasion de faire le ménage dans vos données?"
              description="Au-delà de l'obligation, la Loi 25 peut devenir le moment où votre entreprise reprend le contrôle de ses données, de ses outils et de son hygiène numérique."
              titleLevel="h1"
            />
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/loi-25/wizard">
                  Faire mon auto-évaluation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/loi-25">Voir l'offre Loi 25</Link>
              </Button>
            </div>
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="grid gap-5 p-6 text-sm leading-7 text-muted-foreground md:grid-cols-3 md:p-8">
              <div>
                <Database className="mb-3 h-5 w-5 text-primary" />
                <p className="font-medium text-foreground">Données</p>
                <p className="mt-2">Savoir ce que vous collectez, où c'est conservé et combien de temps.</p>
              </div>
              <div>
                <ShieldCheck className="mb-3 h-5 w-5 text-primary" />
                <p className="font-medium text-foreground">Cybersécurité</p>
                <p className="mt-2">Revoir les accès, sauvegardes, mises à jour et vieux outils.</p>
              </div>
              <div>
                <ClipboardCheck className="mb-3 h-5 w-5 text-primary" />
                <p className="font-medium text-foreground">Priorités</p>
                <p className="mt-2">Avancer par étapes, selon votre capacité et vos vrais risques.</p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6 text-base leading-8 text-muted-foreground">
            <p>
              Quand on parle de la Loi 25, beaucoup de dirigeants de PME entendent surtout une nouvelle obligation. Des
              politiques à rédiger. Des cases à cocher. Des risques d'amendes. Des mots juridiques qu'on n'a pas le
              temps de décoder.
            </p>
            <p>Mais on peut aussi regarder la situation autrement.</p>
            <p>
              La Loi 25 peut devenir une occasion de faire un vrai tour d'horizon de votre entreprise: vos formulaires,
              vos documents, vos dossiers clients, vos outils de travail, vos accès, vos sauvegardes, vos habitudes
              internes et vos vieux systèmes qu'on garde parfois parce que ça a toujours fonctionné comme ça.
            </p>
            <p>Autrement dit: ce n'est pas seulement un sujet légal. C'est une occasion de reprendre le contrôle.</p>
          </div>

          <section className="space-y-5">
            <h2 className="font-heading text-2xl font-semibold text-foreground">Le problème n'est pas toujours la mauvaise volonté</h2>
            <div className="space-y-5 text-base leading-8 text-muted-foreground">
              <p>
                Dans plusieurs PME, les renseignements personnels ne sont pas mal gérés parce que les gens sont
                négligents. Ils le sont souvent parce que l'entreprise a évolué.
              </p>
              <p>
                Un formulaire a été ajouté sur le site web. Un outil d'infolettre a été branché. Un dossier partagé a
                été créé rapidement. Un ancien logiciel est resté en place. Un employé a conservé des fichiers
                localement. Chaque décision avait probablement du sens au moment où elle a été prise.
              </p>
              <p>
                Le problème, c'est l'accumulation. Avec le temps, les données se dispersent, les responsabilités
                deviennent floues et on ne sait plus exactement quelles données on collecte, qui peut y accéder et quoi
                faire si une personne demande à les consulter ou à les faire corriger.
              </p>
              <p>La Loi 25 met de la pression sur ces questions. Mais ces questions existaient déjà.</p>
            </div>
          </section>

          <section className="space-y-5">
            <h2 className="font-heading text-2xl font-semibold text-foreground">Faire le ménage, ce n'est pas tout refaire</h2>
            <div className="space-y-5 text-base leading-8 text-muted-foreground">
              <p>
                Il ne faut pas transformer la Loi 25 en chantier démesuré. Pour une PME, le bon point de départ n'est
                pas de tout remplacer, ni d'engager immédiatement une grande firme pour tout prendre en charge.
              </p>
              <p>Le bon point de départ, c'est de se situer.</p>
            </div>
            <Card>
              <CardContent className="p-6 md:p-8">
                <p className="mb-4 font-medium text-foreground">Quelques questions simples pour commencer</p>
                <ul className="grid gap-3 text-sm leading-7 text-muted-foreground md:grid-cols-2">
                  {selfAssessmentQuestions.map((question) => (
                    <li key={question} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
                      <span>{question}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <p className="text-base leading-8 text-muted-foreground">
              Ce premier portrait change tout. Il permet d'arrêter de deviner et de prioriser.
            </p>
          </section>

          <section className="space-y-5">
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              La Loi 25 comme porte d'entrée vers une meilleure hygiène numérique
            </h2>
            <div className="space-y-5 text-base leading-8 text-muted-foreground">
              <p>
                La protection des renseignements personnels et la cybersécurité sont de plus en plus liées. Si vos
                données sont mal classées, mal protégées ou accessibles à trop de monde, le risque n'est pas seulement
                légal. Il est opérationnel.
              </p>
              <p>
                Un compte compromis, un vieux logiciel non mis à jour, un mot de passe partagé, un ordinateur sans
                sauvegarde fiable ou un dossier client envoyé au mauvais destinataire peuvent tous devenir des incidents
                sérieux.
              </p>
            </div>
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6 md:p-8">
                <p className="mb-4 font-medium text-foreground">Des gestes de base qui changent beaucoup de choses</p>
                <ul className="grid gap-3 text-sm leading-7 text-muted-foreground md:grid-cols-2">
                  {securityActions.map((action) => (
                    <li key={action} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-5">
            <h2 className="font-heading text-2xl font-semibold text-foreground">L'objectif: avancer selon votre capacité</h2>
            <p className="text-base leading-8 text-muted-foreground">
              La pire façon d'aborder la Loi 25, c'est de la voir comme une montagne. Quand tout semble trop gros, on
              reporte. Et quand on reporte trop longtemps, les écarts deviennent encore plus difficiles à corriger.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {steps.map((step) => (
                <Card key={step.title}>
                  <CardContent className="p-6">
                    <p className="font-medium text-foreground">{step.title}</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-base leading-8 text-muted-foreground">
              Demander de l'aide ne veut pas dire déléguer toute la responsabilité. Ça peut vouloir dire obtenir un coup
              de main ponctuel pour clarifier une politique, ajuster un site web, revoir une configuration, structurer
              une procédure ou prioriser les prochaines actions.
            </p>
          </section>

          <section className="space-y-5">
            <h2 className="font-heading text-2xl font-semibold text-foreground">Commencer par soi-même, ce n'est pas être seul</h2>
            <div className="space-y-5 text-base leading-8 text-muted-foreground">
              <p>
                Une PME peut très bien commencer par elle-même. Elle connaît ses outils, ses clients, ses dossiers, ses
                contraintes et sa réalité. Personne ne peut faire cet inventaire avec autant de contexte que l'équipe
                interne.
              </p>
              <p>
                Mais cette démarche devient beaucoup plus facile avec une structure. C'est le rôle d'une auto-évaluation
                Loi 25: transformer un sujet flou en portrait clair. L'objectif n'est pas de produire une certification
                magique. L'objectif est de vous aider à voir où vous en êtes et quelles actions peuvent être posées sans
                vous perdre dans le jargon.
              </p>
            </div>
          </section>

          <section className="space-y-5">
            <h2 className="font-heading text-2xl font-semibold text-foreground">Une opportunité de confiance</h2>
            <div className="space-y-5 text-base leading-8 text-muted-foreground">
              <p>
                Les clients, les parents, les employés, les fournisseurs et les partenaires confient des informations aux
                entreprises parce qu'ils s'attendent à ce qu'elles soient traitées avec sérieux.
              </p>
              <p>
                La Loi 25 vient formaliser une partie de cette attente. Mais le fond du sujet est plus large: être
                capable de dire, avec simplicité et honnêteté, voici les données que nous demandons, pourquoi nous les
                demandons, comment nous les protégeons, et quoi faire si vous avez une question.
              </p>
              <p>
                Une entreprise qui connaît ses données travaille mieux. Elle perd moins de temps à chercher
                l'information. Elle réduit les doublons. Elle évite de conserver des renseignements inutiles. Elle détecte
                plus vite les failles. Elle inspire plus confiance.
              </p>
            </div>
          </section>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="space-y-5 p-8">
              <div className="space-y-2">
                <p className="font-medium text-foreground">Par où commencer?</p>
                <p className="text-sm leading-7 text-muted-foreground">
                  Avant de vouloir tout corriger, faites votre auto-évaluation. Prenez le portrait actuel de votre site,
                  de vos formulaires, de vos outils, de vos accès et de vos pratiques internes. Ensuite, choisissez les
                  prochaines actions selon votre capacité.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild>
                  <Link href="/loi-25/wizard">Faire mon auto-évaluation Loi 25</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/contact?source=article-loi25-menage-donnees">Parler à ForméducWeb</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </article>

      <CtaBand
        title="Reprendre le contrôle, une étape à la fois"
        description="Commencez par l'auto-évaluation Loi 25 pour obtenir un premier portrait clair, puis avancez par priorités."
      />
    </>
  );
}



