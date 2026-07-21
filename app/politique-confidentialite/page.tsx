import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Politique de confidentialité",
  description:
    "Collecte, utilisation, conservation et protection des renseignements traités par ForméducWeb.",
  path: "/politique-confidentialite"
});

const sections = [
  {
    title: "Collecte",
    body: "Le diagnostic gratuit conserve les réponses dans votre navigateur. Si vous choisissez de sauvegarder le résultat, nous recueillons votre courriel et votre consentement marketing facultatif. Le nom et l’entreprise sont demandés seulement avant l’achat d’un rapport complet. Les informations de paiement sont gérées par Stripe."
  },
  {
    title: "Finalités",
    body: "Ces informations servent à produire votre diagnostic, gérer votre accès au rapport, assurer le support client et, si vous y consentez, envoyer des communications utiles sur nos services."
  },
  {
    title: "Cookies et technologies similaires",
    body: "Le site utilise des cookies techniques nécessaires au fonctionnement et à la sécurité. Les cookies non essentiels de mesure analytics restent bloqués tant que vous n'avez pas donné un consentement explicite."
  },
  {
    title: "Mesure d'audience",
    body: "Si vous acceptez la catégorie Analytics, le site peut activer Google Analytics pour comprendre les visites et améliorer les parcours. Aucun pixel publicitaire ni suivi publicitaire n'est chargé dans la configuration active."
  },
  {
    title: "Conservation",
    body: "Les brouillons locaux du diagnostic expirent automatiquement après 30 jours. Côté serveur, les résultats sauvegardés sont conservés selon une durée raisonnable liée aux finalités d'affaires, à la sécurité et aux obligations applicables."
  },
  {
    title: "Sécurité",
    body: "Le site applique des contrôles techniques raisonnables (validation, limitation d'abus, tokens d'accès non devinables, protections d'en-têtes HTTP, pages sensibles non indexées, cache désactivé sur les routes sensibles)."
  },
  {
    title: "Fournisseurs et transferts",
    body: "Certains fournisseurs techniques peuvent traiter des données en dehors du Québec ou du Canada, selon leur infrastructure. Ces traitements restent encadrés par vos choix de consentement et les obligations applicables."
  },
  {
    title: "Vos droits",
    body: "Vous pouvez demander un accès, une rectification, un retrait de consentement, ou discuter d'une suppression selon les obligations applicables et les exceptions légales."
  },
  {
    title: "Responsable et contact",
    body: "Pour toute question relative à la confidentialité, écrivez à info@formeducweb.ca."
  }
];

export default function PolitiqueConfidentialitePage() {
  return (
    <section className="container py-16 md:py-24">
      <div className="max-w-4xl space-y-8">
        <div className="space-y-4">
          <p className="eyebrow">Politique de confidentialité</p>
          <h1 className="font-heading text-5xl font-semibold tracking-tight">
            Comment ForméducWeb traite les renseignements transmis
          </h1>
          <p className="text-lg leading-8 text-muted-foreground">
            Cette page décrit la collecte, l'utilisation, la conservation et les
            droits associés aux données recueillies via les formulaires, les
            diagnostics et les paiements Stripe.
          </p>
        </div>

        {sections.map((section) => (
          <Card key={section.title}>
            <CardContent className="space-y-3 p-8">
              <h2 className="font-heading text-2xl font-semibold">
                {section.title}
              </h2>
              <p className="text-sm leading-7 text-muted-foreground">
                {section.body}
              </p>
            </CardContent>
          </Card>
        ))}

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="space-y-3 p-6 text-sm leading-7 text-muted-foreground">
            <p>
              Consultez aussi la{" "}
              <Link
                href="/politique-cookies"
                className="underline underline-offset-4"
              >
                Politique cookies
              </Link>
              .
            </p>
            <p>
              Pour gérer ou retirer vos choix cookies, ouvrez{" "}
              <Link
                href="/politique-cookies#preferences-cookies"
                className="underline underline-offset-4"
              >
                Gérer mes cookies
              </Link>
              .
            </p>
            <p>
              Pour exercer vos droits, utilisez la page{" "}
              <Link
                href="/demande-confidentialite"
                className="underline underline-offset-4"
              >
                Demande confidentialité
              </Link>
              .
            </p>
            <p>
              Cette politique présente une vue opérationnelle générale et ne
              constitue pas un avis juridique.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
