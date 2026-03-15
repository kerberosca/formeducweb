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
              "Aucun cookie publicitaire ou analytics n'est activé par défaut dans ce projet. Si cela change, une gestion de consentement explicite devra être mise en place selon le contexte."
          },
          {
            title: "Bannière conditionnelle",
            body:
              "La bannière de consentement s'affiche seulement si un tracker optionnel (analytics ou marketing) est configuré. Sans tracker optionnel, aucun script de suivi n'est chargé."
          },
          {
            title: "Comment gérer vos préférences",
            body:
              "Vous pouvez gérer les cookies depuis les réglages de votre navigateur (suppression, blocage, conservation)."
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
