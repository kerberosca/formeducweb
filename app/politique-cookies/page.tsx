import { CookiePreferencesPanel } from "@/components/cookies/cookie-preferences-panel";
import { Card, CardContent } from "@/components/ui/card";

export default function PolitiqueCookiesPage() {
  return (
    <section className="container py-16 md:py-24">
      <div className="max-w-4xl space-y-8">
        <div className="space-y-4">
          <p className="eyebrow">Politique cookies</p>
          <h1 className="font-heading text-5xl font-semibold tracking-tight">Utilisation des cookies et technologies similaires</h1>
          <p className="text-lg leading-8 text-muted-foreground">
            Cette page explique quels cookies peuvent être utilisés, pourquoi, et comment vous informer de façon claire.
          </p>
        </div>

        <CookiePreferencesPanel />

        {[
          {
            title: "Cookies essentiels",
            body:
              "Le site peut utiliser des cookies techniques nécessaires au fonctionnement, à la sécurité, à la prévention d'abus et à la stabilité de la plateforme."
          },
          {
            title: "Cookies tiers",
            body:
              "Le parcours de paiement est opéré par Stripe. Selon votre navigateur, des cookies peuvent être définis sur les domaines de Stripe pendant le checkout."
          },
          {
            title: "Cookies non essentiels",
            body:
              "Les cookies non essentiels sont désactivés par défaut. Ils ne sont chargés qu'après un consentement explicite pour la mesure analytics, puis peuvent être retirés en tout temps."
          },
          {
            title: "Mesure d'audience optionnelle",
            body:
              "Si la catégorie Analytics est acceptée, le site peut charger Google Analytics pour comprendre les visites et améliorer les parcours. Aucun pixel publicitaire ni suivi publicitaire n'est chargé dans la configuration active."
          },
          {
            title: "Banniere conditionnelle",
            body:
              "La banniere de consentement s'affiche seulement si au moins un tracker analytics optionnel est configure. Sans tracker optionnel, aucun script de suivi non essentiel n'est charge."
          },
          {
            title: "Fournisseurs et transferts",
            body:
              "Certains fournisseurs techniques ou analytics peuvent traiter des données en dehors du Québec ou du Canada, selon leur infrastructure. Ces traitements restent soumis à vos choix de consentement."
          },
          {
            title: "Comment gérer vos préférences",
            body:
              "Vous pouvez modifier vos préférences directement sur cette page, ou via les réglages de votre navigateur (suppression, blocage, conservation)."
          },
          {
            title: "Mise à jour",
            body:
              "Cette politique peut être mise à jour pour refléter les évolutions du site, des fournisseurs techniques ou des obligations applicables."
          }
        ].map((section) => (
          <Card key={section.title}>
            <CardContent className="space-y-3 p-8">
              <h2 className="font-heading text-2xl font-semibold">{section.title}</h2>
              <p className="text-sm leading-7 text-muted-foreground">{section.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
