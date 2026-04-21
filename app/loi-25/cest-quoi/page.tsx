import type { Metadata } from "next";
import Link from "next/link";

import { SectionHeading } from "@/components/marketing/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAbsoluteUrl } from "@/lib/seo";

const pageDescription =
  "C’est quoi la Loi 25? Résumé simple pour PME du Québec: obligations clés, renseignements personnels, consentement, incidents et premières actions.";

export const metadata: Metadata = {
  title: "C’est quoi la Loi 25? Résumé simple pour PME du Québec",
  description: pageDescription,
  alternates: {
    canonical: getAbsoluteUrl("/loi-25/cest-quoi")
  },
  openGraph: {
    title: "C’est quoi la Loi 25? Résumé simple pour PME du Québec | ForméducWeb",
    description: pageDescription,
    url: getAbsoluteUrl("/loi-25/cest-quoi")
  }
};

export default function Loi25ExplainerPage() {
  return (
    <section className="container py-16 md:py-24">
      <div className="max-w-4xl space-y-10">
        <SectionHeading
          eyebrow="Comprendre le contexte"
          title="En bref, c’est quoi la Loi 25 au Québec&nbsp;?"
          description="Un résumé simple de la Loi 25 pour PME et OBNL avant de plonger dans les détails juridiques."
          titleLevel="h1"
        />

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="space-y-4 p-8 text-sm leading-7 text-muted-foreground">
            <p className="font-medium text-foreground">Résumé express Loi 25 (en 30 secondes)</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>La Loi 25 encadre mieux les renseignements personnels et la transparence.</li>
              <li>Même une PME est concernée si elle collecte des données via son site ou ses outils.</li>
              <li>Le plus simple est de commencer par un diagnostic pour prioriser les actions.</li>
            </ul>
            <p>
              Pour passer à l’action:{" "}
              <Link href="/loi-25/wizard" className="underline underline-offset-4">
                faire l’évaluation Loi 25
              </Link>{" "}
              ou revenir à la{" "}
              <Link href="/loi-25" className="underline underline-offset-4">
                page principale Loi 25 résumé
              </Link>
              .
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-8 text-sm leading-7 text-muted-foreground">
            <p className="font-medium text-foreground">Origine et objectif</p>
            <p>
              La Loi 25 (Loi modernisant des dispositions législatives en matière de protection des renseignements
              personnels) met à jour les règles québécoises de protection des données pour les organisations publiques
              et privées. L’idée centrale&nbsp;: mieux protéger les renseignements personnels, mieux encadrer leur usage
              et rendre les pratiques plus transparentes pour les citoyens.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-8 text-sm leading-7 text-muted-foreground">
            <p className="font-medium text-foreground">Qui est concerné&nbsp;?</p>
            <p>
              La plupart des organisations qui collectent, détiennent ou utilisent des renseignements personnels au
              Québec sont touchées&nbsp;: PME, OBNL, travailleurs autonomes, grandes entreprises, etc. Les obligations
              visent autant les données sur papier que celles dans vos outils numériques (site web, CRM, suites
              collaborative, outils marketing, etc.).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-8 text-sm leading-7 text-muted-foreground">
            <p className="font-medium text-foreground">Ce que la loi change concrètement</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <span className="font-medium">Responsable interne.</span> Désigner une personne responsable de la
                protection des renseignements personnels (RPRP) dans l’organisation.
              </li>
              <li>
                <span className="font-medium">Politiques et gouvernance.</span> Documenter comment sont collectées,
                utilisées, conservées et détruites les données (politiques, procédures, registres).
              </li>
              <li>
                <span className="font-medium">Consentement plus clair.</span> Expliquer en termes simples pourquoi vous
                collectez les données, pour quelles fins et permettre de retirer son consentement.
              </li>
              <li>
                <span className="font-medium">Incidents et registre.</span> Tenir un registre des incidents de
                confidentialité et, dans certains cas, aviser les personnes concernées et la CAI.
              </li>
              <li>
                <span className="font-medium">Sécurité raisonnable.</span> Mettre en place des mesures concrètes
                (accès, sauvegardes, mises à jour, journalisation, etc.) pour réduire les risques.
              </li>
              <li>
                <span className="font-medium">Droits des personnes.</span> Faciliter l’accès à leurs renseignements, la
                correction, le retrait du consentement et, à terme, la portabilité.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-8 text-sm leading-7 text-muted-foreground">
            <p className="font-medium text-foreground">Pourquoi votre site et vos outils web sont au cœur du sujet</p>
            <p>
              Concrètement, beaucoup d’exigences de la Loi 25 se matérialisent dans vos interfaces numériques&nbsp;:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Formulaires de contact, de demande de soumission ou d’inscription.</li>
              <li>Pages légales (politique de confidentialité, conditions d’utilisation, politique cookies).</li>
              <li>Outils de suivi et de mesure (analytics, pixels, chat en ligne, infolettres).</li>
              <li>Hébergement, CRM, solutions de sauvegarde et autres fournisseurs ayant accès à vos données.</li>
            </ul>
            <p>
              C’est souvent là que l’on commence à voir clairement ce qui est collecté, où ça va, qui y a accès et
              comment tout ça est expliqué aux personnes concernées.
            </p>
            <p>
              Besoin d’une version actionnable plutôt qu’un rappel théorique?{" "}
              <Link href="/loi-25" className="underline underline-offset-4">
                Voir le diagnostic Loi 25 résumé
              </Link>
              .
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-8 text-sm leading-7 text-muted-foreground">
            <p className="font-medium text-foreground">Et nous, où intervenons-nous&nbsp;?</p>
            <p>
              ForméducWeb ne remplace pas un avis juridique. Notre rôle est de transformer ces exigences en actions
              concrètes pour votre réalité&nbsp;: diagnostic, priorités, ajustements web, pages légales plus claires et
              gabarits prêts à utiliser. L’objectif&nbsp;: vous aider à avancer sans vous perdre dans le jargon.
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="space-y-5 p-8">
            <div className="space-y-2">
              <p className="font-medium text-foreground">Passer de comprendre à agir</p>
              <p className="text-sm leading-7 text-muted-foreground">
                Commencez par l’auto-évaluation pour obtenir vos priorités, puis revenez avec vos questions si vous
                voulez valider vos prochaines actions avec nous.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/loi-25/wizard">Faire mon auto-évaluation Loi 25</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/contact?source=loi25-cest-quoi">Parler à notre équipe</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/loi-25">Voir la page principale Loi 25</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

