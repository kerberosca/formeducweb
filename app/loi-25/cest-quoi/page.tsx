import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/marketing/section-heading";

export const metadata = {
  title: "C’est quoi la Loi 25 ?"
};

export default function Loi25ExplainerPage() {
  return (
    <section className="container py-16 md:py-24">
      <div className="max-w-4xl space-y-10">
        <SectionHeading
          eyebrow="Comprendre le contexte"
          title="En bref, c’est quoi la Loi 25&nbsp;?"
          description="Un résumé simple pour savoir de quoi on parle avant de plonger dans les détails juridiques."
        />

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
                <span className="font-medium">Droits des personnes.</span> Faciliter l’accès à leurs renseignements,
                la correction, le retrait du consentement et, à terme, la portabilité.
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
      </div>
    </section>
  );
}

