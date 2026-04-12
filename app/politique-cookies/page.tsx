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
            Cette page explique quels cookies peuvent etre utilises, pourquoi, et comment vous informer de facon claire.
          </p>
        </div>

        <CookiePreferencesPanel />

        {[
          {
            title: "Cookies essentiels",
            body:
              "Le site peut utiliser des cookies techniques necessaires au fonctionnement, a la securite, a la prevention d'abus et a la stabilite de la plateforme."
          },
          {
            title: "Cookies tiers",
            body:
              "Le parcours de paiement est opere par Stripe. Selon votre navigateur, des cookies peuvent etre definis sur les domaines de Stripe pendant le checkout."
          },
          {
            title: "Cookies non essentiels",
            body:
              "Aucun cookie publicitaire ou analytics n'est active par defaut dans ce projet. Si cela change, une gestion de consentement explicite devra etre mise en place selon le contexte."
          },
          {
            title: "Banniere conditionnelle",
            body:
              "La banniere de consentement s'affiche seulement si un tracker optionnel (analytics ou marketing) est configure. Sans tracker optionnel, aucun script de suivi n'est charge."
          },
          {
            title: "Comment gerer vos preferences",
            body:
              "Vous pouvez modifier vos preferences directement sur cette page, ou via les reglages de votre navigateur (suppression, blocage, conservation)."
          },
          {
            title: "Mise a jour",
            body:
              "Cette politique peut etre mise a jour pour refleter les evolutions du site, des fournisseurs techniques ou des obligations applicables."
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